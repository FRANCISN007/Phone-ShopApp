from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    
    # Reference to Product
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product = relationship("Product")

    # Stock tracking
    quantity_in = Column(Float, default=0)    # Stock added via purchase
    quantity_out = Column(Float, default=0)   # Stock removed via sale
    current_stock = Column(Float, default=0)  # quantity_in - quantity_out

    # Optional IMEI tracking for phones
    imei = Column(String, nullable=True)      # Can be null for accessories

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
