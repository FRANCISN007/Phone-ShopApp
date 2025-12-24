from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_no = Column(String, index=True, nullable=False)

    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    selling_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)

    
    ref_no = Column(String, nullable=True)

    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)

    sold_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sold_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product")
    
