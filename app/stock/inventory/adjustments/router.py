from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from . import schemas, service
from app.users.permissions import role_required
from app.users.schemas import UserDisplaySchema

router = APIRouter()


@router.post("/", response_model=schemas.StockAdjustmentOut)
def create_adjustment(
    adjustment: schemas.StockAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["admin"]))
):
    """
    Admin-only endpoint to adjust stock.
    Positive quantity = increase stock
    Negative quantity = decrease stock
    """
    return service.create_adjustment(db, adjustment, current_user.id)


@router.get("/", response_model=List[schemas.StockAdjustmentOut])
def list_adjustments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    """
    List all stock adjustments (admin-only)
    """
    return service.list_adjustments(db, skip, limit)


@router.delete("/{adjustment_id}", status_code=200)
def delete_adjustment(
    adjustment_id: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["admin"]))
):
    """
    Admin-only endpoint to delete a stock adjustment.
    This will revert its effect on inventory.
    """
    service.delete_adjustment(db, adjustment_id)
    return {"message": "Adjustment deleted successfully"}
