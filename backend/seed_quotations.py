import os
import django
import random
from datetime import date, timedelta

# 1. Initialize Django setup (replace 'config.settings' with your settings module if different)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# 2. Import model directly
from quotations.models import Quotation  # Adjust app/model name if necessary

entities = [
    {"name": "Acme Corporation", "address": "71 Ayer Rajah Crescent, #03-01", "postal": "138588"},
    {"name": "Global Logistics Pte Ltd", "address": "10 Changi Business Park Central 2", "postal": "486030"},
    {"name": "Nexus Systems Singapore", "address": "3 Bedok South Road, #01-12", "postal": "469269"}
]

contacts = [
    {"name": "John Doe", "email": "john.doe@acmecorp.com", "mobile": "+65 9123 4567", "office": "+65 6789 0123"},
    {"name": "Jane Smith", "email": "jane.smith@globallogistics.com", "mobile": "+65 9876 5432", "office": "+65 6123 4567"},
    {"name": "Alex Tan", "email": "alex.tan@nexus.sg", "mobile": "+65 8111 2222", "office": "+65 6333 4444"}
]

incoterms = ["EXW", "FOB", "CIF", "DAP", "DDP"]
payment_terms = ["30 Days", "60 Days", "Cash"]

def seed_database(count=5):
    for i in range(1, count + 1):
        entity = random.choice(entities)
        contact = random.choice(contacts)

        quotation, created = Quotation.objects.get_or_create(
            quotation_ref=f"QT-2026-00{i}",
            defaults={
                "contact_person": contact["name"],
                "contact_email": contact["email"],
                "mobile_number": contact["mobile"],
                "office_number": contact["office"],
                "entity_name": entity["name"],
                "entity_address": entity["address"],
                "entity_postal_code": entity["postal"],
                "incoterm": random.choice(incoterms),
                "payment_term": random.choice(payment_terms),
                "validity_of_quotation": date.today() + timedelta(days=30),
                "remarks": f"Automated test quotation entry #{i}"
            }
        )
        if created:
            print(f"[SUCCESS] Created {quotation.quotation_ref} for {quotation.entity_name}")
        else:
            print(f"[SKIP] {quotation.quotation_ref} already exists")

if __name__ == "__main__":
    seed_database(5)