from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet,
    PurchaseOrderViewSet,
    CatalogItemViewSet,
    CompanySettingsViewSet,
    generate_packing_list_pdf,
    manage_invoices,
    delete_invoice,
    update_invoice,
    PurchaseOrderDeleteView,
    export_commercial_invoice_pdf,
    export_delivery_order_pdf,
    export_packing_list_pdf,
)
from .views import PaymentTermTemplateViewSet, QuotationViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')
router.register(r'company-settings', CompanySettingsViewSet, basename='companysetting')
router.register(r'payment-terms', PaymentTermTemplateViewSet)
router.register(r'quotations', QuotationViewSet)

urlpatterns = [
    path('invoices/<int:invoice_id>/packing-list/', generate_packing_list_pdf, name='generate_packing_list_pdf'),
    path('', include(router.urls)),
    path('', manage_invoices, name='manage_invoices'),
    path('<int:pk>/delete/', delete_invoice, name='delete_invoice'),
    path('<int:pk>/update/', update_invoice, name='update_invoice'),
    path('purchase-orders/<int:pk>/', PurchaseOrderDeleteView.as_view(), name='purchase-order-delete'),
    # API endpoints
    path('<int:pk>/export-invoice-pdf/', export_commercial_invoice_pdf, name='export_invoice_pdf'),
    path('<int:pk>/export-do-pdf/', export_delivery_order_pdf, name='export_do_pdf'),
    path('<int:pk>/export-packing-pdf/', export_packing_list_pdf, name='export_packing_pdf'),
] + router.urls