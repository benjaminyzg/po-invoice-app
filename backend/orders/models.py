from django.db import models
from django.conf import settings

class DeliveryOrder(models.Model):
    do_number = models.CharField(max_length=100, unique=True)
    invoice = models.OneToOneField('invoices.Invoice', on_delete=models.CASCADE, related_name='delivery_order')
    created_at = models.DateTimeField(auto_now_add=True)

    # Logistics & Carrier Information
    carrier_name = models.CharField(max_length=255, help_text="e.g. DHL Express, FedEx, Ocean Freight Carrier")
    consignment_note_number = models.CharField(max_length=100, help_text="Air Waybill (AWB) or Bill of Lading (B/L) No.")
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)

    # Shipping Address Details
    sender_address = models.TextField()
    consignee_address = models.TextField()

    # Proof of Delivery & Signatures
    recipient_name = models.CharField(max_length=255, blank=True, null=True)
    recipient_signature_data = models.TextField(blank=True, null=True, help_text="Base64 encoded PNG signature string")
    delivered_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"DO #{self.do_number} - {self.carrier_name}"