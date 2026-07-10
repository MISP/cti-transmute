"""Pure authorization predicates over the acting Submitter (website/lib/access.py).

Every predicate takes the Submitter (``User | None``) and the target row
explicitly — no ``current_user``, no DB. Lightweight stand-in objects are
enough: a Submitter quacks with ``id`` + ``is_admin()``, a Conversion-shaped
target with ``user_id`` (+ ``public`` for visibility).
"""

from types import SimpleNamespace

import pytest

from website.lib.access import (
    assert_can_moderate,
    assert_can_push,
    assert_can_refresh,
    can_see,
    is_admin,
    is_owner,
    is_owner_or_admin,
)
from website.lib.exceptions import PermissionDenied


def _user(id=1, admin=False):
    return SimpleNamespace(id=id, is_admin=lambda: admin)


def _anonymous_object():
    """flask-login's anonymous-user object: no ``id``, is_admin() is False."""
    return SimpleNamespace(is_admin=lambda: False)


def _conversion(owner_id=1, public=True):
    return SimpleNamespace(user_id=owner_id, public=public)


# --- is_admin ----------------------------------------------------------------

def test_none_is_not_admin():
    assert is_admin(None) is False


def test_regular_user_is_not_admin():
    assert is_admin(_user(admin=False)) is False


def test_admin_user_is_admin():
    assert is_admin(_user(admin=True)) is True


def test_anonymous_object_is_not_admin():
    assert is_admin(_anonymous_object()) is False


# --- is_owner ----------------------------------------------------------------

def test_owner_owns_their_row():
    assert is_owner(_user(id=7), _conversion(owner_id=7)) is True


def test_stranger_does_not_own_the_row():
    assert is_owner(_user(id=8), _conversion(owner_id=7)) is False


def test_none_owns_nothing():
    assert is_owner(None, _conversion(owner_id=7)) is False


def test_none_does_not_own_an_anonymously_created_row():
    # A row created anonymously has user_id NULL; an anonymous Submitter must
    # still fail ownership — None == None never counts.
    assert is_owner(None, _conversion(owner_id=None)) is False


def test_anonymous_object_does_not_own_an_anonymously_created_row():
    assert is_owner(_anonymous_object(), _conversion(owner_id=None)) is False


def test_authenticated_user_does_not_own_an_anonymously_created_row():
    assert is_owner(_user(id=7), _conversion(owner_id=None)) is False


# --- is_owner_or_admin ---------------------------------------------------------

def test_owner_passes_owner_or_admin():
    assert is_owner_or_admin(_user(id=7), _conversion(owner_id=7)) is True


def test_admin_passes_owner_or_admin_on_someone_elses_row():
    assert is_owner_or_admin(_user(id=8, admin=True), _conversion(owner_id=7)) is True


def test_stranger_fails_owner_or_admin():
    assert is_owner_or_admin(_user(id=8), _conversion(owner_id=7)) is False


def test_none_fails_owner_or_admin():
    assert is_owner_or_admin(None, _conversion(owner_id=7)) is False


# --- can_see (visibility) ------------------------------------------------------

def test_public_conversion_is_visible_to_everyone():
    assert can_see(None, _conversion(owner_id=7, public=True)) is True
    assert can_see(_user(id=8), _conversion(owner_id=7, public=True)) is True


def test_private_conversion_is_visible_to_its_owner():
    assert can_see(_user(id=7), _conversion(owner_id=7, public=False)) is True


def test_private_conversion_is_visible_to_an_admin():
    assert can_see(_user(id=8, admin=True), _conversion(owner_id=7, public=False)) is True


def test_private_conversion_is_hidden_from_strangers():
    assert can_see(_user(id=8), _conversion(owner_id=7, public=False)) is False


def test_private_conversion_is_hidden_from_anonymous():
    assert can_see(None, _conversion(owner_id=7, public=False)) is False


# --- asserts ------------------------------------------------------------------

@pytest.mark.parametrize("check", [assert_can_refresh, assert_can_moderate])
def test_owner_and_admin_pass_the_asserts(check):
    check(_user(id=7), _conversion(owner_id=7))
    check(_user(id=8, admin=True), _conversion(owner_id=7))


@pytest.mark.parametrize("check", [assert_can_refresh, assert_can_moderate])
@pytest.mark.parametrize("actor", [None, _user(id=8)])
def test_stranger_and_anonymous_fail_the_asserts(check, actor):
    with pytest.raises(PermissionDenied):
        check(actor, _conversion(owner_id=7))


# --- assert_can_push: the can_see rule ----------------------------------------

@pytest.mark.parametrize("actor", [None, _user(id=8)])
def test_anyone_may_push_a_public_conversion(actor):
    assert_can_push(actor, _conversion(owner_id=7, public=True))


def test_owner_and_admin_may_push_a_private_conversion():
    assert_can_push(_user(id=7), _conversion(owner_id=7, public=False))
    assert_can_push(_user(id=8, admin=True), _conversion(owner_id=7, public=False))


@pytest.mark.parametrize("actor", [None, _user(id=8)])
def test_stranger_and_anonymous_may_not_push_a_private_conversion(actor):
    with pytest.raises(PermissionDenied):
        assert_can_push(actor, _conversion(owner_id=7, public=False))
