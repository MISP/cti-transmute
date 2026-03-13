#!/usr/bin/env python3

import os
from flask import  Flask
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_login import LoginManager
from cti_transmute.transmute import Transmute


application = Flask(__name__)
application.wsgi_app = ProxyFix(application.wsgi_app)
application.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-this")
application.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg2://cti_user:cti_pass@localhost:5432/cti_db"

application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
application.config['SESSION_TYPE'] = 'filesystem'  

csrf = CSRFProtect(application)
db = SQLAlchemy()
sess = Session()
login_manager = LoginManager()


migrate = Migrate()
db.init_app(application)
csrf.init_app(application)

from website.db_class import db as db_module 
migrate.init_app(application, db, directory='website/migrations', render_as_batch=True)


login_manager.login_view = "account.login"
login_manager.init_app(application)

application.config["SESSION_SQLALCHEMY"] = db
sess.init_app(application)

transmute: Transmute = Transmute()
