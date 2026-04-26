from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
import os
import subprocess
from datetime import datetime, timedelta
from dotenv import load_dotenv

from app.users.permissions import role_required

# ---------------- LOAD ENV ----------------
load_dotenv()

# ---------------- ROUTER (SECURED) ----------------
router = APIRouter(
    prefix="/backup",
    tags=["Database Backup"],
    dependencies=[Depends(role_required(["super_admin"], bypass_admin=False))]
)

# ---------------- CONFIG ----------------
DB_URL = os.getenv("DB_URL3")
PG_DUMP_PATH = os.getenv("PG_DUMP_PATH", "pg_dump")

if not DB_URL:
    raise ValueError("❌ DB_URL3 is not set")

# ✅ Normalize DB URL for pg_dump
if DB_URL.startswith("postgresql+psycopg2://"):
    DB_URL = DB_URL.replace("postgresql+psycopg2://", "postgresql://", 1)

elif DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

print(f"🔍 Normalized DB_URL: {DB_URL}")

# ---------------- BACKUP DIR ----------------
BACKUP_DIR = os.path.join(os.getcwd(), "backup_files")
os.makedirs(BACKUP_DIR, exist_ok=True)

# ---------------- CLEANUP OLD BACKUPS ----------------
def cleanup_old_backups(days: int = 7):
    now = datetime.now()

    for file in os.listdir(BACKUP_DIR):
        path = os.path.join(BACKUP_DIR, file)

        if os.path.isfile(path):
            file_time = datetime.fromtimestamp(os.path.getmtime(path))

            if now - file_time > timedelta(days=days):
                try:
                    os.remove(path)
                    print(f"🗑️ Deleted old backup: {file}")
                except Exception as e:
                    print(f"⚠️ Failed to delete {file}: {str(e)}")

# ---------------- RUN BACKUP ----------------
def run_auto_backup():
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"database_backup_{timestamp}.backup"
        filepath = os.path.join(BACKUP_DIR, filename)

        # ✅ Best practice: use full DB URL
        pg_dump_cmd = [
            PG_DUMP_PATH,
            "--dbname", DB_URL,
            "-F", "c",
            "-f", filepath,
            "--no-owner",
            "--no-privileges"
        ]

        env = os.environ.copy()

        # ✅ Enable SSL only for remote DB
        if "localhost" not in DB_URL and "127.0.0.1" not in DB_URL:
            env["PGSSLMODE"] = "require"
            print("🔐 SSL enabled (remote DB)")
        else:
            print("⚠️ SSL disabled (local DB)")

        print("🚀 Running pg_dump...")

        result = subprocess.run(
            pg_dump_cmd,
            env=env,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            print("❌ pg_dump failed")
            print("STDOUT:", result.stdout)
            print("STDERR:", result.stderr)
            return None

        if not os.path.exists(filepath):
            print("❌ Backup file not created")
            return None

        cleanup_old_backups()

        print(f"✅ Backup created: {filename}")
        return filepath

    except FileNotFoundError:
        print("❌ pg_dump not found. Install PostgreSQL client.")
        return None

    except Exception as e:
        print(f"❌ Backup error: {str(e)}")
        return None

# ---------------- GET LATEST BACKUP ----------------
def get_latest_backup():
    try:
        files = [
            os.path.join(BACKUP_DIR, f)
            for f in os.listdir(BACKUP_DIR)
            if os.path.isfile(os.path.join(BACKUP_DIR, f))
        ]

        if not files:
            return None

        files.sort(key=os.path.getmtime, reverse=True)
        return files[0]

    except Exception as e:
        print(f"❌ Error getting latest backup: {str(e)}")
        return None

# ---------------- MANUAL BACKUP ENDPOINT ----------------
@router.get("/db")
def backup_database():
    """
    Trigger a manual backup and download the latest file.
    Only accessible by super admin.
    """

    filepath = run_auto_backup()

    # fallback if new backup failed
    if not filepath:
        print("⚠️ Using latest available backup...")
        filepath = get_latest_backup()

    if not filepath or not os.path.exists(filepath):
        raise HTTPException(
            status_code=500,
            detail="Backup failed or file not found"
        )

    return FileResponse(
        path=filepath,
        filename=os.path.basename(filepath),
        media_type="application/octet-stream"
    )
