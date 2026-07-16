from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        # Ensure these strings match the field names in models.py exactly
        fields = ['id', 'invoice_number', 'vendor_name', 'amount', 'status', 'due_date', 'po_number', 'vendor_address', 'item_description']