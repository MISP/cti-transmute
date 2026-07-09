"""Shared authorization rules over the acting Submitter.

Pure predicates/asserts: each takes the acting Submitter and the target row
explicitly — none reads ``current_user``, the request, or the database — so the
same rules serve every transport (web routes, ``lib/`` use-cases, a future API
surface) without a rewrite.

The Submitter is ``User | None``; ``None`` is an anonymous visitor. flask-login's
anonymous-user object is tolerated and treated the same as ``None``: an anonymous
Submitter never owns anything and is never an admin — including rows whose own
``user_id`` is ``NULL`` (anonymously created Conversions).

Targets are duck-typed: ownership reads ``target.user_id`` (Conversion, Comment,
ConversionHistory, …), visibility additionally reads ``conversion.public``.
"""

from website.lib.exceptions import PermissionDenied


def is_admin(user) -> bool:
    """True if the Submitter is an admin; anonymous is never an admin."""
    if user is None:
        return False
    check = getattr(user, "is_admin", None)
    return bool(check()) if callable(check) else False


def is_owner(user, target) -> bool:
    """True if the Submitter owns ``target`` (a row with a ``user_id`` column)."""
    if user is None:
        return False
    user_id = getattr(user, "id", None)
    return user_id is not None and user_id == target.user_id


def is_owner_or_admin(user, target) -> bool:
    """The owner-or-admin rule guarding mutations of an owned row."""
    return is_owner(user, target) or is_admin(user)


def can_see(user, conversion) -> bool:
    """Visibility: a public Conversion is visible to everyone, a private one
    only to its owner or an admin."""
    return bool(conversion.public) or is_owner_or_admin(user, conversion)


def assert_can_refresh(user, conversion) -> None:
    """Allow only the Conversion's owner or an admin to refresh it.

    Anonymous (``user is None``) and any other user raise ``PermissionDenied``.
    """
    if not is_owner_or_admin(user, conversion):
        raise PermissionDenied("You may not refresh this conversion.")


def assert_can_moderate(user, conversion) -> None:
    """Allow only the Conversion's owner or an admin to accept/reject its history."""
    if not is_owner_or_admin(user, conversion):
        raise PermissionDenied("You may not moderate this conversion's history.")


def assert_can_comment(user, conversion) -> None:
    """Allow an authenticated Submitter to comment on a Conversion they can see.

    Anonymous (``user is None``) may not comment at all; a private Conversion
    accepts comments only from its owner or an admin (the ``can_see`` rule).
    """
    if user is None:
        raise PermissionDenied("You must be logged in to comment.")
    if not can_see(user, conversion):
        raise PermissionDenied("You cannot comment on a private conversion.")
