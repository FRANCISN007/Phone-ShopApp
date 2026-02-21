# app/business/schemas.py (fully rewritten - removed static is_active, use dynamic in response)
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


# app/business/schemas.py
class BusinessOut(BusinessBase):
    id: int
    license_active: bool          # renamed – clearly dynamic
    created_at: datetime

    class Config:
        from_attributes = True


class BusinessListResponse(BaseModel):
    total: int
    businesses: List[BusinessOut]