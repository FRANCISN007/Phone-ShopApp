from sqlalchemy import Column, Integer, String, Float, DateTime, UniqueConstraint
from datetime import datetime
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    brand = Column(String, nullable=False)

    cost_price = Column(Float, nullable=True)      # 👈 optional
    selling_price = Column(Float, nullable=True)  # 👈 optional

    created_at = Column(DateTime, default=datetime.utcnow)


    __table_args__ = (
        UniqueConstraint("name", name="uq_product_name"),
    )