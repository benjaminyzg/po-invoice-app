import requests

# Base URL for your Django backend API
BASE_URL = "http://127.0.0.1:8000/api"

def test_update_company_settings():
    # 1. Obtain an auth token (Update username/password if needed)
    print("Authenticating...")
    login_res = requests.post(f"{BASE_URL}/token/", json={
        "username": "benjaminy",  # Replace with your test username if different
        "password": "admin1234" # Replace with your test password
    })
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        print("Tip: You can manually paste a valid token below if authentication endpoint differs.")
        return

    token = login_res.json().get("access") or login_res.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Prepare the payload with all company and banking details
    payload = {
        "company_name": "Focus Machinery Pte Ltd",
        "tax_registration_no": "199902857E",
        "phone_number": "+65 6356 1915",
        "email": "enquiry@focusmachinery.com.sg",
        "website": "https://www.focusmachinery.com.sg",
        "registered_address": "Block 5008 Ang Mo Kio Ave 5\n#04-09, Techplace II\nThe Workshop @ AMK\nSingapore 569874",
        "bank_name": "DBS Bank Pte Ltd",
        "account_name": "Focus Machinery Pte Ltd",
        "account_number": "070-003801-3",
        "swift_code": "DBSSSGSG",
        "paynow_uen": "199902857E",
        "bank_code": "7171",
        "branch_code": "070",
        "bank_address": "9 Bishan Road, #01-14, Junction 8 Shopping Centre; Singapore 579873",
        "quotation_format": "FMQ-{DDMMYY}/{CLIENT_NAME}/{SEQ}",
        "quotation_ref_label": "QUOTATION REF:"
    }

    # 3. Send a PATCH or PUT request to update company settings (ID 1)
    print("Updating Company Settings...")
    response = requests.patch(f"{BASE_URL}/company-settings/1/", data=payload, headers=headers)

    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.json())

if __name__ == "__main__":
    test_update_company_settings()