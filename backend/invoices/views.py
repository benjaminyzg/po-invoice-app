from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Invoice, CatalogItem, PurchaseOrder, CompanySettings
from .serializers import ( InvoiceSerializer, CatalogItemSerializer, PurchaseOrderSerializer, PurchaseOrderStatusSerializer, CompanySettingsSerializer)

class CompanySettingsViewSet(viewsets.ModelViewSet):
    queryset = CompanySettings.objects.all()
    serializer_class = CompanySettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Always return or create the single instance (pk=1)
        obj, _ = CompanySettings.objects.get_or_create(pk=1)
        return obj

class CatalogItemViewSet(viewsets.ModelViewSet):
    queryset = CatalogItem.objects.all()
    serializer_class = CatalogItemSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = [permissions.AllowAny]
class PurchaseOrderViewSet(viewsets.ModelViewSet):
    # queryset = PurchaseOrder.objects.all().order_by('-created_at')
    # Prefetch related items to avoid N+1 queries
    queryset = PurchaseOrder.objects.all().prefetch_related('items')
    serializer_class = PurchaseOrderSerializer
    # permission_classes = [permissions.IsAuthenticated]
    # Temporarily allow unauthenticated requests for testing:
    permission_classes = [permissions.AllowAny]

    # inside PurchaseOrderViewSet or view method
    def partial_update(self, request, *args, **kwargs):
        print(f"\n[BACKEND TRACK 1] Incoming PATCH request for PO ID: {kwargs.get('pk')}")
        print(f"[BACKEND TRACK 2] Payload received: {request.data}")
        
        response = super().partial_update(request, *args, **kwargs)
        
        print(f"[BACKEND TRACK 3] Response status code: {response.status_code}")
        return response

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        po = self.get_object()
        serializer = PurchaseOrderStatusSerializer(po, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"PO #{po.po_number} status updated to {po.status}",
                    "data": PurchaseOrderSerializer(po).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InvoiceViewSet(viewsets.ModelViewSet):
    # queryset = Invoice.objects.all().order_by('-created_at').prefetch_related('items')
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = [AllowAny]