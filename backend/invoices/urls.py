from . import views
from rest_framework.routers import DefaultRouter
from .views import CatalogItemViewSet
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from .views import manage_invoices, delete_invoice, mark_as_paid, update_invoice

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'catalog-items', CatalogItemViewSet, basename='catalogitem')
router.register(r'company-settings', CompanySettingsViewSet, basename='company-settings')

urlpatterns = router.urls

urlpatterns = [
    path('', include(router.urls)),
    path('', views.manage_invoices, name='manage_invoices'),
    path('<int:pk>/delete/', views.delete_invoice, name='delete_invoice'),
    path('<int:pk>/update/', views.update_invoice, name='update_invoice'),
    path('<int:pk>/mark-paid/', views.mark_as_paid, name='mark-paid'),
]

# At the bottom of your root urls.py
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)