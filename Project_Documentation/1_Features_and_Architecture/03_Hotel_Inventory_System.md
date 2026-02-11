# 03. Hotel Inventory & Image System

## 1. Inventory Management
This is the heart of the "Booking Engine". We need to know exactly how many rooms are available for every single date.

### Core Model: `RoomInventory`
Instead of just a "Total User Count" field on the Room, we create a specialized table to track **daily** availability.
- **Table**: `RoomInventory`
- **Fields**:
    - `room_id`: Which room?
    - `date`: Which day? (e.g., 2026-01-20)
    - `total_rooms`: How many physical rooms exist? (e.g., 10)
    - `booked_rooms`: How many are sold? (e.g., 2)
    - `available_rooms` (Calculated): `total` - `booked`.

### Bulk Update & Matrix View (Admin Features)
Managing single dates is tedious. We implemented advanced tools:

1.  **Bulk Upload (14-Day Range)**:
    - **Problem**: Updating inventory for a whole month one by one takes forever.
    - **Solution**: Admins select a Start Date, End Date, and Total Rooms.
    - **Backend**: Python loops through dates `while current <= end`, checks if record exists (`update_or_create`).
    - **Validation**: Enforces max 14-day chunk (for performance). Prevents past dates.

2.  **14-Day Availability Matrix**:
    - **Problem**: Hard to see "gaps" in availability in a list view.
    - **Solution**: A Matrix Grid (Rows=Rooms, Cols=Dates).
    - **Impl**: Frontend fetches 14 days of data with `page_size=1000`. Backend uses `LargeResultsSetPagination`.
    - **Vis**: Green = Available, Red = Full.

## 2. Image Management (S3 + HEIC Support)
Hotels need high-quality photos.
- **Storage**: We use **AWS S3** (Simple Storage Service). Images are not stored on the web server disk (which is ephemeral/small). They sit in S3 buckets.
- **HEIC Problem**: iPhones take photos in `.heic` format. Web browsers (Chrome/Edge) CANNOT display HEIC directly.
- **Our Solution**:
    - When admin uploads an image (`AdminRoomImageUpload.js`).
    - Backend intercepts the file in `validate_image`.
    - Uses `pillow-heif` library to detect HEIC.
    - Converts it to standard **JPEG** in memory.
    - Saves the JPEG to AWS S3.
    - Result: iPhone uploads work perfectly.
