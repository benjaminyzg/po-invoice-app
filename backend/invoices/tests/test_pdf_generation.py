from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from invoices.models import Invoice, CatalogItem # Adjust imports according to your exact models

User = get_user_model()

class PDFGenerationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # 1. Create a test user
        self.user = User.objects.create_user(
            username='testuser', 
            password='password123'
        )
        
        # 2. Authenticate the test client
        self.client.force_authenticate(user=self.user)
        
        # 3. Create sample test invoice data
        self.invoice = Invoice.objects.create(
            number='INV-2026-001',
            vendor_name='Acme Logistics',
            shipping_address='123 Warehouse Way'
        )

    def test_packing_list_pdf_authenticated(self):
        """Test that an authenticated request returns a 200 OK and a valid PDF binary response."""
        url = f'/api/invoices/{self.invoice.id}/packing-list/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(response.content.startswith(b'%PDF')) # Check PDF magic number header
        self.assertIn(f'packing_list_{self.invoice.number}.pdf', response['Content-Disposition'])

    def test_packing_list_pdf_unauthenticated(self):
        """Test that an unauthenticated request returns 401 Unauthorized."""
        self.client.force_authenticate(user=None)
        url = f'/api/invoices/{self.invoice.id}/packing-list/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_packing_list_pdf_not_found(self):
        """Test requesting a PDF for a non-existent invoice returns 404 Not Found."""
        url = '/api/invoices/99999/packing-list/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)