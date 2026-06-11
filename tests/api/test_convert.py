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


def test_route_bare_boolean_flag_does_not_500(client, stix_bundle):
    # A bare store_true flag is how a boolean is naturally passed; the web UI
    # sends it as an empty string. It must not raise an uncaught ValidationError.
    resp = client.post("/api/convert/stix_to_misp?galaxies_as_tags", json=stix_bundle)

    assert resp.status_code == 200


def test_route_empty_boolean_flag_does_not_500(client, stix_bundle):
    resp = client.post("/api/convert/stix_to_misp?single_event=", json=stix_bundle)

    assert resp.status_code == 200


def test_build_params_coerces_present_bool_flag_to_true():
    from cti_transmute.converters.stix_to_misp import StixToMispParams
    from website.api.convert import MispStixConverter

    # Mirrors what reqparse yields: present store_true flag -> "" (web UI),
    # unset flag -> None, ints pass through.
    params = MispStixConverter._build_params(
        StixToMispParams,
        {"galaxies_as_tags": "", "single_event": None, "distribution": 3, "title": None},
    )

    assert params.galaxies_as_tags is True   # present -> True
    assert params.single_event is False      # None dropped -> model default
    assert params.distribution == 3
