#!/usr/bin/env python3

"""Development entry point: Werkzeug's own server, reloader and debugger.

Production runs gunicorn (``bin/start_website.py``), which never calls
``application.run()``. Debug therefore exists only on this path, and only for a
loopback bind: the Werkzeug debugger is an interactive Python console, so on a
reachable interface it is remote code execution for anyone who reaches the port.
"""

import ipaddress
import os
import sys

from cti_transmute.default import get_config
from website.app import application


def is_loopback(host: str) -> bool:
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        # A name, not an address. Only the one that cannot resolve anywhere
        # else counts; anything else is treated as reachable.
        return host == 'localhost'


def resolve_debug(host: str, environ: dict | None=None) -> bool:
    """Whether to run with the debugger, refusing a bind that would expose it."""
    environ = os.environ if environ is None else environ
    debug = environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    if debug and not is_loopback(host):
        sys.exit(
            f"Refusing to start: FLASK_DEBUG=true with a bind address of {host}.\n"
            "The Werkzeug debugger is an interactive Python console, so debug is "
            "only allowed on a loopback bind.\n"
            "Either set website_listen_ip to 127.0.0.1 in config/generic.json, or "
            "unset FLASK_DEBUG."
        )
    return debug


def main():
    generic = get_config('generic')
    ip = generic['website_listen_ip']
    port = generic['website_listen_port']
    application.run(host=ip, port=port, debug=resolve_debug(ip))


if __name__ == '__main__':
    main()
