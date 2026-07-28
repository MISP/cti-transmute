"""The timestamp wire format is ISO-8601 UTC with an explicit Z marker.

The models store UTC wall-clock datetimes but used to serialize them with a
naive strftime('%Y-%m-%d %H:%M'): no offset marker, so browsers parsed the
string as viewer-local time and every relative/absolute display was off by
the viewer's UTC offset. These tests pin the unambiguous format at the single
source (the to_json serializers in website/db_class/db.py) for representative
models, plus a source-level guard that no naive site remains.
"""

import json
import re
import uuid as _uuid
from datetime import datetime, timezone

ISO_Z = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")


def _assert_iso_z(value, field):
    assert value is not None, f"{field} missing"
    assert ISO_Z.match(value), f"{field} not ISO-8601 UTC with Z marker: {value!r}"
    parsed = datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    assert abs((parsed - datetime.now(timezone.utc)).total_seconds()) < 300


def test_conversion_to_json_timestamps_carry_the_utc_marker(app_db):
    from website.db_class.db import Conversion

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4())
    )
    app_db.session.add(conv)
    app_db.session.commit()
    data = conv.to_json()
    _assert_iso_z(data["created_at"], "created_at")
    _assert_iso_z(data["updated_at"], "updated_at")
    listed = conv.to_json_list()
    _assert_iso_z(listed["created_at"], "created_at (list)")
    assert listed["deleted_at"] is None


def test_comment_and_system_log_timestamps_carry_the_utc_marker(app_db):
    from website.db_class.db import Comment, Conversion, SystemLog

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=None, name="c", source_format="misp", target_format="stix",
        input_text=json.dumps({}), output_text="x", params=None,
        created_at=now, updated_at=now, public=True, uuid=str(_uuid.uuid4())
    )
    app_db.session.add(conv)
    app_db.session.commit()
    comment = Comment(conversion_id=conv.id, user_id=None, content="hi",
                      created_at=now, is_deleted=False)
    log = SystemLog(event_type="conversion_created", actor_name="t",
                    target_type="conversion", target_id=conv.id,
                    target_name="c", created_at=now)
    app_db.session.add_all([comment, log])
    app_db.session.commit()
    _assert_iso_z(comment.to_json()["created_at"], "Comment.created_at")
    _assert_iso_z(log.to_json()["created_at"], "SystemLog.created_at")


def test_no_naive_strftime_site_remains_in_the_website_tree():
    """No serializer anywhere under website/ may emit an offset-less
    datetime: allowed are the Z-marked ISO form, a literal ' UTC' suffix
    (human-readable documents), and date-only calendar values."""
    import pathlib

    root = pathlib.Path(__file__).parents[2] / "website"
    naive_fmt = re.compile(r"strftime\(['\"][^'\"]*%H:%M(?::%S)?['\"]\)")
    naive = []
    for path in root.rglob("*.py"):
        if "migrations" in path.parts:
            continue
        for lineno, line in enumerate(path.read_text().splitlines(), 1):
            if naive_fmt.search(line):
                naive.append(f"{path.relative_to(root)}:{lineno}: {line.strip()}")
    assert naive == [], f"naive (offset-less) strftime sites remain: {naive}"
