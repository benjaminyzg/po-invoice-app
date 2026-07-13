from rest_framework import serializers
from core_app.models import Invoice, LineItem

class LineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LineItem
        fields = ['description', 'quantity', 'unit_price']

class InvoiceSerializer(serializers.ModelSerializer):
    items = LineItemSerializer(many=True) # This links the nested items

    class Meta:
        model = Invoice
        fields = ['invoice_number', 'vendor_name', 'amount', 'status', 'due_date', 'items']