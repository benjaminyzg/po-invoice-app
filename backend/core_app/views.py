from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.http import HttpResponse
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer
from .models import CatalogItem, CatalogPriceHistory, CompanySettings
from .serializers import (CatalogItemSerializer, CatalogPriceHistorySerializer, UserSerializer, CompanySettingsSerializer)
from tablib import Dataset
from .resources import CatalogItemResource

class CompanySettingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Always get or create the single global record (ID: 1)
        settings_obj, created = CompanySettings.objects.get_or_create(
            id=1, 
            defaults={"name": "My Company"}
        )
        serializer = CompanySettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        return self.update_settings(request, partial=False)

    def patch(self, request):
        return self.update_settings(request, partial=True)

    def update_settings(self, request, partial):
        settings_obj, created = CompanySettings.objects.get_or_create(id=1)
        serializer = CompanySettingsSerializer(
            settings_obj, 
            data=request.data, 
            partial=partial
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=False, methods=['get', 'patch', 'put'], url_path='me')
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

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