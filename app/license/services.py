import json
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.license.models import LicenseKey
from app.license.schemas import LicenseCreate

LICENSE_FILE = "license.json"

# Helper to save license to local file
def save_license_to_file(key: str, expiration_date: datetime):
    data = {
        "key": key,
        "expiration_date": expiration_date.isoformat(),
        "valid": True
    }
    with open(LICENSE_FILE, "w") as f:
        json.dump(data, f)

# Helper to read license from local file
def read_license_from_file():
    if not os.path.exists(LICENSE_FILE):
        return None
    try:
        with open(LICENSE_FILE, "r") as f:
            data = json.load(f)
        data["expiration_date"] = datetime.fromisoformat(data["expiration_date"])
        return data
    except Exception:
        return None


def create_license_key(db: Session, data: LicenseCreate):
    new_license = LicenseKey(
        key=data.key,
        expiration_date=data.expiration_date,
        business_id=data.business_id,
        is_active=True,
    )

    db.add(new_license)
    db.commit()
    db.refresh(new_license)
    return new_license


def verify_license_key(db: Session, key: str, business_id: int):
    license_record = (
        db.query(LicenseKey)
        .filter(
            LicenseKey.key == key,
            LicenseKey.business_id == business_id,
            LicenseKey.is_active == True,
        )
        .first()
    )

    if not license_record:
        return {"valid": False, "message": "Invalid license key"}

    from datetime import datetime
    if license_record.expiration_date < datetime.utcnow():
        return {"valid": False, "message": "License expired"}

    return {
        "valid": True,
        "expires_on": license_record.expiration_date,
    }
