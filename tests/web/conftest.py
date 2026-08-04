import pytest


@pytest.fixture
def full_web_client():
    """Flask test client with every web blueprint mounted, mirroring
    ``bin/start_website.py`` (base.html url_for's across features, so
    rendering any page needs them all registered)."""
    from website.web import application
    from website.web.account.account import account_blueprint
    from website.web.conversions.conversions import (
        conversions_blueprint,
        legacy_convert_blueprint
    )
    from website.web.evaluate.evaluate import evaluate_blueprint
    from website.web.home import home_blueprint
    from website.web.tags.tags import tags_blueprint

    application.config["TESTING"] = True
    # Other fixtures may have served a request already; clear Flask's
    # setup-after-first-request guard so late registration stays legal.
    application._got_first_request = False
    for bp, prefix in [
        (home_blueprint, "/"),
        (conversions_blueprint, "/conversions"),
        (legacy_convert_blueprint, "/convert"),
        (account_blueprint, "/account"),
        (tags_blueprint, "/tags"),
        (evaluate_blueprint, "/evaluate")
    ]:
        if bp.name not in application.blueprints:
            application.register_blueprint(bp, url_prefix=prefix)
    return application.test_client()
