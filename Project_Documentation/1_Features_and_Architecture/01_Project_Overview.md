# 01. Project Overview & Architecture

## Introduction
This is a comprehensive Hotel Booking System designed to handle hotel management, room inventory, customer bookings, and secure administration. It is built using modern web technologies and deployed on AWS.

## Tech Stack

### Frontend (Client Side)
- **Framework**: React.js (Create React App)
- **Language**: JavaScript (ES6+)
- **UI Library**: Material UI (MUI) - For responsive, pre-built components.
- **State Management**: React Context API (`AuthContext`) - For managing user login state globally.
- **Networking**: Axios - For making HTTP requests to the backend.
- **Routing**: React Router Dom - For handling page navigation.

### Backend (Server Side)
- **Framework**: Django REST Framework (DRF) - For building robust APIs.
- **Language**: Python 3.10+
- **Database**: PostgreSQL - Relational database for robust data integrity.
- **Image Processing**: Pillow + pillow-heif - Supports uploading HEIC/AVIF images (common on iPhones) and converting them to JPEG.
- **Microservices**: A separate FastAPI service (concept/prototype) for handling availability checks independently (in `microservices/` folder).

### Infrastructure & Deployment
- **Cloud Provider**: AWS (Amazon Web Services)
- **Server Instance**: EC2 (Ubuntu Linux)
- **Web Server**: Nginx - distincts static files vs API traffic, acts as a reverse proxy.
- **App Server**: Gunicorn - WSGI HTTP Server to run Python Django code.
- **Process Manager**: Systemd - Keeps Gunicorn running in the background.
- **File Storage**: AWS S3 - Stores uploaded hotel/room images safely in the cloud.
- **Security**: 
  - JWT (JSON Web Tokens) for stateless authentication.
  - CORS headers configured for security.

## High-Level Architecture Flow

1.  **User Access**: User visits website (React App).
2.  **Request**: User clicks "Book Now". React sends `POST` request to API.
3.  **Reverse Proxy**: request hits **Nginx** on EC2.
    - If it's for `static/` files (CSS/JS), Nginx serves it directly (FAST).
    - If it's for `/api/`, Nginx passes it to **Gunicorn**.
4.  **Application Logic**: **Gunicorn** hands request to **Django**.
    - Django checks Authentication (JWT).
    - Validates data (Dates, Room availability).
    - Saves Booking to **PostgreSQL**.
    - Trigger Email Notification.
5.  **Response**: Django returns JSON success.
6.  **Display**: React shows "Booking Confirmed" message.

## Why this Architecture?
- **Separation of Concerns**: Frontend and Backend are decoupled. You can swap the frontend for a Mobile App later without changing the backend.
- **Scalability**: AWS S3 moves heavy image traffic off your main server. Nginx handles static files efficiently.
- **Security**: JWT means no session data stored on server memory (stateless).
