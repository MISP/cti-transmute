#!/usr/bin/env python3

import os

from cti_transmute.default import get_config
from website.app import application


def main():
    ip = get_config('generic', 'website_listen_ip')
    port = get_config('generic', 'website_listen_port')
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    application.run(host=ip, port=port, debug=debug)


if __name__ == '__main__':
    main()
