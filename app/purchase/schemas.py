from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PurchaseBase(BaseModel):
    product_id: int
    vendor_id: Optional[int] = None
    quantity: int
    cost_price: float


class PurchaseCreate(PurchaseBase):
    pass


class PurchaseUpdate(BaseModel):
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    vendor_id: Optional[int] = None


class PurchaseOut(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None      # ✅ New field
    vendor_id: Optional[int]
    vendor_name: Optional[str] = None       # ✅ New field
    quantity: int
    cost_price: float
    total_cost: float
    purchase_date: datetime
    current_stock: Optional[float] = 0     # populated from inventory

    class Config:
        from_attributes = True