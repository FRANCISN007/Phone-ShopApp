from pydantic import BaseModel
from datetime import datetime


class LicenseBase(BaseModel):
    key: str


class LicenseCreate(LicenseBase):
    expiration_date: datetime
    business_id: int   # 🔑 REQUIRED for multi-tenant


class LicenseResponse(LicenseBase):
    id: int
    is_active: bool
    expiration_date: datetime
    business_id: int
    created_at: datetime

    class Config:
        from_attributes = True
