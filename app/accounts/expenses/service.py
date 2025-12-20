from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from . import models, schemas


# =========================
# Helper: payment validation
# =========================
def validate_payment_method(payment_method: str, bank_id: int | None):
    method = payment_method.lower()

    if method == "cash" and bank_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Bank must NOT be selected for cash payment"
        )

    if method in ["transfer", "pos"] and bank_id is None:
        raise HTTPException(
            status_code=400,
            detail="Bank is required for transfer or POS payment"
        )


# =========================
# Helper: serialize expense
# =========================
def serialize_expense(expense: models.Expense):
    return {
        "id": expense.id,
        "vendor_id": expense.vendor_id,
        "category": expense.category,
        "description": expense.description,
        "amount": expense.amount,
        "payment_method": expense.payment_method,
        "bank_id": expense.bank_id,
        "expense_date": expense.expense_date,
        "created_at": expense.created_at,
        "status": expense.status,
        "is_active": expense.is_active,
        "created_by": expense.created_by,
        "created_by_username": expense.creator.username if expense.creator else None,
    }


# =========================
# Create Expense
# =========================
def create_expense(
    db: Session,
    expense: schemas.ExpenseCreate,
    user_id: int
):
    # ✅ Enforce cash / bank rules
    validate_payment_method(expense.payment_method, expense.bank_id)

    new_expense = models.Expense(
        vendor_id=expense.vendor_id,
        category=expense.category,
        description=expense.description,
        amount=expense.amount,
        payment_method=expense.payment_method,
        bank_id=expense.bank_id,
        expense_date=expense.expense_date,
        created_by=user_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return serialize_expense(new_expense)


# =========================
# List Expenses
# =========================
def list_expenses(db: Session):
    expenses = (
        db.query(models.Expense)
        .filter(models.Expense.is_active == True)
        .order_by(models.Expense.expense_date.desc())
        .all()
    )
    return [serialize_expense(exp) for exp in expenses]


# =========================
# Get Expense by ID
# =========================
def get_expense_by_id(db: Session, expense_id: int):
    expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id,
            models.Expense.is_active == True
        )
        .first()
    )

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    return serialize_expense(expense)


# =========================
# Update Expense
# =========================
def update_expense(
    db: Session,
    expense_id: int,
    expense_data: schemas.ExpenseUpdate
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.is_active == True
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    data = expense_data.dict(exclude_unset=True)

    # ✅ Resolve final state before validation
    payment_method = data.get("payment_method", expense.payment_method)
    bank_id = data.get("bank_id", expense.bank_id)

    validate_payment_method(payment_method, bank_id)

    for field, value in data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return serialize_expense(expense)


# =========================
# Delete Expense
# =========================
def delete_expense(db: Session, expense_id: int):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()

    return {
        "id": expense_id,
        "detail": "Expense successfully deleted"
    }
