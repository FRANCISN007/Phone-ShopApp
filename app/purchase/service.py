from sqlalchemy.orm import Session
from app.purchase import models as purchase_models, schemas as purchase_schemas
from app.stock.inventory import service as inventory_service
from datetime import datetime


# service.py
def create_purchase(db: Session, purchase: purchase_schemas.PurchaseCreate):
    total_cost = purchase.quantity * purchase.cost_price

    db_purchase = purchase_models.Purchase(
        product_id=purchase.product_id,
        vendor_id=purchase.vendor_id,
        quantity=purchase.quantity,
        cost_price=purchase.cost_price,
        total_cost=total_cost
    )
    db.add(db_purchase)
    # Update inventory
    inventory_service.add_stock(db, product_id=purchase.product_id, quantity=purchase.quantity, commit=False)

    db.commit()
    db.refresh(db_purchase)

    return db_purchase  # <-- return SQLAlchemy object



def list_purchases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(purchase_models.Purchase).offset(skip).limit(limit).all()


def get_purchase(db: Session, purchase_id: int):
    return db.query(purchase_models.Purchase).filter(
        purchase_models.Purchase.id == purchase_id
    ).first()


def update_purchase(db: Session, purchase_id: int, update_data: purchase_schemas.PurchaseUpdate):
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        return None

    old_quantity = purchase.quantity

    if update_data.quantity is not None:
        purchase.quantity = update_data.quantity
    if update_data.cost_price is not None:
        purchase.cost_price = update_data.cost_price
    if update_data.vendor_id is not None:
        purchase.vendor_id = update_data.vendor_id

    purchase.total_cost = purchase.quantity * purchase.cost_price
    db.commit()
    db.refresh(purchase)

    # Adjust inventory based on quantity difference
    diff = (purchase.quantity - old_quantity)
    if diff != 0:
        inventory_service.add_stock(db, purchase.product_id, diff)

    return purchase


def delete_purchase(db: Session, purchase_id: int):
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        return None

    # Revert inventory: subtract quantity_in from stock
    inventory = inventory_service.get_inventory_by_product(db, purchase.product_id)
    if inventory:
        inventory.quantity_in -= purchase.quantity
        inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total
        db.add(inventory)

    db.delete(purchase)
    db.commit()
    return True
