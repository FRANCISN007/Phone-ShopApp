from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models


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
def add_stock(db: Session, product_id: int, quantity: float, imei: str = None):
    inventory = get_inventory_by_product(db, product_id)
    if not inventory:
        inventory = models.Inventory(
            product_id=product_id,
            quantity_in=quantity,
            current_stock=quantity,
            imei=imei
        )
        db.add(inventory)
    else:
        inventory.quantity_in += quantity
        inventory.current_stock += quantity
        if imei:
            inventory.imei = imei

    db.commit()
    db.refresh(inventory)
    return inventory


# --------------------------
# Internal: remove stock (Sale)
# --------------------------
def remove_stock(db: Session, product_id: int, quantity: float):
    inventory = get_inventory_by_product(db, product_id)
    if not inventory or inventory.current_stock < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    inventory.quantity_out += quantity
    inventory.current_stock -= quantity
    db.commit()
    db.refresh(inventory)
    return inventory
