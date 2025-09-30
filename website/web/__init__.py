#!/usr/bin/env python3

import os
from flask import  Flask
from flask_wtf.csrf import CSRFProtect
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix

from cti_transmute.transmute import Transmute


application = Flask(__name__)
application.wsgi_app = ProxyFix(application.wsgi_app)
application.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-this")
application.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://cti_user:cti_pass@localhost:5432/cti_db"

application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config['SESSION_TYPE'] = 'filesystem'  # simple, stocke les sessions sur disque


csrf = CSRFProtect(application)
db = SQLAlchemy()
sess = Session()



db.init_app(application)
csrf.init_app(application)
application.config["SESSION_SQLALCHEMY"] = db
sess.init_app(application)

transmute: Transmute = Transmute()
