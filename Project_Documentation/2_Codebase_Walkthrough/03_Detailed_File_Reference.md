# 03. Detailed File Reference (Exhaustive)

This document provides a comprehensive, file-by-file explanation of the entire **Hotel Booking System** project. Every file on the disk is listed here with its specific purpose.

---

## 1. Root Level & Infrastructure

These files reside in the main project directory `hotel-booking-system/`.

### Configuration & Documentation
*   **`requirements.txt`**:
    *   **Purpose**: The master list of Python dependencies for the backend.
    *   **Key Contents**: `Django`, `djangorestframework`, `psycopg2-binary` (DB), `Pillow` (Images), `boto3` (AWS S3), `gunicorn` (Server).
    *   **Usage**: Run `pip install -r requirements.txt` to set up the environment.

*   **`docker-compose.yml`**:
    *   **Purpose**: Orchestration file to run the entire stack (Backend, Frontend, Postgres) locally using Docker.
    *   **Key Services**: `web` (Django), `db` (Postgres), `frontend` (React).

*   **`PROJECT_DOCUMENTATION.md`**:
    *   **Purpose**: The main legacy documentation file for the project. Contains initial setup notes.

*   **`RUN_PROJECT.md`**:
    *   **Purpose**: simplified "How-To" guide for starting the server for the first time.

*   **`UI_IMPROVEMENTS.md`**:
    *   **Purpose**: A scratchpad file listing planned or completed UI upgrades.

*   **`logging_snippet.py`**:
    *   **Purpose**: A small utility script containing a Python dictionary configuration for colored console logging. Use this to copy-paste logging config into `settings.py`.

### Hidden Files
*   **`.env`**:
    *   **Purpose**: Stores **secrets** and environment-specific variables.
    *   **Contents**: `SECRET_KEY`, `DEBUG`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
    *   **Note**: This file is **never committed** to Git.

*   **`.gitignore`**:
    *   **Purpose**: Tells Git which files to ignore.
    *   **Contents**: `__pycache__`, `.env`, `venv/`, `node_modules/`, `*.sqlite3`.

---

## 2. Backend Root (`backend/`)

This directory contains the Django project, its applications, and **many important utility scripts**.

### Core Django Files
*   **`manage.py`**:
    *   **Purpose**: The command-line utility for administrative tasks in Django.
    *   **Usage**: `python manage.py runserver`, `python manage.py migrate`, `python manage.py createsuperuser`.

*   **`Dockerfile`**:
    *   **Purpose**: Instructions to build the Docker image for the Django backend.
    *   **Details**: Installs Python 3.9, system dependencies for Postgres/Images, installs pip reqs, and copies code.

*   **`.env.example`**:
    *   **Purpose**: A template version of `.env` without real passwords. Safe to commit to Git so other developers know which variables they need.

*   **`requirements.txt`** (Copy):
    *   **Purpose**: Often duplicated here for Docker build contexts. Same as root.

### Developer Utility Scripts (Root of Backend)
*   **`deploy.sh`**:
    *   **Purpose**: The **Master Deployment Script** for the EC2 server.
    *   **Actions**: Pulls latest Git code, activates virtualenv, installs new requirements, runs migrations, collects static files, and restarts Gunicorn/Nginx.

*   **`create_admin_quick.py`**:
    *   **Purpose**: A targeted script to **instantly create a superuser** (`admin` / `admin123`) if one doesn't exist.
    *   **Usage**: Run `python create_admin_quick.py` after a fresh DB install to get access immediately.

*   **`create_admin.py`**:
    *   **Purpose**: Similar to the quick version but may support interactive prompts or different logic. Legacy version.

*   **`debug_login_issue.py`**:
    *   **Purpose**: A diagnostic script to troubleshoot JWT Login failures.
    *   **Logic**: It manually checks the database for a user and attempts to verify the password hash using Django's internal auth functions, bypassing the API layer to isolate the problem.

*   **`check_heic_support.py`**:
    *   **Purpose**: Verifies if the server has the necessary libraries (`pillow-heif`) to handle iPhone HEIC image uploads.
    *   **Usage**: Run this if image uploads are failing.

*   **`check_images.py`**:
    *   **Purpose**: Scans the database and prints a list of all Hotel/Room images and their currently stored URLs (S3 vs Local).

*   **`compare_users.py`**:
    *   **Purpose**: A lower-level debug tool to compare two user records or password hashes side-by-side.

*   **`fix_admin_user.py`**:
    *   **Purpose**: A rescue script to force-reset the `is_staff` and `is_superuser` flags on the admin account if they were accidentally revoked.

*   **`verify_and_fix_admin.py`**:
    *   **Purpose**: A comprehensive health check for the admin account. It checks existence, password validity, and permissions all in one go.

*   **`test_admin_login.py`**:
    *   **Purpose**: A standalone test script that hits the `/api/login/` endpoint with admin credentials and asserts that a 200 OK and Token are returned.

*   **`test_image_support.py`**:
    *   **Purpose**: Attempts to open and process a dummy image using Pillow to verify the library installation.

*   **`test_jwt_endpoint.py`**:
    *   **Purpose**: specifically tests the SimpleJWT token endpoints (`token/start`, `token/refresh`) to ensure they are routed correctly.

*   **`test_login_api.py`**:
    *   **Purpose**: Checks the JSON structure of the login response (ensuring `access` and `refresh` keys exist).

*   **`test_s3.py`**:
    *   **Purpose**: Attempts to upload a small `hello.txt` to the configured AWS S3 bucket to verify API keys and Write permissions.

---

## 3. Backend Apps

The logic is split into four Django apps.

### `backend/core/` (Project Settings)
*   **`settings.py`**:
    *   **Purpose**: The Brain of the Django project.
    *   **Key Configs**: `INSTALLED_APPS` (registers hotels/bookings), `DATABASES` (Postgres config), `Example Middleware` (CORS headers), `REST_FRAMEWORK` (Pagination, Auth), `AWS_STORAGE_BUCKET_NAME`.

*   **`urls.py`**:
    *   **Purpose**: The Entry Point for all URL routing.
    *   **Details**: Includes paths for `admin/`, `api/v1/auth/`, `api/v1/hotels/`, `api/v1/bookings/`.

*   **`wsgi.py`**:
    *   **Purpose**: **Web Server Gateway Interface**. The entry point for Gunicorn to serve the app in production.
*   **`asgi.py`**:
    *   **Purpose**: **Asynchronous Server Gateway Interface**. Used for async features (not main primary here).

### `backend/hotels/` (Inventory Management)
*   **`models.py`**:
    *   **Purpose**: Defines the database schema for the inventory.
    *   **Classes**: `Hotel` (name, address, description), `Room` (price, capacity, type), `RoomInventory` (dates, availability).

*   **`views.py`**:
    *   **Purpose**: Public-facing APIs.
    *   **Classes**: `HotelListCreateView` (Search/Filter hotels), `RoomListCreateView` (List rooms for a hotel).

*   **`admin_views.py`**:
    *   **Purpose**: **Admin-facing APIs**.
    *   **Key Feature**: `AdminRoomInventoryListCreateView`. This implements the **14-Day Matrix View** logic.
    *   **Pagination**: Defines `LargeResultsSetPagination` (page size = 1000) to support the matrix grid.

*   **`admin_urls.py`**:
    *   **Purpose**: Routes specifically for the Admin Panel (`api/v1/admin/hotels/...`). Separates admin logic from public logic.

*   **`image_models.py`**:
    *   **Purpose**: Defines `HotelImage` and `RoomImage` models.
    *   **Logic**: Contains the path generation logic (e.g. `hotel_images/<id>/<filename>`).

*   **`image_views.py`**:
    *   **Purpose**: APIs for uploading images.
    *   **Logic**: Handles `multipart/form-data`.

*   **`image_serializers.py`**:
    *   **Purpose**: Validates image uploads.
    *   **Critical Logic**: Detects **HEIC** images and converts them to **JPEG** before saving to S3.

*   **`bulk_inventory_serializer.py`**:
    *   **Purpose**: Handles the "Bulk Update" feature in the Admin Inventory page.
    *   **Logic**: Takes `start_date`, `end_date`, `rooms` and creates multiple `RoomInventory` records in a loop.

*   **`serializers.py`**:
    *   **Purpose**: Standard JSON converters for Hotel and Room models.

*   **`pagination.py`**:
    *   **Purpose**: Custom pagination classes (e.g. Standard 10 items, Large 1000 items).

*   **`urls.py`**:
    *   **Purpose**: Links the views to URL paths (e.g. `hotels/<id>/`).

*   **`admin.py`**:
    *   **Purpose**: Configuration for the built-in Django Admin Interface (localhost:8000/admin).

### `backend/bookings/` (Reservation System)
*   **`models.py`**:
    *   **Purpose**: Tracking reservations.
    *   **Classes**: `Booking` (user, room, dates, status), `OTPRequest` (stores temp codes for guest login), `EmailSession` (tracks verified guest sessions).

*   **`views.py`**:
    *   **Purpose**: Booking Logic.
    *   **Key Views**:
        *   `PublicCreateBookingView`: Validates dates, calls Availability Microservice, creates Booking.
        *   `RequestOTPView`: Sends email with 6-digit code.
        *   `VerifyOTPView`: Checks code and issues JWT token.
        *   `MyBookingsView`: Lists history for the logged-in user.

*   **`utils.py`**:
    *   **Purpose**: Helper functions like `get_date_list` which returns all dates between query parameters.

*   **`serializers.py`**:
    *   **Purpose**: Validates booking data (e.g. check-out must be after check-in).

### `backend/users/` (Authentication)
*   **`models.py`**:
    *   **Purpose**: `CustomUser` model extending Django's AbstractUser. Adds `phone_number` and `role`.

*   **`views.py`**:
    *   **Purpose**: Auth APIs.
    *   **Classes**: `RegisterView` (Sign up), `ManageUserView` (Profile), `MyTokenObtainPairView` (Login - returns JWT).

*   **`signals.py`**:
    *   **Purpose**: Event listeners. Example: When a User is created, automatically create a basic Profile entry.

---

## 4. Scripts & Configuration Directory (`backend/scripts/`)

*   **`setup_s3.py`**:
    *   **Purpose**: One-time setup script for AWS. Creates the bucket if missing and applies the Public Read policy for images.

*   **`test_booking.py`**:
    *   **Purpose**: A script to functionally test the booking flow via bare HTTP requests (using `requests` lib).

*   **`test_token.py`**:
    *   **Purpose**: A script to verify that the Auth system is issuing valid JWT tokens.

---

## 5. System Configuration (`backend/systemd/`)

*   **`gunicorn.service`**:
    *   **Purpose**: The systemd service file for the Main Django App.
    *   **Location**: Copied to `/etc/systemd/system/` on the server.
    *   **Command**: Runs `gunicorn core.wsgi:application` bound to port 8000.

*   **`fastapi.service`**:
    *   **Purpose**: The systemd service file for the Availability Microservice.
    *   **Command**: Runs `uvicorn main:app` bound to port 8001.

---

## 6. Frontend (`frontend/`)

This directory contains the React Single Page Application (SPA).

### Build & Deploy
*   **`deploy-frontend.sh`**:
    *   **Purpose**: Automates the frontend build.
    *   **Actions**: Runs `npm run build`, deletes old files in `/var/www/html`, and copies the new `build/` folder there.

*   **`nginx.conf`**:
    *   **Purpose**: Configuration for serving the React app.
    *   **Logic**: Handles `try_files $uri /index.html` to support React Router (client-side routing).

*   **`package.json`**:
    *   **Purpose**: List of Node.js dependencies (`react`, `axios`, `react-router-dom`, `jwt-decode`).

*   **`Dockerfile`**:
    *   **Purpose**: Builds a container for the frontend (multi-stage build typically, or dev server).

### Source Code (`frontend/src/`)
*   **`index.js`**:
    *   **Purpose**: The entry point. Renders the `<App />` component into the DOM.

*   **`App.js`**:
    *   **Purpose**: The Main Router. Defines all routes (`/`, `/login`, `/admin/dashboard`, etc.).

*   **`api/axios.js`**:
    *   **Purpose**: The HTTP Client.
    *   **Logic**: Creates an axios instance. Adds an **Interceptor** to automatically attach the `Authorization: Bearer <token>` header to every request if a user is logged in.

*   **`context/AuthContext.js`**:
    *   **Purpose**: **Global State Management**.
    *   **Logic**: Stores `user` object and `authTokens`. Provides `loginUser` and `logoutUser` functions to all components.

### Source Code (`frontend/src/components/`)
*   **`Navbar.js`**:
    *   **Purpose**: The top navigation bar. Shows "Login" for guests or "Logout" for users.

*   **`AdminNav.js`**:
    *   **Purpose**: A secondary execution bar visible only to Admins (links to Inv, Hotels, Rooms).

*   **`ImageManager.js`**:
    *   **Purpose**: The complex UI for uploading images.
    *   **Features**: Drag-and-drop zone, file preview, delete button.

*   **`ImageSlider.js`**:
    *   **Purpose**: The carousel component used on the Hotel Details page to show room photos.

*   **`ProtectedRoute.js`**:
    *   **Purpose**: A wrapper component. Redirects unauthenticated users to `/login`.

*   **`AdminRoute.js`**:
    *   **Purpose**: A wrapper component. Redirects non-admin users to `/`.

### Source Code (`frontend/src/pages/`)
*   **`Home.js`**:
    *   **Purpose**: Landing page.

*   **`AdminInventory.js`**:
    *   **Purpose**: **The most complex admin page**.
    *   **Features**: Displays the **14-Day Availability Matrix**. Contains the **Bulk Update** form.

*   **`AdminDashboard.js`**:
    *   **Purpose**: The central hub for admins to navigate to other management pages.

*   **`AdminHotels.js`, `AdminRooms.js`**:
    *   **Purpose**: CRUD pages (Create, Read, Update, Delete) for basic data.

*   **`HotelDetail.js`**:
    *   **Purpose**: The public booking page.
    *   **Features**: Shows hotel info, room list, and the **Booking Form**.

*   **`MyBookings.js`**:
    *   **Purpose**: Guest portal. Users enter OTP to see their past reservations.

---

## 7. Microservices (`microservices/`)

*   **`availability_service/`**:
    *   **`main.py`**: The FastAPI application. Exposes a lightweight endpoint to check date overlaps.
    *   **`database.py`**: Connects to the **same** PostgreSQL database as Django (read-only usually).
    *   **`check_availability` logic**: Raw SQL or ORM query to see if a requested booking overlaps with existing bookings.

---

## 8. Nginx Reverse Proxy (`nginx/`)

*   **`django.conf`**:
    *   **Purpose**: The production Nginx config.
    *   **Routing**:
        *   Requests to `/api/` -> Forward to Gunicorn (Port 8000).
        *   Requests to `/` -> Serve React Static Files.
        *   Requests to `/media/` -> Serve uploaded files (if local) or Proxy to S3.
