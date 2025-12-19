from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.purchase import schemas, service
from app.stock.inventory import service as inventory_service

router = APIRouter()


@router.post("/", response_model=schemas.PurchaseOut, status_code=status.HTTP_201_CREATED)
def create_purchase(purchase: schemas.PurchaseCreate, db: Session = Depends(get_db)):
    db_purchase = service.create_purchase(db, purchase)
    current_stock = inventory_service.get_inventory_by_product(db, db_purchase.product_id).current_stock
    return {**db_purchase.__dict__, "current_stock": current_stock}


@router.get("/", response_model=List[schemas.PurchaseOut])
def list_purchases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    purchases = service.list_purchases(db, skip, limit)
    # attach current stock
    result = []
    for p in purchases:
        stock_entry = inventory_service.get_inventory_by_product(db, p.product_id)
        current_stock = stock_entry.current_stock if stock_entry else 0
        result.append({**p.__dict__, "current_stock": current_stock})
    return result


@router.get("/{purchase_id}", response_model=schemas.PurchaseOut)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = service.get_purchase(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")
    stock_entry = inventory_service.get_inventory_by_product(db, purchase.product_id)
    current_stock = stock_entry.current_stock if stock_entry else 0
    return {**purchase.__dict__, "current_stock": current_stock}


@router.put("/{purchase_id}", response_model=schemas.PurchaseOut)
def update_purchase(purchase_id: int, update_data: schemas.PurchaseUpdate, db: Session = Depends(get_db)):
    purchase = service.update_purchase(db, purchase_id, update_data)
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")
    stock_entry = inventory_service.get_inventory_by_product(db, purchase.product_id)
    current_stock = stock_entry.current_stock if stock_entry else 0
    return {**purchase.__dict__, "current_stock": current_stock}


@router.delete("/{purchase_id}")
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    deleted = service.delete_purchase(db, purchase_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")
    return {"message": "Purchase deleted successfully"}
