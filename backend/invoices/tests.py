import threading
from unittest.mock import patch
from .models import DocumentSequence
from .utils import generate_serial_number
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from core_app.models import UserProfile
from invoices.models import PurchaseOrder

User = get_user_model()

class PurchaseOrderTests(APITestCase):

    def setUp(self):
        # Create an admin user who has approval permissions
        self.admin_user = User.objects.create_user(
            username='admin_test', 
            password='password123'
        )
        UserProfile.objects.create(
            user=self.admin_user, 
            role='ADMIN'
        )

        # Create a PO instance for testing actions
        self.po = PurchaseOrder.objects.create(
            po_number='PO-1001',
            status='PENDING'
        )
        
        # DRF endpoint URLs
        self.list_url = reverse('purchaseorder-list')
        self.approve_url = reverse('purchaseorder-approve', kwargs={'pk': self.po.pk})

    def test_approve_purchase_order_success(self):
        """Verify an admin user can successfully approve a PO."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.approve_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.po.refresh_from_db()
        self.assertEqual(self.po.status, 'APPROVED')

    def test_approve_purchase_order_unauthenticated(self):
        """Verify unauthenticated requests cannot approve a PO."""
        response = self.client.post(self.approve_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class DocumentSerializationTestCase(TestCase):

    def setUp(self):
        """Initializes a clean state before each isolated test execution."""
        self.current_year = timezone.now().year

    def test_standard_sequential_incrementation(self):
        """Verifies counters increment predictably under normal conditions."""
        num_1 = generate_serial_number('INV', 'INV')
        num_2 = generate_serial_number('INV', 'INV')
        
        self.assertEqual(num_1, f"INV-{self.current_year}-0001")
        self.assertEqual(num_2, f"INV-{self.current_year}-0002")

    def test_year_over_year_reset(self):
        """Ensures transitions into a future year automatically reset sequences back to 0001."""
        # 1. Populate current year track
        generate_serial_number('PO', 'PO')
        
        # 2. Simulate next year by mocking timezone.now()
        future_year = self.current_year + 1
        fake_now = timezone.datetime(year=future_year, month=1, day=1, hour=0, minute=0, second=0)
        fake_now = timezone.make_aware(fake_now, timezone.get_current_timezone())

        with patch('django.utils.timezone.now', return_value=fake_now):
            future_num_1 = generate_serial_number('PO', 'PO')
            future_num_2 = generate_serial_number('PO', 'PO')

            self.assertEqual(future_num_1, f"PO-{future_year}-0001")
            self.assertEqual(future_num_2, f"PO-{future_year}-0002")

    def test_concurrency_race_condition_safety(self):
        """
        Simulates simultaneous parallel API request hits across separate
        threads to verify row-locking blocks duplication errors.
        """
        from django.db import connection
        
        # Safely skip the concurrency check if running on a local SQLite file
        if connection.vendor == 'sqlite':
            self.skipTest("Database vendor is SQLite. Row-level locking (select_for_update) is not supported natively.")

        results = []

        def worker_task():
            try:
                num = generate_serial_number('INV', 'INV')
                results.append(num)
            except Exception as e:
                results.append(str(e))

        # Launch 5 rapid background threads simultaneously
        threads = [threading.Thread(target=worker_task) for _ in range(5)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()

        unique_results = set(results)
        
        self.assertEqual(len(results), 5)
        self.assertEqual(len(unique_results), 5, "CRITICAL PROTECTION FAILURE: Duplicate tracking IDs detected!")