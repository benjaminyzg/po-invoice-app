from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from invoices.views import CatalogItemViewSet, InvoiceViewSet, PurchaseOrderViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'), # Ensure trailing slash!
]