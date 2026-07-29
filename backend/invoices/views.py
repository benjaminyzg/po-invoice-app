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

    # inside PurchaseOrderViewSet or view method
    def partial_update(self, request, *args, **kwargs):
        print(f"\n[BACKEND TRACK 1] Incoming PATCH request for PO ID: {kwargs.get('pk')}")
        print(f"[BACKEND TRACK 2] Payload received: {request.data}")
        
        response = super().partial_update(request, *args, **kwargs)
        
        print(f"[BACKEND TRACK 3] Response status code: {response.status_code}")
        return response

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]