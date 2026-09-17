from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.conf import settings 

User = get_user_model()

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('ACCOUNTANT', 'Accountant'),
        ('VIEWER', 'Viewer'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='VIEWER')
    department = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class Invoice(models.Model):
    # Add the user field here
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=30)
    invoice_date = models.DateField()
    status = models.CharField(max_length=20, default='PENDING') 
    po_number = models.CharField(max_length=50, blank=True, null=True)
    item_description = models.TextField(blank=True, null=True)
    vendor_address = models.TextField(blank=True, null=True)

    vendor_name = models.CharField(max_length=255)
    client_email = models.EmailField(blank=True, null=True)
    client_phone_number = models.CharField(max_length=20, blank=True, null=True)
    client_office_number = models.CharField(max_length=20, blank=True, null=True)
    client_postal_code = models.CharField(max_length=20, blank=True, null=True)
    client_billing_address = models.TextField(blank=True, null=True)
    client_contact_person = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.invoice_number

class CatalogItem(models.Model):
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # Soft delete flag
    image = models.ImageField(upload_to='catalog_photos/', null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.pk:
            previous = CatalogItem.objects.get(pk=self.pk)
            if previous.unit_price != self.unit_price:
                CatalogPriceHistory.objects.create(
                    catalog_item=self,
                    old_price=previous.unit_price,
                    new_price=self.unit_price,
                )
        super().save(*args, **kwargs)

class CatalogPriceHistory(models.Model):
    catalog_item = models.ForeignKey(CatalogItem, on_delete=models.CASCADE, related_name='price_history')
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']

class LineItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_price(self):
        return self.quantity * self.unit_price

class CompanySettings(models.Model):
    name = models.CharField(max_length=255, default="My Company")
    tax_uen = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    office_number = models.CharField(max_length=20, blank=True, null=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    full_address = models.TextField(blank=True, null=True)
    web = models.URLField(blank=True, null=True)
    # Add this new field:
    quotation_format = models.CharField(max_length=100, default="FMQ-{DDMMYY}/{CLIENT_NAME}/{SEQ}")
    quotation_ref_label = models.CharField(max_length=100, default="Quote Ref")
    