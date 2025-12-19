from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from . import schemas, service
from app.users.schemas import UserDisplaySchema
from app.users.permissions import role_required

router = APIRouter()


@router.post("/", response_model=schemas.SaleOut, status_code=status.HTTP_201_CREATED)
def create_sale(
    sale: schemas.SaleCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    return service.create_sale(db, sale, current_user.id)


@router.get("/", response_model=List[schemas.SaleOut])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    return service.list_sales(db, skip, limit)


@router.get("/{sale_id}", response_model=schemas.SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    sale = service.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return sale


@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["admin"]))
):
    deleted = service.delete_sale(db, sale_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found")
    return deleted
