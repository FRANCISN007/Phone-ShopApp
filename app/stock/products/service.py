from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from app.stock.products import models, schemas
from app.stock.inventory import models as inventory_models
from app.purchase import models as purchase_models


def create_product(
    db: Session,
    product: schemas.ProductCreate
):
    db_product = models.Product(
        name=product.name,
        category=product.category,
        brand=product.brand
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100
):
    return (
        db.query(models.Product)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_product_by_id(
    db: Session,
    product_id: int
):
    return (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )


def update_product(
    db: Session,
    product_id: int,
    product: schemas.ProductUpdate
):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None

    update_data = product.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int):
    product = get_product_by_id(db, product_id)
    if not product:
        return None

    # Check if product has any inventory
    inventory_entry = db.query(inventory_models.Inventory).filter(
        inventory_models.Inventory.product_id == product_id
    ).first()
    if inventory_entry and inventory_entry.current_stock > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product with existing stock"
        )

    # Check if product has any purchases
    purchase_entry = db.query(purchase_models.Purchase).filter(
        purchase_models.Purchase.product_id == product_id
    ).first()
    if purchase_entry:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product with existing purchase records"
        )

    db.delete(product)
    db.commit()
    return {"detail": "Product deleted successfully"}