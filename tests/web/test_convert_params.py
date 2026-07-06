"""Unit tests for the conversion view's ConversionError → flash-message mapping.

The WTForm→Pydantic params builders that used to live here are retired: params
now travel as JSON and are built + validated by the shared
`website.lib.params.build_params` (see `tests/lib/test_params.py`), and the
fetch/JSON submission is covered by `tests/web/test_convert_submit.py`. What
remains view-local is turning a typed `ConversionError` into a human message.
"""


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
