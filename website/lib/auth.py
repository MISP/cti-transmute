"""API authentication: resolve the acting User from the ``X-API-KEY`` header.

The public API accepts an optional ``X-API-KEY`` header:
- **absent** → anonymous (``None``); the request proceeds and any persisted
  Conversion gets ``user_id IS NULL`` — matching the web view for logged-out
  visitors.
- **present and matches a User** → that ``User`` becomes the actor.
- **present but matches nobody** → ``InvalidApiKey`` (the API maps it to 403).
  The request does *not* silently fall through to anonymous; that would mask
  key-rotation bugs.

A valid or absent key never blocks the request; only a *wrong* key does.
"""

import functools

from flask import g, request

from website.db_class.db import User
from website.lib.exceptions import InvalidApiKey

API_KEY_HEADER = "X-API-KEY"


def resolve_api_actor() -> User | None:
    """Return the ``User`` identified by the ``X-API-KEY`` header, or ``None``.

    ``None`` means no header was sent (anonymous). Raises ``InvalidApiKey`` when
    a key is present but matches no user. An indexed exact-match lookup; no
    constant-time comparison needed.
    """
    key = request.headers.get(API_KEY_HEADER)
    if not key:
        return None
    user = User.query.filter_by(api_key=key).first()
    if user is None:
        raise InvalidApiKey("Invalid API key")
    return user


def api_actor(view):
    """Resolve the API actor onto ``flask.g.api_user`` before the view runs.

    A present-but-unknown key short-circuits to 403 *before* any payload is read
    or converted, so the auth check runs first regardless of ``?persist``.
    Absent/valid keys set ``g.api_user`` to ``None``/the ``User`` and let the
    view proceed.
    """
    @functools.wraps(view)
    def wrapper(*args, **kwargs):
        try:
            g.api_user = resolve_api_actor()
        except InvalidApiKey as exc:
            return {"message": str(exc)}, 403
        return view(*args, **kwargs)

    return wrapper
