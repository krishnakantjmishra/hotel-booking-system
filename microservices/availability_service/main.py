from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from sqlalchemy import and_

from database import get_db, Base, engine
from models import Room, Booking, RoomInventory
from schemas import AvailabilityRequest, AvailabilityResponse

app = FastAPI(
    title="Availability Service",
    description="FastAPI microservice to check room availability",
    version="1.0.0",
)

# Not creating tables here, just ensure metadata is bound
Base.metadata.bind = engine


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/check-availability", response_model=AvailabilityResponse)
def check_availability(payload: AvailabilityRequest, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == payload.room_id).first()

    if not room:
        return AvailabilityResponse(
            available=False,
            reason="Room not found"
        )

    if not room.is_available:
        return AvailabilityResponse(
            available=False,
            reason="Room is marked unavailable"
        )

    if payload.check_in >= payload.check_out:
        return AvailabilityResponse(
            available=False,
            reason="Check-out must be after check-in"
        )

    # 1. Check for overlapping bookings (Backup check)
    overlapping = db.query(Booking).filter(
        Booking.room_id == payload.room_id,
        Booking.status == "confirmed",
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in,
    ).count()

    if overlapping >= room.total_rooms:
        return AvailabilityResponse(
            available=False,
            reason=f"Room is fully booked for the selected dates (Booked: {overlapping}, Total: {room.total_rooms})"
        )

    # 2. Strict Inventory Check
    current_date = payload.check_in
    while current_date < payload.check_out:
        inventory = db.query(RoomInventory).filter(
            RoomInventory.room_id == payload.room_id,
            RoomInventory.date == current_date
        ).first()

        if not inventory:
            return AvailabilityResponse(
                available=False,
                reason=f"Inventory not defined for {current_date}. Please check for another date"
            )

        if inventory.booked_rooms >= inventory.total_rooms:
            return AvailabilityResponse(
                available=False,
                reason=f"No rooms available for {current_date}. Please check for another date"
            )
        
        current_date += timedelta(days=1)

    return AvailabilityResponse(
        available=True,
        reason="Room is available for the selected dates"
    )
