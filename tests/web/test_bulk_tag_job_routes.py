"""HTTP contracts of the two bulk-tag *jobs* routes.

``GET /tags/admin/bulk_conversions/jobs`` polls the history;
``DELETE /tags/admin/bulk_conversions/jobs`` dismisses every job that is no
longer live. The repo-level suite pins what ``remove_finished()`` decides; this
one pins what the routes do with it, and the two things that make the DELETE
safe to expose:

- the admin guard, an irreversible delete away from being world-reachable, and
- the ``csrf.exempt``, which the panel's fetch depends on (it sends no token).

Both are decorators, so both are one careless refactor from gone - and without
a request-level test, nothing else in ``tests/`` would notice.

CSRF is *on* here, unlike most of the web suite: a tokenless DELETE succeeding
is the whole point of the exemption test, and it proves nothing with the
protection disabled. The flags are restored on the way out, and
``SESSION_COOKIE_SECURE`` is pinned off because the test client's cookie jar
withholds a Secure cookie over plain HTTP - an operator whose ``.env`` turns it
on would otherwise see these log in as nobody.
"""

import pytest


@pytest.fixture
def jobs_client(app_db):
    """Admin-capable client with CSRF enforced, on the SQLite-backed app.

    The account blueprint rides along because ``login_required`` redirects to
    ``account.login``, which has to resolve for the anonymous cases.
    """
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    previous = {
        key: application.config.get(key)
        for key in ("WTF_CSRF_ENABLED", "SESSION_COOKIE_SECURE")
    }
    application.config["WTF_CSRF_ENABLED"] = True
    application.config["SESSION_COOKIE_SECURE"] = False
    for blueprint, prefix in (
        (account_blueprint, "/account"),
        (tags_blueprint, "/tags")
    ):
        if blueprint.name not in application.blueprints:
            application.register_blueprint(blueprint, url_prefix=prefix)
    try:
        yield application.test_client()
    finally:
        application.config.update(previous)


JOBS_URL = "/tags/admin/bulk_conversions/jobs"


def _make_user(email, admin):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name="u", last_name="x", email=email, admin=admin,
                api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _login(client, user):
    with client.session_transaction() as session:
        session["_user_id"] = str(user.id)
        session["_fresh"] = True


def _a_finished_job():
    from website.repos import bulk_tag_jobs as jobs_repo

    job = jobs_repo.create(job_type="scan", total=1, user_id=1)
    jobs_repo.finish(token=job.token, progress=1, affected=1)
    return job.token


# --- who may ask ---------------------------------------------------------------

def test_an_anonymous_caller_reads_no_job_history(jobs_client):
    _a_finished_job()

    response = jobs_client.get(JOBS_URL)

    assert response.status_code == 302           # sent to the login page
    assert "/account/login" in response.headers["Location"]


def test_an_anonymous_caller_cannot_dismiss_the_history(jobs_client):
    """The exemption drops the CSRF check, so login_required is all that is
    left between a cross-site caller and the delete. It has to hold alone."""
    from website.repos import bulk_tag_jobs as jobs_repo

    token = _a_finished_job()

    response = jobs_client.delete(JOBS_URL)

    assert response.status_code == 302
    assert jobs_repo.get(token) is not None


def test_a_signed_in_non_admin_is_refused_the_job_history(jobs_client):
    _a_finished_job()
    _login(jobs_client, _make_user("user@test.test", admin=False))

    response = jobs_client.get(JOBS_URL)

    assert response.status_code == 403


def test_a_signed_in_non_admin_cannot_dismiss_the_history(jobs_client):
    from website.repos import bulk_tag_jobs as jobs_repo

    token = _a_finished_job()
    _login(jobs_client, _make_user("user@test.test", admin=False))

    response = jobs_client.delete(JOBS_URL)

    assert response.status_code == 403
    assert jobs_repo.get(token) is not None


def test_an_admin_reads_the_job_history(jobs_client):
    token = _a_finished_job()
    _login(jobs_client, _make_user("admin@test.test", admin=True))

    response = jobs_client.get(JOBS_URL)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert [job["id"] for job in payload["jobs"]] == [token]


# --- what the DELETE does ------------------------------------------------------

def test_the_dismiss_needs_no_csrf_token(jobs_client):
    """The panel's fetch sends none, so the exemption is load-bearing.

    Drop ``@csrf.exempt`` from the route and this is a 400 - which is what the
    button does today when the exemption goes missing, silently, with the
    history still on screen.
    """
    _a_finished_job()
    _login(jobs_client, _make_user("admin@test.test", admin=True))

    response = jobs_client.delete(JOBS_URL)

    assert response.status_code == 200
    assert response.get_json()["success"] is True


def test_the_dismiss_clears_the_finished_jobs_and_spares_the_live_one(jobs_client):
    """Through the route, not the repo: which jobs count as finished is pinned
    next door, what is pinned here is that the route delegates that verdict
    rather than clearing every row it can list."""
    from website.repos import bulk_tag_jobs as jobs_repo

    finished = _a_finished_job()
    live = jobs_repo.create(job_type="assign", total=9, user_id=1).token
    _login(jobs_client, _make_user("admin@test.test", admin=True))

    jobs_client.delete(JOBS_URL)

    assert jobs_repo.get(finished) is None
    assert jobs_repo.get(live)["status"] == "running"
