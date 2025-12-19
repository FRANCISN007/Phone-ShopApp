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
    adjusted_at: datetime

    class Config:
        from_attributes = True
