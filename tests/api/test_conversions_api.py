"""HTTP-layer tests for the read-only Conversion catalogue/history API.

The public ``/api/conversions`` surface is a sibling transport over the same
``conv_repo`` + ``access`` logic the web UI reaches through its own session
routes: listing Conversions, fetching one, and reading a Conversion's accepted
``ConversionHistory`` timeline. These pin the access scoping (the load-bearing
behaviour), the 404-not-403 stance on private rows, accepted-only history, and
the payload guards (no ``share_key`` leak, the list envelope shape).

Driven against the in-memory SQLite ``api_db_client`` (conftest), so the routes
run over the real ORM/session and the scoping is exercised for real.
"""

from website.db_class.db import User
from website.repos import conversions as conv_repo
from website.web import db


def _make_user(email, *, admin=False, api_key=None):
    user = User(first_name="u", last_name="x", email=email, admin=admin,
                api_key=api_key or email)
    db.session.add(user)
    db.session.commit()
    return user


def _make_conversion(*, owner=None, public=True, name):
    return conv_repo.create(
        user_id=None if owner is None else owner.id,
        name=name, source_format="misp", target_format="stix",
        input_text="IN", output_text="OUT", params={"version": "2.1"},
        public=public,
    )


def _key(user):
    return {"X-API-KEY": user.api_key}


def _ids(payload):
    return {row["id"] for row in payload["data"]}


# --- listing: access scoping (the load-bearing behaviour) --------------------

def test_list_anonymous_sees_public_only(api_db_client):
    owner = _make_user("owner@t.t")
    pub = _make_conversion(owner=owner, public=True, name="pub")
    priv = _make_conversion(owner=owner, public=False, name="priv")

    resp = api_db_client.get("/api/conversions")

    assert resp.status_code == 200
    ids = _ids(resp.get_json())
    assert pub.id in ids
    assert priv.id not in ids


def test_list_authenticated_sees_public_and_own_private(api_db_client):
    alice = _make_user("alice@t.t", api_key="alice-key")
    bob = _make_user("bob@t.t", api_key="bob-key")
    pub = _make_conversion(owner=bob, public=True, name="pub")
    alice_priv = _make_conversion(owner=alice, public=False, name="alice-priv")
    bob_priv = _make_conversion(owner=bob, public=False, name="bob-priv")

    resp = api_db_client.get("/api/conversions", headers=_key(alice))

    assert resp.status_code == 200
    ids = _ids(resp.get_json())
    assert pub.id in ids
    assert alice_priv.id in ids
    assert bob_priv.id not in ids


def test_list_admin_sees_all(api_db_client):
    admin = _make_user("admin@t.t", admin=True, api_key="admin-key")
    alice = _make_user("alice@t.t", api_key="alice-key")
    bob = _make_user("bob@t.t", api_key="bob-key")
    pub = _make_conversion(owner=alice, public=True, name="pub")
    alice_priv = _make_conversion(owner=alice, public=False, name="alice-priv")
    bob_priv = _make_conversion(owner=bob, public=False, name="bob-priv")

    resp = api_db_client.get("/api/conversions", headers=_key(admin))

    assert resp.status_code == 200
    ids = _ids(resp.get_json())
    assert {pub.id, alice_priv.id, bob_priv.id} <= ids


# --- single conversion + gating ----------------------------------------------

def test_get_public_conversion_returns_full_payload(api_db_client):
    owner = _make_user("owner@t.t")
    conv = _make_conversion(owner=owner, public=True, name="pub")

    resp = api_db_client.get(f"/api/conversions/{conv.id}")

    assert resp.status_code == 200
    body = resp.get_json()
    assert body["id"] == conv.id
    # the single view carries the full record, not just the list summary
    assert body["input_text"] == "IN"
    assert body["output_text"] == "OUT"


def test_get_private_conversion_as_stranger_returns_404(api_db_client):
    owner = _make_user("owner@t.t", api_key="owner-key")
    stranger = _make_user("stranger@t.t", api_key="stranger-key")
    conv = _make_conversion(owner=owner, public=False, name="priv")

    # anonymous
    assert api_db_client.get(f"/api/conversions/{conv.id}").status_code == 404
    # authenticated non-owner: 404, not 403 (don't confirm the row exists)
    resp = api_db_client.get(f"/api/conversions/{conv.id}", headers=_key(stranger))
    assert resp.status_code == 404


# --- history: accepted-only, parent-gated ------------------------------------

def test_history_returns_accepted_only(api_db_client):
    owner = _make_user("owner@t.t")
    conv = _make_conversion(owner=owner, public=True, name="pub")

    accepted = conv_repo.create_history(
        conversion=conv, new_output_text="ACCEPTED", params=None)
    conv_repo.set_history_status(accepted, "accepted")
    conv_repo.create_history(  # left pending
        conversion=conv, new_output_text="PENDING", params=None)
    rejected = conv_repo.create_history(
        conversion=conv, new_output_text="REJECTED", params=None)
    conv_repo.set_history_status(rejected, "rejected")

    resp = api_db_client.get(f"/api/conversions/{conv.id}/history")

    assert resp.status_code == 200
    rows = resp.get_json()["data"]
    assert [r["id"] for r in rows] == [accepted.id]
    assert rows[0]["status"] == "accepted"


def test_history_non_visible_parent_returns_404(api_db_client):
    owner = _make_user("owner@t.t", api_key="owner-key")
    stranger = _make_user("stranger@t.t", api_key="stranger-key")
    conv = _make_conversion(owner=owner, public=False, name="priv")
    accepted = conv_repo.create_history(
        conversion=conv, new_output_text="ACCEPTED", params=None)
    conv_repo.set_history_status(accepted, "accepted")

    assert api_db_client.get(
        f"/api/conversions/{conv.id}/history").status_code == 404
    assert api_db_client.get(
        f"/api/conversions/{conv.id}/history", headers=_key(stranger)
    ).status_code == 404


# --- contract & security guards ----------------------------------------------

def test_wrong_api_key_returns_403(api_db_client):
    resp = api_db_client.get(
        "/api/conversions", headers={"X-API-KEY": "no-such-key"})

    assert resp.status_code == 403


def test_payloads_never_leak_share_key(api_db_client):
    owner = _make_user("owner@t.t")
    conv = _make_conversion(owner=owner, public=True, name="pub")

    list_resp = api_db_client.get("/api/conversions")
    single_resp = api_db_client.get(f"/api/conversions/{conv.id}")

    assert "share_key" not in list_resp.get_data(as_text=True)
    assert "share_key" not in single_resp.get_json()


def test_list_envelope_shape_and_tags(api_db_client):
    owner = _make_user("owner@t.t")
    _make_conversion(owner=owner, public=True, name="pub")

    body = api_db_client.get("/api/conversions").get_json()

    assert set(body) == {"data", "page", "per_page", "total", "total_pages"}
    assert body["page"] == 1
    assert body["per_page"] == 10
    assert body["total"] >= 1
    item = body["data"][0]
    assert "tags" in item and isinstance(item["tags"], list)
    assert "is_favorite" not in item  # a UI affordance, not catalogue data
