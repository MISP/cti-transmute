"""Service-layer exceptions.

Persistence knowledge stays out of the Flask-free engine:
`PersistenceFailed` lives here in `website/`, but subclasses the engine's
`ConversionError` base so callers can catch the whole conversion hierarchy.
"""

from cti_transmute.exceptions import ConversionError


class PersistenceFailed(ConversionError):
    """A conversion's persistence (DB write) failed; nothing was written."""


class InvalidApiKey(Exception):
    """An ``X-API-KEY`` header was supplied but matches no user.

    Auth failure, not a conversion failure — so it deliberately does *not*
    subclass ``ConversionError``. The API layer maps it to HTTP 403.
    """


class ValidationFailed(Exception):
    """The submitted data is invalid (bad length, missing referent, …);
    nothing was written.

    Not a conversion failure, so it does not subclass ``ConversionError``.
    Transports map it to HTTP 400 with ``str(exc)`` as the message.
    """


class PermissionDenied(Exception):
    """The actor may not perform this action on the Conversion.

    An authorisation failure, not a conversion failure — so, like
    ``InvalidApiKey``, it deliberately does *not* subclass ``ConversionError``,
    and conversion-error handling never swallows it. The API maps it to HTTP
    403; the Web aborts 403 (or redirects anonymous callers to login).
    """
