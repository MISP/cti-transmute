import json

import pytest


@pytest.fixture
def ocsf_client(app_db, full_web_client):
    from website.web import application

    previous = application.config.get("WTF_CSRF_ENABLED", True)
    application.config["WTF_CSRF_ENABLED"] = False
    yield full_web_client
    application.config["WTF_CSRF_ENABLED"] = previous


@pytest.mark.parametrize("source,fixture", [("misp", "misp_event"), ("stix", "stix_bundle")])
def test_ocsf_page_submit_detail_and_download(ocsf_client, source, fixture, request):
    from website.db_class.db import Conversion

    endpoint = f"/conversions/{source}_to_ocsf"
    page = ocsf_client.get(endpoint)
    assert page.status_code == 200
    assert b"OCSF 1.9.0" in page.data
    payload = request.getfixturevalue(fixture)
    response = ocsf_client.post(endpoint, json={"payload": json.dumps(payload), "public": True})
    assert response.status_code == 200
    body = response.get_json()
    conversion = Conversion.query.get(body["id"])
    assert conversion.target_format == "ocsf"
    detail = ocsf_client.get(body["url"])
    assert detail.status_code == 200
    output = ocsf_client.get(f"/conversions/download/{conversion.id}/output")
    assert f"ocsf-output-{conversion.id}.json" in output.headers["Content-Disposition"]
    assert output.get_json()[0]["class_uid"] == 5021
    original = ocsf_client.get(f"/conversions/download/{conversion.id}/input")
    assert f"{source}-input-" in original.headers["Content-Disposition"]
    assert original.get_json() == payload


def test_anonymous_private_save_is_rejected_before_creating_an_inaccessible_row(ocsf_client, misp_event):
    from website.db_class.db import Conversion

    response = ocsf_client.post("/conversions/misp_to_ocsf", json={"payload": json.dumps(misp_event), "public": False})
    assert response.status_code == 400
    assert "Sign in" in response.get_json()["error"]
    assert Conversion.query.count() == 0


@pytest.mark.parametrize("source,fixture", [("misp", "misp_event"), ("stix", "stix_bundle")])
@pytest.mark.parametrize("length", [255, 256, 512])
def test_ocsf_saved_name_database_limit(ocsf_client, source, fixture, length, request):
    from website.db_class.db import Conversion

    name = "é" * length
    response = ocsf_client.post(f"/conversions/{source}_to_ocsf", json={
        "payload": json.dumps(request.getfixturevalue(fixture)), "public": True, "name": name})
    if length == 255:
        assert response.status_code == 200
        assert Conversion.query.one().name == name
    else:
        assert response.status_code == 400
        assert "255" in response.get_json()["fields"]["name"]
        assert Conversion.query.count() == 0
