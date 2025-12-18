from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    category: Optional[str]
    brand: Optional[str]
    cost_price: float
    selling_price: float

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    category: Optional[str]
    brand: Optional[str]
    cost_price: Optional[float]
    selling_price: Optional[float]

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
