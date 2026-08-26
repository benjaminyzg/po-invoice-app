from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Invoice, CatalogItem, PurchaseOrder, CompanySettings
from .serializers import ( InvoiceSerializer, CatalogItemSerializer, PurchaseOrderSerializer, PurchaseOrderStatusSerializer, CompanySettingsSerializer)

@api_view(['PUT', 'PATCH'])
def update_invoice(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = InvoiceSerializer(invoice, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_invoice(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
        invoice.delete()
        return Response(status=status.HTTP_24_NO_CONTENT)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def manage_invoices(request):
    return Response({"message": "Manage invoices endpoint"})

class CompanySettingsViewSet(viewsets.ModelViewSet):
    queryset = CompanySettings.objects.all()
    serializer_class = CompanySettingsSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        obj, _ = CompanySettings.objects.get_or_create(pk=1)
        return obj

    def create(self, request, *args, **kwargs):
        # Redirect POST requests to update the existing pk=1 instance
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

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