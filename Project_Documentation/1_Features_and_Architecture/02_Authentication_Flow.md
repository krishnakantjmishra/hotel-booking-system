# 02. Authentication & Security Flow

## Overview
Security is paramount. We use a **Role-Based Access Control (RBAC)** system using **JWT (JSON Web Tokens)**. There are two main types of users:
1.  **Admins**: Can manage hotels, rooms, inventory, and delete bookings.
2.  **Regular Users (Guests)**: Can browse hotels, make bookings, and view their own history.

## How JWT Works in this Project

1.  **Login**:
    - User sends `username` & `password` to `/api/token/`.
    - Server verifies credentials.
    - Server returns two tokens:
        - `access_token` (Short life, e.g., 60 mins): Used for every API call.
        - `refresh_token` (Long life, e.g., 7 days): Used to get a new access token when the old one expires.
2.  **Storage**:
    - Frontend stores these tokens in `localStorage` (simple approach) or HTTP-only cookies (more secure, future enhancement).
3.  **Authenticated Requests**:
    - For every request (e.g., "Get My Bookings"), React adds a header: 
      `Authorization: Bearer <access_token>`
4.  **Backend Verification**:
    - Django Middleware checks this signature. If valid, it knows *who* the user is (`request.user`).

## Login-Free Booking Flow (Special Feature)
We implemented a **Login-Free** experience for guests to reduce friction/drop-offs.
- **Browse & Book**: Users don't need to register to book a room.
- **Identification**: They provide an email address during booking.
- **Accessing History**:
    - They go to "My Bookings".
    - Enter Email.
    - System sends **OTP (One Time Password)** to email.
    - User enters OTP -> Receives a temporary JWT to view *only* their bookings.

## Key Files involved
- **Backend**:
    - `users/serializers.py`: Defines how user data is converted.
    - `core/settings.py`: Configures `SIMPLE_JWT` settings (token lifetime).
- **Frontend**:
    - `context/AuthContext.js`: Global provider that checks if user is logged in and exposes `user` object to all components.
    - `api/axios.js`: Automatically attaches the Token to every request. Intercepts 401 errors to try and refresh the token automatically.
