from django.db import models
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from django.utils.translation import gettext_lazy as _

from hotels.models import Hotel, Room


class Booking(models.Model):
    """Booking no longer references Django's User model.

    Rationale: normal users will not have accounts. Bookings are created
    using name/email/phone supplied at time of booking. This keeps admin
    functionality intact while removing username/password auth for users.
    """

    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    # Guest information (replaces a User foreign key for normal users)
    user_name = models.CharField(max_length=150, help_text=_('Guest full name.'), default="Guest", null=False)
    user_email = models.EmailField(db_index=True, help_text=_('Guest email used for OTP access.'), default="guest@example.com", null=False)
    user_phone = models.CharField(max_length=30, blank=True, null=True, help_text=_('Optional phone number'))

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')

    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.user_email}"


class OTPRequest(models.Model):
    """Stores hashed OTPs for an email. OTPs are single-use and expire.

    Security choices made:
    - OTP is hashed using Django's password hashing utilities (not stored in plain text)
    - Each OTP has an expiry timestamp (5-10 minutes configurable by views)
    - 'used' flag ensures single-use
    - Basic rate limiting can be implemented by counting recent OTPRequests for the same email
    """

    email = models.EmailField(db_index=True)
    otp_hash = models.CharField(max_length=128)  # hash produced by make_password
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def set_otp(self, raw_otp: str):
        # Hash and store
        self.otp_hash = make_password(raw_otp)

    def check_otp(self, raw_otp: str) -> bool:
        return check_password(raw_otp, self.otp_hash)


class EmailSession(models.Model):
    """Short-lived session token issued after successful OTP verification.

    The token is a random UUID-like string and is used by the frontend to
    authenticate booking-related pages/actions (view/cancel) for the specified email.
    """

    token = models.CharField(max_length=64, unique=True)
    email = models.EmailField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    valid = models.BooleanField(default=True)

    def is_valid(self):
        return self.valid and timezone.now() < self.expires_at
