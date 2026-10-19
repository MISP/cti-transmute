#!/usr/bin/env python3

"""Production entry point: hand the process over to gunicorn.

Werkzeug's ``application.run()`` lives in ``bin/dev_server.py`` instead, so this
path never calls it and the interactive debugger cannot be switched on here by
an environment variable. The process is replaced rather than spawned, so a
supervisor signals gunicorn directly.
"""

import os
import sys

from cti_transmute.default import get_config

DEFAULT_THREADS = 8


def gunicorn_command() -> list[str]:
    """The argv gunicorn is exec'd with."""
    # Read as one dict so a config file written before website_threads existed
    # keeps starting the service on the default.
    generic = get_config('generic')
    ip = generic['website_listen_ip']
    port = generic['website_listen_port']
    threads = generic.get('website_threads', DEFAULT_THREADS)
    return [
        # Through the interpreter already running, not through PATH: a service
        # manager starting the console script by its absolute path hands it the
        # system PATH, which has no virtualenv on it.
        sys.executable, '-m', 'gunicorn',
        # One worker because nobody has measured a need for more, not because
        # more would break. Bulk tag jobs keep their state in the database now
        # (website/repos/bulk_tag_jobs.py), and what is left in process memory
        # is read-only data loaded from disk, identical in every process, so
        # raising this is a capacity decision. What it buys is GIL parallelism
        # for CPU-bound STIX parsing; what it costs is N times the Postgres
        # connection budget, one SQLAlchemy pool per process.
        '-w', '1',
        # gthread, not sync: application.run() served requests concurrently
        # (threaded=True) and a sync worker serves exactly one at a time.
        '--worker-class', 'gthread',
        '--threads', str(threads),
        # Long STIX conversions are CPU-bound and run inside the request;
        # matches the read timeout documented for the reverse proxy.
        '--timeout', '300',
        '--graceful-timeout', '2',
        # gunicorn logs no request unless told to, and the development server
        # it replaces logged every one. Standard output, so whatever supervises
        # the process collects it.
        '--access-logfile', '-',
        '-b', f'{ip}:{port}',
        'website.app:application'
    ]


def main():
    command = gunicorn_command()
    os.execvp(command[0], command)


if __name__ == '__main__':
    main()
