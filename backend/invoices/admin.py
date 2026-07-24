from django.contrib import admin
from .models import Invoice, InvoiceItem, CatalogItem, PurchaseOrder

# 1. Register CatalogItem
@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit_price')

# 2. Register PurchaseOrder
@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'vendor_name', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('po_number', 'vendor_name')

# 3. Register Invoice & Inline Items
class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1

from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    # 1. Replace 'total_amount' with your custom method name 'formatted_total_amount'
    list_display = (
        'invoice_number',
        'vendor_name',
        'po_number',
        'status',
        'formatted_total_amount',
    )

    # 2. Add this method to format the output with thousands separators
    @admin.display(description='TOTAL AMOUNT')
    def formatted_total_amount(self, obj):
        if obj.total_amount is None:
            return '$0.00'
        return f'${obj.total_amount:,.2f}'  # Adds commas and keeps 2 decimal places