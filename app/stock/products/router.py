from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd

from app.database import get_db
from app.stock.products import schemas, service, models
from app.stock.products.schemas import ProductSimpleSchema

from app.stock.products.models import Product
from app.stock.products.schemas import ProductPriceUpdate, ProductOut


router = APIRouter()


@router.post(
    "/",
    response_model=schemas.ProductOut,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    return service.create_product(db, product)


@router.get(
    "/",
    response_model=List[schemas.ProductOut]
)
def list_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return service.get_products(db, skip=skip, limit=limit)


@router.get("/simple", response_model=List[ProductSimpleSchema])
def list_products_simple(db: Session = Depends(get_db)):
    products = service.get_products(db, skip=0, limit=1000)
    return products


@router.get(
    "/{product_id}",
    response_model=schemas.ProductOut
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = service.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.put(
    "/{product_id}",
    response_model=schemas.ProductOut
)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db)
):
    updated_product = service.update_product(
        db, product_id, product
    )
    if not updated_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return updated_product


# -------------------------------
# Update Product Selling Price
# -------------------------------
@router.put("/{product_id}/price", response_model=ProductOut)
def update_product_price(
    product_id: int,
    price_update: ProductPriceUpdate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.selling_price = price_update.selling_price
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return service.delete_product(db, product_id)


@router.post("/import-excel", status_code=status.HTTP_201_CREATED)
def import_products_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files are allowed"
        )

    return service.import_products_from_excel(db, file)
