from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InventoryBase(BaseModel):
    product_id: int
    quantity_in: Optional[float] = 0
    quantity_out: Optional[float] = 0
    current_stock: Optional[float] = 0
    imei: Optional[str] = None


class InventoryOut(InventoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
