from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime

from . import models, schemas


# =========================
# Helper: serialize expense for API output
# =========================
def serialize_expense(expense: models.Expense):
    return {
        "id": expense.id,
        "vendor_id": expense.vendor_id,
        "category": expense.category,
        "description": expense.description,
        "amount": expense.amount,
        "payment_method": expense.payment_method,
        "account_type": expense.account_type,
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
    user_id: int | None = None
):
    new_expense = models.Expense(
        vendor_id=expense.vendor_id,
        category=expense.category,
        description=expense.description,
        amount=expense.amount,
        payment_method=expense.payment_method,
        account_type=expense.account_type,
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

    for field, value in expense_data.dict(exclude_unset=True).items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return serialize_expense(expense)


# =========================
# Delete Expense (Hard)
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
