from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InventoryBase(BaseModel):
    product_id: int
    quantity_in: float
    quantity_out: float
    adjustment_total: float
    current_stock: float
    imei: Optional[str] = None



class InventoryOut(InventoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
