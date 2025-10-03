#!/usr/bin/env python3
"""
Installation script for PostgreSQL and Flask database for CTI-Transmute.
This will:
  - Install PostgreSQL (Linux/Debian)
  - Create database and user
  - Initialize Flask database tables
"""

import os
import subprocess
import sys
from getpass import getpass

# Flask imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from website.web import application, db

# Configuration
DB_NAME = "cti_db"
DB_USER = "cti_user"
DB_PASSWORD = "cti_pass"
DB_PORT = 5432

def run_command(cmd):
    """Run a shell command and exit if it fails."""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"Command failed: {cmd}")
        sys.exit(1)

def install_postgresql():
    """Install PostgreSQL (Debian/Ubuntu)."""
    print("Installing PostgreSQL...")
    run_command("sudo apt update")
    run_command("sudo apt install -y postgresql postgresql-contrib")

def start_postgresql_service():
    print("Starting PostgreSQL service...")
    run_command("sudo systemctl enable postgresql")
    run_command("sudo systemctl start postgresql")

def create_db_user_and_db():
    print("Creating database and user...")
    # Ask password if not set
    global DB_PASSWORD
    if not DB_PASSWORD:
        DB_PASSWORD = getpass(f"Enter password for database user {DB_USER}: ")

    # Drop existing DB/user
    print("Dropping existing database and user if they exist...")
    run_command(f"sudo -u postgres psql -c \"DROP DATABASE IF EXISTS {DB_NAME};\"")
    run_command(f"sudo -u postgres psql -c \"DROP USER IF EXISTS {DB_USER};\"")

    # Create user
    run_command(f"sudo -u postgres psql -c \"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASSWORD}';\"")
    # Create database
    run_command(f"sudo -u postgres psql -c \"CREATE DATABASE {DB_NAME} OWNER {DB_USER};\"")
    # Grant privileges
    run_command(f"sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};\"")

def init_flask_db():
    print("Initializing Flask database tables...")
    with application.app_context():
        db.create_all()
    print("Database initialized successfully!")

def main():
    install_postgresql()
    start_postgresql_service()
    create_db_user_and_db()
    init_flask_db()
    print("✅ PostgreSQL and Flask DB installation complete!")

if __name__ == "__main__":
    main()
