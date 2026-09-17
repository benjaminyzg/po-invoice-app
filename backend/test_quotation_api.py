import requests

BASE_URL = "http://127.0.0.1:8000/api"

# Optional: If your endpoints require authentication, obtain a token first or paste a valid one here
# TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg4OTQwMDYzLCJpYXQiOjE3ODg5Mzk3NjMsImp0aSI6IjUxMDYxY2RhMTMyZDRhMmFiMzNlZDQ2ZTZiNTljZjhhIiwidXNlcl9pZCI6IjEifQ.kTU8_IHUbMBtPnRLT3nAFh69HZ5_21Qe2d46vdG-c9E"  # Paste your JWT access token here if authentication is required

# Replace with your actual development superuser / test credentials
USERNAME = "benjaminy"  # or your username
PASSWORD = "admin1234"

def get_auth_headers():
    # 1. Automatically request a fresh token
    login_response = requests.post(f"{BASE_URL}/token/", json={
        "username": USERNAME,
        "password": PASSWORD
    })
    
    if login_response.status_code == 200:
        token = login_response.json().get("access")
        return {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}
    else:
        print(f"Auto-login failed: {login_response.text}")
        return {"Content-Type": "application/json"}

def test_quotation_lifecycle():
    print("--- Starting Quotation API Tests ---")

    # 1. READ (Get all quotations)
    print("\n1. Testing GET /quotations/...")
    response = requests.get(f"{BASE_URL}/quotations/", headers=get_auth_headers())
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Fetched {len(response.json())} quotations successfully.")
    else:
        print(f"Failed to fetch: {response.text}")
        return

    # 2. CREATE (New Quotation)
    print("\n2. Testing POST /quotations/ (Create)...")

    # Fetch existing catalog items to get a valid ID FIRST
    cat_response = requests.get(f"{BASE_URL}/catalog-items/", headers=get_auth_headers())
    print("Catalog Items API Response:", cat_response.status_code, cat_response.text)

    if cat_response.status_code == 200 and len(cat_response.json()) > 0:
        valid_catalog_item_id = cat_response.json()[0]["id"]
    else:
        # Fallback: Create one programmatically if the API list is empty
        create_cat = requests.post(f"{BASE_URL}/catalog-items/", json={
            "sku": "SUP-CAR-001",
            "name": "Supersport Car",
            "unit_price": "1500.00",
            "packing_dimensions": "200 x 200 x 500",
            "gross_weight": "1599.00"
        }, headers=get_auth_headers())
        
        if create_cat.status_code in [200, 201]:
            valid_catalog_item_id = create_cat.json()["id"]
        else:
            print("Catalog creation fallback failed:", create_cat.status_code, create_cat.text)
            valid_catalog_item_id = 1
            
    # Fetch existing payment terms to get a valid ID FIRST
    payment_response = requests.get(f"{BASE_URL}/payment-terms/", headers=get_auth_headers())
    if payment_response.status_code == 200 and len(payment_response.json()) > 0:
        valid_payment_term_id = payment_response.json()[0]["id"]
    else:
        valid_payment_term_id = 1  # fallback

    print(f"Using catalog item ID: {valid_catalog_item_id}")
    print(f"Using payment term ID: {valid_payment_term_id}")

    # NOW define the payload using the dynamic variables
    payload = {
        "client_name": "Test Client Pte Ltd",
        "valid_until": "2026-12-31",
        "payment_term": valid_payment_term_id, 
        "client_contact_person": "John Doe",
        "client_email": "john@testclient.com",
        "client_phone": "+6591234567",
        "client_postal_code": "123456",
        "client_billing_address": "123 Test Street, Singapore",
        "items": [
            {
                "catalog_item": valid_catalog_item_id, 
                "description": "Web Development Services",
                "quantity": 2,
                "unit_price": "500.00"
            }
        ]
    }

    response = requests.post(f"{BASE_URL}/quotations/", json=payload, headers=get_auth_headers())
    print(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        created_data = response.json()
        quotation_id = created_data.get("id")
        print(f"Quotation created successfully with ID: {quotation_id}")
    else:
        print(f"Creation failed: {response.text}")
        return

    # 3. UPDATE (Modify the created quotation)
    print(f"\n3. Testing PUT /quotations/{quotation_id}/ (Update)...")
    update_payload = payload.copy()
    update_payload["client_name"] = "Updated Test Client Pte Ltd"
    
    response = requests.put(f"{BASE_URL}/quotations/{quotation_id}/", json=update_payload, headers=get_auth_headers())
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Quotation updated successfully.")
    else:
        print(f"Update failed: {response.text}")

    # 4. DELETE (Remove the quotation)
    print(f"\n4. Testing DELETE /quotations/{quotation_id}/ (Delete)...")
    response = requests.delete(f"{BASE_URL}/quotations/{quotation_id}/", headers=get_auth_headers())
    print(f"Status Code: {response.status_code}")
    if response.status_code in [200, 204]:
        print("Quotation deleted successfully.")
    else:
        print(f"Deletion failed: {response.text}")

    print("\n--- All Tests Completed ---")

if __name__ == "__main__":
    test_quotation_lifecycle()