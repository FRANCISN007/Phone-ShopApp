from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
#from app.auth.dependencies import get_current_user
from app.users.auth import get_current_user
from app.business.models import Business
from app.license.models import LicenseKey




def get_current_business(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Central SaaS guard:
    - Regular users: must belong to a business, active license required
    - Super admins: exempted from business checks
    """

    # 🔹 Super admin bypass
    if "super_admin" in getattr(current_user, "roles", []):
        return None  # super admin does not need a business

    # 🔹 Regular user: must have business_id
    business_id = getattr(current_user, "business_id", None)
    if not business_id:
        raise HTTPException(status_code=400, detail="User does not belong to any business")

    # Fetch business
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    if not business.is_active:
        raise HTTPException(status_code=403, detail="Business is inactive")

    # Check license
    license_key = (
        db.query(LicenseKey)
        .filter(LicenseKey.business_id == business.id, LicenseKey.is_active == True)
        .order_by(LicenseKey.expiration_date.desc())
        .first()
    )
    if not license_key:
        raise HTTPException(status_code=403, detail="No active license")

    if license_key.expiration_date < datetime.utcnow():
        raise HTTPException(status_code=403, detail="License expired")

    return business
