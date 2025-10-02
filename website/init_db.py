#!/usr/bin/env python3
from website.web import application, db


def init_db():
    with application.app_context():
        db.create_all()

if __name__ == "__main__":
    init_db()
