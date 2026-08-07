from rest_framework import serializers
from .models import Invoice, InvoiceItem, CatalogItem, PurchaseOrder, PurchaseOrderItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'vendor_name',
            'status',
            'total_amount',
        ]

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    total_amount = serializers.ReadOnlyField()  # 👈 Reads @property from model

    # Overrides total_amount to output as a formatted string
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 
            'invoice_number', 
            'vendor_name', 
            'po_number', 
            'issued_date',  # <-- Add this field
            'status', 
            'items', 
        ]

    def get_total_amount(self, obj):
        # Returns "2,200,000.00"
        return f'{obj.total_amount:,.2f}'

# 1. Catalog Item Serializer
class CatalogItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogItem
        fields = '__all__'

# 2. Purchase Order Item Serializer
class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'currency']

# 3. Purchase Order Serializer
class PurchaseOrderSerializer(serializers.ModelSerializer):
    # Add nested serializer (use the related_name from your ForeignKey, e.g. 'items')
    items = PurchaseOrderItemSerializer(many=True, required=False)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 
            'po_number', 
            'vendor_name', 
            'total_amount', 
            'status', 
            'created_at', 
            'updated_at', 
            'items'  # 2. Add 'items' to the serializer fields
        ]

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update parent PurchaseOrder attributes
        instance.po_number = validated_data.get('po_number', instance.po_number)
        instance.vendor_name = validated_data.get('vendor_name', instance.vendor_name)
        instance.status = validated_data.get('status', instance.status)
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.save()

        # Update nested items if provided
        if items_data is not None:
            # Clear existing items and replace with updated set
            instance.items.all().delete()
            for item_data in items_data:
                PurchaseOrderItem.objects.create(purchase_order=instance, **item_data)

        return instance

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
            
        return purchase_order

# 4. Purchase Order Status Serializer
class PurchaseOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = ['status']

    def validate_status(self, new_status):
        instance = getattr(self, 'instance', None)
        if instance is None:
            return new_status

        current_status = instance.status

        # Rule 1: Cannot change status of a Cancelled PO
        if current_status == PurchaseOrder.Status.CANCELLED:
            raise serializers.ValidationError(
                f"Cannot update status for a PO that is already {current_status}."
            )

        # Rule 2: Cannot transition directly from Pending to Paid
        if current_status == PurchaseOrder.Status.PENDING and new_status == PurchaseOrder.Status.PAID:
            raise serializers.ValidationError(
                "A Purchase Order must be 'Received' before it can be marked as 'Paid'."
            )

        return new_status

# 5. Invoice Item Serializer (Line Items)
class InvoiceItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price']

# 6. Main Invoice Serializer (Nested Line Items)
class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'vendor_name', 'po_number', 'status', 'total_amount', 'items', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice