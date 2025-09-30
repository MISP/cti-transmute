#!/usr/bin/env python3

import os
from flask import Flask
from flask_wtf.csrf import CSRFProtect
from werkzeug.middleware.proxy_fix import ProxyFix

from cti_transmute.transmute import Transmute


application = Flask(__name__)
application.wsgi_app = ProxyFix(application.wsgi_app)
application.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-this")

csrf = CSRFProtect(application)


transmute: Transmute = Transmute()
