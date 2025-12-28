from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime, date

# ---------- Sale Item ----------
class SaleItemData(BaseModel):
    product_id: int
    quantity: int
    selling_price: float

class SaleItemCreate(BaseModel):
    sale_invoice_no: int
    product_id: int
    quantity: int
    selling_price: float

class SaleItemOut(BaseModel):
    id: int
    sale_invoice_no: int
    product_id: int
    quantity: int
    selling_price: float
    total_amount: float

    class Config:
        from_attributes = True

# ---------- Sale ----------
class SaleCreate(BaseModel):
    invoice_date: date
    customer_name: str
    customer_phone: Optional[str] = None
    ref_no: Optional[str] = None

    @validator("invoice_date", pre=True)
    def parse_invoice_date(cls, v):
        if isinstance(v, str):
            return date.fromisoformat(v)
        return v

class SaleFullCreate(BaseModel):
    invoice_date: date
    customer_name: str
    customer_phone: Optional[str] = None
    ref_no: Optional[str] = None
    items: List[SaleItemData]

class SaleOut(BaseModel):
    id: int
    invoice_no: int      # 🔥 WAS str — MUST BE int
    invoice_date: datetime
    customer_name: str
    customer_phone: Optional[str]
    ref_no: Optional[str]
    total_amount: float
    sold_by: Optional[int]
    sold_at: datetime
    items: List[SaleItemOut] = []

    class Config:
        orm_mode = True

class SaleOut2(BaseModel):
    id: int
    invoice_no: int
    invoice_date: datetime
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    total_amount: float
    total_paid: float
    balance_due: float
    payment_status: str
    sold_at: datetime
    items: List[SaleItemOut] = []



# ==============================
# ---------- Full Sale (Header + Items) ----------
# ==============================
class SaleFullCreate(SaleCreate):
    items: List[SaleItemData]

# ==============================
# ---------- Sale Analysis ----------
# ==============================
class SaleAnalysisItem(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    cost_price: float
    selling_price: float
    total_sales: float
    margin: float

class SaleAnalysisOut(BaseModel):
    items: List[SaleAnalysisItem]
    total_sales: float
    total_margin: float


class SaleUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    ref_no: Optional[str] = None

    class Config:
        extra = "forbid"  # 🔥 prevents silent bugs



class SaleItemUpdate(BaseModel):
    quantity: Optional[int] = None
    selling_price: Optional[float] = None

    class Config:
        extra = "forbid"

class SaleSummary(BaseModel):
    total_sales: float
    total_paid: float
    total_balance: float

class SalesListResponse(BaseModel):
    sales: List[SaleOut2]
    summary: SaleSummary





class OutstandingSaleItem(BaseModel):
    id: int
    sale_invoice_no: int
    product_id: int
    quantity: int
    selling_price: float
    total_amount: float

    class Config:
        from_attributes = True


class OutstandingSale(BaseModel):
    id: int
    invoice_no: int
    invoice_date: datetime
    customer_name: str | None
    customer_phone: str | None
    ref_no: str | None

    total_amount: float
    total_paid: float
    balance_due: float

    items: List[OutstandingSaleItem]

    class Config:
        from_attributes = True


class OutstandingSummary(BaseModel):
    sales_sum: float
    paid_sum: float
    balance_sum: float


class OutstandingSalesResponse(BaseModel):
    sales: List[OutstandingSale]
    summary: OutstandingSummary


