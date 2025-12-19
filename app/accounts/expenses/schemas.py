from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# =========================
# Base
# =========================
class ExpenseBase(BaseModel):
    vendor_id: int
    category: str
    description: Optional[str] = None
    amount: float
    payment_method: str          # cash / transfer / pos
    account_type: str            # operating / admin / cost_of_sales
    expense_date: datetime


# =========================
# Create
# =========================
class ExpenseCreate(ExpenseBase):
    pass


# =========================
# Update
# =========================
class ExpenseUpdate(BaseModel):
    vendor_id: Optional[int] = None
    category: Optional[str] = None   # Rent, Utilities, Salary, Maintenance, general etc.
    description: Optional[str] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    account_type: Optional[str] = None  #operating / admin / cost_of_sales (important for P&L grouping)
    expense_date: Optional[datetime] = None
    status: Optional[str] = None


# =========================
# Output
# =========================
class ExpenseOut(ExpenseBase):
    id: int
    status: str
    is_active: bool
    created_at: datetime

    created_by: int | None
    created_by_username: str | None

    class Config:
        from_attributes = True
