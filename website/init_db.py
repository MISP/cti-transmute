#!/usr/bin/env python3
from website.web import application, db
from website.web.utils import create_admin, show_admin_first_connection


def init_db():
    with application.app_context():
        db.drop_all()
        db.create_all()
        admin, raw_password = create_admin()
        show_admin_first_connection(admin , raw_password)

        

if __name__ == "__main__":
    init_db()
