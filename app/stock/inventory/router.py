from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.stock.inventory import schemas, service

router = APIRouter()


@router.get("/", response_model=List[schemas.InventoryOut])
def list_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.list_inventory(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.InventoryOut)
def get_inventory(product_id: int, db: Session = Depends(get_db)):
    inventory = service.get_inventory_by_product(db, product_id)
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found for this product"
        )
    return inventory
