"""``website.app:application`` is the routed WSGI callable.

Blueprint registration used to live inside ``bin/start_website.py:main()``, so
importing anything in the repo yielded a Flask object with no routes and a WSGI
server had nothing to load. These fail if a mount point stops being attached at
import time, if one moves off its URL prefix, or if the error pages stop being
the app's own.

Imported at module scope on purpose: it must run during collection, before any
fixture registers a blueprint on the shared application object by hand.
"""

import pytest
from werkzeug.exceptions import Forbidden, NotFound

from website.app import application

#  blueprint name, its url_prefix, one URL it has to answer at
MOUNTS = [
    ("home", "/", "/"),
    ("conversions", "/conversions", "/conversions/history"),
    ("legacy_convert", "/convert", "/convert/"),
    ("account", "/account", "/account/login"),
    ("tags", "/tags", "/tags/admin/"),
    ("evaluate", "/evaluate", "/evaluate/overview"),
    ("transmute_api", "/api", "/api/convert/misp_to_stix")
]


@pytest.mark.parametrize("name, url_prefix, mounted_url", MOUNTS)
def test_blueprint_is_mounted_at_its_prefix(name, url_prefix, mounted_url):
    rules = [rule for rule in application.url_map.iter_rules()
             if rule.endpoint.split(".")[0] == name]
    assert rules, f"the {name} blueprint is not mounted"
    off_prefix = [rule.rule for rule in rules if not rule.rule.startswith(url_prefix)]
    assert not off_prefix
    assert mounted_url in {rule.rule for rule in rules}


@pytest.mark.parametrize("exception, marker", [
    (NotFound(), "Page not found"),
    (Forbidden(), "Access denied")
])
def test_error_page_renders_the_app_template(exception, marker):
    """Flask's stock error body is plain text; ours is the themed template."""
    with application.test_request_context("/no-such-page"):
        body, status = application.handle_http_exception(exception)

    assert status == exception.code
    assert marker in body
