from django.db import models  
from django.conf import settings # Add this import

class Invoice(models.Model):
    # Add the user field here
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=30)
    invoice_date = models.DateField()
    status = models.CharField(max_length=20, default='PENDING') 
    po_number = models.CharField(max_length=50, blank=True, null=True)
    item_description = models.TextField(blank=True, null=True)
    vendor_address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.invoice_number

class LineItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_price(self):
        return self.quantity * self.unit_price