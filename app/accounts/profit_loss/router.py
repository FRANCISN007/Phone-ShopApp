from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from app.database import get_db
from . import service

router = APIRouter()


@router.get("/", response_model=Dict[str, Any])
def get_profit_loss(
    start_date: datetime = Query(None, description="Start date for P&L period"),
    end_date: datetime = Query(None, description="End date for P&L period"),
    db: Session = Depends(get_db)
):
    """
    Returns P&L report for the given period.
    If no dates are provided, defaults to the current month.
    """
    return service.get_profit_and_loss(db, start_date, end_date)