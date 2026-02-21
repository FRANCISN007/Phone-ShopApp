# app/business/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.orm import Session
from typing import List
from app.users.auth import get_current_user
from app.users.schemas import UserDisplaySchema


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
    current_user: UserDisplaySchema = Depends(role_required(["super_admin"], bypass_admin=False))
):
    """
    Super admin creates a new business.
    The owner_username is explicitly provided (the admin/owner of this business).
    """
    # Prevent duplicate business name
    existing = db.query(models.Business).filter(
        models.Business.name == business_in.name.strip()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Business name already exists")

    # Prevent duplicate owner_username for businesses (optional but recommended)
    existing_owner = db.query(models.Business).filter(
        models.Business.owner_username == business_in.owner_username.strip()
    ).first()
    if existing_owner:
        raise HTTPException(status_code=400, detail="This username is already used as owner for another business")

    # Create business with the specified owner_username
    business = models.Business(
        name=business_in.name.strip(),
        address=business_in.address,
        phone=business_in.phone,
        email=business_in.email,
        owner_username=business_in.owner_username.strip()  # ← from input, NOT current_user
    )

    db.add(business)
    db.commit()
    db.refresh(business)

    # Safe response with computed license_active
    biz_out = schemas.BusinessOut.from_orm(business)
    biz_out.license_active = business.is_license_active(db)
    # owner_username is already in biz_out from the column

    return biz_out



@router.get("/", response_model=schemas.BusinessListResponse)
def list_businesses(
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["super_admin", "admin"]))
):
    roles = set(current_user.roles)

    if "super_admin" in roles:
        businesses = db.query(models.Business).all()

        enriched = []
        for biz in businesses:
            biz_out = schemas.BusinessOut.from_orm(biz)
            biz_out.license_active = biz.is_license_active(db)  # ← set computed value
            biz_out.owner_username = biz.owner_username
            enriched.append(biz_out)

        return {"total": len(enriched), "businesses": enriched}

    else:
        business = (
            db.query(models.Business)
            .filter(models.Business.id == current_user.business_id)
            .first()
        )

        if not business or not business.is_license_active(db):
            return {"total": 0, "businesses": []}

        biz_out = schemas.BusinessOut.from_orm(business)
        biz_out.license_active = True
        biz_out.owner_username = business.owner_username

        return {
            "total": 1,
            "businesses": [biz_out]
        }
    

@router.get("/{business_id}", response_model=schemas.BusinessOut)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["super_admin", "admin"]))
):
    # Fetch business (no need to eager load users – we use owner_username column)
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    # Permission check
    roles = set(current_user.roles)
    if "super_admin" not in roles and business.id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Safe mapping + computed fields
    biz_out = schemas.BusinessOut.from_orm(business)
    biz_out.license_active = business.is_license_active(db)
    biz_out.owner_username = business.owner_username

    return biz_out



@router.put("/{business_id}", response_model=schemas.BusinessOut)
def update_business(
    business_id: int,
    updated: schemas.BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["super_admin", "admin"]))
):
    business = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    roles = set(current_user.roles)
    if "super_admin" not in roles and business.id != current_user.business_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    # Apply updates (only allowed fields)
    update_data = updated.dict(exclude_unset=True)

    # Optional: prevent changing owner_username or business_id
    if "owner_username" in update_data or "business_id" in update_data:
        raise HTTPException(status_code=400, detail="Cannot update owner_username or business_id")

    for field, value in update_data.items():
        setattr(business, field, value)

    db.commit()
    db.refresh(business)

    # Safe mapping + computed fields
    biz_out = schemas.BusinessOut.from_orm(business)
    biz_out.license_active = business.is_license_active(db)
    biz_out.owner_username = business.owner_username

    return biz_out

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