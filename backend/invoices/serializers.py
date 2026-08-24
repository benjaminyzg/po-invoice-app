from rest_framework import serializers
from .models import Invoice, InvoiceItem, CatalogItem, PurchaseOrder, PurchaseOrderItem, CompanySettings

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
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
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
    class Meta:
        model = PurchaseOrderItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'currency']

# 3. Purchase Order Serializer
class PurchaseOrderSerializer(serializers.ModelSerializer):
    # Add nested serializer (use the related_name from your ForeignKey, e.g. 'items')
    items_detail = PurchaseOrderItemSerializer(many=True, read_only=True, source='items')
    items = serializers.JSONField(write_only=True, required=False, allow_null=True)
        
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'po_number', 'vendor_name', 'cost_centre', 
            'remarks', 'total_amount', 'status', 'created_at', 
            'updated_at', 'items', 'items_detail', 'supporting_document'
        ]
        read_only_fields = ['po_number']

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
            instance.items.all().delete()
            calculated_total = 0

            for item_data in items_data:
                qty = float(item_data.pop('quantity', item_data.pop('qty', 1)))
                price = float(item_data.get('unit_price', item_data.get('unitPrice', 0)))
                description = item_data.get('description', '')
                currency = item_data.get('currency', 'SGD')

                calculated_total += (qty * price)

                PurchaseOrderItem.objects.create(
                    purchase_order=instance,
                    description=description,
                    quantity=qty,
                    unit_price=price,
                    currency=currency
                )
            
                # Automatically update the parent total amount
                instance.total_amount = calculated_total

        instance.save()
        return instance

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            # Make sure these lines are indented under the 'for' loop
            qty = item_data.get('quantity', item_data.get('qty', 1))
            price = item_data.get('unit_price', item_data.get('unit_price', 0))
            description = item_data.get('description', '')
            currency = item_data.get('currency', 'SGD')
            
            calculated_total += (float(qty) * float(price))

            PurchaseOrderItem.objects.create(
                purchase_order=instance,
                description=description,
                quantity=qty,
                unit_price=price,
                currency=currency
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
