#!/usr/bin/env python3

import os
from importlib.metadata import version as _dist_version
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, request, url_for
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from werkzeug.middleware.proxy_fix import ProxyFix

from flask_session import Session

load_dotenv()

application = Flask(__name__)
application.wsgi_app = ProxyFix(application.wsgi_app)
application.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-this")
application.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://cti_user:cti_pass@localhost:5432/cti_db"

application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
application.config['SESSION_TYPE'] = 'filesystem'
session_file_dir = os.environ.get("SESSION_FILE_DIR")
if session_file_dir:
    Path(session_file_dir).mkdir(parents=True, exist_ok=True)
    application.config["SESSION_FILE_DIR"] = session_file_dir

# Flask 3.x defaults MAX_FORM_MEMORY_SIZE to 500 KB which rejects large MISP JSON payloads.
# Set both limits to 50 MB to accommodate large events.
application.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024   # 50 MB — total request size
application.config["MAX_FORM_MEMORY_SIZE"] = 50 * 1024 * 1024  # 50 MB — non-file form fields

csrf = CSRFProtect(application)

db = SQLAlchemy()
sess = Session()
login_manager = LoginManager()


migrate = Migrate()
db.init_app(application)
csrf.init_app(application)

migrate.init_app(application, db, directory='website/migrations', render_as_batch=True)


login_manager.login_view = "account.login"
login_manager.init_app(application)

application.config["SESSION_SQLALCHEMY"] = db
sess.init_app(application)


# Cookie hardening. HttpOnly is already the Flask/flask-login default.
def _cookie_secure_from_env() -> bool:
    """Secure requires TLS end-to-end from the browser's point of view:
    localhost is exempt in browsers, but a dev container reached by plain-HTTP
    IP is not, so such setups opt out with SESSION_COOKIE_SECURE=false in .env.
    """
    return os.environ.get("SESSION_COOKIE_SECURE", "true").lower() not in ("0", "false", "no")


_secure_cookies = _cookie_secure_from_env()
application.config["SESSION_COOKIE_SECURE"] = _secure_cookies
application.config["SESSION_COOKIE_SAMESITE"] = "Lax"
application.config["REMEMBER_COOKIE_SECURE"] = _secure_cookies
application.config["REMEMBER_COOKIE_SAMESITE"] = "Lax"


# Content-Security-Policy. The two 'unsafe-*' allowances are forced by the
# no-build-step frontend: Vue's runtime compiler needs 'unsafe-eval' (in-DOM
# templates compile via new Function), and the inline Jinja <script> blocks
# plus on*= handlers in templates need 'unsafe-inline'. Everything else is
# vendored under static/ except highlight.js/zxcvbn (cdnjs), echarts/chart.js/
# diff (jsdelivr), the Inter/JetBrains Mono fonts (Google Fonts), and the demo
# video thumbnail (img.youtube.com). Pivotick spawns its graph worker from a
# blob: URL.
_CSP = "; ".join((
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://img.youtube.com",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
))


@application.after_request
def _set_security_headers(response):
    """Stamp every response with the security headers.

    setdefault so a route can consciously override a header; HSTS only when
    the request arrived over TLS (X-Forwarded-Proto via ProxyFix), so a
    plain-HTTP dev instance never pins browsers to HTTPS.
    """
    response.headers.setdefault("Content-Security-Policy", _CSP)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), geolocation=(), microphone=()")
    if request.is_secure:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    return response


# Single source of truth for the displayed version: the installed package
# metadata, built from pyproject.toml's [project] version. Templates read it
# as {{ app_version }} so the footer never drifts from the real version.
application.jinja_env.globals["app_version"] = _dist_version("cti-transmute")


@application.template_global()
def asset_url(filename):
    """Static URL cache-busted with the file's last-modified time.

    The browser caches the asset but re-fetches it the moment the file changes
    (the ``?v=`` stamp changes), so editing a JS/CSS file never needs a manual
    cache clear. Use in templates: ``src="{{ asset_url('js/conversions/x.js') }}"``.
    """
    try:
        version = int(os.path.getmtime(os.path.join(application.static_folder, filename)))
    except OSError:
        version = 0
    return f"{url_for('static', filename=filename)}?v={version}"
