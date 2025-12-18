from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)  # phone / accessory
    brand = Column(String)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
