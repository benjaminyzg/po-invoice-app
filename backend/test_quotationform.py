import os
import django
from datetime import date, timedelta

# 1. Initialize Django settings context
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from quotations.models import Quotation, QuotationItem


def seed_quotations():
    print("--- Clearing existing quotation records ---")
    Quotation.objects.all().delete()

    dummy_data = [
        {
            "ref": "QT-2026-001",
            "entity": "Nexus Systems Singapore Pte Ltd",
            "contact": "John Doe",
            "email": "john.doe@nexussystems.sg",
            "mobile": "+65 9123 4567",
            "office": "+65 6789 0123",
            "address": "3 Bedok South Road, #01-12",
            "postal": "469269",
            "country": "Singapore",
            "incoterm": "EXW",
            "payment": "30 Days",
            "validity": date.today() + timedelta(days=30),
            "remarks": "Standard 30-day quote for enterprise networking hardware.",
            "items": [
                {"description": "Industrial Mesh Wi-Fi Access Point X90", "quantity": 3, "unit_price": 450.00},
                {"description": "Cat6A Ethernet Cables (50m Spool)", "quantity": 5, "unit_price": 65.50},
                {"description": "On-Site Installation & Configuration", "quantity": 1, "unit_price": 500.00},
            ],
        },
        {
            "ref": "QT-2026-002",
            "entity": "Global Logistics Malaysia Sdn Bhd",
            "contact": "Jane Smith",
            "email": "jane.smith@globallogistics.my",
            "mobile": "+60 12 9876 5432",
            "office": "+60 3 5566 7788",
            "address": "Bangsar South, No 8 Jalan Kerinchi",
            "postal": "59200",
            "country": "Malaysia",
            "incoterm": "CIF",
            "payment": "60 Days",
            "validity": date.today() + timedelta(days=45),
            "remarks": "Cross-border logistics equipment package.",
            "items": [
                {"description": "Barcode Scanner Terminal Assembly", "quantity": 10, "unit_price": 280.00},
                {"description": "Thermal Receipt Printers", "quantity": 4, "unit_price": 195.00},
            ],
        },
        {
            "ref": "QT-2026-003",
            "entity": "PT Nusantara Tech Indonesia",
            "contact": "Alex Tan",
            "email": "alex.tan@nusantara.co.id",
            "mobile": "+62 811 1222 333",
            "office": "+62 21 555 4321",
            "address": "Gudang Logistic Hub, Jl. Yos Sudarso No. 45",
            "postal": "14350",
            "country": "Indonesia",
            "incoterm": "DDP",
            "payment": "Cash",
            "validity": date.today() + timedelta(days=14),
            "remarks": "Urgent procurement order. Payment upon delivery confirmation.",
            "items": [
                {"description": "Server Cabinet Rack 42U", "quantity": 2, "unit_price": 1250.00},
                {"description": "Uninterruptible Power Supply (UPS) 3kVA", "quantity": 2, "unit_price": 890.00},
            ],
        },
        {
            "ref": "QT-2026-004",
            "entity": "Siam Automation Works Co., Ltd.",
            "contact": "Prasert Somchai",
            "email": "prasert@siamauto.co.th",
            "mobile": "+66 81 234 5678",
            "office": "+66 2 345 6789",
            "address": "77 Bangna-Trad Road, KM 18",
            "postal": "10540",
            "country": "Thailand",
            "incoterm": "FOB",
            "payment": "30 Days",
            "validity": date.today() + timedelta(days=60),
            "remarks": "FOB Singapore Port freight agreement.",
            "items": [
                {"description": "PLC Controller Processing Unit", "quantity": 5, "unit_price": 1100.00},
                {"description": "Digital I/O Expansion Module", "quantity": 8, "unit_price": 320.00},
                {"description": "Calibration & Inspection Certificate", "quantity": 1, "unit_price": 250.00},
            ],
        },
    ]

    print("\n--- Preloading Quotation Test Entries ---")
    for data in dummy_data:
        quotation = Quotation.objects.create(
            quotation_ref=data["ref"],
            entity_name=data["entity"],
            contact_person=data["contact"],
            contact_email=data["email"],
            mobile_number=data["mobile"],
            office_number=data["office"],
            entity_address=data["address"],
            entity_postal_code=data["postal"],
            country_of_origin=data["country"],
            incoterm=data["incoterm"],
            payment_term=data["payment"],
            validity_of_quotation=data["validity"],
            remarks=data["remarks"],
        )

        for item in data["items"]:
            QuotationItem.objects.create(
                quotation=quotation,
                description=item["description"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
            )

        total_amount = sum(i["quantity"] * i["unit_price"] for i in data["items"])
        print(f"✅ Preloaded {quotation.quotation_ref} - {quotation.entity_name} (${total_amount:,.2f})")

    print(f"\n🎉 Successfully preloaded {Quotation.objects.count()} quotation records into SQLite!")


if __name__ == "__main__":
    seed_quotations()