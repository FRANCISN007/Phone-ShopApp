# app/business/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.business import models, schemas
from app.users.permissions import role_required

router = APIRouter()


# -------------------------------
# CREATE BUSINESS - ONLY SUPER ADMIN
# -------------------------------
@router.post("/", response_model=schemas.BusinessOut, status_code=201)
def create_business(
    business_in: schemas.BusinessCreate,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["super_admin"], bypass_admin=False))
):
    # Prevent duplicate name
    existing = db.query(models.Business).filter(
        models.Business.name == business_in.name.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business name already exists")

    business = models.Business(
        name=business_in.name.strip(),
        address=business_in.address,
        phone=business_in.phone,
        email=business_in.email,
    )
    db.add(business)
    db.commit()
    db.refresh(business)

    # Enrich with dynamic license status (new business → no license yet)
    return schemas.BusinessOut(
        **business.__dict__,
        license_active=business.is_license_active(db)
    )


# -------------------------------
# LIST BUSINESSES - ADMIN & SUPER ADMIN
# -------------------------------
@router.get("/", response_model=schemas.BusinessListResponse)
def list_businesses(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["super_admin", "admin"]))
):
    roles = set(current_user.roles)

    if "super_admin" in roles:
        # Super admin sees all + real-time license status
        businesses = db.query(models.Business).all()
        enriched = [
            schemas.BusinessOut(
                **biz.__dict__,
                license_active=biz.is_license_active(db)
            )
            for biz in businesses
        ]
        return {"total": len(enriched), "businesses": enriched}

    # Normal admin → only their own + license check
    business = (
        db.query(models.Business)
        .filter(models.Business.id == current_user.business_id)
        .first()
    )

    if not business or not business.is_license_active(db):
        return {"total": 0, "businesses": []}

    return {
        "total": 1,
        "businesses": [
            schemas.BusinessOut(
                **business.__dict__,
                license_active=True  # they are logged in → license must be active
            )
        ]
    }


# -------------------------------
# GET BUSINESS - ADMIN & SUPER ADMIN
# -------------------------------
@router.get("/{business_id}", response_model=schemas.BusinessOut)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["super_admin", "admin"]))
):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    roles = set(current_user.roles)

    if "super_admin" not in roles and business.id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    return schemas.BusinessOut(
        **business.__dict__,
        license_active=business.is_license_active(db)
    )


# -------------------------------
# UPDATE BUSINESS - SUPER ADMIN OR OWNER ADMIN
# -------------------------------
@router.put("/{business_id}", response_model=schemas.BusinessOut)
def update_business(
    business_id: int,
    updated: schemas.BusinessUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["super_admin", "admin"]))
):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    roles = set(current_user.roles)

    if "super_admin" not in roles and business.id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    for field, value in updated.dict(exclude_unset=True).items():
        setattr(business, field, value)

    db.commit()
    db.refresh(business)

    return schemas.BusinessOut(
        **business.__dict__,
        license_active=business.is_license_active(db)
    )


# -------------------------------
# DELETE BUSINESS - SUPER ADMIN ONLY
# -------------------------------
@router.delete("/{business_id}")
def delete_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["super_admin", "admin"]))
):
    roles = set(current_user.roles)

    if "super_admin" not in roles:
        raise HTTPException(status_code=403, detail="Only super admin can delete businesses")

    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    db.delete(business)
    db.commit()

    return {"message": f"Business {business.name} deleted successfully"}