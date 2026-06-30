"""HTTP-layer tests for the conversion routes (Flask test client)."""


def test_list_available_keyed_by_registry_urls(client):
    """The list reflects the registry: one entry per registered Converter,
    keyed by that Converter's POST URL.

    ADR-0011: MISP->STIX is a single Converter with `version` as a param, so
    there are two entries (not a 2.0/2.1 split). The keys are the existing
    public URLs the README and integrations rely on.
    """
    resp = client.get("/api/convert/list")

    assert resp.status_code == 200
    available = resp.get_json()["available"]
    assert set(available) == {
        "/api/convert/misp_to_stix",
        "/api/convert/stix_to_misp",
    }


def test_list_entry_declares_source_target_and_post_method(client):
    """Each entry names the source/target formats it bridges and the HTTP
    method to call it with."""
    available = client.get("/api/convert/list").get_json()["available"]

    misp_to_stix = available["/api/convert/misp_to_stix"]
    assert misp_to_stix["source"] == "misp"
    assert misp_to_stix["target"] == "stix"
    assert misp_to_stix["method"] == "POST"

    stix_to_misp = available["/api/convert/stix_to_misp"]
    assert stix_to_misp["source"] == "stix"
    assert stix_to_misp["target"] == "misp"
    assert stix_to_misp["method"] == "POST"


def test_list_entry_publishes_valid_jsonschema_params(client):
    """Each entry carries a non-empty params_schema that is itself a valid
    JSON Schema (Draft 2020-12, as Pydantic v2 emits), so a client can use it
    to validate a request body before sending."""
    from jsonschema import Draft202012Validator

    available = client.get("/api/convert/list").get_json()["available"]

    for url, entry in available.items():
        schema = entry["params_schema"]
        assert schema, f"{url} has an empty params_schema"
        # Raises SchemaError if it is not a valid Draft 2020-12 schema.
        Draft202012Validator.check_schema(schema)


def test_misp_to_stix_params_schema_round_trips_through_endpoint(client, misp_event):
    """The published schema describes the real contract: a client reads it,
    picks a value it permits, and the actual endpoint accepts and honours it."""
    from jsonschema import Draft202012Validator

    available = client.get("/api/convert/list").get_json()["available"]
    schema = available["/api/convert/misp_to_stix"]["params_schema"]

    # The version param is discoverable from the published schema...
    assert "version" in schema["properties"]
    # ...a value it permits validates against it...
    Draft202012Validator(schema).validate({"version": "2.0"})
    # ...and that same value is accepted and honoured by the live endpoint.
    resp = client.post("/api/convert/misp_to_stix?version=2.0", json=misp_event)
    assert resp.status_code == 200
    assert resp.get_json().get("spec_version") == "2.0"


def test_list_entry_describes_the_conversion(client):
    """Each entry carries a human-readable description of the conversion it
    performs, sourced from the Converter itself."""
    available = client.get("/api/convert/list").get_json()["available"]

    misp_to_stix = available["/api/convert/misp_to_stix"]["description"]
    assert misp_to_stix and "MISP" in misp_to_stix and "STIX" in misp_to_stix

    stix_to_misp = available["/api/convert/stix_to_misp"]["description"]
    assert stix_to_misp and "STIX" in stix_to_misp and "MISP" in stix_to_misp


def test_list_reflects_a_newly_registered_converter(client):
    """A new Converter shows up in the listing with no further code change:
    the list is driven by the registry, not a hand-maintained table."""
    from pydantic import BaseModel

    from cti_transmute import transmute
    from cti_transmute.converter import Converter

    class _ScratchParams(BaseModel):
        pass

    class _OpenIocToStix(Converter):
        source_format = "openioc"
        target_format = "stix"
        output_format = "application/json"
        description = "Throwaway converter for the registry-driven test."
        params_class = _ScratchParams

        def process(self, payload, params):  # pragma: no cover - never run
            return {}

    transmute.register(_OpenIocToStix())
    try:
        available = client.get("/api/convert/list").get_json()["available"]
        assert "/api/convert/openioc_to_stix" in available
        entry = available["/api/convert/openioc_to_stix"]
        assert entry["source"] == "openioc"
        assert entry["target"] == "stix"
        assert entry["method"] == "POST"
    finally:
        transmute._converters.pop(("openioc", "stix"), None)


def test_openapi_scraping_helpers_are_gone():
    """The list endpoint reads the registry directly; the OpenAPI-schema
    scraper (and its Api-lookup helper) are deleted, not just unused."""
    import website.api.convert as convert_module

    assert not hasattr(convert_module, "_extract_converters_from_schema")
    assert not hasattr(convert_module, "_get_api_from_namespace")


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
