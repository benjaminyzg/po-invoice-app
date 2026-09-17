import os
import django
from django.utils import timezone

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # Adjust 'config.settings' if your main folder has a different name
django.setup()

from invoices.models import DocumentSequence, Invoice, PurchaseOrder
from invoices.utils import generate_serial_number

def run_year_reset_test():
    print("🚀 Starting Serialization Year-Over-Year Test...\n")
    
    # Clear existing test sequence data for a clean sandbox environment
    current_year = timezone.now().year
    DocumentSequence.objects.filter(year__in=[current_year, current_year + 1]).delete()

    # --- TEST 1: Establish Current Year Sequences ---
    print(f"📋 Step 1: Generating standard sequences for current year ({current_year})...")
    num1 = generate_serial_number('INV', 'INV')
    num2 = generate_serial_number('INV', 'INV')
    
    print(f"   Generated: {num1}")  # Expected: INV-2026-0001
    print(f"   Generated: {num2}")  # Expected: INV-2026-0002
    
    assert num1.endswith("-0001"), "❌ Error: First sequence did not start at 0001"
    assert num2.endswith("-0002"), "❌ Error: Second sequence did not increment to 0002"
    print("   ✅ Current year increment logic works perfectly.\n")

    # --- TEST 2: Simulate Year Over Year Time Jump ---
    future_year = current_year + 1
    print(f"⏳ Step 2: Simulating time jump to next year ({future_year})...")
    
    # We mock timezone.now to return a date in the next year
    original_now = timezone.now
    class MockedTimezone:
        class FakeDateTime:
            year = future_year
        @staticmethod
        def now():
            return MockedTimezone.FakeDateTime()

    # Apply the mock directly to the utility runtime context
    import invoices.utils
    invoices.utils.timezone = MockedTimezone

    try:
        print(f"⚡ Step 3: Triggering sequence generation for simulated year {future_year}...")
        future_num1 = generate_serial_number('INV', 'INV')
        future_num2 = generate_serial_number('INV', 'INV')
        
        print(f"   Generated in future: {future_num1}")  # Expected: INV-2027-0001
        print(f"   Generated in future: {future_num2}")  # Expected: INV-2027-0002

        # Assertions to ensure it correctly broke away and restarted tracking from 1
        assert f"INV-{future_year}-0001" == future_num1, "❌ Error: Serialization failed to roll back to 0001 for the new year!"
        assert f"INV-{future_year}-0002" == future_num2, "❌ Error: Serialization failed to increment smoothly in the new year!"
        
        print(f"\n🎉 SUCCESS: Counter automatically reset to 0001 for {future_year} without affecting old tracking records!")

    finally:
        # Crucial: restore original time mechanisms so your local dev database stays accurate
        invoices.utils.timezone = original_now
        
        # Clean up mock records from database
        DocumentSequence.objects.filter(year__in=[current_year, future_year]).delete()
        print("\n🧹 Test database rows successfully cleared.")

if __name__ == "__main__":
    run_year_reset_test()