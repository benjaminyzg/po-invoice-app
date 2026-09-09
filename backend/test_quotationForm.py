import requests

# Base API URL (adjust port if needed)
BASE_URL = "http://127.0.0.1:8000/api"

def get_auth_token(username, password):
    """Obtain a JWT access token."""
    url = f"{BASE_URL}/token/"  # Adjust endpoint if your token URL differs
    response = requests.post(url, json={"username": username, "password": password})
    if response.status_code == 200:
        return response.json().get("access")
    raise Exception(f"Authentication failed: {response.text}")

def create_bulk_quotations(access_token):
    """Loop through 5 sample payloads and post them to the quotations endpoint."""
    url = f"{BASE_URL}/quotations/"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # 5 Sample Dummy Quotation Entries
    quotations = [
        {
            "client_name": "Acme Corporation",
            "valid_until": "2026-10-15",
            "payment_term": 1,  # Ensure this ID exists in your PaymentTerm table
            "client_contact_person": "John Doe",
            "client_email": "john.doe@acmecorp.com",
            "client_phone_number": "+65 6123 4567",
            "client_postal_code": "138588",
            "client_billing_address": "71 Ayer Rajah Crescent, #02-18, Singapore 138588",
            "items": [{"catalog_item": 2, "quantity": 1, "unit_price": "1500.00"}]
        },
        {
            "client_name": "Nexus Logistics Pte Ltd",
            "valid_until": "2026-11-30",
            "payment_term": 1,  # Added payment_term here
            "client_contact_person": "Sarah Lim",
            "client_email": "sarah.lim@nexuslogistics.sg",
            "client_phone_number": "+65 6899 9000",
            "client_postal_code": "408600",
            "client_billing_address": "10 Ubi Crescent, #04-32, Ubi Techpark, Singapore 408600",
            "items": [{"catalog_item": 2, "quantity": 5, "unit_price": "220.00"}]  # Changed catalog_item to 2
        },
        {
            "client_name": "Apex Digital Solutions",
            "valid_until": "2026-12-01",
            "payment_term": 1,  # Added payment_term here
            "client_contact_person": "Michael Tan",
            "client_email": "m.tan@apexdigital.co",
            "client_phone_number": "+65 6333 4455",
            "client_postal_code": "039190",
            "client_billing_address": "6 Temasek Boulevard, #29-01, Suntec Tower 4, Singapore 039190",
            "items": [{"catalog_item": 2, "quantity": 2, "unit_price": "1200.00"}]  # Changed catalog_item to 2
        },
        {
            "client_name": "Merlion Tech Ventures",
            "valid_until": "2026-10-31",
            "payment_term": 1,  # Added payment_term here
            "client_contact_person": "Jessica Wong",
            "client_email": "jessica@merliontech.io",
            "client_phone_number": "+65 6555 7889",
            "client_postal_code": "048581",
            "client_billing_address": "1 Raffles Quay, #25-01, Singapore 048581",
            "items": [{"catalog_item": 2, "quantity": 3, "unit_price": "850.00"}]  # Changed catalog_item to 2
        },
        {
            "client_name": "Sentosa Hospitality Group",
            "valid_until": "2026-11-15",
            "payment_term": 1,  # Added payment_term here
            "client_contact_person": "David Koh",
            "client_email": "david.koh@sentosahospitality.com",
            "client_phone_number": "+65 6738 1234",
            "client_postal_code": "098269",
            "client_billing_address": "8 Sentosa Gateway, Singapore 098269",
            "items": [{"catalog_item": 2, "quantity": 4, "unit_price": "500.00"}]  # Changed catalog_item to 2
        }
    ]

    for index, payload in enumerate(quotations, 1):
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            print(f"[Success] Created entry {index}: {payload['client_name']}")
        else:
            print(f"[Error] Failed entry {index} ({payload['client_name']}): {response.status_code} - {response.text}")

if __name__ == "__main__":
    # Replace with your local Django superuser credentials
    USERNAME = "benjaminy"
    PASSWORD = "admin1234"
    
    print("Authenticating with Django backend...")
    token = get_auth_token(USERNAME, PASSWORD)
    
    print("Generating and seeding bulk test quotations...")
    create_bulk_quotations(token)
    print("Seeding process completed.")