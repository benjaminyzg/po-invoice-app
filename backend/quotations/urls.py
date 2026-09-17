from django.urls import path
from .views import export_quotation_pdf

urlpatterns = [
    path('<int:pk>/export-pdf/', export_quotation_pdf, name='export_quotation_pdf'),
]