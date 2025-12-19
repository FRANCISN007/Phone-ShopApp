from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SaleBase(BaseModel):
    product_id: Optional[int]
    quantity: int
    selling_price: float
    payment_method: str          # cash / transfer / pos
    bank_id: Optional[int] = None
    ref_no: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    quantity: Optional[int] = None
    selling_price: Optional[float] = None
    payment_method: Optional[str] = None
    bank_id: Optional[int] = None
    ref_no: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


class SaleOut(SaleBase):
    id: int
    invoice_no: str
    total_amount: float
    sold_by: Optional[int]
    sold_at: datetime

    class Config:
        from_attributes = True
