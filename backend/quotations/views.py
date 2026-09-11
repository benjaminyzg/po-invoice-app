import io
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from rest_framework import viewsets
from .models import Quotation
from .serializers import QuotationSerializer  # Adjust if named differently

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-id')
    serializer_class = QuotationSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([AllowAny])
def export_quotation_pdf(request, pk):
    try:
        quotation = Quotation.objects.get(pk=pk)
    except Quotation.DoesNotExist:
        return HttpResponse("Quotation not found", status=404)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    elements = []
    styles = getSampleStyleSheet()

    # Title & Header
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor('#1A365D'))
    elements.append(Paragraph(f"QUOTATION: {quotation.quotation_ref}", title_style))
    elements.append(Spacer(1, 12))

    # Entity Details
    details = [
        [f"Entity Name: {quotation.entity_name}", f"Contact Person: {quotation.contact_person}"],
        [f"Address: {quotation.entity_address}", f"Email: {quotation.contact_email}"],
        [f"Postal Code: {quotation.entity_postal_code}", f"Mobile: {quotation.mobile_number or '-'}"],
        [f"Country: {quotation.country_of_origin or 'Singapore'}", f"Office: {quotation.office_number or '-'}"],
        [f"Incoterm: {quotation.incoterm or '-'}", f"Validity: {quotation.validity_of_quotation}"],
        [f"Payment Term: {quotation.payment_term}", ""]
    ]
    info_table = Table(details, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 16))

    # Line Items Table
    items_data = [["Description", "Qty", "Unit Price ($)", "Total Amount ($)"]]
    grand_total = 0
    
    # Fetch related items from DB or reverse relationship
    items = getattr(quotation, 'items', None)
    if items and hasattr(items, 'all'):
        for item in items.all():
            line_total = item.quantity * item.unit_price
            grand_total += line_total
            items_data.append([item.description, str(item.quantity), f"${item.unit_price:.2f}", f"${line_total:.2f}"])
    
    items_data.append(["", "", "Grand Total:", f"${grand_total:.2f}"])

    item_table = Table(items_data, colWidths=[260, 60, 100, 120])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#2D3748')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#CBD5E0')),
        ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (2,-1), (-1,-1), 'Helvetica-Bold'),
    ]))
    elements.append(item_table)

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{quotation.quotation_ref}.pdf"'
    return response