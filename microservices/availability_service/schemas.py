from pydantic import BaseModel, Field
from datetime import date

class AvailabilityRequest(BaseModel):
    room_id: int = Field(..., example=1)
    check_in: date = Field(..., example="2025-03-01")
    check_out: date = Field(..., example="2025-03-05")


class AvailabilityResponse(BaseModel):
    available: bool
    reason: str
