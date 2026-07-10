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
