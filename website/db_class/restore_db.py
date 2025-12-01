#!/usr/bin/env python3
import os
import subprocess
import sys
import gzip
import shutil

# Database configuration
DB_USER = "cti_user"
DB_PASSWORD = "cti_pass"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "cti_db"

def restore_database(backup_file):
    """
    Restore a PostgreSQL database from a .sql or .sql.gz backup file.
    WARNING: This will ERASE the current database content.
    """

    if not os.path.exists(backup_file):
        print(f"Backup file not found: {backup_file}")
        sys.exit(1)

    # Flexible confirmation
    print(f"WARNING: You are about to restore the database '{DB_NAME}' from: {backup_file}")
    print("This will DELETE the current database content permanently!")
    print("If you have not backed up the current database, do it now.")
    confirmation = input("Type 'yes' to proceed: ")

    if confirmation.lower() not in ("yes", "y"):
        print("Restore cancelled.")
        sys.exit(0)

    print(f"Restoring database '{DB_NAME}' from: {backup_file}")

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD

    # Drop and recreate the database using postgres superuser
    print("Dropping existing database...")
    subprocess.run(
        ["sudo", "-u", "postgres", "dropdb", "--if-exists", DB_NAME],
        check=True
    )

    print("Recreating database...")
    subprocess.run(
        ["sudo", "-u", "postgres", "createdb", DB_NAME, "-O", DB_USER],
        check=True
    )

    # Restore depending on file type
    if backup_file.endswith(".gz"):
        print("Detected .gz compressed backup. Decompressing and restoring...")
        restore_cmd = ["psql", "-h", DB_HOST, "-p", DB_PORT, "-U", DB_USER, DB_NAME]

        with gzip.open(backup_file, "rb") as f_in:
            process = subprocess.Popen(restore_cmd, stdin=subprocess.PIPE, env=env)
            shutil.copyfileobj(f_in, process.stdin)
            process.stdin.close()
            process.wait()
            if process.returncode != 0:
                print("Restore failed.")
                sys.exit(1)

    else:
        print("Detected .sql file. Restoring...")
        restore_cmd = [
            "psql",
            "-h", DB_HOST,
            "-p", DB_PORT,
            "-U", DB_USER,
            "-d", DB_NAME,
            "-f", backup_file
        ]
        subprocess.run(restore_cmd, env=env, check=True)

    print("Database restore completed successfully.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: ./restore_db.py <backup_file.sql or backup_file.sql.gz>")
        sys.exit(1)

    restore_database(sys.argv[1])
