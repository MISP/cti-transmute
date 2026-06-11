"""HTTP-layer tests for the conversion routes (Flask test client)."""


def test_route_converts_misp_to_stix(client, misp_event):
    resp = client.post("/api/convert/misp_to_stix", json=misp_event)

    assert resp.status_code == 200
    assert resp.get_json()["type"] == "bundle"


def test_route_invalid_payload_returns_400(client):
    resp = client.post("/api/convert/misp_to_stix", json={"not": "a misp event"})

    assert resp.status_code == 400


def test_route_version_2_0_query_param_flows_through(client, misp_event):
    resp = client.post("/api/convert/misp_to_stix?version=2.0", json=misp_event)

    assert resp.status_code == 200
    assert resp.get_json().get("spec_version") == "2.0"


def test_route_converts_stix_to_misp(client, stix_bundle):
    resp = client.post("/api/convert/stix_to_misp", json=stix_bundle)

    assert resp.status_code == 200
    assert resp.get_json()["info"] == "TDD fixture event"


def test_route_stix_to_misp_invalid_payload_returns_400(client):
    resp = client.post("/api/convert/stix_to_misp", json={"not": "stix"})

    assert resp.status_code == 400
