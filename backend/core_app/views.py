from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer

@api_view(['GET'])
def health_check(request):
    return Response({"status": "Backend is online!", "database": "Connected"})

@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_invoices(request):
    invoices = Invoice.objects.all()
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)