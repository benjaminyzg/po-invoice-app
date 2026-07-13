from django.urls import path
from . import views
# from .views import manage_invoices, delete_invoice, mark_as_paid, update_invoice

urlpatterns = [
    path('invoices/', views.manage_invoices, name='manage_invoices'),
    # path('invoices/<int:pk>/delete/', views.delete_invoice, name='delete_invoice'),
    # path('invoices/<int:pk>/update/', views.update_invoice, name='update_invoice'),
    # path('invoices/<int:pk>/mark-paid/', views.mark_as_paid, name='mark-paid'),
]