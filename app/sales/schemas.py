from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SaleBase(BaseModel):
    invoice_no: Optional[str] = None
    product_id: int
    quantity: int
    selling_price: float
    ref_no: Optional[str] = None       # IMEI / Serial / Any reference
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    quantity: Optional[int] = None
    selling_price: Optional[float] = None
    ref_no: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

class SaleOut(SaleBase):
    id: int
    invoice_no: str
    total_amount: float
    total_paid: float = 0.0       # computed from payments
    balance_due: float = 0.0      # computed: total_amount - total_paid
    sold_by: Optional[int]
    sold_at: datetime

    class Config:
        from_attributes = True


class SaleAnalysisItem(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    cost_price: float
    selling_price: float
    total_sales: float
    margin: float


class SaleAnalysisOut(BaseModel):
    items: list[SaleAnalysisItem]
    total_sales: float
    total_margin: float
