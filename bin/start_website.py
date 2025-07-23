#!/usr/bin/env python3

from cti_transmute.default import get_config, get_homedir
from website.api import api_blueprint
from website.web import application


def main():
    ip = get_config('generic', 'website_listen_ip')
    port = get_config('generic', 'website_listen_port')
    with application.app_context():
        application.register_blueprint(api_blueprint)
    application.run(host=ip, port=port, debug=True)


if __name__ == '__main__':
    main()
