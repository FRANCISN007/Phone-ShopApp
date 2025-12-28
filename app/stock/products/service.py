from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from app.stock.products import models, schemas
from app.stock.inventory import models as inventory_models
from app.purchase import models as purchase_models

from app.stock.products.schemas import ProductOut

import pandas as pd

from .models import Product



def create_product(
    db: Session,
    product: schemas.ProductCreate
):
    # Check if a product with the same name already exists
    existing_product = (
        db.query(models.Product)
        .filter(models.Product.name == product.name)
        .filter(models.Product.category == product.category)
        .first()
    )

    if existing_product:
        raise HTTPException(
            status_code=400,
            detail=f"A product with name '{product.name}' already exists in category '{product.category}'."
        )

    db_product = models.Product(
        name=product.name,
        brand=product.brand
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session, skip: int = 0, limit: int = 100):
    products = (
        db.query(models.Product)
        .order_by(models.Product.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return products


    


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

def clean_price(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
        value = (
            value.replace("₦", "")
                 .replace("N", "")
                 .replace(",", "")
                 .strip()
        )
    try:
        return float(value)
    except ValueError:
        return None



def import_products_from_excel(db: Session, file):
    try:
        df = pd.read_excel(file.file)

        required_columns = {
            "name",
            "category",
            "brand",
            "cost_price",
            "selling_price"
        
        }

        if not required_columns.issubset(df.columns):
            raise HTTPException(
                status_code=400,
                detail=f"Excel must contain columns: {required_columns}"
            )

        products = []
        skipped = 0

        for _, row in df.iterrows():
            if pd.isna(row["name"]) or pd.isna(row["category"]):
                skipped += 1
                continue

            # Prevent duplicates
            #exists = db.query(Product).filter(
                #Product.name == row["name"]
            #).first()

            #if exists:
                #skipped += 1
                #continue

            product = Product(
                name=str(row["name"]).strip(),
                category=str(row["category"]).strip(),
                brand=None if pd.isna(row["brand"]) else str(row["brand"]).strip(),
                cost_price=clean_price(row["cost_price"]),
                selling_price=clean_price(row["selling_price"]),
            )


            products.append(product)

        if products:
            db.add_all(products)
            db.flush()   # 🔥 forces SQL execution
            db.commit()



        return {
            "message": "Import completed",
            "imported": len(products),
            "skipped": skipped
        }

    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
