from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)

    # Basic info
    name = Column(String, nullable=False, unique=True, index=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    # SaaS control
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Core relationships
    users = relationship("User", back_populates="business", cascade="all, delete-orphan")
    licenses = relationship("LicenseKey", back_populates="business", cascade="all, delete-orphan")

    # Financial & banking
    banks = relationship("Bank", back_populates="business", cascade="all, delete-orphan")
    #accounts = relationship("Account", back_populates="business", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="business", cascade="all, delete-orphan")

    payments = relationship("Payment", back_populates="business", cascade="all, delete-orphan")

    # Vendors & purchasing
    vendors = relationship("Vendor", back_populates="business", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="business", cascade="all, delete-orphan")

    # Stock & sales
    products = relationship("Product", back_populates="business", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="business", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="business", cascade="all, delete-orphan")



# Ensure dependent models are imported AFTER Business is defined
# Expenses
    expenses = relationship("Expense", back_populates="business", cascade="all, delete-orphan")



from app.bank.models import Bank
from app.vendor.models import Vendor
from app.purchase.models import Purchase
from app.sales.models import Sale
from app.stock.products.models import Product
from app.stock.inventory.models import Inventory
from app.license.models import LicenseKey
from app.users.models import User
from app.accounts.models import Account
