from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import pytz

# -------------------------
# Base Schema
# -------------------------
class PaymentBase(BaseModel):
    amount_paid: float
    discount_allowed: Optional[float] = 0.0
    payment_method: str                 # cash / transfer / pos
    bank_id: Optional[int] = None
    reference_no: Optional[str] = None
    payment_date: Optional[datetime] = Field(default_factory=lambda: datetime.now(pytz.timezone("Africa/Lagos")))

# -------------------------
# Create Payment
# -------------------------
class PaymentCreate(PaymentBase):
    pass  # sale_id comes from the URL

# -------------------------
# Output / Response Schema
# -------------------------
class PaymentOut(PaymentBase):
    id: int
    sale_id: int
    balance_due: float
    status: str                          # pending / part_paid / completed / voided
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
