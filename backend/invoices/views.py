from rest_framework import viewsets, permissions
from .models import Invoice, CatalogItem, PurchaseOrder
from .serializers import (
    InvoiceSerializer,
    CatalogItemSerializer,
    PurchaseOrderSerializer,
)

class CatalogItemViewSet(viewsets.ModelViewSet):
    queryset = CatalogItem.objects.all()
    serializer_class = CatalogItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]