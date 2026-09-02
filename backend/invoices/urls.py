from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet,
    PurchaseOrderViewSet,
    CatalogItemViewSet,
    CompanySettingsViewSet
)

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')
router.register(r'company-settings', CompanySettingsViewSet, basename='companysetting')

urlpatterns = router.urls