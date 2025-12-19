from pydantic import BaseModel
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
class ProductOut(ProductBase):
    id: int
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
