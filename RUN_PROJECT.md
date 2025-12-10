# How to Run the Hotel Booking System

## Quick Start Guide

### Option 1: Using Docker Compose (Recommended)

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **FastAPI Service:** http://localhost:8001
   - **Django Admin:** http://localhost:8000/admin

### Option 2: Manual Setup (Development)

#### Backend Setup:
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# Set up environment variables (create .env file)
# DB_NAME=hotel_db
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_HOST=127.0.0.1
# DB_PORT=5432

python manage.py migrate
python manage.py runserver
```

Backend runs on: **http://127.0.0.1:8000**

#### Frontend Setup:
```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## URLs Reference

### Frontend Routes (React App)
- **Login Page:** http://localhost:3000/login
- **Register Page:** http://localhost:3000/register
- **Hotels List:** http://localhost:3000/hotels
- **Hotel Detail:** http://localhost:3000/hotels/:id
- **Default/Redirect:** http://localhost:3000 (redirects to /login)

### Backend API Endpoints (Django)

#### Base URL: `http://localhost:8000` or `http://127.0.0.1:8000`

#### Authentication Endpoints (`/api/v1/auth/`)
- **POST** `/api/v1/auth/register/` - Register new user
  - Body: `{ "username": "user", "email": "user@example.com", "password": "pass123" }`
- **POST** `/api/v1/auth/token/` - Login (get JWT token)
  - Body: `{ "username": "user", "password": "pass123" }`
  - Returns: `{ "access": "token...", "refresh": "token..." }`
- **POST** `/api/v1/auth/token/refresh/` - Refresh JWT token
- **GET** `/api/v1/auth/profile/` - Get user profile (requires auth)

#### Hotel Endpoints (`/api/v1/hotels/`)
- **GET** `/api/v1/hotels/` - List all hotels (requires auth)
- **GET** `/api/v1/hotels/:id/` - Get hotel details (requires auth)
- **GET** `/api/v1/hotels/:id/rooms/` - Get rooms for a hotel (requires auth)
- **POST** `/api/v1/hotels/` - Create hotel (requires auth, admin only)
- **POST** `/api/v1/hotels/:id/rooms/` - Create room (requires auth, admin only)

#### Booking Endpoints (`/api/v1/bookings/`)
- **GET** `/api/v1/bookings/` - List user's bookings (requires auth)
- **POST** `/api/v1/bookings/` - Create booking (requires auth)
  - Body: `{ "room": 1, "check_in": "2024-01-15", "check_out": "2024-01-20" }`
- **GET** `/api/v1/bookings/:id/` - Get booking details (requires auth)
- **DELETE** `/api/v1/bookings/:id/` - Cancel booking (requires auth)

#### Admin Panel
- **Django Admin:** http://localhost:8000/admin
  - Create superuser: `python manage.py createsuperuser`

### FastAPI Microservice
- **Base URL:** http://localhost:8001
- **POST** `/check-availability` - Check room availability
  - Body: `{ "room_id": 1, "check_in": "2024-01-15", "check_out": "2024-01-20" }`

---

## Testing the Application

### 1. Register a New User
- Go to: http://localhost:3000/register
- Fill in username, email, and password
- Click "Register"

### 2. Login
- Go to: http://localhost:3000/login
- Enter credentials
- You'll be redirected to: http://localhost:3000/hotels

### 3. Browse Hotels
- View all hotels at: http://localhost:3000/hotels
- Click "View rooms" on any hotel

### 4. Book a Room
- Select a hotel → View rooms
- Choose a room, check-in, and check-out dates
- Click "Book now"

---

## Environment Variables

### Backend (.env file in backend/)
```
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
AVAILABILITY_SERVICE_URL=http://127.0.0.1:8001/check-availability
```

### Frontend (.env file in frontend/)
```
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```

---

## Common Commands

### Docker:
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build
```

### Backend:
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Frontend:
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build
```

---

## Troubleshooting

1. **Port already in use:**
   - Change ports in docker-compose.yml or stop conflicting services

2. **Database connection error:**
   - Ensure PostgreSQL is running
   - Check .env file has correct credentials

3. **CORS errors:**
   - Backend is configured to allow localhost:3000
   - Check CORS settings in backend/core/settings.py

4. **Frontend can't connect to API:**
   - Verify REACT_APP_API_BASE_URL in frontend/.env
   - Check backend is running on port 8000

