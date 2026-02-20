# app/business/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class BusinessBase(BaseModel):
    name: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]

class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    is_active: Optional[bool]

class BusinessOut(BusinessBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# schemas.py



class BusinessListResponse(BaseModel):
    total: int
    businesses: List[BusinessOut]
