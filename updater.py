import os
import subprocess
import shutil
import sys
from pathlib import Path

PROJECT_DIR = Path(r"C:\Users\KLOUNGE\Documents\PHONE_SHOP")
FRONTEND_DIR = PROJECT_DIR / "react-frontend"
BACKEND_DIR = PROJECT_DIR / "app"
INSTALL_DIR = Path(r"C:\Program Files\PhoneShopApp")


def run(cmd, cwd=None):
    print(f"\n>> {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print("❌ Command failed")
        sys.exit(1)


def stop_backend():
    print("\nStopping running backend...")
    os.system("taskkill /F /IM python.exe >nul 2>&1")
    os.system("taskkill /F /IM uvicorn.exe >nul 2>&1")


def build_frontend():
    print("\nBuilding frontend...")
    run("npm install", cwd=FRONTEND_DIR)
    run("npm run build", cwd=FRONTEND_DIR)


def copy_frontend():
    print("\nUpdating frontend...")

    target = INSTALL_DIR / "react-frontend" / "build"

    if target.exists():
        shutil.rmtree(target)

    shutil.copytree(FRONTEND_DIR / "build", target)


def copy_backend():
    print("\nUpdating backend...")

    target = INSTALL_DIR / "app"

    if target.exists():
        shutil.rmtree(target)

    shutil.copytree(BACKEND_DIR, target, ignore=shutil.ignore_patterns("__pycache__", ".git", "venv"))

    shutil.copy(PROJECT_DIR / "start.py", INSTALL_DIR / "start.py")


def copy_env():
    print("\nChecking .env file...")

    src = PROJECT_DIR / ".env"
    dst = INSTALL_DIR / ".env"

    if src.exists() and not dst.exists():
        shutil.copy(src, dst)
        print("✔ .env copied")
    else:
        print("ℹ .env already exists or missing in project")


def run_migration():
    print("\nRunning database migration...")
    run("python -m pip install --upgrade alembic")
    run("python -m alembic upgrade head", cwd=INSTALL_DIR)


def start_backend():
    print("\nStarting backend...")
    subprocess.Popen(["python", str(INSTALL_DIR / "start.py")])


def main():
    print("=====================================")
    print("     PhoneShopApp One-Click Updater")
    print("=====================================")

    stop_backend()
    build_frontend()
    copy_frontend()
    copy_backend()
    copy_env()
    run_migration()
    start_backend()

    print("\n✅ UPDATE COMPLETED SUCCESSFULLY")
    input("Press Enter to exit...")


if __name__ == "__main__":
    main()
