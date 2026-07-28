"""Integration tests for the push_to_misp use-case: authorize → build → POST →
error-mapping → activity, end-to-end.

Prior art: ``tests/lib/test_bulk_action.py`` for the ``app_db`` fixture and
outcome-based assertions, ``tests/lib/test_misp.py`` for mocking the remote
MISP instance at the HTTP layer with ``responses`` (no injection, no
monkeypatching of our own code). The payload's *content* is pinned at the pure
builder seam (``test_misp_payload.py``); here we assert the orchestration
outcomes - what was POSTed, the typed exception raised, the Activity row
written or not.
"""

import json
import uuid as _uuid
from datetime import datetime, timezone

import pytest
import requests
import responses

MISP_URL = "https://misp.example.org"


def _make_user(*, admin=False, email="owner@test.test"):
    from website.db_class.db import User
    from website.web import db

    user = User(first_name=email.split("@")[0], last_name="x",
                email=email, admin=admin, api_key=email)
    db.session.add(user)
    db.session.commit()
    return user


def _make_conversion(owner_id, misp_event, *, public=True, name="DEMO"):
    from website.db_class.db import Conversion
    from website.web import db

    now = datetime.now(timezone.utc)
    conv = Conversion(
        user_id=owner_id, name=name, source_format="misp", target_format="stix",
        input_text=json.dumps(misp_event), output_text="{}", params=None,
        created_at=now, updated_at=now, public=public, uuid=str(_uuid.uuid4())
    )
    db.session.add(conv)
    db.session.commit()
    return conv


def _mock_push_ok(new_event_id="123"):
    responses.add(responses.POST, f"{MISP_URL}/events",
                  json={"Event": {"id": new_event_id}}, status=200)


# --- happy path: build → POST → activity ---------------------------------------

@responses.activate
def test_push_sends_the_built_payload_and_records_the_activity(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp

    _mock_push_ok("123")
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    new_event_id = push_to_misp(
        owner, conversion, misp_url=MISP_URL, api_key="the-key")

    assert new_event_id == "123"
    sent = responses.calls[0].request
    assert sent.headers["Authorization"] == "the-key"
    body = json.loads(sent.body)
    assert body["Event"]["info"] == "TDD fixture event"
    assert any(o["name"] == "cti-evaluation"
               for o in body["Event"].get("Object", []))

    log = SystemLog.query.one()
    assert log.event_type == "misp_push"
    assert log.actor_id == owner.id
    assert log.target_type == "conversion"
    assert log.target_id == conversion.id
    assert log.target_name == "DEMO"
    assert MISP_URL in log.details and "123" in log.details


@responses.activate
def test_extra_tags_are_merged_without_duplicating_event_tags(app_db, misp_event):
    from website.lib.conversions import push_to_misp

    _mock_push_ok()
    misp_event["Event"]["Tag"] = [{"name": "tlp:green"}]
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k",
                 extra_tags=["tlp:green", "extra:tag", ""])

    sent_tags = [t["name"] for t in
                 json.loads(responses.calls[0].request.body)["Event"]["Tag"]]
    assert sent_tags.count("tlp:green") == 1
    assert "extra:tag" in sent_tags
    assert "" not in sent_tags


@responses.activate
def test_community_evaluations_land_on_the_pushed_event(app_db, misp_event):
    from website.db_class.db import ConversionEvaluation
    from website.lib.conversions import push_to_misp
    from website.web import db

    _mock_push_ok()
    owner = _make_user()
    voter = _make_user(email="voter@test.test")
    conversion = _make_conversion(owner.id, misp_event)
    for user in (owner, voter):
        db.session.add(ConversionEvaluation(
            conversion_id=conversion.id, user_id=user.id, eval_type="reaction",
            reaction_key='cti-evaluation:accuracy="high"',
            created_at=datetime.now(timezone.utc)))
    db.session.commit()

    push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k")

    event = json.loads(responses.calls[0].request.body)["Event"]
    sent_tags = {t["name"] for t in event["Tag"]}
    assert 'cti-evaluation:accuracy="high"' in sent_tags
    assert 'cti-evaluation:overall-score="high"' in sent_tags
    cti_obj = next(o for o in event["Object"] if o["name"] == "cti-evaluation")
    values = {a["object_relation"]: a["value"] for a in cti_obj["Attribute"]
              if a["object_relation"] in ("overall-score", "accuracy")}
    assert values == {"overall-score": "high", "accuracy": "high"}


# --- authorization: the can_see rule, checked before anything happens ----------

@responses.activate
@pytest.mark.parametrize("actor", ["stranger", "anonymous"])
def test_non_owners_may_not_push_a_private_conversion(app_db, misp_event, actor):
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp
    from website.lib.exceptions import PermissionDenied

    owner = _make_user()
    submitter = _make_user(email="stranger@test.test") if actor == "stranger" else None
    conversion = _make_conversion(owner.id, misp_event, public=False)

    with pytest.raises(PermissionDenied):
        push_to_misp(submitter, conversion, misp_url=MISP_URL, api_key="k")

    assert len(responses.calls) == 0
    assert SystemLog.query.count() == 0


@responses.activate
def test_an_admin_may_push_someone_elses_private_conversion(app_db, misp_event):
    from website.lib.conversions import push_to_misp

    _mock_push_ok()
    owner = _make_user()
    admin = _make_user(admin=True, email="admin@test.test")
    conversion = _make_conversion(owner.id, misp_event, public=False)

    assert push_to_misp(admin, conversion, misp_url=MISP_URL, api_key="k") == "123"


@responses.activate
def test_an_anonymous_submitter_may_push_a_public_conversion(app_db, misp_event):
    # The transport-ready seam: the web route keeps @login_required, but the
    # can_see rule lets an anonymous Submitter push a *public* Conversion to
    # their own MISP instance — the Activity entry stamps "Anonymous".
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp

    _mock_push_ok("55")
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    new_event_id = push_to_misp(None, conversion, misp_url=MISP_URL, api_key="k")

    assert new_event_id == "55"
    log = SystemLog.query.one()
    assert log.actor_id is None
    assert log.actor_name == "Anonymous"


# --- build failure: nothing is POSTed, nothing is recorded ---------------------

@responses.activate
def test_undecodable_conversion_data_fails_before_any_request(app_db):
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp
    from website.lib.exceptions import ValidationFailed

    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event=None)
    conversion.input_text = "not json"

    with pytest.raises(ValidationFailed):
        push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k")

    assert len(responses.calls) == 0
    assert SystemLog.query.count() == 0


# --- error mapping: the typed MispError cascade, no activity on failure --------

@responses.activate
def test_a_rejected_key_raises_auth_failed_and_records_nothing(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp
    from website.lib.misp import MispAuthFailed

    responses.add(responses.POST, f"{MISP_URL}/events", json={}, status=403)
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    with pytest.raises(MispAuthFailed):
        push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="bad")

    assert SystemLog.query.count() == 0


@responses.activate
def test_an_unreachable_instance_raises_unreachable(app_db, misp_event):
    from website.lib.conversions import push_to_misp
    from website.lib.misp import MispUnreachable

    responses.add(responses.POST, f"{MISP_URL}/events",
                  body=requests.exceptions.ConnectionError())
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    with pytest.raises(MispUnreachable):
        push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k")


@responses.activate
def test_an_upstream_5xx_raises_http_error(app_db, misp_event):
    from website.lib.conversions import push_to_misp
    from website.lib.misp import MispHttpError

    responses.add(responses.POST, f"{MISP_URL}/events", json={}, status=500)
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    with pytest.raises(MispHttpError) as exc_info:
        push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k")
    assert exc_info.value.status == 500


@responses.activate
def test_misp_errors_inside_a_2xx_body_raise_http_error_with_the_message(app_db, misp_event):
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp
    from website.lib.misp import MispHttpError

    responses.add(responses.POST, f"{MISP_URL}/events",
                  json={"errors": "Event blocked by blocklist"}, status=200)
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    with pytest.raises(MispHttpError, match="blocklist"):
        push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k")

    assert SystemLog.query.count() == 0


# --- the activity entry is best-effort after a landed push ---------------------

@responses.activate
def test_a_failed_activity_write_never_misreports_a_landed_push(
        app_db, misp_event, monkeypatch):
    from website.db_class.db import SystemLog
    from website.lib.conversions import push_to_misp
    from website.web import db

    _mock_push_ok("77")
    owner = _make_user()
    conversion = _make_conversion(owner.id, misp_event)

    def commit_failing():
        raise RuntimeError("database hiccup")

    monkeypatch.setattr(db.session, "commit", commit_failing)
    new_event_id = push_to_misp(owner, conversion, misp_url=MISP_URL, api_key="k")

    monkeypatch.undo()
    assert new_event_id == "77"     # the push still reports its success
    assert SystemLog.query.count() == 0  # the lost entry rolled back cleanly
