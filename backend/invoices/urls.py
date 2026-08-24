from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'catalog-items', views.CatalogItemViewSet, basename='catalogitem')
router.register(r'purchase-orders', views.PurchaseOrderViewSet, basename='purchaseorders')
router.register(r'company-settings', views.CompanySettingsViewSet, basename='company-settings')

urlpatterns = [
    path('', include(router.urls)),
    path('manage/', views.manage_invoices, name='manage_invoices'),
    path('<int:pk>/delete/', views.delete_invoice, name='delete_invoice'),
    path('<int:pk>/update/', views.update_invoice, name='update_invoice'),
    path('<int:pk>/mark-paid/', views.mark_as_paid, name='mark-paid'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)