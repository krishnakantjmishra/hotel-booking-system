from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import datetime as _dt
from django.utils.dateparse import parse_date, parse_datetime
from django.utils import timezone
import logging
import secrets
from django.core.mail import send_mail
from django.conf import settings
import requests

logger = logging.getLogger(__name__)

from .models import Booking, OTPRequest, EmailSession
from .serializers import BookingSerializer, OTPRequestSerializer, OTPVerifySerializer, EmailSessionSerializer
from hotels.models import Room, RoomInventory


# Helper: dates range generator
def get_dates_in_range(check_in, check_out):
    """Generate all dates between check_in and check_out (excluding check_out)."""
    # Normalize inputs to date objects
    def normalize(val):
        if isinstance(val, _dt.date) and not isinstance(val, _dt.datetime):
            return val
        if isinstance(val, _dt.datetime):
            return val.date()
        if isinstance(val, str):
            parsed = parse_date(val)
            if parsed:
                return parsed
            parsed_dt = parse_datetime(val)
            if parsed_dt:
                return parsed_dt.date()
            logger.debug("normalize_date failed for value=%r type=%r", val, type(val))
            return None

    check_in = normalize(check_in)
    check_out = normalize(check_out)
    if not check_in or not check_out:
        return []
    dates = []
    # ensure caller passes date objects
    current_date = check_in
    while current_date < check_out:
        dates.append(current_date)
        current_date += _dt.timedelta(days=1)
    return dates


# Simple helper to get EmailSession from request headers
def _get_session_from_request(request):
    header = request.META.get('HTTP_AUTHORIZATION', '')
    token = None
    if header.startswith('EmailToken '):
        token = header.split(' ', 1)[1].strip()
    else:
        # Also accept X-Email-Token header for convenience
        token = request.META.get('HTTP_X_EMAIL_TOKEN')

    if not token:
        return None

    try:
        session = EmailSession.objects.get(token=token, valid=True)
        if session.is_valid():
            return session
        # Invalidate expired session
        session.valid = False
        session.save()
    except EmailSession.DoesNotExist:
        return None

    return None


class PublicCreateBookingView(APIView):
    """Allow anyone to create a booking (no authentication required).

    Booking requires guest name and email (email is mandatory per requirements).
    After booking we send a booking confirmation email using configured SMTP.
    """
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        try:
            data = request.data.copy()

            # Basic required guest fields
            if not data.get('user_email') or not data.get('user_name'):
                return Response({"error": "user_email and user_name are required"}, status=400)

            # Validate room
            try:
                room = Room.objects.select_for_update().get(id=data.get('room'))
            except Room.DoesNotExist:
                return Response({"error": "Room not found"}, status=404)
            except Exception as e:
                # Catch invalid ID format etc
                return Response({"error": f"Invalid room ID: {str(e)}"}, status=400)

            # Validate dates
            def normalize_date(val):
                if isinstance(val, _dt.datetime):
                    return val.date()
                if isinstance(val, _dt.date):
                    return val
                if isinstance(val, str):
                    parsed = parse_date(val)
                    if parsed:
                        return parsed
                    parsed_dt = parse_datetime(val)
                    if parsed_dt:
                        return parsed_dt.date()
                return None

            check_in = normalize_date(data.get('check_in'))
            check_out = normalize_date(data.get('check_out'))

            if not check_in or not check_out:
                return Response({"error": "check_in and check_out dates are required or in wrong format"}, status=400)

            if check_in >= check_out:
                return Response({"error": "Check-out must be after check-in"}, status=400)

            # Call Availability Microservice
            # We hold the Room lock (from select_for_update above) to ensure serialization of requests for this room
            try:
                availability_url = settings.AVAILABILITY_SERVICE_URL
                payload = {
                    "room_id": room.id,
                    "check_in": str(check_in),
                    "check_out": str(check_out)
                }
                # Timeout set to 3 seconds to avoid hanging Django
                response = requests.post(availability_url, json=payload, timeout=3)
                
                if response.status_code == 200:
                    avail_data = response.json()
                    if not avail_data.get("available"):
                        return Response({"error": avail_data.get("reason", "Room is not available")}, status=400)
                else:
                    # If microservice is down or errors, fail safe
                    logger.error("Availability service returned status %s: %s", response.status_code, response.text)
                    return Response({"error": "Unable to verify availability at this time."}, status=503)
                    
            except requests.RequestException as e:
                logger.error("Failed to connect to availability service: %s", e)
                return Response({"error": "Availability check service unavailable."}, status=503)
            except ValueError: # Catch JSON decode errors
                logger.error("Availability service returned invalid JSON")
                return Response({"error": "Availability check service invalid response."}, status=503)

            # Validate booking data
            serializer = BookingSerializer(data=data, context={'request': request})
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)

            # Create booking
            try:
                booking = serializer.save()
            except Exception as e:
                logger.error("Booking creation failed: %s", str(e))
                return Response({"error": f"Booking creation failed: {str(e)}"}, status=400)

            # Send confirmation email (best-effort, do not fail booking)
            try:
                subject = f"Booking confirmation - {booking.hotel.name}"
                message = (
                    f"Hi {booking.user_name},\n\n" 
                    f"Your booking (id: {booking.id}) at {booking.hotel.name} is confirmed.\n"
                    f"Check-in: {booking.check_in} - Check-out: {booking.check_out}\n\n"
                    "Thanks for booking with us."
                )
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [booking.user_email], fail_silently=False)
            except Exception as exc:
                logger.exception("Failed to send booking confirmation email: %s", exc)

            return Response(BookingSerializer(booking).data, status=201)

        except Exception as e:
            # GLOBAL CATCH-ALL
            import traceback
            logger.error("CRITICAL ERROR IN BOOKING VIEW: %s\n%s", str(e), traceback.format_exc())
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)


class AdminBookingListView(APIView):
    """Admin-only view to list all bookings."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Forbidden"}, status=403)
        bookings = Booking.objects.all().order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class RequestOTPView(APIView):
    """Request an OTP for an email. Rate-limited and stores hashed OTP."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email'].lower().strip()

        # Basic rate limiting: no more than 5 OTPs in the last 30 minutes
        window = timezone.now() - _dt.timedelta(minutes=30)
        recent_count = OTPRequest.objects.filter(email=email, created_at__gte=window).count()
        if recent_count >= 5:
            return Response({"error": "Too many OTP requests, please try later"}, status=429)

        # Generate 6-digit OTP
        raw_otp = f"{secrets.randbelow(10**6):06d}"

        expires_at = timezone.now() + _dt.timedelta(minutes=10)

        otp_req = OTPRequest(email=email, expires_at=expires_at)
        otp_req.set_otp(raw_otp)
        otp_req.save()

        # Send OTP by email (best-effort)
        try:
            subject = "Your OTP code"
            message = f"Your OTP is: {raw_otp}. It expires in 10 minutes."
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
        except Exception:
            logger.exception("Failed to send OTP email to %s", email)

        return Response({"message": "OTP sent if the email is valid"})


class VerifyOTPView(APIView):
    """Verify OTP and return a short-lived EmailSession token."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email'].lower().strip()
        otp = serializer.validated_data['otp'].strip()

        # Find a valid, unused, unexpired OTPRequest for this email
        now = timezone.now()
        candidates = OTPRequest.objects.filter(email=email, used=False, expires_at__gte=now).order_by('-created_at')
        if not candidates.exists():
            return Response({"error": "Invalid or expired OTP"}, status=400)

        otp_req = candidates.first()
        if not otp_req.check_otp(otp):
            return Response({"error": "Invalid or expired OTP"}, status=400)

        # Mark used to enforce single-use
        otp_req.used = True
        otp_req.save()

        # Create EmailSession token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + _dt.timedelta(minutes=10)
        session = EmailSession.objects.create(token=token, email=email, expires_at=expires_at)

        out = EmailSessionSerializer({"token": session.token, "expires_at": session.expires_at})
        return Response(out.data)


class MyBookingsView(APIView):
    """Return bookings for a verified email (requires EmailSession token in Authorization header)."""
    permission_classes = [AllowAny]

    def get(self, request):
        session = _get_session_from_request(request)
        if not session:
            return Response({"error": "Unauthorized"}, status=401)

        bookings = Booking.objects.filter(user_email__iexact=session.email).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class BookingCancelView(APIView):
    """Cancel a booking either as admin (JWT staff) or via EmailSession token if email matches."""
    permission_classes = [AllowAny]

    @transaction.atomic
    def delete(self, request, pk):
        # First try admin flow
        if request.user and getattr(request.user, 'is_authenticated', False) and request.user.is_staff:
            try:
                booking = Booking.objects.select_for_update().get(id=pk)
            except Booking.DoesNotExist:
                return Response({"error": "Booking not found"}, status=404)
        else:
            session = _get_session_from_request(request)
            if not session:
                return Response({"error": "Unauthorized"}, status=401)
            try:
                booking = Booking.objects.select_for_update().get(id=pk, user_email__iexact=session.email)
            except Booking.DoesNotExist:
                return Response({"error": "Booking not found"}, status=404)

        # If booking confirmed, decrement inventory
        if booking.status == 'confirmed':
            dates_in_range = get_dates_in_range(booking.check_in, booking.check_out)
            for date in dates_in_range:
                try:
                    inventory = RoomInventory.objects.select_for_update().get(room=booking.room, date=date)
                    if inventory.booked_rooms > 0:
                        inventory.booked_rooms -= 1
                        inventory.save()
                except RoomInventory.DoesNotExist:
                    pass

        booking.status = 'cancelled'
        booking.save()

        return Response({"message": "Booking cancelled successfully"})

