from fastapi import APIRouter, Depends, HTTPException, status,  Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from typing import Optional
from sqlalchemy import text

from app.sales.schemas import SaleOut, SaleOut2,  SaleFullCreate, OutstandingSalesResponse, SalesListResponse
from app.database import get_db
from . import schemas, service
from app.users.schemas import UserDisplaySchema
from app.users.permissions import role_required
import uuid

from app.sales.service import get_sales_by_customer







router = APIRouter()





@router.post("/", response_model=SaleOut, status_code=201)
def create_sale_endpoint(
    sale_data: SaleFullCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    """
    Create a sale + all items in a single transaction.
    """
    return service.create_sale_full(db, sale_data, current_user.id)


@router.post("/items")
def create_sale_item(
    item: schemas.SaleItemCreate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["staff", "manager", "admin"]))
):
    return service.create_sale_item(db, item)




@router.get("/", response_model=schemas.SalesListResponse)
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


@router.get(
    "/report/staff",
    response_model=List[schemas.SaleOut]
)
def staff_sales_report(
    staff_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(
        role_required(["manager", "admin"])
    )
):
    """
    Sales made by staff (sold_by).
    Optional filters:
    - staff_id
    - start_date / end_date
    """
    return service.staff_sales_report(
        db=db,
        staff_id=staff_id,
        start_date=start_date,
        end_date=end_date
    )


@router.get(
    "/sales/outstanding",
    response_model=OutstandingSalesResponse
)
def outstanding_sales(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db)
):
    return service.outstanding_sales_service(db, start_date, end_date)



@router.get(
    "/by-customer",
    response_model=List[SaleOut]
)
def sales_by_customer(
    customer_name: str | None = Query(None, description="Customer name"),
    customer_phone: str | None = Query(None, description="Customer phone"),
    db: Session = Depends(get_db)
):
    return get_sales_by_customer(
        db=db,
        customer_name=customer_name,
        customer_phone=customer_phone
    )



@router.get(
    "/item-sold",
    response_model=List[schemas.SaleOut]
)
def list_item_sold(
    start_date: date,
    end_date: date,
    invoice_no: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(
        role_required(["staff", "manager", "admin"])
    )
):
    """
    List all sales within a date range.
    Optionally filter by invoice number.
    """
    return service.list_item_sold(
        db=db,
        start_date=start_date,
        end_date=end_date,
        invoice_no=invoice_no,
        skip=skip,
        limit=limit
    )

@router.put("/{invoice_no}", response_model=schemas.SaleOut)
def update_sale(
    invoice_no: int,
    sale_update: schemas.SaleUpdate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(
        role_required(["staff", "manager", "admin"])
    )
):
    """
    Update sale header information.
    Totals and balance are recalculated automatically.
    """
    return service.update_sale(db, invoice_no, sale_update)



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



@router.put(
    "/{invoice_no}/items/{product_id}",
    response_model=schemas.SaleItemOut
)
def update_sale_item(
    invoice_no: int,
    product_id: int,
    item_update: schemas.SaleItemUpdate,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(
        role_required(["staff", "manager", "admin"])
    )
):
    return service.update_sale_item(
        db,
        invoice_no,
        product_id,
        item_update
    )



@router.delete("/{invoice_no}")
def delete_sale(
    invoice_no: int,
    db: Session = Depends(get_db),
    current_user: UserDisplaySchema = Depends(role_required(["admin"]))
):
    # 1️⃣ Check if there are payments tied to this sale
    from app.payments import service as payment_service

    payments = payment_service.list_payments_by_sale(db, invoice_no)
    if payments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete sale: payments exist. Please delete the payment(s) first."
        )

    # 2️⃣ Delete the sale
    deleted = service.delete_sale(db, invoice_no)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Sale not found"
        )

    return {"message": "Sale deleted successfully"}




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
