from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)

from core_app.views import UserViewSet, CatalogItemViewSet
from invoices.views import CompanySettingsViewSet, InvoiceViewSet, PurchaseOrderViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchaseorder')
router.register(r'company-settings', CompanySettingsViewSet, basename='companysettings')
router.register(r'company-settings', CompanySettingsViewSet, basename='companysetting')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/quotations/', include('quotations.urls')),
    # SimpleJWT Token Endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # App Routes
    path('api/', include(router.urls)),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'), # Ensure trailing slash!
    # path('api/company-settings/', CompanySettingsView.as_view(), name='company-settings'),
]
    path('api/', include('core_app.urls')),
    path('api/', include('invoices.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
