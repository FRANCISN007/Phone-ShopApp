from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models
from app.stock.inventory.adjustments.models import StockAdjustment

from app.stock.inventory.models import Inventory
from app.stock.products.models import  Product

# --------------------------
# Read-only: list inventory
# --------------------------
def list_inventory(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    product_id: int | None = None,
    product_name: str | None = None,
):
    query = (
        db.query(
            Inventory.id,
            Inventory.product_id,
            Product.name.label("product_name"),
            Inventory.quantity_in,
            Inventory.quantity_out,
            Inventory.adjustment_total,
            Inventory.current_stock,
            Inventory.created_at,
            Inventory.updated_at,
        )
        .join(Product, Product.id == Inventory.product_id)
    )

    # 🔍 Filter by product ID
    if product_id is not None:
        query = query.filter(Inventory.product_id == product_id)

    # 🔍 Filter by product name (case-insensitive)
    if product_name:
        query = query.filter(Product.name.ilike(f"%{product_name}%"))

    return (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_inventory_by_product(db: Session, product_id: int):
    return (
        db.query(
            Inventory.id,
            Inventory.product_id,
            Product.name.label("product_name"),
            Inventory.quantity_in,
            Inventory.quantity_out,
            Inventory.adjustment_total,
            Inventory.current_stock,
            Inventory.created_at,
            Inventory.updated_at,
        )
        .join(Product, Product.id == Inventory.product_id)
        .filter(Inventory.product_id == product_id)
        .first()
    )


# --------------------------
# Internal: add stock (Purchase)
# --------------------------
def add_stock(db: Session, product_id: int, quantity: float, commit: bool = False):
    inventory = get_inventory_by_product(db, product_id)
    if not inventory:
        inventory = models.Inventory(
            product_id=product_id,
            quantity_in=quantity,
            adjustment_total=0,
            quantity_out=0,
            current_stock=quantity
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
def remove_stock(
    db: Session,
    product_id: int,
    quantity: float,
    commit: bool = False
):
    """
    Deduct stock from inventory for a product.
    Allows negative stock (POS-friendly).
    """

    inventory = get_inventory_by_product(db, product_id)

    # 🔹 If inventory does not exist, create it
    if not inventory:
        inventory = Inventory(
            product_id=product_id,
            quantity_in=0,
            quantity_out=0,
            adjustment_total=0,
            current_stock=0
        )
        db.add(inventory)
        db.flush()

    # 🔥 NO BLOCKING — allow negative stock
    inventory.quantity_out += quantity

    # 🔹 Recalculate current stock (CAN GO NEGATIVE)
    inventory.current_stock = (
        inventory.quantity_in
        - inventory.quantity_out
        + inventory.adjustment_total
    )

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
