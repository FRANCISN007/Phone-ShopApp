from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StockAdjustmentBase(BaseModel):
    product_id: int
    quantity: float
    reason: str


class StockAdjustmentCreate(StockAdjustmentBase):
    pass


class StockAdjustmentOut(StockAdjustmentBase):
    id: int
    inventory_id: int
    adjusted_by: Optional[int]
    adjusted_by_name: Optional[str]  # <-- new field for user name
    adjusted_at: datetime
    product_name: str  # <-- new field

    class Config:
        from_attributes = True
