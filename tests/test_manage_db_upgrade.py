"""Which revision `manage db` stamps a database that has tables but no version.

An unstamped database is one built by `db.create_all()` - the dev-container
bootstrap, and any install that skipped `manage init`. It embodies the models
of whatever checkout built it, which is not necessarily the revision the
constant names: the stamp point was pinned while the chain was mid-refactor,
and revisions have landed since, one of them creating a table.

Stamping too early is not a no-op. The upgrade then replays those revisions
against a schema that already has what they create, and dies on the first
`CREATE TABLE` of a table that is already there - on an operator's database,
during an upgrade.
"""

from bin import manage


def test_a_schema_that_already_matches_the_models_is_stamped_at_head():
    """`create_all` from a current checkout: nothing for the chain to do."""
    assert manage.unstamped_target(schema_matches_models=True) == "head"


def test_a_schema_behind_the_models_keeps_the_stamp_then_upgrade_path():
    """The case the constant was written for: an older create_all bootstrap
    that still needs the revisions after it."""
    assert (manage.unstamped_target(schema_matches_models=False)
            == manage.CREATE_ALL_SCHEMA_REV)


def test_an_up_to_date_unstamped_database_is_not_upgraded_after_stamping(
        monkeypatch):
    """Stamping head and then upgrading would be harmless; stamping the old
    revision and upgrading is what breaks. This pins the whole branch, not
    just the revision it picks."""
    calls = []
    monkeypatch.setattr(manage, "_db_state", lambda: "unstamped")
    monkeypatch.setattr(manage, "_schema_matches_models", lambda: True)
    monkeypatch.setattr(manage, "_flask_db", lambda *sub: calls.append(sub))
    monkeypatch.setattr(manage, "run", lambda *a, **k: None)

    manage._run_db_upgrade()

    assert calls == [("stamp", "head")]


def test_a_stale_unstamped_database_still_stamps_then_upgrades(monkeypatch):
    calls = []
    monkeypatch.setattr(manage, "_db_state", lambda: "unstamped")
    monkeypatch.setattr(manage, "_schema_matches_models", lambda: False)
    monkeypatch.setattr(manage, "_flask_db", lambda *sub: calls.append(sub))
    monkeypatch.setattr(manage, "run", lambda *a, **k: None)

    manage._run_db_upgrade()

    assert calls == [("stamp", manage.CREATE_ALL_SCHEMA_REV), ("upgrade",)]
