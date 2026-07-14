from rest_framework import serializers
from .models import Invoice
# If you have LineItem, keep this line, otherwise remove it:
# from core_app.models import LineItem 

class InvoiceSerializer(serializers.ModelSerializer):
    # Only include the line below if you have LineItem set up
    # items = LineItemSerializer(many=True) 

    class Meta:
        model = Invoice
        fields = ['invoice_number', 'vendor_name', 'amount', 'status', 'due_date']