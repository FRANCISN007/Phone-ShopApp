from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from datetime import datetime
import os
import json
from loguru import logger

from app.database import get_db
from app.license import schemas as license_schemas, services, models as license_models
from app.business.models import Business
from app.superadmin.passwords import verify_password
from app.users.auth import get_current_user

router = APIRouter()

logger.add("app.log", rotation="500 MB", level="DEBUG")

# ===========================
# ENV CONFIG
# ===========================
ADMIN_LICENSE_PASSWORD_HASH = os.getenv("ADMIN_LICENSE_PASSWORD_HASH")

# Local offline fallback file
LICENSE_FILE = "license_status.json"


# ===========================
# LOCAL FILE HELPERS
# ===========================
def save_license_file(data: dict):
    """Save license status to local JSON file."""
    safe_data = {}
    for k, v in data.items():
        if isinstance(v, datetime):
            safe_data[k] = v.isoformat()
        else:
            safe_data[k] = v

    with open(LICENSE_FILE, "w") as f:
        json.dump(safe_data, f)


def load_license_file():
    """Load license status from local JSON file."""
    if os.path.exists(LICENSE_FILE):
        with open(LICENSE_FILE, "r") as f:
            return json.load(f)
    return None


# ===========================
# GENERATE LICENSE (SUPER ADMIN)
# ===========================
from datetime import datetime, timedelta

@router.post("/generate", response_model=license_schemas.LicenseResponse)
def generate_license_key(
    license_password: str = Form(...),
    key: str = Form(...),
    duration_days: int = Form(...),   # ✅ flexible duration input
    business_id: int = Form(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a new license key with flexible duration (in days).
    ONLY super admin can perform this action.
    """

    # ===============================
    # 1. SUPER ADMIN CHECK
    # ===============================
    if "super_admin" not in current_user.roles:
        raise HTTPException(
            status_code=403,
            detail="Only super admin can generate license keys."
        )

    # ===============================
    # 2. ADMIN LICENSE PASSWORD CHECK
    # ===============================
    if not ADMIN_LICENSE_PASSWORD_HASH:
        raise HTTPException(status_code=500, detail="Admin password not configured.")

    if not verify_password(license_password, ADMIN_LICENSE_PASSWORD_HASH):
        raise HTTPException(status_code=403, detail="Invalid license password.")
    
    

    # ===============================
    # 3. VALIDATE BUSINESS
    # ===============================
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")

    # ===============================
    # 4. CALCULATE EXPIRATION DATE
    # ===============================
    if duration_days <= 0:
        raise HTTPException(status_code=400, detail="Duration must be greater than 0 days.")

    expiration_date = datetime.utcnow() + timedelta(days=duration_days)

    # ===============================
    # 5. CREATE LICENSE
    # ===============================
    new_license = services.create_license_key(
        db,
        license_schemas.LicenseCreate(
            key=key,
            expiration_date=expiration_date,
            business_id=business_id,
        ),
    )

    # ===============================
    # 6. SAVE OFFLINE FALLBACK
    # ===============================
    save_license_file({
        "valid": True,
        "expires_on": new_license.expiration_date,
    })

    return new_license


# ===========================
# VERIFY LICENSE (PER BUSINESS)
# ===========================
@router.get("/verify/{key}/{business_id}")
def verify_license(
    key: str,
    business_id: int,
    db: Session = Depends(get_db),
):
    """
    Verify a license key for a specific business.
    """

    result = services.verify_license_key(db, key, business_id)

    if not result["valid"]:
        raise HTTPException(status_code=400, detail=result["message"])

    # Save offline fallback
    save_license_file({
        "valid": True,
        "expires_on": result["expires_on"],
    })

    return result


# ===========================
# CHECK CURRENT LICENSE STATUS (JWT-AWARE)
# ===========================
@router.get("/license/check")
def check_license_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Check license for the logged-in user's business.
    Super admin bypasses license restriction.
    """

    try:
        # Super admin → always valid
        if not current_user.business_id:
            return {"valid": True, "expires_on": None}

        # Get latest active license for this business
        license_record = (
            db.query(license_models.LicenseKey)
            .filter(
                license_models.LicenseKey.business_id == current_user.business_id,
                license_models.LicenseKey.is_active == True,
            )
            .order_by(license_models.LicenseKey.expiration_date.desc())
            .first()
        )

        # Valid license
        if license_record and license_record.expiration_date > datetime.utcnow():
            data = {
                "valid": True,
                "expires_on": license_record.expiration_date.isoformat(),
            }
            save_license_file(data)
            return data

        # Invalid or expired
        data = {"valid": False, "expires_on": None}
        save_license_file(data)
        return data

    except Exception as e:
        logger.error(f"DB error, falling back to license file: {e}")

        file_data = load_license_file()
        if file_data:
            if file_data.get("expires_on"):
                exp_date = datetime.fromisoformat(file_data["expires_on"])
                if exp_date > datetime.utcnow():
                    return file_data

            return {"valid": False, "expires_on": file_data.get("expires_on")}

        return {"valid": False, "expires_on": None}
