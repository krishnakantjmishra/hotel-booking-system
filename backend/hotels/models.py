from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

class Hotel(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=120)
    address = models.TextField()
    rating = models.DecimalField(max_digits=2, decimal_places=1)  # example: 4.5
    price_min = models.DecimalField(max_digits=10, decimal_places=2)  # lowest price among rooms
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # newest first

    def __str__(self):
        return self.name

class Room(models.Model):
    ROOM_TYPES = [
        ('standard', 'Standard'),
        ('deluxe', 'Deluxe'),
        ('suite', 'Suite'),
        ('family', 'Family'),
        ('premium', 'Premium'),
    ]

    BED_TYPES = [
        ('king', 'King'),
        ('queen', 'Queen'),
        ('twin', 'Twin Bed'),
        ('single', 'Single Bed'),
    ]

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')

    # Basic Info
    room_name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, blank=True, null=True)
    bed_type = models.CharField(max_length=20, choices=BED_TYPES, default='king')  # NEW
    size_in_sqft = models.IntegerField(default=200)  # NEW

    # Pricing & Guests
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    max_guests = models.IntegerField(blank=True, null=True)
    total_rooms = models.IntegerField(default=1)      # NEW
    available_rooms = models.IntegerField(default=1)  # NEW

    # Features
    amenities = models.JSONField(default=list, blank=True)  # NEW
    is_refundable = models.BooleanField(default=True)       # NEW
    free_cancellation = models.BooleanField(default=False)  # NEW
    description = models.TextField(blank=True)

    # Availability
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room_name} ({self.hotel.name})"


class RoomInventory(models.Model):
    """
    Tracks room inventory for specific dates.
    Allows tracking availability per day for each room type.
    """
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='inventory')
    date = models.DateField()
    total_rooms = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    booked_rooms = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    class Meta:
        unique_together = ['room', 'date']
        ordering = ['date']
        verbose_name_plural = 'Room Inventories'

    def clean(self):
        """Ensure that booked_rooms does not exceed total_rooms."""
        if self.booked_rooms > self.total_rooms:
            raise ValidationError('booked_rooms cannot exceed total_rooms')

    @property
    def available_rooms(self):
        """Calculate available rooms: total_rooms - booked_rooms, never negative."""
        return max(self.total_rooms - self.booked_rooms, 0)

    def __str__(self):
        return f"{self.room.room_name} - {self.date} ({self.available_rooms}/{self.total_rooms} available)"


class Package(models.Model):
    """
    Hotel packages/offers that can include rooms, meals, activities, etc.
    """
    name = models.CharField(max_length=255)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='packages')
    description = models.TextField(blank=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Package details
    duration_nights = models.IntegerField(default=1)
    includes_meals = models.BooleanField(default=False)
    includes_activities = models.BooleanField(default=False)
    amenities = models.JSONField(default=list, blank=True)
    
    # Availability
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField(blank=True, null=True)
    valid_until = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Packages'

    @property
    def final_price(self):
        """Calculate final price after discount"""
        if self.discount_percentage > 0:
            discount_amount = (self.price * self.discount_percentage) / 100
            return self.price - discount_amount
        return self.price

    def __str__(self):
        return f"{self.name} - {self.hotel.name}"


# Import image models so they are registered with Django
from .image_models import HotelImage, RoomImage
