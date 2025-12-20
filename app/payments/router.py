from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from . import schemas, service
from app.users.auth import get_current_user
from app.users.schemas import UserDisplaySchema

router = APIRouter()

# -------------------------
# Create Payment for Sale
# -------------------------
@router.post("/sale/{sale_id}", response_model=schemas.PaymentOut)
def create_payment_for_sale(
    sale_id: int,
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(get_current_user),
):
    return service.create_payment(
        db=db,
        sale_id=sale_id,
        payment=payment,
        user_id=current_user.id
    )

# -------------------------
# List all payments
# -------------------------
@router.get("/", response_model=List[schemas.PaymentOut])
def list_payments(db: Session = Depends(get_db)):
    return service.list_payments(db)

# -------------------------
# List payments by sale
# -------------------------
@router.get("/sale/{sale_id}", response_model=List[schemas.PaymentOut])
def list_payments_by_sale(
    sale_id: int,
    db: Session = Depends(get_db),
):
    return service.list_payments_by_sale(db, sale_id)

# -------------------------
# Delete a payment
# -------------------------
@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(get_current_user),
):
    return service.delete_payment(db, payment_id)
