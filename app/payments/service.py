from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas
from app.sales import models as sales_models
import uuid

from datetime import datetime, time
from datetime import date
from sqlalchemy import func

from sqlalchemy.orm import joinedload




# -------------------------
# Create Payment
# -------------------------
import uuid

def create_payment(
    db: Session,
    invoice_no: int,
    payment: schemas.PaymentCreate,
    user_id: int
):
    # Fetch sale
    sale = db.query(sales_models.Sale).filter(sales_models.Sale.invoice_no == invoice_no).first()
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

    # Force generate reference_no, ignore frontend input
    generated_reference_no = str(uuid.uuid4())

    # Create payment
    new_payment = models.Payment(
        sale_invoice_no=invoice_no,
        amount_paid=payment.amount_paid,
        discount_allowed=payment.discount_allowed or 0,
        payment_method=payment.payment_method,
        bank_id=payment.bank_id,
        reference_no=generated_reference_no,  # <-- ALWAYS use UUID
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







from datetime import datetime, time
from sqlalchemy.orm import joinedload

def list_payments(
    db: Session,
    start_date: date | None = None,
    end_date: date | None = None,
    status: str | None = None,
    bank_id: int | None = None
):
    query = db.query(models.Payment)\
        .options(
            joinedload(models.Payment.sale),
            joinedload(models.Payment.user),
            joinedload(models.Payment.bank)
        )

    # ----------------- Date Filter -----------------
    if start_date:
        start_dt = datetime.combine(start_date, time.min)
        query = query.filter(models.Payment.created_at >= start_dt)

    if end_date:
        end_dt = datetime.combine(end_date, time.max)
        query = query.filter(models.Payment.created_at <= end_dt)

    # ----------------- Status Filter -----------------
    if status:
        query = query.filter(models.Payment.status == status.lower())

    # ----------------- Bank Filter -----------------
    if bank_id:
        query = query.filter(models.Payment.bank_id == bank_id)

    payments = query.order_by(models.Payment.created_at.desc()).all()

    # ----------------- Attach extra info -----------------
    for p in payments:
        p.bank_name = p.bank.name if p.bank else None
        p.created_by_name = p.user.username if p.user else None
        p.total_amount = p.sale.total_amount if p.sale else None

    return payments

# -------------------------
# List payments by sale
# -------------------------
def list_payments_by_sale(db: Session, invoice_no: int):
    return db.query(models.Payment).filter(models.Payment.sale_invoice_no == invoice_no).order_by(models.Payment.created_at.desc()).all()

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
