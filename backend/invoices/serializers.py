import json
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
    # items = PurchaseOrderItemSerializer(many=True, required=False)
    items = serializers.JSONField(write_only=True, required=False)

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
            'items',
            'supporting_document',  # 2. Add 'items' to the serializer fields
        ]

    def update(self, instance, validated_data):
        # 1. Pop the items payload
        items_data = validated_data.pop('items', None)
        if items_data is None and hasattr(self, 'initial_data'):
            items_data = self.initial_data.get('items', None)

        # Update standard parent fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update parent PurchaseOrder attributes
        instance.po_number = validated_data.get('po_number', instance.po_number)
        instance.vendor_name = validated_data.get('vendor_name', instance.vendor_name)
        instance.status = validated_data.get('status', instance.status)
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.save()

        # 2. Update all other standard fields (vendor_name, status, po_number, etc.)
        # Update standard PO fields (vendor, status, po_number, supporting_document, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3. Explicitly parse and handle the items data
        # Update nested items if provided
        if items_data is not None:
            # If it came through FormData as a JSON string, load it into a Python list
            if isinstance(items_data, str):
                try:
                    items_data = json.loads(items_data)
                except json.JSONDecodeError:
                    items_data = []

            # Clear old items to replace them with the updated list
            instance.items.all().delete()
            calculated_total = 0
            
            for item_data in items_data:
                qty = int(item_data.pop('quantity', item_data.pop('qty', 1)))
                price = float(item_data.get('unit_price', item_data.pop('unitPrice', 0)))

                calculated_total += (qty * price)
                
                PurchaseOrderItem.objects.create(
                    purchase_order=instance,
                    quantity=qty,
                    unit_price=price, #explicity pass the cleaned snake_case field
                    **item_data
                )
            
            # Automatically update the parent total amount
            instance.total_amount = calculated_total
            instance.save()

        return instance

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            qty = item_data.pop('quantity', item_data.pop('qty', 1))
            PurchaseOrderItem.objects.create(
                purchase_order=purchase_order,
                quantity=qty,
                **item_data
            )

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