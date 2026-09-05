from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from core_app.models import CatalogItem
from invoices.models import Quotation, QuotationItem, PaymentTermTemplate

class QuotationModelTest(TestCase):
    def setUp(self):
        self.catalog_item = CatalogItem.objects.create(name="Test Item", unit_price=Decimal("100.00"))
        self.payment_term = PaymentTermTemplate.objects.create(name="Net 30", due_days=30)

    def test_quotation_item_default_price(self):
        quotation = Quotation.objects.create(client_name="Acme Corp", valid_until=timezone.now().date() + timedelta(days=10), payment_term=self.payment_term)
        item = QuotationItem.objects.create(quotation=quotation, catalog_item=self.catalog_item, quantity=2)
        
        # Verify that unit_price automatically defaults to the master catalog item price
        self.assertEqual(item.unit_price, Decimal("100.00"))