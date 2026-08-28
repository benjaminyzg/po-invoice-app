from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from core_app.views import UserViewSet, CatalogItemViewSet

# 1. Import CompanySettingsViewSet alongside the other viewsets
from invoices.views import (
    CatalogItemViewSet, 
    InvoiceViewSet, 
    PurchaseOrderViewSet, 
    CompanySettingsViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
# 2. Register company-settings here in config/urls.py
router.register(r'company-settings', CompanySettingsViewSet, basename='company-settings')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include('invoices.urls')),  # or whatever your app url routing is named
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'), # Ensure trailing slash!
]

# Serve media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)