from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas
from app.sales import models as sales_models

# -------------------------
# Create Payment
# -------------------------
def create_payment(
    db: Session,
    sale_id: int,
    payment: schemas.PaymentCreate,
    user_id: int
):
    # Fetch sale
    sale = db.query(sales_models.Sale).filter(sales_models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Bank is required for non-cash payments
    if payment.payment_method != "cash" and not payment.bank_id:
        raise HTTPException(status_code=400, detail="Bank is required for non-cash payments")

    # Compute total amount already paid
    total_paid = sum(p.amount_paid for p in sale.payments)
    remaining_balance = sale.total_amount - total_paid

    # Prevent overpayment
    if payment.amount_paid > remaining_balance:
        raise HTTPException(status_code=400, detail=f"Payment exceeds balance due ({remaining_balance})")

    # Determine new balance and status
    new_balance_due = remaining_balance - payment.amount_paid
    if new_balance_due == sale.total_amount:
        status = "pending"
    elif new_balance_due > 0:
        status = "part_paid"
    else:
        status = "completed"

    # Create payment
    new_payment = models.Payment(
        sale_id=sale_id,
        amount_paid=payment.amount_paid,
        discount_allowed=payment.discount_allowed or 0,
        payment_method=payment.payment_method,
        bank_id=payment.bank_id,
        reference_no=payment.reference_no,
        payment_date=payment.payment_date,
        created_by=user_id,
        balance_due=new_balance_due,
        status=status
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment

# -------------------------
# List all payments
# -------------------------
def list_payments(db: Session):
    return db.query(models.Payment).order_by(models.Payment.created_at.desc()).all()

# -------------------------
# List payments by sale
# -------------------------
def list_payments_by_sale(db: Session, sale_id: int):
    return db.query(models.Payment).filter(models.Payment.sale_id == sale_id).order_by(models.Payment.created_at.desc()).all()

# -------------------------
# Get single payment
# -------------------------
def get_payment(db: Session, payment_id: int):
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()

# -------------------------
# Delete payment
# -------------------------
def delete_payment(db: Session, payment_id: int):
    payment = get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db.delete(payment)
    db.commit()

    return {
        "detail": "Payment deleted successfully"
    }
