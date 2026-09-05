from decimal import Decimal
from django.db import models
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core_app.models import CatalogItem  # Import master catalog from core_app

class PaymentTermTemplate(models.Model):
    """Reusable payment term templates (e.g., Net 30, 50/50 Split)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    deposit_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    due_days = models.IntegerField(help_text="Number of days until full payment is due")

    def __str__(self):
        return self.name

class Quotation(models.Model):
    """Quotation document tracking pricing validity and payment schedules"""
    client_name = models.CharField(max_length=255) # Or ForeignKey to a Client model if available
    created_at = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateField(help_text="Date until which this quoted price is valid")
    payment_term = models.ForeignKey(PaymentTermTemplate, on_delete=models.SET_NULL, null=True)
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('ACCEPTED', 'Accepted'),
        ('EXPIRED', 'Expired'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    def clean(self):
        super().clean()
        if self.pk is None and self.valid_until and self.valid_until < timezone.now().date():
            raise ValidationError({'valid_until': "Quotation validity date cannot be set in the past."})

    def save(self, *args, **kwargs):
        if self.valid_until and self.valid_until < timezone.now().date() and self.status == 'SENT':
            self.status = 'EXPIRED'
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Quotation #{self.id} - {self.client_name}"

class QuotationItem(models.Model):
    """Line items locking in pricing from core_app's CatalogItem"""
    quotation = models.ForeignKey(Quotation, related_name='items', on_delete=models.CASCADE)
    catalog_item = models.ForeignKey(CatalogItem, on_delete=models.PROTECT) # Prevents deleting items used in quotes
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2) # Locks price at time of quotation

    def save(self, *args, **kwargs):
        # Automatically pull price from core_app CatalogItem if not specified
        if not self.unit_price and self.catalog_item:
            self.unit_price = self.catalog_item.unit_price
        super().save(*args, **kwargs)

class CompanySettings(models.Model):
    # Company Profile
    company_name = models.CharField(max_length=255, default="My Company Pte Ltd")
    tax_registration_no = models.CharField(max_length=50, blank=True, null=True, help_text="UEN / GST Registration Number")
    logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)

    # Contact Details
    registered_address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)

    # Banking & Payment Details
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    swift_code = models.CharField(max_length=20, blank=True, null=True)
    paynow_uen = models.CharField(max_length=50, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Enforce single instance rule (Singleton pattern)
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name

# 1. Catalog Item Model
class CatalogItem(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_deleted = models.BooleanField(default=False)
    packing_dimensions = models.CharField(max_length=100, blank=True, null=True)
    gross_weight = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (${self.unit_price})"

# 2. Invoice Header Model
class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval')
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    vendor_name = models.CharField(max_length=255)
    po_number = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    issued_date = models.DateField(default=timezone.now)
    remarks = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    invoice_number = models.CharField(max_length=50, unique=True)
    purchase_order = models.ForeignKey(
        'PurchaseOrder',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    vendor_name = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def total_amount(self):
        """Calculates total from related line items."""
        total = sum(
            (item.total_price for item in self.items.all()), 
            Decimal('0.00')
        )
        return total

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.vendor_name}"

# 3. Purchase Order Model
class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        RECEIVED = 'RECEIVED', 'Received'
        PAID = 'PAID', 'Paid'
        CANCELLED = 'CANCELLED', 'Cancelled'

    po_number = models.CharField(max_length=50, unique=True)
    vendor_name = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_centre = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING,)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    supporting_document = models.FileField(upload_to='po_docs/', null=True, blank=True)

    def __str__(self):
        return f"{self.po_number} - {self.vendor_name} ({self.status})"

    # Strip away lines 94-106. Your save method should just look like this:
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

# 4. Purchase Order Item Model
class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, 
        related_name='items',  # This allows po.items.all() in Django and "items" in the serializer
        on_delete=models.CASCADE
    )
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='SGD')

    def __str__(self):
        return f"{self.description} ({self.quantity})"

# 5. Invoice Line Items Model
class InvoiceItem(models.Model):
    invoice = models.ForeignKey(
        Invoice, related_name='items', on_delete=models.CASCADE
    )
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_price(self):
        if self.quantity is None or self.unit_price is None:
            return Decimal('0.00')
        return self.quantity * self.unit_price

    def __str__(self):
        return f'{self.description} ({self.quantity} x ${self.unit_price})'

# 6. Document Sequence Items Model
class DocumentSequence(models.Model):
    DOCUMENT_TYPES = [
        ('INV', 'Invoice'),
        ('PO', 'Purchase Order'),
    ]
    doc_type = models.CharField(max_length=3, choices=DOCUMENT_TYPES)
    year = models.PositiveIntegerField()
    last_sequence = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('doc_type', 'year')