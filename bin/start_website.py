#!/usr/bin/env python3

from cti_transmute.default import get_config
from website.api import api_blueprint
from website.web import db
from website.web import application
from flask import render_template


@application.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404


@application.errorhandler(403)
def forbidden(e):
    return render_template("403.html"), 403


def main():
    ip = get_config('generic', 'website_listen_ip')
    port = get_config('generic', 'website_listen_port')


    from website.web.home import home_blueprint
    from website.web.convert.convert import convert_blueprint
    from website.web.account.account import account_blueprint
    from website.web.tags.tags import tags_blueprint
    from website.web.evaluate.evaluate import evaluate_blueprint

    application.register_blueprint(home_blueprint, url_prefix="/")
    application.register_blueprint(convert_blueprint, url_prefix="/convert")
    application.register_blueprint(account_blueprint, url_prefix="/account")
    application.register_blueprint(tags_blueprint, url_prefix="/tags")
    application.register_blueprint(evaluate_blueprint, url_prefix="/evaluate")



    with application.app_context():
        application.register_blueprint(api_blueprint)
        # db.drop_all()
        # db.create_all()
    import os
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    application.run(host=ip, port=port, debug=True)#debug)






if __name__ == '__main__':
    main()

