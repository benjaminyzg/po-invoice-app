from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
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
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    queryset = PurchaseOrder.objects.all().prefetch_related('items')
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Temporarily allow unauthenticated requests for testing:
    # permission_classes = [permissions.AllowAny]

    # inside PurchaseOrderViewSet or view method
    def partial_update(self, request, *args, **kwargs):
        print(f"\n[BACKEND TRACK 1] Incoming PATCH request for PO ID: {kwargs.get('pk')}")
        print(f"[BACKEND TRACK 2] Payload received: {request.data}")
        
        response = super().partial_update(request, *args, **kwargs)
        
        print(f"[BACKEND TRACK 3] Response status code: {response.status_code}")
        return response

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        po = self.get_object()
        
        # Check user role (e.g., ADMIN or MANAGER only)
        if hasattr(request.user, 'profile') and request.user.profile.role not in ['ADMIN', 'MANAGER']:
            return Response(
                {"detail": "You do not have permission to approve POs."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        po.status = 'APPROVED'
        po.save()
        return Response({'status': 'Purchase Order approved successfully.'})

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

    def get_queryset(self):
        # Optional: Filter POs by current user's department or role
        return super().get_queryset()

class InvoiceViewSet(viewsets.ModelViewSet):
    # queryset = Invoice.objects.all().order_by('-created_at').prefetch_related('items')
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    # permission_classes = [permissions.IsAuthenticated]
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'], url_path='validate-match')
    def validate_match(self, request, pk=None):
        invoice = self.get_object()
        po = invoice.purchase_order

        if not po:
            return Response(
                {"detail": "Cannot perform 3-way match: No Purchase Order linked to this invoice."},
                status=status.HTTP_400_BAD_REQUEST
            )

        discrepancies = []
        invoice_items = invoice.items.all()
        po_items = {item.description.lower().strip(): item for item in po.items.all()}

        total_invoice_qty = 0
        total_po_qty = 0

        for inv_item in invoice_items:
            total_invoice_qty += inv_item.quantity
            item_key = inv_item.description.lower().strip()
            po_item = po_items.get(item_key)

            if not po_item:
                discrepancies.append({
                    "type": "UNMATCHED_ITEM",
                    "description": inv_item.description,
                    "detail": f"Item '{inv_item.description}' exists on invoice but not found on PO."
                })
                continue

            total_po_qty += po_item.quantity

            # Check Unit Price Variance
            if inv_item.unit_price > po_item.unit_price:
                discrepancies.append({
                    "type": "PRICE_VARIANCE",
                    "description": inv_item.description,
                    "invoice_unit_price": float(inv_item.unit_price),
                    "po_unit_price": float(po_item.unit_price),
                    "difference": float(inv_item.unit_price - po_item.unit_price)
                })

            # Check Quantity Variance
            if inv_item.quantity > po_item.quantity:
                discrepancies.append({
                    "type": "QUANTITY_VARIANCE",
                    "description": inv_item.description,
                    "invoice_qty": inv_item.quantity,
                    "po_qty": po_item.quantity,
                    "difference": inv_item.quantity - po_item.quantity
                })

        # Overall Status Determination
        match_status = "DISCREPANCY" if discrepancies else "MATCHED"
        
        # Save match status to invoice if status field exists
        if hasattr(invoice, 'match_status'):
            invoice.match_status = match_status
            invoice.save(update_fields=['match_status'])

        return Response({
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "po_number": po.po_number,
            "match_status": match_status,
            "summary": {
                "total_discrepancies": len(discrepancies),
                "total_invoice_qty": total_invoice_qty,
                "total_po_qty": total_po_qty,
            },
            "discrepancies": discrepancies
        }, status=status.HTTP_200_OK)

    # PATCH /api/invoices/{id}/mark_paid/
    @action(detail=True, methods=['patch'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PATCH /api/invoices/{id}/cancel/
    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel_invoice(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'cancelled'
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='submit-approval')
    def submit_for_approval(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status != 'DRAFT':
            return Response({'error': 'Only DRAFT invoices can be submitted.'}, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'PENDING_APPROVAL'
        invoice.save()
        return Response({'status': 'Invoice submitted for approval.'})
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status != 'PENDING_APPROVAL':
            return Response({'error': 'Invoice is not pending approval.'}, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'APPROVED'
        invoice.save()
        return Response({'status': 'Invoice approved successfully.'})

    @action(detail=True, methods=['post'], url_path='pay')
    def mark_as_paid(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status not in ['APPROVED', 'PENDING_APPROVAL']:
            return Response({'error': 'Invoice cannot be marked as paid in current state.'}, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.status = 'PAID'
        invoice.save()
        return Response({'status': 'Invoice marked as paid.'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'REJECTED'
        invoice.save()
        return Response({'status': 'Invoice rejected.'})

    def get_queryset(self):
        return Invoice.objects.filter(is_deleted=False).order_by('-created_at')

    # Soft delete instead of removing from DB
    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

    # Endpoint to recall/restore a soft-deleted invoice
    @action(detail=True, methods=['patch'], url_path='restore')
    def restore(self, request, pk=None):
        invoice = Invoice.objects.get(pk=pk, is_deleted=True)
        invoice.is_deleted = False
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)