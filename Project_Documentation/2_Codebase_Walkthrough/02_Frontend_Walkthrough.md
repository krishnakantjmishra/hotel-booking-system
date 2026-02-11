# 02. Frontend Codebase Walkthrough (React)

This document explains the structure of the `frontend/` folder.

## Root (`src/`)
- **`index.js`**: The entry point. It attaches the React App to the HTML DOM (`<div id="root">`).
- **`App.js`**: The Main Router. It decides which "Page" to show based on the URL (e.g., `/` -> Home, `/admin` -> Admin Dashboard).
- **`App.css`**: Global styles.

## Folder: `src/api/`
- **`axios.js`**: A configured "HTTP Client".
    - It knows the Base URL (`http://16.171.138.117`).
    - **Interceptors**: It automatically checks for a Token in `localStorage` and adds `Authorization: Bearer xyz` to every request. This is why we don't need to manually add headers everywhere.

## Folder: `src/context/`
- **`AuthContext.js`**: The "Global State" for User Login.
    - Creates a "Provider" that wraps the whole app.
    - Variables: `user`, `loginUser`, `logoutUser`.
    - Any component can ask `useContext(AuthContext)` to know if the user is logged in.

## Folder: `src/components/` (Reusable UI parts)
- **`ImageSlider.js`**: The carousel component used to show room images.
- **`Navbar.js`**: The top navigation bar. It conditionally shows "Login" or "Logout" based on AuthContext.
- **`Loader.js`**: A spinning loading indicator.

## Folder: `src/pages/` (The Screens)

### Public Pages
- **`Home.js`**: Landing page.
- **`Hotels.js`**: List of all hotels (Consumes `GET /api/hotels/`).
- **`HotelDetail.js`**: The complex page.
    - Shows Hotel Info.
    - Lists Rooms.
    - **Booking Form**: The date picker logic (min date = today) and "Book Now" logic live here.
- **`MyBookings.js`**:
    - Login-Free access flow.
    - Input Email -> Enter OTP -> View List of Bookings.

### Admin Pages (Protected Routes)
- **`AdminDashboard.js`**: The main control panel.
- **`AdminHotels.js`**: Add/Edit Hotels.
- **`AdminRooms.js`**: Add/Edit Rooms.
- **`AdminInventory.js`**: The most complex admin page.
    - **Matrix View**: Renders the 14-day grid.
    - **Bulk Update**: Handles the date-range upload.
    - **Single Update**: Quick fix for one day.
