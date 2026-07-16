from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import InvoiceSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status
from invoices.models import Invoice

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_invoices(request):
    if request.method == 'GET':
        invoices = Invoice.objects.all()
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        serializer = InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            # Automatically assign the logged-in user to the new invoice
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoices(request):
    print(f"DEBUG: Total Invoice count in DB is: {Invoice.objects.all().count()}") # Add this
    # Fetch all invoices (or filter by user if required)
    invoices = Invoice.objects.all()
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_invoice(request, pk):
    # Find the invoice by ID (pk), ensuring it belongs to the logged-in user
    invoice = get_object_or_404(Invoice, pk=pk, user=request.user)
    invoice.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_as_paid(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk, user=request.user)
    invoice.status = 'PAID'
    invoice.save()
    return Response({'message': 'Invoice marked as paid'})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_invoice(request, pk):
    invoice = get_object_or_404(Invoice, pk=pk, user=request.user)
    serializer = InvoiceSerializer(invoice, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


