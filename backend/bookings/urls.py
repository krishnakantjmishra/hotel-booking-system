from django.urls import path
from .views import (
    PublicCreateBookingView,
    AdminBookingListView,
    RequestOTPView,
    VerifyOTPView,
    MyBookingsView,
    BookingCancelView,
)

urlpatterns = [
    path('', PublicCreateBookingView.as_view(), name='bookings-create'),
    path('admin/', AdminBookingListView.as_view(), name='bookings-admin-list'),

    # OTP endpoints for passwordless access
    path('otp/request/', RequestOTPView.as_view(), name='otp-request'),
    path('otp/verify/', VerifyOTPView.as_view(), name='otp-verify'),

    # Booking actions that require OTP session token
    path('me/', MyBookingsView.as_view(), name='my-bookings'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),
]
