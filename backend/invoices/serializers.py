from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Invoice, InvoiceItem, CatalogItem, PurchaseOrder, PurchaseOrderItem, CompanySettings
from .utils import generate_serial_number  # Adjust import based on where you put it

def generate_serial_number(doc_type):
    current_year = timezone.now().year
    
    with transaction.atomic():
        # Using CompanySettings if it holds sequences, or substitute with a Sequence model
        # select_for_update() locks the row to prevent concurrent duplicate generation
        # Adjust field names based on your actual models.py fields
        # ...
        pass

class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = '__all__'

# 1. Define InvoiceItemSerializer FIRST
class InvoiceItemSerializer(serializers.ModelSerializer):
    total_amount = serializers.ReadOnlyField()

    class Meta:
        model = InvoiceItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_amount']

# 2. Define InvoiceSerializer SECOND (it can now reference InvoiceItemSerializer cleanly)
class InvoiceSerializer(serializers.ModelSerializer):
    items_detail = InvoiceItemSerializer(source='items', many=True, read_only=True)
    items = serializers.JSONField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'purchase_order', 'status', 'vendor_name',
            'total_amount', 'remarks', 'items_detail', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        
        calculated_total = 0
        for item in items_data:
            qty = float(item.get('quantity', item.get('qty', 1)))
            price = float(item.get('unit_price', item.get('unitPrice', 0)))
            calculated_total += (qty * price)
            
            InvoiceItem.objects.create(
                invoice=invoice,
                description=item.get('description', ''),
                quantity=qty,
                unit_price=price
            )
            
        invoice.total_amount = calculated_total
        invoice.save()
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # 1. Update invoice header fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 2. Recreate line items first
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)

        # 3. Recalculate total_amount from items and save instance
        # total = sum(
        #     (item.quantity or 0) * (item.unit_price or 0) 
        #    for item in instance.items.all()
        # )
        # instance.total_amount = total
        
        return instance

# 1. Catalog Item Serializer
class CatalogItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogItem
        fields = '__all__'

# 2. Purchase Order Item Serializer
class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total_price']

    def get_total_price(self, obj):
        # Dynamically calculate quantity * unit_price for the frontend
        return (obj.quantity or 0) * (obj.unit_price or 0)

# 3. Purchase Order Serializer
class PurchaseOrderSerializer(serializers.ModelSerializer):
    items_detail = PurchaseOrderItemSerializer(source='items', many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'vendor_name', 'status', 'items_detail', 
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['po_number']

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        # Update parent PurchaseOrder attributes
        instance.vendor_name = validated_data.get('vendor_name', instance.vendor_name)
        instance.status = validated_data.get('status', instance.status)
        instance.remarks = validated_data.get('remarks', instance.remarks)
        instance.total_amount = validated_data.get('total_amount', instance.total_amount)
        instance.save()

        # Update nested items if provided
        if items_data is not None:
            instance.items.all().delete()
            calculated_total = 0

            for item_data in items_data:
                qty = float(item_data.get('quantity', item_data.get('qty', 1)))
                price = float(item_data.get('unit_price', item_data.get('unitPrice', 0)))
                description = item_data.get('description', '')

                calculated_total += (qty * price)

                PurchaseOrderItem.objects.create(
                    purchase_order=instance,
                    description=description,
                    quantity=qty,
                    unit_price=price
                )

        return instance

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
