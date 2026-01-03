from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas
from app.stock.inventory import service as inventory_service
from app.stock.inventory import models as inventory_models


def create_adjustment(db: Session, adjustment: schemas.StockAdjustmentCreate, adjusted_by: int):
    # Get ORM Inventory object
    inventory = inventory_service.get_inventory_orm_by_product(db, adjustment.product_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")

    # Ensure numbers are not None
    quantity_in = inventory.quantity_in or 0
    quantity_out = inventory.quantity_out or 0
    adjustment_total = inventory.adjustment_total or 0

    # Compute new stock
    new_stock = quantity_in - quantity_out + adjustment_total + adjustment.quantity
    if new_stock < 0:
        raise HTTPException(status_code=400, detail="Adjustment would result in negative stock")

    # Update inventory
    inventory.adjustment_total = adjustment_total + adjustment.quantity
    inventory.current_stock = quantity_in - quantity_out + inventory.adjustment_total

    # Create adjustment record
    adj = models.StockAdjustment(
        product_id=adjustment.product_id,
        inventory_id=inventory.id,
        quantity=adjustment.quantity,
        reason=adjustment.reason,
        adjusted_by=adjusted_by
    )

    # Commit transaction
    try:
        db.add(adj)
        db.add(inventory)
        db.commit()
        db.refresh(adj)
        db.refresh(inventory)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create adjustment: {str(e)}")

    return adj


def list_adjustments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.StockAdjustment).offset(skip).limit(limit).all()


def delete_adjustment(db: Session, adjustment_id: int):
    adjustment = db.query(models.StockAdjustment).filter(models.StockAdjustment.id == adjustment_id).first()
    if not adjustment:
        raise HTTPException(status_code=404, detail="Stock adjustment not found")

    # Revert inventory
    inventory = db.query(inventory_models.Inventory).filter(
        inventory_models.Inventory.id == adjustment.inventory_id
    ).first()

    if inventory:
        inventory.adjustment_total -= adjustment.quantity
        inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total
        db.add(inventory)

    db.delete(adjustment)
    db.commit()
    
