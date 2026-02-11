# 01. Backend Codebase Walkthrough (Django)

This document explains every important file in the `backend/` folder.

## Root Directory
- **`manage.py`**: The command-center for Django. You run commands like `python manage.py runserver` or `migrate` using this script.
- **`requirements.txt`**: A list of all Python libraries needed (Django, Pillow, Boto3, etc.). `pip install -r requirements.txt` installs them.
- **`.env`**: (Hidden) Stores secrets like DB passwords and API keys. NEVER share this.

## App: `core/` (The Project Configuration)
- **`settings.py`**: The brain of the project.
    - Configures Database connection.
    - Configures Installed Apps.
    - Configures Email and AWS S3 settings.
    - Configures JWT settings (token lifetime).
- **`urls.py`**: The traffic controller. It directs incoming URLs (e.g., `/api/hotels/`) to the correct App.
- **`wsgi.py`**: The entry point for the web server (Gunicorn) to talk to Django.

## App: `hotels/` (Managing Hotels & Inventory)
- **`models.py`**: Defines the Database Tables.
    - `Hotel`: Name, address, description.
    - `Room`: Name, price, amenities.
    - `RoomInventory`: The daily availability tracker (date, rooms available).
    - `HotelImage`/`RoomImage`: Links images to hotels/rooms.
- **`serializers.py`**: Translates Python "Objects" into "JSON" for the API.
    - `HotelSerializer`: Converts a Hotel object to `{ "name": "Grand Hotel", ... }`.
    - `BulkInventorySerializer`: Handles validation for the bulk upload feature.
- **`views.py` (Public)**:
    - `HotelListView`: Get all hotels.
    - `HotelDetailView`: Get one hotel.
- **`admin_views.py` (Private)**:
    - `AdminRoomInventoryListCreateView`: The API for the matrix view (supports large pagination).
    - `AdminBulkInventoryCreateView`: The logic for the "14-Day Bulk Update".
- **`admin_urls.py`**: Routes specific to the Admin Panel APIs.

## App: `bookings/` (Handling Reservations)
- **`models.py`**:
    - `Booking`: Stores user, room, dates, total price, and status (CONFIRMED/CANCELLED).
- **`views.py`**:
    - `Creating a Booking`: Checks inventory -> Locks logic -> Saves booking -> Sends Email.
    - `Cancelling`: Releases inventory back to the pool.
- **`utils.py` (or inside views)**:
    - Contains helper logic for sending emails via SMTP.

## App: `users/` (Authentication)
- **`models.py`**:
    - `CustomUser`: We extended the default User to add "phone number" (if needed) or just to have control.
- **`serializers.py`**:
    - `UserSerializer`: formats user data.
    - `RegisterSerializer`: Handles sign-up validation (password match, etc.).
- **`urls.py`**:
    - Routes for `/login/` (Token obtain) and `/register/`.

## App: `microservices/` (Experimental)
- A separate folder containing a `FastAPI` app.
- Purpose: To demonstrate we can split "Availability Checking" into a microservice for high performance.
- Not critical for the main flow but good for interview "Architecture" points.
