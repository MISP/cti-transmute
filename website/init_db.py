#!/usr/bin/env python3


from website.web import application, db
from website.db_class import *  # importe tes modèles

def init_db():
    with application.app_context():
        print("🔄 Suppression des tables existantes...")
        db.drop_all()
        print("✅ Création des tables...")
        db.create_all()
        print("🎉 Base de données initialisée avec succès !")

if __name__ == "__main__":
    init_db()
