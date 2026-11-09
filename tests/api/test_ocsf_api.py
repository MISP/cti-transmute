import json
from io import BytesIO

import pytest


@pytest.fixture
def client(api_db_client):
    # Reinitialize the shared Flask app before API registration, including
    # when these tests are selected after web tests in the same process.
    return api_db_client


@pytest.mark.parametrize("source,fixture", [("misp", "misp_event"), ("stix", "stix_bundle")])
def test_ocsf_api_json_upload_and_diagnostics(client, source, fixture, request):
    payload = request.getfixturevalue(fixture)
    endpoint = f"/api/convert/{source}_to_ocsf"
    response = client.post(endpoint, json=payload)
    assert response.status_code == 200
    document = response.get_json()
    assert isinstance(document, list) and document
    assert document[0]["class_uid"] == 5021
    uploaded = client.post(endpoint, data={"file": (BytesIO(json.dumps(payload).encode()), "input.json")})
    assert uploaded.status_code == 200
    assert uploaded.get_json() == document
    diagnostic = client.post(endpoint + "?diagnostics=true", json=payload)
    assert diagnostic.get_json()["conversion"] == document
    assert "diagnostics" in diagnostic.get_json()


@pytest.mark.parametrize("source,fixture", [("misp", "misp_event"), ("stix", "stix_bundle")])
def test_ocsf_api_persistence(api_db_client, source, fixture, request):
    from website.db_class.db import Conversion

    response = api_db_client.post(f"/api/convert/{source}_to_ocsf?persist=true",
                                  json=request.getfixturevalue(fixture))
    assert response.status_code == 200
    body = response.get_json()
    row = Conversion.query.get(body["id"])
    assert row.source_format == source and row.target_format == "ocsf"
    assert json.loads(row.output_text) == body["conversion"]
    assert row.params == {"source_data": "preserve", "fallback_time": 0}


def test_ocsf_parameter_contract_and_payload_errors(client, misp_event):
    assert client.post("/api/convert/misp_to_ocsf?version=1.8.0", json=misp_event).status_code == 400
    assert client.post("/api/convert/stix_to_ocsf", json={"not": "stix"}).status_code == 400
    assert client.post("/api/convert/stix_to_ocsf", json={"type": "indicator", "pattern": "invalid"}).status_code == 400
    response = client.post("/api/convert/misp_to_ocsf?source_data=omit", json=misp_event)
    assert response.status_code == 200
    assert "unmapped" not in response.get_json()[0]
    assert int(response.headers["X-Transmute-Warnings"]) > 0


def test_stix_extension_definition_bundle_converts_through_api(client, extension_definition):
    response = client.post("/api/convert/stix_to_ocsf", json={"type": "bundle", "objects": [extension_definition]})
    assert response.status_code == 200
    assert response.get_json()[0]["unmapped"]["stix"] == extension_definition


@pytest.mark.parametrize("persist", [False, True])
def test_misp_expansion_limit_returns_400_without_saving(client, persist):
    from website.db_class.db import Conversion

    payload = {"info": "fanout", "Tag": [{"name": f"tag-{i:04d}"} for i in range(1000)],
               "Attribute": [{"type": "domain", "value": "example.org"}] * 4000}
    response = client.post(f"/api/convert/misp_to_ocsf?source_data=omit&persist={str(persist).lower()}", json=payload)
    assert response.status_code == 400
    assert "size limit" in response.get_json()["errors"]["input"]
    assert Conversion.query.count() == 0
