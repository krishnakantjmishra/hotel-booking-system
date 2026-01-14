from sqlalchemy import Column, Integer, String, Boolean, Date, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Room(Base):
    __tablename__ = "hotels_room"

    id = Column(Integer, primary_key=True, index=True)
    room_name = Column(String(255))
    is_available = Column(Boolean, default=True)
    total_rooms = Column(Integer, default=1)


class Booking(Base):
    __tablename__ = "bookings_booking"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("hotels_room.id"))
    check_in = Column(Date)
    check_out = Column(Date)
    status = Column(String(20))
