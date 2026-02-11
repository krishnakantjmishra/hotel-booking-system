# 04. Booking Process & Email System

## The Booking Flow
When a user clicks "Book Now":

1.  **Frontend Validation**:
    - Checks dates (Check-out > Check-in).
    - Checks past dates (Blocked via `min={today}`).
2.  **API Request**: `POST /v1/bookings/`
3.  **Backend Logic (`bookings/views.py`)**:
    - **Availability Check**: Queries `RoomInventory` for *every single day* in the range. 
        - If `available < 1` for ANY day -> Reject.
    - **Inventory Lock**: If available, it increments `booked_rooms` count for those days. **Atomic Transaction** is used (conceptually) to prevent race conditions (two people booking last room at same millisecond).
    - **Price Calculation**: `days * price_per_night`.
    - **Save**: Creates `Booking` record.

## Email Notifications
We use Python's built-in `smtplib` via Django's wrapper.
- **Trigger**: Happens immediately after successful booking save.
- **Protocol**: SMTP (Simple Mail Transfer Protocol).
- **Provider**: Gmail (configured in `.env`).
- **Content**: Sends HTML email with Booking ID, Dates, and Hotel details to the user.

## Cancellation
- When a user cancels:
    - Status changes to `CANCELLED`.
    - **Critical Step**: We must "Release" the inventory.
    - Logic: Loop through booked dates -> Decrement `booked_rooms` count in `RoomInventory`.
