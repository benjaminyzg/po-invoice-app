from django.urls import path
from . import views

urlpatterns = [
    path('', views.manage_invoices, name='manage_invoices'),
    path('<int:pk>/delete/', views.delete_invoice, name='delete_invoice'), # Add this line
    path('<int:pk>/update/', views.update_invoice, name='update_invoice'),
]