from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models
from app.stock.inventory.adjustments.models import StockAdjustment

# --------------------------
# Read-only: list inventory
# --------------------------
def list_inventory(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Inventory).offset(skip).limit(limit).all()

def get_inventory_by_product(db: Session, product_id: int):
    return db.query(models.Inventory).filter(models.Inventory.product_id == product_id).first()


# --------------------------
# Internal: add stock (Purchase)
# --------------------------
def add_stock(db: Session, product_id: int, quantity: float, imei: str = None, commit: bool = False):
    inventory = get_inventory_by_product(db, product_id)
    if not inventory:
        inventory = models.Inventory(
            product_id=product_id,
            quantity_in=quantity,
            adjustment_total=0,
            quantity_out=0,
            current_stock=quantity,
            imei=imei
        )
        db.add(inventory)
    else:
        inventory.quantity_in += quantity
        inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total

    if commit:
        db.commit()
        db.refresh(inventory)
    return inventory


# --------------------------
# Internal: remove stock (Sale)
# --------------------------
def remove_stock(db: Session, product_id: int, quantity: float, commit: bool = False, imei: str = None):
    """
    Deduct stock from inventory for a product.

    Parameters:
    - db: SQLAlchemy Session
    - product_id: ID of the product
    - quantity: Quantity to remove
    - commit: Whether to commit the transaction (default False)
    - imei: Optional IMEI for phones (ignored for accessories)
    """
    inventory = get_inventory_by_product(db, product_id)
    if not inventory or inventory.current_stock < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    inventory.quantity_out += quantity
    inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total

    if imei:
        inventory.imei = imei

    if commit:
        db.commit()
        db.refresh(inventory)

    return inventory

# --------------------------
# Admin-only: Adjust stock
# --------------------------
def adjust_stock(db: Session, product_id: int, quantity: float, reason: str, adjusted_by: int):
    with db.begin():
        inventory = get_inventory_by_product(db, product_id)
        if not inventory:
            raise HTTPException(status_code=404, detail="Inventory not found")

        new_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total + quantity
        if new_stock < 0:
            raise HTTPException(status_code=400, detail="Adjustment would result in negative stock")

        inventory.adjustment_total += quantity
        inventory.current_stock = new_stock

        # Record adjustment
        adjustment = StockAdjustment(
            product_id=product_id,
            inventory_id=inventory.id,
            quantity=quantity,
            reason=reason,
            adjusted_by=adjusted_by
        )
        db.add(adjustment)
        db.flush()
        db.refresh(inventory)
        return inventory


# --------------------------
# Revert stock when deleting Purchase
# --------------------------
def revert_purchase_stock(db: Session, product_id: int, quantity: float):
    with db.begin():
        inventory = get_inventory_by_product(db, product_id)
        if not inventory:
            return
        inventory.quantity_in -= quantity
        inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total
        if inventory.quantity_in < 0:
            inventory.quantity_in = 0
            inventory.current_stock = max(inventory.current_stock, 0)
        db.flush()
        db.refresh(inventory)


# --------------------------
# Revert stock when deleting Sale
# --------------------------
def revert_sale_stock(db: Session, product_id: int, quantity: float):
    with db.begin():
        inventory = get_inventory_by_product(db, product_id)
        if not inventory:
            return
        inventory.quantity_out -= quantity
        inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total
        if inventory.quantity_out < 0:
            inventory.quantity_out = 0
        db.flush()
        db.refresh(inventory)
