from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from typing import Optional
from sqlalchemy import text



from app.database import get_db
from . import schemas, service
from app.users.schemas import UserDisplaySchema
from app.users.permissions import role_required
import uuid

router = APIRouter()





@router.post("/", response_model=schemas.SaleOut, status_code=status.HTTP_201_CREATED)
def create_sale_endpoint(
    sale: schemas.SaleCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    return service.create_sale(db, sale, current_user.id)




@router.get("/", response_model=List[schemas.SaleOut])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(
        role_required(["staff", "manager", "admin"])
    )
):
    return service.list_sales(
        db=db,
        skip=skip,
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/{sale_id}", response_model=schemas.SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    sale = service.get_sale(db, sale_id)
    return sale


@router.put("/{sale_id}", response_model=schemas.SaleOut)
def update_sale(
    sale_id: int,
    sale_update: schemas.SaleUpdate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    """
    Update a sale (quantity, price, payment method, bank, etc.).
    Recalculates total_amount and balance_due automatically.
    """
    return service.update_sale(db, sale_id, sale_update)

@router.get("/report/analysis", response_model=schemas.SaleAnalysisOut)
def sales_analysis(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(
        role_required(["manager", "admin"])
    )
):
    return service.sales_analysis(
        db=db,
        start_date=start_date,
        end_date=end_date
    )



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


@router.delete("/clear/all", status_code=status.HTTP_200_OK)
def delete_all_sales(
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["admin"]))
):
    """
    Delete ALL sales records.
    Admin only.
    """
    return service.delete_all_sales(db)
