from decimal import Decimal
from django.db import models
from django.utils import timezone

# 1. Catalog Item Model
class CatalogItem(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} (${self.unit_price})"

# 3. Invoice Header Model
class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    vendor_name = models.CharField(max_length=255)
    po_number = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    issued_date = models.DateField(default=timezone.now)

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

# 2. Purchase Order Model
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
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.po_number} - {self.vendor_name} ({self.status})"

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

# 4. Invoice Line Items Model
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