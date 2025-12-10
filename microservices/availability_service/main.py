from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import and_

from database import get_db, Base, engine
from models import Room, Booking
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

    # Overlapping bookings logic:
    # (check_in < existing_check_out) AND (check_out > existing_check_in)
    overlapping = db.query(Booking).filter(
        Booking.room_id == payload.room_id,
        Booking.status == "confirmed",
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in,
    ).count()

    if overlapping > 0:
        return AvailabilityResponse(
            available=False,
            reason="Room is already booked for the selected datesss"
        )

    return AvailabilityResponse(
        available=True,
        reason="Room is available for the selected dates"
    )
