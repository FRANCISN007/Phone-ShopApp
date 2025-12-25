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
@router.post("/sale/{invoice_no}", response_model=schemas.PaymentOut)
def create_payment_for_sale(
    invoice_no: int,
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(get_current_user),
):
    return service.create_payment(
        db=db,
        invoice_no=invoice_no,
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
@router.get("/sale/{invoice_no}", response_model=List[schemas.PaymentOut])
def list_payments_by_sale(
    invoice_no: int,
    db: Session = Depends(get_db),
):
    return service.list_payments_by_sale(db, invoice_no)

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
