from django.template.loader import render_to_string
from django.http import HttpResponse
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Invoice, CatalogItem, PurchaseOrder, CompanySettings, PaymentTermTemplate, Quotation
from .models import from .serializers import ( InvoiceSerializer, CatalogItemSerializer, PurchaseOrderSerializer, PurchaseOrderStatusSerializer, CompanySettingsSerializer)
from .serializers import PaymentTermTemplateSerializer, QuotationSerializer
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from weasyprint import HTML
import io

def build_pdf_header(title, ref_no, styles):
    elements = []
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#1A365D'))
    elements.append(Paragraph(f"{title}: {ref_no}", title_style))
    elements.append(Spacer(1, 12))
    return elements

@api_view(['GET'])
@permission_classes([AllowAny])
def export_commercial_invoice_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Invoice not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = build_pdf_header("COMMERCIAL INVOICE", invoice.invoice_number, styles)

    # Details Section
    details = [
        [f"Billed To: {invoice.client_name}", f"Invoice Date: {invoice.issue_date}"],
        [f"Address: {invoice.billing_address}", f"Due Date: {invoice.due_date}"],
        [f"Payment Term: {invoice.payment_terms}", f"PO Ref: {invoice.po_reference or '-'}"],
    ]
    info_table = Table(details, colWidths=[270, 270])
    info_table.setStyle(TableStyle([('FONTNAME', (0,0), (-1,-1), 'Helvetica'), ('FONTSIZE', (0,0), (-1,-1), 9)]))
    elements.extend([info_table, Spacer(1, 16)])

    # Financial Line Items Table
    items_data = [["Description", "Qty", "Unit Price ($)", "Amount ($)"]]
    grand_total = 0
    for item in invoice.items.all():
        line_total = item.quantity * item.unit_price
        grand_total += line_total
        items_data.append([item.description, str(item.quantity), f"${item.unit_price:.2f}", f"${line_total:.2f}"])
    items_data.append(["", "", "Total Due:", f"${grand_total:.2f}"])

    item_table = Table(items_data, colWidths=[260, 60, 100, 120])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (2,-1), (-1,-1), 'Helvetica-Bold'),
    ]))
    elements.append(item_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_delivery_order_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Document not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = build_pdf_header("DELIVERY ORDER", f"DO-{invoice.invoice_number}", styles)

    details = [
        [f"Deliver To: {invoice.client_name}", f"Delivery Date: {invoice.issue_date}"],
        [f"Address: {invoice.billing_address}", f"PO Ref: {invoice.po_reference or '-'}"],
    ]
    elements.extend([Table(details, colWidths=[270, 270]), Spacer(1, 16)])

    # Logistics Items Table (No Financial Figures)
    items_data = [["Item Description", "Qty Ordered", "Qty Delivered", "Remarks"]]
    for item in invoice.items.all():
        items_data.append([item.description, str(item.quantity), str(item.quantity), "Good Condition"])

    item_table = Table(items_data, colWidths=[260, 80, 80, 120])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (1,0), (2,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ]))
    elements.extend([item_table, Spacer(1, 40)])

    # Signature Block for Delivery Confirmation
    sig_data = [["Received By (Name & Signature): ______________________", "Date: _______________"]]
    sig_table = Table(sig_data, colWidths=[360, 180])
    elements.append(sig_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="DO_{invoice.invoice_number}.pdf"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_packing_list_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Document not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = build_pdf_header("PACKING LIST", f"PL-{invoice.invoice_number}", styles)

    details = [
        [f"Ship To: {invoice.client_name}", f"Packing Date: {invoice.issue_date}"],
        [f"Destination: {invoice.billing_address}", f"Shipping Ref: {invoice.po_reference or '-'}"],
    ]
    elements.extend([Table(details, colWidths=[270, 270]), Spacer(1, 16)])

    # Package Specs Table (Focus on Units/Packaging)
    items_data = [["Pkg #", "Item Description", "Qty", "Pkg Type", "Notes"]]
    for idx, item in enumerate(invoice.items.all(), 1):
        items_data.append([f"Box {idx}", item.description, str(item.quantity), "Carton", "-"])

    item_table = Table(items_data, colWidths=[60, 240, 60, 80, 100])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ]))
    elements.append(item_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="PackingList_{invoice.invoice_number}.pdf"'
    return response

def build_pdf_header(title, ref_no, styles):
    elements = []
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#1A365D'))
    elements.append(Paragraph(f"{title}: {ref_no}", title_style))
    elements.append(Spacer(1, 12))
    return elements

@api_view(['GET'])
@permission_classes([AllowAny])
def export_commercial_invoice_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Invoice not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = build_pdf_header("COMMERCIAL INVOICE", invoice.invoice_number, styles)

    # Details Section
    details = [
        [f"Billed To: {invoice.client_name}", f"Invoice Date: {invoice.issue_date}"],
        [f"Address: {invoice.billing_address}", f"Due Date: {invoice.due_date}"],
        [f"Payment Term: {invoice.payment_terms}", f"PO Ref: {invoice.po_reference or '-'}"],
    ]
    info_table = Table(details, colWidths=[270, 270])
    info_table.setStyle(TableStyle([('FONTNAME', (0,0), (-1,-1), 'Helvetica'), ('FONTSIZE', (0,0), (-1,-1), 9)]))
    elements.extend([info_table, Spacer(1, 16)])

    # Financial Line Items Table
    items_data = [["Description", "Qty", "Unit Price ($)", "Amount ($)"]]
    grand_total = 0
    for item in invoice.items.all():
        line_total = item.quantity * item.unit_price
        grand_total += line_total
        items_data.append([item.description, str(item.quantity), f"${item.unit_price:.2f}", f"${line_total:.2f}"])
    items_data.append(["", "", "Total Due:", f"${grand_total:.2f}"])

    item_table = Table(items_data, colWidths=[260, 60, 100, 120])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (2,-1), (-1,-1), 'Helvetica-Bold'),
    ]))
    elements.append(item_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_delivery_order_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Document not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = build_pdf_header("DELIVERY ORDER", f"DO-{invoice.invoice_number}", styles)

    details = [
        [f"Deliver To: {invoice.client_name}", f"Delivery Date: {invoice.issue_date}"],
        [f"Address: {invoice.billing_address}", f"PO Ref: {invoice.po_reference or '-'}"],
    ]
    elements.extend([Table(details, colWidths=[270, 270]), Spacer(1, 16)])

    # Logistics Items Table (No Financial Figures)
    items_data = [["Item Description", "Qty Ordered", "Qty Delivered", "Remarks"]]
    for item in invoice.items.all():
        items_data.append([item.description, str(item.quantity), str(item.quantity), "Good Condition"])

    item_table = Table(items_data, colWidths=[260, 80, 80, 120])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (1,0), (2,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ]))
    elements.extend([item_table, Spacer(1, 40)])

    # Signature Block for Delivery Confirmation
    sig_data = [["Received By (Name & Signature): ______________________", "Date: _______________"]]
    sig_table = Table(sig_data, colWidths=[360, 180])
    elements.append(sig_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="DO_{invoice.invoice_number}.pdf"'
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
def export_packing_list_pdf(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return HttpResponse("Document not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = build_pdf_header("PACKING LIST", f"PL-{invoice.invoice_number}", styles)

    details = [
        [f"Ship To: {invoice.client_name}", f"Packing Date: {invoice.issue_date}"],
        [f"Destination: {invoice.billing_address}", f"Shipping Ref: {invoice.po_reference or '-'}"],
    ]
    elements.extend([Table(details, colWidths=[270, 270]), Spacer(1, 16)])

    # Package Specs Table (Focus on Units/Packaging)
    items_data = [["Pkg #", "Item Description", "Qty", "Pkg Type", "Notes"]]
    for idx, item in enumerate(invoice.items.all(), 1):
        items_data.append([f"Box {idx}", item.description, str(item.quantity), "Carton", "-"])

    item_table = Table(items_data, colWidths=[60, 240, 60, 80, 100])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ]))
    elements.append(item_table)

    doc.build(elements)
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="PackingList_{invoice.invoice_number}.pdf"'
    return response

class PaymentTermTemplateViewSet(viewsets.ModelViewSet):
    queryset = PaymentTermTemplate.objects.all()
    serializer_class = PaymentTermTemplateSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_packing_list_pdf(request, invoice_id):
    try:
        invoice = Invoice.objects.get(pk=invoice_id)
        items = invoice.items.all() # Adjust according to your model relationship
        
        # Calculate total weights for packing list
        for item in items:
            item.total_weight = (item.unit_weight_kg or 0) * (item.quantity or 1)

        context = {
            'invoice': invoice,
            'items': items,
            'company': getattr(request.user, 'company', None),
        }

        # Render HTML string
        html_string = render_to_string('pdf/packing_list.html', context)
        html = HTML(string=html_string, base_url=request.build_absolute_uri('/'))
        pdf_file = html.write_pdf()

        # HTTP Response
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="packing_list_{invoice.number}.pdf"'
        return response

    except Invoice.DoesNotExist:
        return HttpResponse({'error': 'Invoice not found'}, status=404)

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

class UserViewSet(viewsets.ModelViewSet):
    # ... existing queryset and serializer config ...

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

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

class PurchaseOrderDeleteView(generics.DestroyAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    # queryset = PurchaseOrder.objects.all().order_by('-created_at')
    # Prefetch related items to avoid N+1 queries
    queryset = PurchaseOrder.objects.all().order_by('-created_at')
    queryset = PurchaseOrder.objects.all().prefetch_related('items')
    serializer_class = PurchaseOrderSerializer
    # permission_classes = [permissions.IsAuthenticated]
    # Temporarily allow unauthenticated requests for testing:
    permission_classes = [AllowAny]

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

    @action(detail=True, methods=['get'], url_path='export-invoice-pdf', permission_classes=[AllowAny])
    def export_invoice_pdf(self, request, pk=None):
        invoice = self.get_object()
        buffer = io.BytesIO()
        # Build Commercial Invoice PDF...
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        # (Insert your ReportLab elements construction here)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice_{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['get'], url_path='export-do-pdf', permission_classes=[AllowAny])
    def export_do_pdf(self, request, pk=None):
        invoice = self.get_object()
        buffer = io.BytesIO()
        # Build Delivery Order PDF...
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        # (Insert your Delivery Order ReportLab elements here)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="DO_{invoice.invoice_number}.pdf"'
        return response

    @action(detail=True, methods=['get'], url_path='export-packing-pdf', permission_classes=[AllowAny])
    def export_packing_pdf(self, request, pk=None):
        invoice = self.get_object()
        buffer = io.BytesIO()
        # Build Packing List PDF...
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        # (Insert your Packing List ReportLab elements here)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="PackingList_{invoice.invoice_number}.pdf"'
        return response