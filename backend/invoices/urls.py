from django.urls import path
from .views import manage_invoices, delete_invoice, mark_as_paid, update_invoice

urlpatterns = [
    path('invoices/', manage_invoices, name='manage_invoices'),
    path('invoices/<int:pk>/delete/', delete_invoice, name='delete_invoice'),
    path('invoices/<int:pk>/update/', update_invoice, name='update_invoice'),
    path('invoices/<int:pk>/mark-paid/', mark_as_paid, name='mark-paid'),
]