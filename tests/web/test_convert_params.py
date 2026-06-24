"""Unit tests for the WTForm → Pydantic params builders in the convert views.

These are the testable seam of the Spine 03 web rewire: the views stop calling
their own API over HTTP and instead build the Converter's Pydantic params from
the WTForm's cleaned data, then call `submit_conversion` directly. The mapping
(strip strings, drop empties to defaults, keep real bool/int) replaces the old
`sanitazed_params` + `[None, "", False, "False"]` filter and the API's
`""`-means-true convention.
"""

from types import SimpleNamespace


def _form(**fields):
    """A stand-in for a WTForm: `form.<field>.data` reads back each value."""
    return SimpleNamespace(
        **{name: SimpleNamespace(data=value) for name, value in fields.items()}
    )


def test_stix_to_misp_params_from_a_populated_form():
    from website.web.convert.convert import _build_stix_to_misp_params

    params = _build_stix_to_misp_params(_form(
        distribution=4,
        sharing_group_id=7,
        galaxies_as_tags=True,
        no_force_contextual_data=False,
        cluster_distribution=2,
        cluster_sharing_group_id=9,
        organisation_uuid="org-uuid",
        single_event=True,
        producer="ACME",
        title="My Event",
    ))

    assert params.distribution == 4
    assert params.sharing_group_id == 7
    assert params.galaxies_as_tags is True
    assert params.cluster_distribution == 2
    assert params.cluster_sharing_group_id == 9
    assert params.organisation_uuid == "org-uuid"
    assert params.single_event is True
    assert params.producer == "ACME"
    assert params.title == "My Event"


def test_stix_to_misp_params_drops_blank_strings_to_defaults():
    from website.web.convert.convert import _build_stix_to_misp_params

    params = _build_stix_to_misp_params(_form(
        distribution=0,
        sharing_group_id=None,
        galaxies_as_tags=False,
        no_force_contextual_data=False,
        cluster_distribution=0,
        cluster_sharing_group_id=None,
        organisation_uuid="   ",   # whitespace only
        single_event=False,
        producer="",               # empty
        title="  Padded  ",        # stripped, kept
    ))

    assert params.organisation_uuid is None
    assert params.producer is None
    assert params.title == "Padded"


def test_stix_to_misp_params_blank_distribution_uses_default():
    from website.web.convert.convert import _build_stix_to_misp_params

    params = _build_stix_to_misp_params(_form(
        distribution=None,            # field left blank
        sharing_group_id=None,
        galaxies_as_tags=False,
        no_force_contextual_data=False,
        cluster_distribution=None,
        cluster_sharing_group_id=None,
        organisation_uuid=None,
        single_event=False,
        producer=None,
        title=None,
    ))

    assert params.distribution == 0          # Pydantic default, not a crash
    assert params.cluster_distribution == 0


def test_misp_to_stix_params_carries_the_version():
    from website.web.convert.convert import _build_misp_to_stix_params

    assert _build_misp_to_stix_params(_form(version="2.0")).version == "2.0"
    assert _build_misp_to_stix_params(_form(version="2.1")).version == "2.1"


def test_error_message_surfaces_invalid_payload_detail():
    from cti_transmute.exceptions import InvalidPayload
    from website.web.convert.convert import _conversion_error_message

    msg = _conversion_error_message(InvalidPayload("Payload is not valid JSON"))

    assert "Payload is not valid JSON" in msg


def test_error_message_for_persistence_failure_is_about_saving():
    from website.lib.exceptions import PersistenceFailed
    from website.web.convert.convert import _conversion_error_message

    msg = _conversion_error_message(PersistenceFailed("boom")).lower()

    assert "save" in msg or "saving" in msg


def test_error_message_for_unknown_converter_says_unsupported():
    from cti_transmute.exceptions import UnknownConverter
    from website.web.convert.convert import _conversion_error_message

    msg = _conversion_error_message(UnknownConverter("misp->nope")).lower()

    assert "unsupported" in msg or "not supported" in msg


def test_error_message_for_invalid_parameters_surfaces_detail():
    from cti_transmute.exceptions import InvalidParameters
    from website.web.convert.convert import _conversion_error_message

    msg = _conversion_error_message(InvalidParameters("distribution must be 0-4"))

    assert "parameter" in msg.lower()
    assert "distribution must be 0-4" in msg
