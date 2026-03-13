#!/usr/bin/env python3
import os
import datetime
import subprocess
import sys

def backup_database():
    """
    Create a PostgreSQL database backup using pg_dump.
    The backup file is stored in a 'backups/' folder with a timestamp.
    """

    # Database configuration
    DB_USER = "cti_user"
    DB_PASSWORD = "cti_pass"
    DB_HOST = "localhost"
    DB_PORT = "5432"
    DB_NAME = "cti_db"

    # Output directory
    backup_dir = "backups"
    os.makedirs(backup_dir, exist_ok=True)

    # Filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_file = os.path.join(backup_dir, f"{DB_NAME}_backup_{timestamp}.sql.gz")

    # Environment variable for password
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD

    # pg_dump command
    command = [
        "pg_dump",
        "-h", DB_HOST,
        "-p", DB_PORT,
        "-U", DB_USER,
        "-F", "p",           # plain SQL
        DB_NAME
    ]

    print(f"Creating backup: {backup_file}")

    try:
        # Run pg_dump and compress output
        with open(backup_file, "wb") as f_out:
            dump = subprocess.Popen(command, stdout=subprocess.PIPE, env=env)
            gzip = subprocess.Popen(["gzip"], stdin=dump.stdout, stdout=f_out)
            dump.stdout.close()
            gzip.communicate()

        print("Backup completed successfully.")
        print(f"Backup file saved at: {backup_file}")

    except Exception as e:
        print("Backup failed:", e)
        sys.exit(1)


if __name__ == "__main__":
    backup_database()
