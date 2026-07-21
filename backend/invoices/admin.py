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

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'vendor_name', 'po_number', 'status', 'created_at')
    inlines = [InvoiceItemInline]