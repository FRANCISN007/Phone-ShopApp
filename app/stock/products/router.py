from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from typing import List, Optional
from app.users.auth import pwd_context, get_current_user

from app.database import get_db
from app.stock.products import schemas, service, models


from app.stock.products.models import Product
from app.stock.products.schemas import ProductPriceUpdate, ProductOut, ProductSimpleSchema, ProductSimpleSchema1


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
    db_product = service.create_product(db, product)

    return schemas.ProductOut(
        id=db_product.id,
        name=db_product.name,
        category=db_product.category.name,  # ✅ STRING
        type=db_product.type,
        cost_price=db_product.cost_price,
        selling_price=db_product.selling_price,
        created_at=db_product.created_at
    )



@router.get("/", response_model=list[schemas.ProductOut])
def list_products(
    category: Optional[str] = None,
    name: Optional[str] = None,
    db: Session = Depends(get_db),
):
    products = service.get_products(
        db,
        category=category,
        name=name
    )

    return [
        schemas.ProductOut(
            id=p.id,
            name=p.name,
            category=p.category.name,
            type=p.type,
            cost_price=p.cost_price,
            selling_price=p.selling_price,
            created_at=p.created_at,
        )
        for p in products
    ]

    
@router.get(
    "/search",
    response_model=List[ProductSimpleSchema1]
)
def search_products(
    query: str,
    db: Session = Depends(get_db)
):
    """
    Simple product search for dropdowns (by name)
    """
    products = (
        db.query(Product)
        .filter(Product.name.ilike(f"%{query}%"))
        .order_by(Product.name.asc())
        .limit(20)
        .all()
    )

    return products



@router.get(
    "/simple",
    response_model=List[ProductSimpleSchema]
)
def list_products_simple(
    db: Session = Depends(get_db)
):
    products = service.get_products_simple(db)

    return [
        ProductSimpleSchema(
            id=p.id,
            name=p.name,
            selling_price=p.selling_price
        )
        for p in products
    ]


# products/simple
@router.get("/simple-pos")
def simple_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "selling_price": p.selling_price,
            "category_id": p.category_id,
            "category_name": p.category.name  # <-- add this
        })
    return result




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

    return schemas.ProductOut(
        id=product.id,
        name=product.name,
        category=product.category.name,   # ✅ STRING
        type=product.type,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        created_at=product.created_at,
    )

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

    return schemas.ProductOut(
        id=updated_product.id,
        name=updated_product.name,
        category=updated_product.category.name,  # ✅ STRING
        type=updated_product.type,
        cost_price=updated_product.cost_price,
        selling_price=updated_product.selling_price,
        created_at=updated_product.created_at,
    )



@router.put(
    "/{product_id}/price",
    response_model=schemas.ProductOut
)
def update_product_price(
    product_id: int,
    price_update: schemas.ProductPriceUpdate,
    db: Session = Depends(get_db)
):
    product = service.update_product_price(
        db, product_id, price_update
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return schemas.ProductOut(
        id=product.id,
        name=product.name,
        category=product.category.name,  # ✅ STRING
        type=product.type,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        created_at=product.created_at,
    )




@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return service.delete_product(db, product_id)





@router.post("/import-excel")
def import_products_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return service.import_products_from_excel(db, file)
