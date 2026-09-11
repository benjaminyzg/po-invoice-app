import os
import django
import requests

# 1. Initialize Django context
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from quotations.models import Quotation, QuotationItem  # Adjust imports as needed
from datetime import date, timedelta

def run_test_and_seed():
    print("--- 1. Seeding Dummy Quotation Records ---")
    
    sample_data = [
        {
            "ref": "QT-2026-001",
            "entity": "Singtech Engineering Pte Ltd",
            "contact": "David Tan",
            "email": "david.tan@singtech.sg",
            "mobile": "+65 9123 4567",
            "office": "+65 6789 0123",
            "address": "12 Jurong East Street 21, #04-02",
            "postal": "609601",
            "country": "Singapore",
            "incoterm": "FOB",
            "payment": "30 Days",
            "validity": date.today() + timedelta(days=30),
            "items": [
                {"description": "Industrial Router Module X1", "quantity": 2, "unit_price": 650.00},
                {"description": "On-Site Installation & Setup", "quantity": 1, "unit_price": 300.00}
            ]
        },
        {
            "ref": "QT-2026-002",
            "entity": "Global Logistics Malaysia Sdn Bhd",
            "contact": "Ahmad Razak",
            "email": "ahmad@globallogistics.my",
            "mobile": "+60 12 345 6789",
            "office": "+60 3 5566 7788",
            "address": "Bangsar South, No 8 Jalan Kerinchi",
            "postal": "59200",
            "country": "Malaysia",
            "incoterm": "CIF",
            "payment": "60 Days",
            "validity": date.today() + timedelta(days=45),
            "items": [
                {"description": "Enterprise Server Rack 42U", "quantity": 1, "unit_price": 2400.00}
            ]
        }
    ]

    for data in sample_data:
        quotation, created = Quotation.objects.get_or_create(
            quotation_ref=data["ref"],
            defaults={
                "entity_name": data["entity"],
                "contact_person": data["contact"],
                "contact_email": data["email"],
                "mobile_number": data["mobile"],
                "office_number": data["office"],
                "entity_address": data["address"],
                "entity_postal_code": data["postal"],
                "country_of_origin": data["country"],
                "incoterm": data["incoterm"],
                "payment_term": data["payment"],
                "validity_of_quotation": data["validity"],
                "remarks": "Automated system test entry."
            }
        )
        if created:
            print(f"[SUCCESS] Created Quotation: {quotation.quotation_ref}")
            # Add line items
            for item in data["items"]:
                QuotationItem.objects.create(
                    quotation=quotation,
                    description=item["description"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"]
                )
        else:
            print(f"[EXISTS] Quotation {quotation.quotation_ref} already present.")

    # 2. Test PDF Export Functionality
    print("\n--- 2. Testing PDF Export Endpoint ---")
    first_quotation = Quotation.objects.first()
    if first_quotation:
        pdf_url = f"http://127.0.0.1:8000/api/quotations/{first_quotation.id}/export-pdf/"
        print(f"Requesting PDF from: {pdf_url}")
        
        try:
            res = requests.get(pdf_url)
            if res.status_code == 200 and res.headers.get('content-type') == 'application/pdf':
                file_name = f"test_{first_quotation.quotation_ref}.pdf"
                with open(file_name, 'wb') as f:
                    f.write(res.content)
                print(f"[SUCCESS] Exported PDF successfully saved to '{file_name}'")
            else:
                print(f"[FAILED] HTTP {res.status_code}: Could not retrieve PDF")
        except requests.exceptions.ConnectionError:
            print("[NOTE] Ensure 'python manage.py runserver' is active to test HTTP PDF download.")

if __name__ == '__main__':
    run_test_and_seed()