from rest_framework.decorators import api_view, permission_classes
from invoices.serializers import InvoiceSerializer
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from invoices.models import Invoice
from django.views.decorators.csrf import csrf_exempt

@api_view(['GET'])
def health_check(request):
    return Response({"status": "Backend is online!", "database": "Connected"})

@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_invoices(request):
    # Print the database file path to your terminal
    print(f"DEBUG: Accessing database at: {connection.settings_dict['NAME']}")
    
    invoices = Invoice.objects.all()
    print(f"DEBUG: Found {invoices.count()} invoices.")
    
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)