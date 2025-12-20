from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
import uuid

from . import models, schemas
from app.stock.inventory import service as inventory_service
from app.stock.products import models as product_models
from app.payments.models import Payment

def generate_invoice_no() -> str:
    return f"INV-{uuid.uuid4().hex[:8].upper()}"

def create_sale(db: Session, sale: schemas.SaleCreate, user_id: int):
    # Validate product
    if sale.product_id:
        product = db.query(product_models.Product).filter(product_models.Product.id == sale.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

    # Payment validation
    payment_method = sale.payment_method.lower()
    if payment_method == "cash" and sale.bank_id:
        raise HTTPException(status_code=400, detail="Bank should not be selected for cash payment")
    if payment_method in ["transfer", "pos"] and not sale.bank_id:
        raise HTTPException(status_code=400, detail="Bank is required for transfer or POS payment")

    # Check and update inventory
    if sale.product_id:
        stock = inventory_service.get_inventory_by_product(db, sale.product_id)
        if not stock or stock.current_stock < sale.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        inventory_service.remove_stock(db, sale.product_id, sale.quantity, commit=False)

    # Compute total
    total_amount = sale.quantity * sale.selling_price

    db_sale = models.Sale(
        invoice_no=generate_invoice_no(),
        product_id=sale.product_id,
        quantity=sale.quantity,
        selling_price=sale.selling_price,
        total_amount=total_amount,
        payment_method=sale.payment_method,
        bank_id=sale.bank_id,
        ref_no=sale.ref_no,
        customer_name=sale.customer_name,
        customer_phone=sale.customer_phone,
        sold_by=user_id,
        sold_at=datetime.utcnow()
    )

    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    return db_sale

def get_sale(db: Session, sale_id: int):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Compute total paid and balance due
    total_paid = sum(p.amount_paid for p in sale.payments)
    sale.total_paid = total_paid
    sale.balance_due = sale.total_amount - total_paid
    return sale

def list_sales(db: Session, skip: int = 0, limit: int = 100):
    sales = db.query(models.Sale).order_by(models.Sale.sold_at.desc()).offset(skip).limit(limit).all()
    # Add total_paid and balance_due for each sale
    for sale in sales:
        total_paid = sum(p.amount_paid for p in sale.payments)
        sale.total_paid = total_paid
        sale.balance_due = sale.total_amount - total_paid
    return sales

def update_sale(db: Session, sale_id: int, sale_update: schemas.SaleUpdate):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Update allowed fields
    for field, value in sale_update.dict(exclude_unset=True).items():
        setattr(sale, field, value)

    # Recalculate total_amount if quantity or selling_price updated
    if sale_update.quantity or sale_update.selling_price:
        sale.total_amount = sale.quantity * sale.selling_price

    # Recalculate balance_due
    total_paid = sum(p.amount_paid for p in sale.payments)
    sale.balance_due = sale.total_amount - total_paid

    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

def delete_sale(db: Session, sale_id: int):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    # Restore inventory
    inventory = inventory_service.get_inventory_by_product(db, sale.product_id)
    if inventory:
        inventory.quantity_out -= sale.quantity
        inventory.current_stock = inventory.quantity_in - inventory.quantity_out + inventory.adjustment_total
        db.add(inventory)

    db.delete(sale)
    db.commit()
    return {"detail": "Sale deleted successfully"}
