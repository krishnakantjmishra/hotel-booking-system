from django.db import models

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
