import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from invoices.models import PurchaseOrder, PurchaseOrderItem, Invoice, InvoiceItem

# 1. Get or Create Purchase Order
po, created = PurchaseOrder.objects.get_or_create(
    po_number="PO-2026-001",
    defaults={
        "vendor_name": "Acme Supplies Ltd",
        "status": "APPROVED",
        "remarks": "Initial bulk office supply order"
    }
)

PurchaseOrderItem.objects.get_or_create(
    purchase_order=po,
    description="Ergonomic Chairs",
    defaults={
        "quantity": 5,
        "unit_price": 250.00
    }
)

# 2. Get or Create Linked Invoice
inv, created = Invoice.objects.get_or_create(
    invoice_number="INV-2026-001",
    defaults={
        "purchase_order": po,
        "vendor_name": "Acme Supplies Ltd",
        "status": "DRAFT",
        "remarks": "Invoice matching PO-2026-001"
    }
)

InvoiceItem.objects.get_or_create(
    invoice=inv,
    description="Ergonomic Chairs",
    defaults={
        "quantity": 5,
        "unit_price": 250.00
    }
)

print("Seed data successfully created!")