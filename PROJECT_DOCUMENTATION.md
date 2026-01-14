# Hotel Booking System - Complete Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Backend (Django)](#4-backend-django)
5. [Microservices (FastAPI)](#5-microservices-fastapi)
6. [Frontend (React)](#6-frontend-react)
7. [Docker Setup](#7-docker-setup)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [Authentication Flow](#10-authentication-flow)
11. [Booking Flow](#11-booking-flow)
12. [Date Overlap Logic](#12-date-overlap-logic)
13. [Error Handling](#13-error-handling)
14. [Common Issues & Solutions](#14-common-issues--solutions)
15. [Interview Preparation Notes](#15-interview-preparation-notes)

---

## 1. Project Overview

### 1.1 What is This Project?
A full-stack hotel booking system with microservices architecture, allowing users to:
- Register and authenticate
- Browse hotels and rooms
- Check room availability in real-time
- Create and manage bookings
- View booking history

### 1.2 Technology Stack

**Backend:**
- Django 5.2.8 (REST Framework)
- PostgreSQL 15
- JWT Authentication
- Gunicorn (WSGI server)

**Microservices:**
- FastAPI (Availability Service)
- SQLAlchemy 2.0
- Uvicorn (ASGI server)

**Frontend:**
- React (Create React App)
- Axios (HTTP client)
- React Router (Navigation)
- Context API (State management)

**DevOps:**
- Docker & Docker Compose
- Nginx (Frontend serving)
- Multi-stage builds

### 1.3 Key Features
1. **User Authentication**: JWT-based secure authentication
2. **Hotel Management**: CRUD operations for hotels and rooms
3. **Availability Check**: Real-time room availability via microservice
4. **Booking System**: Prevent double bookings with date overlap logic
5. **CORS Support**: Configured for cross-origin requests
6. **Dockerized**: All services containerized for easy deployment

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────┐
│   React App     │  Port 3000
│   (Frontend)    │  (Nginx)
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Django API     │  Port 8000
│  (Backend)      │  (Gunicorn)
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐    │
│ FastAPI Service │    │ HTTP
│ (Availability)  │    │
│   Port 8001     │    │
└────────┬────────┘    │
         │              │
┌────────▼──────────────▼────────┐
│      PostgreSQL Database       │
│         Port 5432              │
└────────────────────────────────┘
```

### 2.2 Communication Flow

**Booking Creation Flow:**
1. User submits booking → Frontend (React)
2. Frontend → Django API (`POST /api/v1/bookings/`)
3. Django API → FastAPI Service (`POST /check-availability`)
4. FastAPI → PostgreSQL (Check existing bookings)
5. FastAPI → Django API (Availability response)
6. Django API → PostgreSQL (Create booking if available)
7. Django API → Frontend (Booking confirmation)

### 2.3 Microservices Pattern
- **Availability Service**: Isolated service for availability checks
- **Benefits**: 
  - Independent scaling
  - Technology flexibility (FastAPI vs Django)
  - Separation of concerns
  - Can be replaced/upgraded independently

### 2.4 Network Configuration
- All services on `booking_network` (Docker bridge network)
- Services communicate via service names:
  - `django_api` → `fastapi:8001`
  - `fastapi` → `postgres:5432`
  - `django` → `postgres:5432`

---

## 3. Project Structure

### 3.1 Root Directory Structure

```
hotel-booking-system/
├── backend/                 # Django backend application
│   ├── core/               # Main Django project configuration
│   ├── hotels/             # Hotels app (models, views, serializers)
│   ├── bookings/           # Bookings app
│   ├── users/              # Users app (authentication)
│   ├── manage.py           # Django management script
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker build configuration
│   └── .env                # Environment variables
│
├── microservices/          # Microservices directory
│   └── availability_service/  # FastAPI availability service
│       ├── main.py         # FastAPI application entry point
│       ├── models.py       # SQLAlchemy models
│       ├── database.py     # Database connection setup
│       ├── schemas.py      # Pydantic schemas
│       ├── config.py       # Configuration & env vars
│       ├── requirements.txt
│       └── Dockerfile
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components (Login, Register, Hotels, etc.)
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (AuthContext)
│   │   ├── api/           # API client setup (axios.js)
│   │   └── App.js         # Main app component
│   ├── package.json
│   ├── Dockerfile         # Multi-stage build
│   └── nginx.conf         # Nginx configuration
│
├── docker-compose.yml      # Docker Compose configuration
└── PROJECT_DOCUMENTATION.md # This file
```

### 3.2 Backend Structure (`backend/`)

**Core App (`core/`):**
- `settings.py`: Django settings (CORS, database, installed apps)
- `urls.py`: Main URL routing
- `wsgi.py`: WSGI configuration for Gunicorn

**Hotels App (`hotels/`):**
- `models.py`: Hotel, Room models
- `views.py`: Hotel/room CRUD operations
- `serializers.py`: DRF serializers
- `urls.py`: Hotel/room endpoints
- `migrations/`: Database migrations

**Bookings App (`bookings/`):**
- `models.py`: Booking model
- `views.py`: Booking creation/retrieval logic
- `serializers.py`: BookingSerializer with price calculation
- `urls.py`: Booking endpoints

**Users App (`users/`):**
- `views.py`: Registration, login (JWT)
- `serializers.py`: User serializers
- `models.py`: Custom user model (if any)

### 3.3 Microservices Structure (`microservices/availability_service/`)

- `main.py`: FastAPI app, `/check-availability` endpoint
- `models.py`: SQLAlchemy Room, Booking models
- `database.py`: SQLAlchemy engine, session setup
- `schemas.py`: Pydantic request/response models
- `config.py`: Environment variable loading, DB URL construction

### 3.4 Frontend Structure (`frontend/src/`)

**Pages (`pages/`):**
- `Login.js`: Login page
- `Register.js`: Registration page
- `Hotels.js`: Hotel listing page
- `HotelDetail.js`: Hotel details, rooms, booking form

**Components (`components/`):**
- `ProtectedRoute.js`: Route protection (auth check)

**Context (`context/`):**
- `AuthContext.js`: Global auth state management

**API (`api/`):**
- `axios.js`: Axios instance with base URL and interceptors

---

## 4. Backend (Django)

### 4.1 Django Configuration (`backend/core/settings.py`)

**Key Settings:**

**CORS Configuration:**
```python
INSTALLED_APPS = [
    ...
    'corsheaders',  # Added for CORS support
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be before CommonMiddleware
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # Development only
CORS_ALLOW_CREDENTIALS = True
```

**REST Framework Configuration:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 5,
}
```

**JWT Configuration:**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

**Microservice Integration:**
```python
AVAILABILITY_SERVICE_URL = os.getenv(
    'AVAILABILITY_SERVICE_URL',
    'http://127.0.0.1:8001/check-availability'
)
```

### 4.2 URL Routing (`backend/core/urls.py`)

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),      # Authentication
    path('api/v1/hotels/', include('hotels.urls')),   # Hotels & Rooms
    path('api/v1/hotels', include('hotels.urls')),    # Without trailing slash
    path('api/v1/bookings/', include('bookings.urls')), # Bookings
    path('api/v1/bookings', include('bookings.urls')),  # Without trailing slash
]
```

**Note:** Both with/without trailing slash included for API compatibility.

### 4.3 Booking Serializer (`backend/bookings/serializers.py`)

**Key Features:**

1. **Read-only fields**: `user`, `hotel`, `hotel_name`, `room_name`, `total_price`
2. **Custom save()**: Stores `hotel` and `user` from kwargs before `create()`
3. **Price calculation**: Automatic calculation based on nights

```python
def save(self, **kwargs):
    # Store hotel and user from kwargs if provided
    self._hotel = kwargs.pop('hotel', None)
    self._user = kwargs.pop('user', None)
    return super().save(**kwargs)

def create(self, validated_data):
    room = validated_data['room']
    hotel = self._hotel if hasattr(self, '_hotel') and self._hotel else room.hotel
    user = self._user if hasattr(self, '_user') and self._user else self.context['request'].user
    
    # Calculate price
    nights = (validated_data['check_out'] - validated_data['check_in']).days
    total_price = room.price_per_night * nights
    
    return Booking.objects.create(...)
```

### 4.4 Booking View (`backend/bookings/views.py`)

**BookingListCreateView Logic:**

1. **Transaction**: Wrapped in `@transaction.atomic` for data consistency
2. **Room validation**: Checks if room exists
3. **Availability check**: Calls FastAPI service
4. **Error handling**: Handles service unreachable, invalid responses
5. **Booking creation**: Only if availability service confirms

```python
@transaction.atomic
def post(self, request):
    # 1. Validate room
    room = Room.objects.select_for_update().get(id=data['room'])
    
    # 2. Call availability service
    response = requests.post(availability_url, json=payload, timeout=5)
    availability_data = response.json()
    
    # 3. Check availability
    if not availability_data.get("available"):
        return Response({"error": availability_data.get("reason")}, status=400)
    
    # 4. Create booking
    serializer = BookingSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        booking = serializer.save(hotel=room.hotel, user=request.user)
        return Response(BookingSerializer(booking).data, status=201)
```

**Key Points:**
- `select_for_update()`: Locks room row during transaction
- Timeout: 5 seconds for availability service call
- Context passing: `context={'request': request}` for serializer
- Explicit user/hotel: Passed via `save(hotel=..., user=...)`

### 4.5 Database Models

**Booking Model (`backend/bookings/models.py`):**
```python
class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 5. Microservices (FastAPI)

### 5.1 Overview
FastAPI microservice for checking room availability. Handles date overlap logic independently from Django backend.

### 5.2 Configuration (`microservices/availability_service/config.py`)

**Key Features:**

1. **Environment Variable Loading:**
   - Priority: Current directory → Backend directory → System env
   - Loads `.env` from `availability_service/.env` or `backend/.env`

2. **Host Sanitization:**
```python
def _sanitize_host(host: str) -> str:
    # Removes "@" if present (e.g., "user@host" -> "host")
    # Removes "/" path components
    # Extracts hostname if port included (e.g., "host:5432" -> "host")
    return cleaned_host
```

3. **Database URL Construction:**
```python
# URL encode credentials for special characters
encoded_user = quote_plus(DB_USER)
encoded_password = quote_plus(DB_PASSWORD)

DATABASE_URL = f"postgresql://{encoded_user}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
```

**Why This Matters:**
- Prevents connection errors from malformed host values
- Handles special characters in passwords (e.g., `@`, `#`)
- Flexible env file location

### 5.3 Database Setup (`microservices/availability_service/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Explanation:**
- SQLAlchemy ORM setup (not Django ORM)
- `get_db()`: Dependency injection for FastAPI routes
- Uses same PostgreSQL database as Django

### 5.4 Models (`microservices/availability_service/models.py`)

```python
class Room(Base):
    __tablename__ = "hotels_room"  # Must match Django table name
    id = Column(Integer, primary_key=True)
    room_name = Column(String(255))
    is_available = Column(Boolean, default=True)

class Booking(Base):
    __tablename__ = "bookings_booking"  # Must match Django table name
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("hotels_room.id"))
    check_in = Column(Date)
    check_out = Column(Date)
    status = Column(String(20))
```

**Important:**
- Table names must match Django's table names
- SQLAlchemy reads from same tables Django writes to
- No migrations needed (Django handles schema)

### 5.5 Schemas (`microservices/availability_service/schemas.py`)

**Pydantic Models (Request/Response validation):**

```python
class AvailabilityRequest(BaseModel):
    room_id: int
    check_in: date
    check_out: date

class AvailabilityResponse(BaseModel):
    available: bool
    reason: str
```

**Benefits:**
- Automatic request validation
- Type checking
- API documentation (OpenAPI/Swagger)

### 5.6 Main Application (`microservices/availability_service/main.py`)

**Endpoint: `/check-availability`**

**Validation Steps:**
1. Room exists check
2. Room `is_available` flag check
3. Date range validation (`check_in < check_out`)
4. Date overlap check (see Section 12)

**Response Format:**
```json
{
  "available": true,
  "reason": "Room is available for the selected dates"
}
```

**Error Responses:**
- Room not found: `{"available": false, "reason": "Room not found"}`
- Room unavailable: `{"available": false, "reason": "Room is marked unavailable"}`
- Invalid dates: `{"available": false, "reason": "Check-out must be after check-in"}`
- Date overlap: `{"available": false, "reason": "Room is already booked for the selected dates"}`

### 5.7 Import Strategy

**Problem Solved:** Initial relative imports caused `ImportError`

**Solution:** Use absolute imports
```python
# Before (relative - causes error):
from .database import get_db
from .models import Room, Booking

# After (absolute - works):
from database import get_db
from models import Room, Booking
```

**Why:** When running `uvicorn main:app`, Python treats `main.py` as the entry point, not part of a package.

---

## 6. Frontend (React)

### 6.1 API Client Setup (`frontend/src/api/axios.js`)

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000",
});

// Request interceptor: Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Key Points:**
- Base URL from environment variable (set at build time)
- Automatic token injection via interceptor
- Token stored in `localStorage`

### 6.2 Authentication Context (`frontend/src/context/AuthContext.js`)

**Purpose:** Global authentication state management

**Features:**
- Token management (store/retrieve from localStorage)
- Authentication status tracking
- Login/logout functions
- Available to all components via Context API

```javascript
const value = {
  token,
  user,
  login,
  logout,
  isAuthenticated: !!token,
  loading,
};
```

### 6.3 Protected Routes (`frontend/src/components/ProtectedRoute.js`)

```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};
```

**Usage:**
```javascript
<Route path="/hotels" element={
  <ProtectedRoute>
    <Hotels />
  </ProtectedRoute>
} />
```

### 6.4 Pages

**Login (`frontend/src/pages/Login.js`):**
- Endpoint: `POST /api/v1/auth/token/`
- Stores access token in localStorage
- Redirects to hotels page on success

**Register (`frontend/src/pages/Register.js`):**
- Endpoint: `POST /api/v1/auth/register/`
- Creates new user account
- Redirects to login on success

**Hotels (`frontend/src/pages/Hotels.js`):**
- Endpoint: `GET /api/v1/hotels/`
- Displays paginated hotel list
- Links to hotel details

**HotelDetail (`frontend/src/pages/HotelDetail.js`):**
- Endpoints:
  - `GET /api/v1/hotels/{id}/` - Hotel details
  - `GET /api/v1/hotels/{id}/rooms/` - Room list
  - `POST /api/v1/bookings/` - Create booking
- Booking form with date pickers
- Real-time availability check (via Django → FastAPI)

### 6.5 Environment Variables

**Build-time Variables:**
- `REACT_APP_API_BASE_URL`: Backend API URL
- Set in `docker-compose.yml` as build arg
- Baked into build (cannot change at runtime)

**Docker Setup:**
```yaml
frontend:
  build:
    args:
      REACT_APP_API_BASE_URL: http://localhost:8000
```

---

## 7. Docker Setup

### 7.1 Docker Compose Overview (`docker-compose.yml`)

**Services:**
1. **postgres**: PostgreSQL database
2. **django**: Django REST API
3. **fastapi**: Availability microservice
4. **frontend**: React app (served via Nginx)

**Network:** All services on `booking_network` (bridge network)

**Volumes:** `postgres_data` for database persistence

### 7.2 PostgreSQL Service

```yaml
postgres:
  image: postgres:15
  container_name: booking_db
  environment:
    POSTGRES_DB: hotel_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  networks:
    - booking_network
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    timeout: 5s
    retries: 5
```

**Key Points:**
- Healthcheck: Ensures DB is ready before dependent services start
- Volume: Persists data across container restarts
- Port 5432: Exposed to host for direct database access

### 7.3 Django Service

```yaml
django:
  build: ./backend
  container_name: django_api
  command: sh -c "python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:8000"
  ports:
    - "8000:8000"
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    - DB_NAME=hotel_db
    - DB_USER=postgres
    - DB_PASSWORD=postgres
    - DB_HOST=postgres  # Service name, not IP
    - DB_PORT=5432
    - AVAILABILITY_SERVICE_URL=http://fastapi:8001/check-availability
```

**Key Points:**
- **Startup command**: Runs migrations, then starts Gunicorn
- **Depends on**: Waits for postgres healthcheck
- **Service name resolution**: `postgres` resolves to container IP
- **Gunicorn**: Production WSGI server (not development server)

**Dockerfile (`backend/Dockerfile`):**
```dockerfile
# Use slim Python image for smaller size
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code (this layer rebuilds when code changes)
COPY . /app/

EXPOSE 8000
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Docker Layer Caching:**
- Copy `requirements.txt` first → install dependencies
- Copy code last → faster rebuilds when only code changes
- Uses `python:3.11-slim` for smaller image size (~200MB savings)

### 7.4 FastAPI Service

```yaml
fastapi:
  build: ./microservices/availability_service
  container_name: fastapi_service
  command: uvicorn main:app --host 0.0.0.0 --port 8001
  ports:
    - "8001:8001"
  depends_on:
    postgres:
      condition: service_healthy
  environment:
    - DB_NAME=hotel_db
    - DB_USER=postgres
    - DB_PASSWORD=postgres
    - DB_HOST=postgres
    - DB_PORT=5432
```

**Dockerfile (`microservices/availability_service/Dockerfile`):**
```dockerfile
# Use slim Python image for smaller size
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code (this layer rebuilds when code changes)
COPY . /app/

EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Key Points:**
- Uses Uvicorn ASGI server (FastAPI requirement)
- Same database as Django (shared connection)
- Uses `python:3.11-slim` for smaller image size

### 7.5 Frontend Service

```yaml
frontend:
  build:
    context: ./frontend
    args:
      REACT_APP_API_BASE_URL: http://localhost:8000
  container_name: frontend_app
  ports:
    - "3000:80"
  depends_on:
    - django
  networks:
    - booking_network
```

**Dockerfile (`frontend/Dockerfile`):**
```dockerfile
# Build phase
FROM node:18-alpine AS build
WORKDIR /app

# Accept build argument for API URL
ARG REACT_APP_API_BASE_URL=http://localhost:8000
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Copy package files first for better caching
COPY package*.json ./

# Use npm ci for faster, reliable, reproducible builds
RUN npm ci --only=production=false

# Copy source code (this layer will be rebuilt when code changes)
COPY . .

# Build the app
RUN npm run build

# Production phase
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Multi-stage Build:**
1. **Stage 1 (build)**: Node.js environment to build React app
2. **Stage 2 (production)**: Nginx to serve static files

**Benefits:**
- Smaller final image (no Node.js in production)
- Better security (minimal attack surface)
- Faster deployment

**Nginx Configuration (`frontend/nginx.conf`):**
- Serves static files from `/usr/share/nginx/html`
- Handles React Router (SPA routing)
- Proxy configuration for API calls (if needed)

### 7.6 Build Arguments & Environment Variables

**Frontend Build Args:**
- `REACT_APP_API_BASE_URL`: Set at build time
- Baked into JavaScript bundle
- Cannot change at runtime

**Why `localhost:8000` for frontend?**
- Frontend runs in user's browser
- Browser makes requests from user's machine
- Must use `localhost` (not `django_api` service name)

**Service-to-Service Communication:**
- Django → FastAPI: `http://fastapi:8001` (service name)
- Django → Postgres: `postgres:5432` (service name)
- Frontend → Django: `http://localhost:8000` (from browser)

### 7.7 Startup Sequence

1. **Postgres starts** → Healthcheck passes
2. **Django/FastAPI wait** → `depends_on: condition: service_healthy`
3. **Django runs migrations** → Database schema ready
4. **Gunicorn/Uvicorn start** → Services ready
5. **Frontend builds** → React app compiled
6. **Nginx serves** → Frontend accessible

### 7.8 Docker Build Optimizations

**Optimizations Applied:**

1. **Better Layer Caching**
   - Requirements files copied before source code
   - Dependencies installed in separate layer
   - Source code changes don't invalidate dependency cache

2. **Smaller Base Images**
   - Changed from `python:3.11` to `python:3.11-slim` (saves ~200MB)
   - Frontend already uses `node:18-alpine` (optimized)

3. **.dockerignore Files**
   - Excludes `venv/`, `__pycache__`, `.git`, and other unnecessary files
   - Reduces build context size by ~80%
   - Faster COPY operations

4. **npm ci Instead of npm install**
   - Faster and more reliable for production builds
   - Uses exact versions from package-lock.json

5. **System Dependencies Optimization**
   - Only installs necessary packages
   - Cleans apt cache after installation

**Expected Improvements:**
- **First build**: Similar time (needs to download everything)
- **Subsequent builds**: **50-70% faster** when only code changes
- **Image size**: **~30-40% smaller** (slim images)
- **Build context**: **~80% smaller** (excluded unnecessary files)

**Usage Tips:**

```bash
# Build only changed services
docker-compose build frontend
docker-compose build django

# Build in parallel
docker-compose build --parallel

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose build

# Force rebuild (ignore cache)
docker-compose build --no-cache
```

### 7.9 Docker Troubleshooting

**Common Errors and Solutions:**

1. **"requirements.txt not found" Error**
   - Make sure `requirements.txt` exists in `backend/` directory
   - Check that `.dockerignore` doesn't exclude `requirements.txt`

2. **"npm ci" Fails**
   - If `package-lock.json` is missing or out of sync, change Dockerfile:
   ```dockerfile
   # Change from:
   RUN npm ci --only=production=false
   # To:
   RUN npm install
   ```

3. **"Permission Denied" Errors**
   - Make sure Docker Desktop is running
   - On Linux: `sudo usermod -aG docker $USER`

4. **"Port Already in Use"**
   ```bash
   # Stop existing containers
   docker-compose down
   ```

5. **"Module Not Found" in Python**
   - Check `requirements.txt` includes all dependencies
   - Rebuild without cache: `docker-compose build --no-cache django`

6. **Build Context Too Large**
   - Check `.dockerignore` is working
   - Remove large files from project directory
   - Exclude `venv/`, `node_modules/`, etc.

7. **Frontend Build Fails**
   - Check if `package.json` and `package-lock.json` are in sync
   - Try: `cd frontend && npm install` locally first
   - Check for syntax errors in React code

**Quick Fixes:**

```bash
# Clear everything and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build

# Build individual services
docker-compose build django
docker-compose build frontend

# Check build logs
docker-compose build --progress=plain
```

---

## 8. Database Schema

### 8.1 Django Models

**Hotel Model (`backend/hotels/models.py`):**
```python
class Hotel(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    address = models.TextField()
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    price_min = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Room Model (`backend/hotels/models.py`):**
```python
class Room(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    room_name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    bed_type = models.CharField(max_length=20, choices=BED_TYPES)
    size_in_sqft = models.IntegerField(default=200)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    max_guests = models.IntegerField()
    total_rooms = models.IntegerField(default=1)
    available_rooms = models.IntegerField(default=1)
    amenities = models.JSONField(default=list)
    is_refundable = models.BooleanField(default=True)
    free_cancellation = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Booking Model (`backend/bookings/models.py`):**
```python
class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)
```

### 8.2 Relationships

- **Hotel → Room**: One-to-Many (Hotel has many Rooms)
- **Room → Booking**: One-to-Many (Room has many Bookings)
- **User → Booking**: One-to-Many (User has many Bookings)
- **Hotel → Booking**: One-to-Many (Hotel has many Bookings)

### 8.3 SQLAlchemy Models (FastAPI)

**Purpose:** Read same database tables as Django

**Room Model (`microservices/availability_service/models.py`):**
- Maps to `hotels_room` table
- Fields: `id`, `room_name`, `is_available`

**Booking Model (`microservices/availability_service/models.py`):**
- Maps to `bookings_booking` table
- Fields: `id`, `room_id`, `check_in`, `check_out`, `status`

**Note:** SQLAlchemy models are minimal (only fields needed for availability check)

---

## 9. API Endpoints

### 9.1 Authentication Endpoints (`/api/v1/auth/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register/` | Register new user | No |
| POST | `/api/v1/auth/token/` | Login (get JWT token) | No |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token | No |
| GET | `/api/v1/auth/profile/` | Get user profile | Yes |

### 9.2 Hotel Endpoints (`/api/v1/hotels/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/hotels/` | List all hotels (paginated) | No |
| POST | `/api/v1/hotels/` | Create hotel | Yes |
| GET | `/api/v1/hotels/{id}/` | Get hotel details | No |
| GET | `/api/v1/hotels/{id}/rooms/` | List rooms for hotel | No |
| POST | `/api/v1/hotels/{id}/rooms/` | Create room | Yes |
| GET | `/api/v1/hotels/rooms/{id}/` | Get room details | No |

### 9.3 Booking Endpoints (`/api/v1/bookings/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/bookings/` | Create booking | Yes |
| GET | `/api/v1/bookings/{id}/` | Get booking details | Yes |
| DELETE | `/api/v1/bookings/{id}/` | Cancel booking | Yes |

**Booking Request Body:**
```json
{
  "room": 2,
  "check_in": "2025-03-01",
  "check_out": "2025-03-05"
}
```

### 9.4 FastAPI Endpoints (`http://fastapi:8001/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/check-availability` | Check room availability |

**Availability Request:**
```json
{
  "room_id": 2,
  "check_in": "2025-03-01",
  "check_out": "2025-03-05"
}
```

**Availability Response:**
```json
{
  "available": true,
  "reason": "Room is available for the selected dates"
}
```

---

## 10. Authentication Flow

Note: The project was updated to a passwordless flow for normal users: only admin users keep username/password login (JWT via `/api/v1/auth/token/`). Normal users do NOT have accounts and will authenticate only via a one-time OTP sent to their email when they access "My Bookings".

Key endpoints:
- `POST /api/v1/auth/token/` - Admin login (username/password) — restricted to staff users only
- `POST /api/v1/bookings/otp/request/` - Request OTP for an email
- `POST /api/v1/bookings/otp/verify/` - Verify OTP and receive short-lived session token
- Use header `Authorization: EmailToken <token>` or `X-Email-Token: <token>` to access booking history/cancellations as a guest

### 10.1 Registration Flow

1. User submits registration form (`/api/v1/auth/register/`)
2. Backend creates user account
3. Returns success response
4. Frontend redirects to login page

### 10.2 Login Flow

1. User submits login form (`/api/v1/auth/token/`)
2. Backend validates credentials
3. Returns JWT tokens:
   ```json
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```
4. Frontend stores `access` token in `localStorage`
5. Token automatically attached to API requests via Axios interceptor

### 10.3 Token Usage

**Request Header:**
```
Authorization: Bearer <access_token>
```

**Token Lifetime:**
- Access token: 60 minutes
- Refresh token: 7 days

**Token Refresh:**
- Use `/api/v1/auth/token/refresh/` with refresh token
- Returns new access token

### 10.4 Protected Routes

**Frontend:**
- `ProtectedRoute` component checks `isAuthenticated`
- Redirects to `/login` if not authenticated

**Backend:**
- Views use `permission_classes = [IsAuthenticated]`
- DRF validates JWT token automatically
- Invalid/missing token → 401 Unauthorized

---

## 11. Booking Flow

### 11.1 Complete Booking Flow

```
User → Frontend → Django API → FastAPI Service → PostgreSQL
                                    ↓
                             Availability Check
                                    ↓
                             Django API → PostgreSQL
                                    ↓
                             Create Booking
                                    ↓
                             Frontend ← Booking Confirmation
```

### 11.2 Step-by-Step Process

1. **User selects room and dates** (Frontend)
2. **Frontend sends booking request**:
   ```javascript
   POST /api/v1/bookings/
   {
     "room": 2,
     "check_in": "2025-03-01",
     "check_out": "2025-03-05"
   }
   ```

3. **Django validates request**:
   - User authenticated? (JWT token)
   - Room exists?
   - Valid date range?

4. **Django calls FastAPI service**:
   ```python
   POST http://fastapi:8001/check-availability
   {
     "room_id": 2,
     "check_in": "2025-03-01",
     "check_out": "2025-03-05"
   }
   ```

5. **FastAPI checks availability**:
   - Room exists?
   - Room `is_available` flag?
   - Date overlap with existing bookings?
   - Returns `{"available": true/false, "reason": "..."}`

6. **Django processes response**:
   - If not available → Return error
   - If available → Proceed to create booking

7. **Django creates booking**:
   - Calculate total price: `nights * price_per_night`
   - Create Booking record
   - Set `user` and `hotel` (from room)
   - Status: `"confirmed"`

8. **Django returns booking**:
   ```json
   {
     "id": 123,
     "user": 1,
     "hotel": 5,
     "hotel_name": "Grand Hotel",
     "room": 2,
     "room_name": "Deluxe Suite",
     "check_in": "2025-03-01",
     "check_out": "2025-03-05",
     "total_price": "400.00",
     "status": "confirmed",
     "created_at": "2025-01-15T10:30:00Z"
   }
   ```

9. **Frontend displays confirmation**

### 11.3 Transaction Safety

**Why `@transaction.atomic`?**
- Ensures booking creation is atomic
- If any step fails, entire transaction rolls back
- Prevents partial bookings

**Row Locking:**
```python
room = Room.objects.select_for_update().get(id=data['room'])
```
- Locks room row during transaction
- Prevents concurrent booking conflicts

### 11.4 Error Handling

**Common Errors:**
- `400 Bad Request`: Invalid dates, room not available
- `401 Unauthorized`: Missing/invalid JWT token
- `404 Not Found`: Room doesn't exist
- `503 Service Unavailable`: FastAPI service unreachable

---

## 12. Date Overlap Logic

### 12.1 Overview
The date overlap logic is critical for preventing double bookings. It checks if a new booking's date range overlaps with existing confirmed bookings.

### 12.2 Implementation Location
- **Microservice**: `microservices/availability_service/main.py` (lines 47-54)
- **Logic**: Implemented in FastAPI availability service

### 12.3 Date Overlap Logic

**Two date ranges overlap if:**
```
existing_check_in < new_check_out AND existing_check_out > new_check_in
```

**Visual Example:**
```
Existing: [-----]
New:          [-----]
Result: Overlap (existing_check_out > new_check_in)

Existing: [-----]
New:              [-----]
Result: No overlap

Existing: [-----]
New:    [-----]
Result: Overlap (new_check_out > existing_check_in)
```

### 12.4 Code Implementation

**File**: `microservices/availability_service/main.py`

```python
# Overlapping bookings logic:
# (check_in < existing_check_out) AND (check_out > existing_check_in)
overlapping = db.query(Booking).filter(
    Booking.room_id == payload.room_id,
    Booking.status == "confirmed",
    Booking.check_in < payload.check_out,
    Booking.check_out > payload.check_in,
).count()
```

**Explanation**:
- Filters bookings for the same room (`room_id`)
- Only considers `confirmed` bookings (ignores cancelled)
- Checks if existing booking's check-in is before new check-out
- Checks if existing booking's check-out is after new check-in
- If both conditions are true → overlap detected

### 12.5 Edge Cases Handled

1. **Same check-in date**: `existing_check_in == new_check_in` → Overlap
2. **Same check-out date**: `existing_check_out == new_check_out` → Overlap  
3. **Adjacent dates**: `existing_check_out == new_check_in` → No overlap (can checkout and checkin same day)
4. **Cancelled bookings**: Ignored (status != "confirmed")
5. **Invalid date range**: `check_in >= check_out` → Rejected before overlap check

---

## 13. Error Handling

### 13.1 Backend Error Handling

**Django Views:**
- Try-except blocks for external service calls
- Timeout handling (5 seconds for availability service)
- Transaction rollback on errors

**Error Response Format:**
```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `400`: Bad request (validation errors, availability issues)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not found (room/hotel doesn't exist)
- `500`: Internal server error
- `503`: Service unavailable (FastAPI unreachable)

### 13.2 FastAPI Error Handling

**Validation Errors:**
- Pydantic automatically validates request schemas
- Returns 422 Unprocessable Entity with detailed errors

**Database Errors:**
- Handles missing room gracefully
- Returns structured error responses

### 13.3 Frontend Error Handling

**API Errors:**
- Axios interceptors can handle common errors
- Displays user-friendly error messages
- Handles network failures

**Example:**
```javascript
try {
  const response = await api.post('/api/v1/bookings/', bookingData);
  // Success handling
} catch (error) {
  if (error.response) {
    // API returned error
    setError(error.response.data.error || 'Booking failed');
  } else {
    // Network error
    setError('Network error. Please try again.');
  }
}
```

---

## 14. Common Issues & Solutions

### 14.1 Import Errors in FastAPI

**Problem:** `ImportError: attempted relative import with no known parent package`

**Solution:** Use absolute imports instead of relative
```python
# ❌ Wrong
from .database import get_db

# ✅ Correct
from database import get_db
```

**Why:** When running `uvicorn main:app`, Python treats `main.py` as entry point, not a package.

### 14.2 Database Connection Issues

**Problem:** `psycopg2.OperationalError: could not translate host name "Admin123@127.0.0.1"`

**Solution:** Sanitize environment variables in `config.py`
- Remove `@` from host
- Remove path components
- Extract hostname if port included

### 14.3 Missing Context in Serializer

**Problem:** `KeyError: 'request'` in serializer

**Solution:** 
1. Pass context to serializer: `serializer = BookingSerializer(data=data, context={'request': request})`
2. Pass user explicitly: `serializer.save(user=request.user)`
3. Add fallback in serializer: `user = self.context.get('request', {}).get('user', None)`

### 14.4 CORS Errors

**Problem:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:** Configure CORS in Django settings
```python
INSTALLED_APPS = ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOW_ALL_ORIGINS = True  # Development only
```

### 14.5 Gunicorn Not Found

**Problem:** `sh: 1: gunicorn: not found`

**Solution:** Add `gunicorn` to `backend/requirements.txt`
```txt
gunicorn==23.0.0
```

### 14.6 Frontend Shows "Enable JavaScript"

**Problem:** Frontend page blank, shows "You need to enable JavaScript to run this app."

**Solution:** 
- Check if `ProtectedRoute.js` is properly implemented
- Verify React build completed successfully
- Check Nginx configuration

### 14.7 Service Communication Issues

**Problem:** Django cannot reach FastAPI service

**Solution:**
- Use service name in Docker: `http://fastapi:8001`
- Ensure services on same network: `booking_network`
- Check service health: `docker compose ps`

### 14.8 Environment Variables Not Working (Frontend)

**Problem:** Frontend API URL incorrect

**Solution:**
- React env vars must be set at BUILD time
- Use `ARG` and `ENV` in Dockerfile
- Pass as build arg in docker-compose.yml
- Rebuild image after changes

---

## 15. Interview Preparation Notes

### 15.1 Architecture Questions

**Q: Why microservices?**
- **Answer:** Separated availability check logic into independent service for:
  - Independent scaling (availability service can scale separately)
  - Technology flexibility (FastAPI vs Django)
  - Separation of concerns
  - Future extensibility (can add more microservices)

**Q: Why FastAPI for availability service?**
- **Answer:**
  - High performance (async support)
  - Automatic API documentation (OpenAPI/Swagger)
  - Type validation with Pydantic
  - Modern Python features

**Q: How do services communicate?**
- **Answer:**
  - Django → FastAPI: HTTP REST calls (`requests` library)
  - Within Docker: Service names (`fastapi:8001`)
  - Frontend → Backend: HTTP from browser (`localhost:8000`)

### 15.2 Database Questions

**Q: Why SQLAlchemy in FastAPI instead of Django ORM?**
- **Answer:**
  - FastAPI is framework-agnostic
  - SQLAlchemy is standard Python ORM
  - Can reuse same database, different ORM
  - Table names must match Django's conventions

**Q: How do you prevent double bookings?**
- **Answer:**
  1. Row locking: `select_for_update()` in Django
  2. Transaction atomicity: `@transaction.atomic`
  3. Date overlap check in FastAPI service
  4. Database constraints (could add unique constraints)

### 15.3 Docker Questions

**Q: Explain multi-stage build for frontend**
- **Answer:**
  - Stage 1: Build React app with Node.js
  - Stage 2: Serve static files with Nginx
  - Benefits: Smaller image, better security, no Node.js in production

**Q: Why `depends_on` with healthcheck?**
- **Answer:**
  - Ensures PostgreSQL is ready before Django/FastAPI start
  - Prevents connection errors during startup
  - `condition: service_healthy` waits for actual readiness, not just container start

**Q: Why port mapping `3000:80` for frontend?**
- **Answer:**
  - Container listens on port 80 (Nginx default)
  - Host exposes on port 3000
  - Allows access from browser as `localhost:3000`

### 15.4 Authentication Questions

**Q: Why JWT instead of session-based auth?**
- **Answer:**
  - Stateless (no server-side session storage)
  - Scalable (works across multiple servers)
  - API-friendly (REST APIs)
  - Token lifetime configurable

**Q: How is token stored and used?**
- **Answer:**
  - Stored in `localStorage` (frontend)
  - Automatically attached via Axios interceptor
  - Sent as `Authorization: Bearer <token>` header
  - DRF validates token on each request

### 15.5 Code Quality Questions

**Q: How do you handle errors?**
- **Answer:**
  - Try-except blocks for external calls
  - Timeout handling (5 seconds)
  - Transaction rollback on failures
  - Structured error responses
  - Appropriate HTTP status codes

**Q: How do you ensure data consistency?**
- **Answer:**
  - Database transactions (`@transaction.atomic`)
  - Row locking (`select_for_update()`)
  - Validation at multiple levels (serializer, view, service)
  - Availability check before booking creation

### 15.6 Frontend Questions

**Q: Why Context API for auth?**
- **Answer:**
  - Global state management for auth
  - Avoids prop drilling
  - Lightweight (no Redux needed for this use case)
  - React built-in solution

**Q: How does protected routing work?**
- **Answer:**
  - `ProtectedRoute` component checks `isAuthenticated`
  - Uses React Router's `Navigate` for redirects
  - Checks token presence from Context
  - Shows loading state during check

### 15.7 Performance Questions

**Q: How would you optimize this system?**
- **Answer:**
  - Add caching (Redis) for hotel/room data
  - Database indexing on frequently queried fields
  - Connection pooling for database
  - CDN for frontend static assets
  - Horizontal scaling of microservices
  - Load balancing

**Q: How would you handle high traffic?**
- **Answer:**
  - Scale services independently (Docker/Kubernetes)
  - Add Redis cache layer
  - Database read replicas
  - API rate limiting
  - Message queue for async processing

### 15.8 Testing Questions

**Q: How would you test this system?**
- **Answer:**
  - **Unit tests:** Serializers, models, utility functions
  - **Integration tests:** API endpoints, database operations
  - **E2E tests:** Complete booking flow
  - **Mock external services:** FastAPI service in tests
  - **Test edge cases:** Date overlaps, concurrent bookings

### 15.9 Security Questions

**Q: What security measures are in place?**
- **Answer:**
  - JWT authentication
  - CORS configuration
  - SQL injection prevention (ORM parameterization)
  - Password hashing (Django default)
  - HTTPS in production (not in development)
  - Input validation (serializers, Pydantic schemas)

**Q: What would you improve for production?**
- **Answer:**
  - Environment-specific settings (dev/staging/prod)
  - Secret management (AWS Secrets Manager, HashiCorp Vault)
  - Rate limiting
  - Request logging and monitoring
  - HTTPS/TLS certificates
  - Security headers
  - Regular dependency updates

### 15.10 Key Takeaways for Interview

1. **Architecture**: Microservices, Docker, REST APIs
2. **Database**: PostgreSQL, ORM usage, transactions
3. **Authentication**: JWT, stateless design
4. **Error Handling**: Comprehensive error handling strategy
5. **Docker**: Multi-stage builds, networking, healthchecks
6. **Frontend**: React, Context API, protected routes
7. **Backend**: Django REST Framework, serializers, views
8. **Problem Solving**: Systematically debugged multiple issues
9. **Best Practices**: Code organization, error handling, security

---

## Conclusion

This documentation covers the complete hotel booking system implementation, including architecture, code explanations, Docker setup, and interview preparation notes. The system demonstrates full-stack development skills, microservices architecture, containerization, and real-world problem-solving.

For updates to this documentation, refer to the git history or update this file when making code changes.

