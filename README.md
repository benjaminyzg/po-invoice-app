# Generate a comprehensive README.md for the po-invoice-app project.
readme_content = """# PO-Invoice-App

A full-stack Invoice Management Dashboard designed to streamline tracking, searching, and updating invoice records.

## Features
* **User Authentication**: Secure login and registration.
* **Search & Filter**: Real-time filtering of invoices by vendor name.
* **CRUD Operations**:
    * **Create**: Add new invoices via a dedicated form.
    * **Read**: View all invoices in a clear, responsive table.
    * **Update**: Inline editing to modify invoice details (Vendor, Amount, Status).
    * **Delete**: Remove records securely.
* **Responsive UI**: Clean interface built with React and Vite.

## Purchase Order (PO) Tab Updates
* **Features Added:** Implemented new PO tab workflow and data entry options.
* **Bug Fixes:** Resolved display issues in PO summary tables.
* **Merged Work:** Refreshed components integrated into `main`.

## Tech Stack
* **Frontend**: React, Vite, JavaScript
* **Backend**: Django, Django REST Framework
* **Database**: SQLite
* **Authentication**: Token-based authentication

## Setup & Installation

### Prerequisites
* Python 3.x
* Node.js & npm

### Backend Setup
1. Navigate to the backend directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate

## Recent Updates
### Version / Date - PO Tab Update
* **Features Added:** Implemented new PO tab workflow and data entry options.
* **Bug Fixes:** Resolved display issues in PO summary tables.
* **Merged Work:** Refreshed components integrated into `main`.

## Bug Fix & Enhancement Report: Purchase Order Endpoint & Input Handling

### Issues Resolved
1. **React DOM Focus Loss on Input:**
   - **Root Cause:** Declaring sub-components inside the main functional component caused full component re-instantiation on every state update, destroying input focus and cursor placement.
   - **Fix:** Refactored sub-components outside the main component scope and delegated props properly.

2. **Unexpected Token `<` SyntaxError on PO Creation:**
   - **Root Cause:** 
     - Request URL resulted in a duplicated `/api` path (`/api/api/purchase-orders/`), triggering a backend `404 Not Found` HTML page response.
     - Direct invocation of `response.json()` on HTML error pages caused fatal JSON parsing crashes.
   - **Fix:** 
     - Corrected the endpoint string concatenation to `${baseUrl}/purchase-orders/`.
     - Implemented dynamic response parsing checking `Content-Type` headers (`application/json` vs `text/html`) prior to parsing to safely log Django REST Framework validation errors.

### Verified Behavior
- Input fields retain focus smoothly while typing line items and totals.
- Submitting valid PO payload converts to `snake_case`, successfully posts to DRF endpoint, resets form, and updates the PO table list seamlessly.