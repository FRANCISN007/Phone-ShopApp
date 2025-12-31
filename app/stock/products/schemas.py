from pydantic import BaseModel, field_serializer

from typing import Optional
from datetime import datetime


# ---------------------------------
# Base Schema (Identity only)
# ---------------------------------
class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    brand: Optional[str] = None


# ---------------------------------
# Create Product (NO PRICE REQUIRED)
# ---------------------------------
class ProductCreate(ProductBase):
    pass


# ---------------------------------
# Update Product (Price can be set)
# ---------------------------------
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None


# ---------------------------------
# Output Schema (API Response)
# ---------------------------------
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductOut(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    brand: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    created_at: datetime

    @field_serializer("selling_price")
    def format_selling_price(self, value):
        if value is None:
            return None
        return value

    @property
    def selling_price_formatted(self) -> str:
        if self.selling_price is None:
            return "UNPRICED"
        return f"₦{int(self.selling_price):,}"

    class Config:
        from_attributes = True


# -------------------------------
# Simple product list for dropdown
# -------------------------------

class ProductSimpleSchema1(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True



class ProductSimpleSchema(BaseModel):
    id: int
    name: str
    selling_price: Optional[float] = None

    @property
    def selling_price_formatted(self) -> str:
        if self.selling_price is None:
            return "N0"
        return f"N{int(self.selling_price):,}"  # formats as 23,000

    class Config:
        from_attributes = True
# ---------------------------------
# Update Selling Price (Dedicated)
# ---------------------------------
class ProductPriceUpdate(BaseModel):
    selling_price: float

    class Config:
        from_attributes = True
