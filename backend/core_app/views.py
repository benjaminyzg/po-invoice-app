from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from django.views.decorators.csrf import csrf_exempt
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer
from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from django.http import HttpResponse
from .serializers import UserSerializer
from .models import CatalogItem, CatalogPriceHistory
from .serializers import CatalogItemSerializer, CatalogPriceHistorySerializer
from tablib import Dataset

from .models import CatalogItem, CatalogPriceHistory
from .serializers import CatalogItemSerializer, CatalogPriceHistorySerializer
from .resources import CatalogItemResource

class CatalogItemViewSet(viewsets.ModelViewSet):
    queryset = CatalogItem.objects.all().order_by('name')
    serializer_class = CatalogItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        resource = CatalogItemResource()
        dataset = resource.export()
        response = HttpResponse(dataset.csv, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="catalog_items.csv"'
        return response

    @action(detail=True, methods=['get'], url_path='price-history')
    def price_history(self, request, pk=None):
        item = self.get_object()
        history = item.price_history.all()
        serializer = CatalogPriceHistorySerializer(history, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = CatalogItem.objects.all().order_by('name')
        active_only = self.request.query_params.get('active_only')
        if active_only == 'true':
            queryset = queryset.filter(is_active=True)
        return queryset

    @action(detail=False, methods=['post'], url_path='import-csv')
    def import_csv(self, request):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({'error': 'No CSV file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        dataset = Dataset()
        try:
            imported_data = dataset.load(csv_file.read().decode('utf-8'), format='csv')
            resource = CatalogItemResource()
            result = resource.import_data(dataset, dry_run=False)

            if result.has_errors():
                return Response({'error': 'Failed to process CSV rows.'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'message': f'Successfully imported {len(imported_data)} items.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('profile').order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('profile').order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
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