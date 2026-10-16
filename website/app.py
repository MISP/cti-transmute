#!/usr/bin/env python3

"""The routed WSGI application: ``website.app:application``.

``website/web/__init__.py`` builds the Flask object and its extensions but
attaches no routes. Importing *this* module is what mounts the blueprints and
the error pages, so it is what a WSGI server loads. There is no application
factory: the import itself is the composition step.
"""

from flask import render_template

from website.api import api_blueprint
from website.web import application
from website.web.account.account import account_blueprint
from website.web.conversions.conversions import (
    conversions_blueprint, legacy_convert_blueprint)
from website.web.evaluate.evaluate import evaluate_blueprint
from website.web.home import home_blueprint
from website.web.tags.tags import tags_blueprint


@application.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404


@application.errorhandler(403)
def forbidden(e):
    return render_template("403.html"), 403


application.register_blueprint(home_blueprint, url_prefix="/")
application.register_blueprint(conversions_blueprint, url_prefix="/conversions")
application.register_blueprint(legacy_convert_blueprint, url_prefix="/convert")
application.register_blueprint(account_blueprint, url_prefix="/account")
application.register_blueprint(tags_blueprint, url_prefix="/tags")
application.register_blueprint(evaluate_blueprint, url_prefix="/evaluate")

with application.app_context():
    application.register_blueprint(api_blueprint)
