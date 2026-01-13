from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    ref_no = Column(String(100), unique=True, index=True, nullable=False)

    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)

    account_type = Column(String, nullable=False)

    description = Column(String, nullable=True)

    amount = Column(Float, nullable=False)

    payment_method = Column(String, nullable=False)
    bank_id = Column(Integer, ForeignKey("banks.id", ondelete="SET NULL"), nullable=True)
   
    expense_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    status = Column(String, default="paid")
    is_active = Column(Boolean, default=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    vendor = relationship("Vendor")
    creator = relationship("User", foreign_keys=[created_by])
    bank = relationship("Bank") 

    created_by_user = relationship("User", backref="expenses", foreign_keys=[created_by])
