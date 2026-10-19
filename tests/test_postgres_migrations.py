"""The newest migration against a real PostgreSQL, over a populated database.

The rest of the suite runs on in-memory SQLite, which cannot see anything
dialect-specific: the JSON columns, the server defaults, the indexes as
Postgres actually builds them. Operators upgrade through `manage db`, on
Postgres, with rows in the tables - the one configuration nothing else here
covers.

The chain is deliberately *not* replayed from empty: the early revisions are
not replayable on a blank database, which is why `manage db` builds a fresh
install from the models instead (`bin/manage.py`, `_run_db_upgrade`). So these
tests build the schema the way an install does, stamp it, then step the newest
revision down and back up - which is what an operator's upgrade runs, over
rows that were already there.

Generic by construction: "the newest revision" is whatever head is, so a
revision added later is covered the day it lands.

Skipped unless ``CTI_TEST_POSTGRES_URL`` names a server whose role may
``CREATE DATABASE``; CI sets it. **No existing database is touched**: each run
creates its own, under a random name, and drops it afterwards.

    CTI_TEST_POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres \\
        uv run pytest tests/test_postgres_migrations.py
"""

import os
import uuid
from datetime import datetime, timezone
from urllib.parse import urlsplit, urlunsplit

import pytest

ADMIN_URL = os.environ.get("CTI_TEST_POSTGRES_URL")

pytestmark = pytest.mark.skipif(
    not ADMIN_URL, reason="CTI_TEST_POSTGRES_URL is not set")

MIGRATIONS = "website/migrations"


def _scratch_url(name):
    """The scratch database, with the driver spelled out.

    SQLAlchemy 2.1 resolves a bare ``postgresql://`` to psycopg 3, which this
    project does not install - it runs on psycopg2, as the application's own
    URI says. Naming the driver here means the environment variable can be
    written either way.
    """
    split = urlsplit(ADMIN_URL)
    return urlunsplit(
        split._replace(scheme="postgresql+psycopg2", path=f"/{name}"))


def _admin(statement):
    """One statement outside a transaction block, which CREATE/DROP need."""
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

    # libpq parses this one, and it rejects SQLAlchemy's ``+driver`` suffix.
    split = urlsplit(ADMIN_URL)
    connection = psycopg2.connect(
        urlunsplit(split._replace(scheme="postgresql")))
    try:
        connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        with connection.cursor() as cursor:
            cursor.execute(statement)
    finally:
        connection.close()


@pytest.fixture
def stamped_database():
    """A scratch database holding the schema an install starts from.

    ``create_all`` then ``stamp head``: the bootstrap `manage db` performs on
    a fresh install, and the state every later upgrade departs from.
    """
    from flask_migrate import stamp

    import website.db_class.db  # noqa: F401  -- register models on the metadata
    from website.web import application, db

    name = f"cti_test_migrations_{uuid.uuid4().hex[:8]}"
    previous = dict(application.config)
    _admin(f'CREATE DATABASE "{name}"')
    try:
        application.config["SQLALCHEMY_DATABASE_URI"] = _scratch_url(name)
        db._app_engines.pop(application, None)
        application.extensions.pop("sqlalchemy", None)
        application._got_first_request = False
        db.init_app(application)
        with application.app_context():
            db.create_all()
            stamp(directory=MIGRATIONS, revision="head")
        yield application, db
    finally:
        with application.app_context():
            db.session.remove()
        db._app_engines.pop(application, None)
        application.extensions.pop("sqlalchemy", None)
        application.config.update(previous)
        application._got_first_request = False
        db.init_app(application)
        _admin(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
            f"WHERE datname = '{name}' AND pid <> pg_backend_pid()")
        _admin(f'DROP DATABASE IF EXISTS "{name}"')


def _some_rows(application, db):
    """A user and a conversion, written while the newest revision is pending."""
    from website.db_class.db import Conversion, User

    now = datetime.now(timezone.utc)
    suffix = uuid.uuid4().hex[:8]
    with application.app_context():
        user = User(first_name="Migration", last_name="Check",
                    email=f"migration-{suffix}@check.test", password_hash="x",
                    api_key=uuid.uuid4().hex)
        db.session.add(user)
        db.session.commit()
        conversion = Conversion(
            user_id=user.id, name=f"before-the-upgrade-{suffix}",
            source_format="misp", target_format="stix", input_text="{}",
            output_text="x", created_at=now, updated_at=now, public=True,
            uuid=str(uuid.uuid4()))
        db.session.add(conversion)
        db.session.commit()
        return user.email, conversion.name


def test_the_newest_revision_leaves_a_schema_matching_the_models(
        stamped_database):
    """Step it down, run it for real, compare what Postgres built.

    ``compare_metadata`` against the live server is the check SQLite cannot
    make: a revision that drifts from its model - a type, a nullability, a
    missing index - lands here rather than in an operator's upgrade.
    """
    from alembic.autogenerate import compare_metadata
    from alembic.migration import MigrationContext
    from flask_migrate import downgrade, upgrade

    application, db = stamped_database
    with application.app_context():
        downgrade(directory=MIGRATIONS, revision="-1")
        upgrade(directory=MIGRATIONS)
        connection = db.engine.connect()
        try:
            diff = compare_metadata(
                MigrationContext.configure(connection), db.metadata)
        finally:
            connection.close()

    assert diff == []


def test_the_newest_revision_runs_over_rows_and_keeps_them(stamped_database):
    """An operator's upgrade is not a blank database. This one has rows in it
    before the revision runs, and they have to be there afterwards."""
    from flask_migrate import downgrade, upgrade

    from website.db_class.db import Conversion, User

    application, db = stamped_database
    with application.app_context():
        downgrade(directory=MIGRATIONS, revision="-1")

    email, conversion_name = _some_rows(application, db)

    with application.app_context():
        upgrade(directory=MIGRATIONS)
        assert User.query.filter_by(email=email).first() is not None
        assert Conversion.query.filter_by(
            name=conversion_name).first() is not None


def test_a_bulk_tag_job_round_trips_through_the_real_json_column(
        stamped_database):
    """The errors list is a JSON column. SQLite stores it as text and is happy
    with anything; this pins the read-back on the dialect operators run."""
    from website.repos import bulk_tag_jobs as jobs_repo

    application, _ = stamped_database
    with application.app_context():
        job = jobs_repo.create(job_type="assign", total=2, user_id=None)
        jobs_repo.append_errors(token=job.token, messages=["#1: broke"])
        jobs_repo.finish(token=job.token, progress=2, affected=0, skipped=0,
                         errors=["#2: broke"])
        payload = jobs_repo.get(job.token)

    assert payload["status"] == "done"
    assert payload["error_count"] == 2
    assert payload["errors"] == ["#1: broke", "#2: broke"]
