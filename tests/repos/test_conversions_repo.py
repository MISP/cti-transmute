"""Integration tests for the conversions repository.

`website/repos/conversions.py` owns Conversion + ConversionHistory persistence.
Its writes take ``commit: bool = True`` so the spine use-cases can pass
``commit=False`` and bundle the row with their audit log in one transaction.

These tests exercise the repo's public surface directly against the in-memory
SQLite ``app_db`` fixture (real ORM/session/transaction). They pin the new
contract; the pre-existing use-case/web/API suites remain the regression net
for the extraction itself.
"""


def test_create_persists_a_conversion_and_assigns_identity(app_db):
    from website.db_class.db import Conversion
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c1", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params={"a": 1},
    )

    assert conv.id is not None
    assert conv.uuid          # the repo mints the uuid
    assert conv.share_key     # ...and the share key
    # committed by default and readable back
    row = Conversion.query.get(conv.id)
    assert row is not None
    assert row.name == "c1"
    assert row.params == {"a": 1}


def test_create_with_commit_false_stages_without_committing(app_db):
    """The spine seam: commit=False flushes (id assigned) but the caller owns
    the commit, so a rollback discards the row."""
    from website.db_class.db import Conversion
    from website.repos import conversions as conv_repo
    from website.web import db

    conv = conv_repo.create(
        user_id=None, name="staged", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None, commit=False,
    )

    assert conv.id is not None        # flushed → id assigned within the tx
    db.session.rollback()             # caller decided not to keep it
    assert Conversion.query.count() == 0  # nothing persisted


def test_next_history_version_starts_at_2_and_increments(app_db):
    """The base Conversion counts as version 1, so history starts at 2."""
    import uuid as uuid_lib

    from website.db_class.db import ConversionHistory
    from website.repos import conversions as conv_repo
    from website.web import db

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )

    assert conv_repo.next_history_version(conv.id) == 2

    db.session.add(ConversionHistory(
        conversion_id=conv.id, version=2, uuid=str(uuid_lib.uuid4()),
        status="pending",
    ))
    db.session.commit()

    assert conv_repo.next_history_version(conv.id) == 3


def test_create_history_derives_fields_from_the_parent_conversion(app_db):
    from website.db_class.db import ConversionHistory
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=7, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OLD", params=None, public=False,
    )

    history = conv_repo.create_history(
        conversion=conv, new_output_text="NEW", params={"v": "2.1"},
    )

    assert history.id is not None
    assert history.conversion_id == conv.id
    assert history.version == 2                # first refresh follows base v1
    assert history.status == "pending"
    assert history.user_id == conv.user_id     # refresh doesn't change ownership
    assert history.public == conv.public
    assert history.input_text == "IN"          # snapshot of the parent input
    assert history.old_output_text == "OLD"    # parent's current output
    assert history.new_output_text == "NEW"
    assert history.params == {"v": "2.1"}
    assert history.uuid
    assert ConversionHistory.query.get(history.id) is not None


def test_set_history_status_persists_the_new_status(app_db):
    from website.db_class.db import ConversionHistory
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OLD", params=None,
    )
    history = conv_repo.create_history(
        conversion=conv, new_output_text="NEW", params=None,
    )

    conv_repo.set_history_status(history, "accepted")

    assert ConversionHistory.query.get(history.id).status == "accepted"


def test_get_hides_soft_deleted_unless_requested(app_db):
    from website.repos import conversions as conv_repo
    from website.web import db

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )
    assert conv_repo.get(conv.id).id == conv.id

    conv.is_active = False
    db.session.commit()

    assert conv_repo.get(conv.id) is None                       # hidden by default
    assert conv_repo.get(conv.id, include_deleted=True).id == conv.id


def test_get_by_uuid_returns_the_matching_row(app_db):
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )

    assert conv_repo.get_by_uuid(conv.uuid).id == conv.id
    assert conv_repo.get_by_uuid("no-such-uuid") is None


def test_soft_delete_restore_and_hard_delete_lifecycle(app_db):
    from website.db_class.db import Conversion
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )
    cid = conv.id

    # soft delete: flips is_active and stamps deleted_at
    assert conv_repo.soft_delete(cid) is True
    row = Conversion.query.get(cid)
    assert row.is_active is False
    assert row.deleted_at is not None

    # restore: reverses it
    assert conv_repo.restore(cid) is True
    row = Conversion.query.get(cid)
    assert row.is_active is True
    assert row.deleted_at is None
    # restoring an already-active row is a no-op
    assert conv_repo.restore(cid) is False

    # hard delete: removes the row entirely
    assert conv_repo.hard_delete(cid) is True
    assert Conversion.query.get(cid) is None
    # operating on a missing row reports False, not an error
    assert conv_repo.soft_delete(cid) is False


def test_toggle_visibility_flips_and_persists_public(app_db):
    from website.db_class.db import Conversion
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None, public=True,
    )

    ok, new_value = conv_repo.toggle_visibility(conv.id)

    assert ok is True
    assert new_value is False
    assert Conversion.query.get(conv.id).public is False
    assert conv_repo.toggle_visibility(-1) == (False, False)  # missing row


def test_edit_updates_fields_and_rejects_duplicate_names(app_db):
    from website.db_class.db import Conversion
    from website.repos import conversions as conv_repo

    a = conv_repo.create(
        user_id=None, name="alpha", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )
    conv_repo.create(
        user_id=None, name="beta", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )

    ok, msg = conv_repo.edit(a.id, {"name": "alpha-2", "description": "d"})
    assert ok is True
    row = Conversion.query.get(a.id)
    assert row.name == "alpha-2"
    assert row.description == "d"

    # a name already taken by another Conversion is refused
    ok, msg = conv_repo.edit(a.id, {"name": "beta"})
    assert ok is False
    assert Conversion.query.get(a.id).name == "alpha-2"  # unchanged


def test_regenerate_share_key_mints_a_new_key(app_db):
    from website.db_class.db import Conversion
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )
    old_key = conv.share_key

    ok, new_key = conv_repo.regenerate_share_key(conv.id)

    assert ok is True
    assert new_key != old_key
    assert Conversion.query.get(conv.id).share_key == new_key
    assert conv_repo.regenerate_share_key(-1) == (False, None)  # missing row


def test_history_readers_order_and_filter_by_status(app_db):
    from website.repos import conversions as conv_repo

    conv = conv_repo.create(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params=None,
    )
    h2 = conv_repo.create_history(conversion=conv, new_output_text="v2", params=None)
    h3 = conv_repo.create_history(conversion=conv, new_output_text="v3", params=None)
    h4 = conv_repo.create_history(conversion=conv, new_output_text="v4", params=None)
    conv_repo.set_history_status(h2, "accepted")
    conv_repo.set_history_status(h3, "rejected")
    conv_repo.set_history_status(h4, "accepted")

    assert conv_repo.latest_history(conv.id).version == 4
    # full history, newest version first
    assert [h.version for h in conv_repo.latest_history_list(conv.id)] == [4, 3, 2]
    # only accepted rows, oldest version first
    assert [h.version for h in conv_repo.accepted_history_list(conv.id)] == [2, 4]
    assert conv_repo.get_history(h3.id).id == h3.id
    assert conv_repo.get_history(-1) is None
