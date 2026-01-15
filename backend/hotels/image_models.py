"""
Image models for Hotels and Rooms.
Supports multiple images with AWS S3 storage and file size validation.
"""
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


def validate_image_size(file):
    """Validate that image size is under 5MB."""
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'Image size must be under 5MB. Current size: {file.size / (1024*1024):.2f}MB')


def hotel_image_path(instance, filename):
    """Generate upload path for hotel images."""
    return f'hotels/{instance.hotel_id}/images/{filename}'


def room_image_path(instance, filename):
    """Generate upload path for room images."""
    return f'rooms/{instance.room_id}/images/{filename}'


class HotelImage(models.Model):
    """Multiple images for a hotel."""
    hotel = models.ForeignKey(
        'hotels.Hotel',
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(
        upload_to=hotel_image_path,
        validators=[
            validate_image_size,
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
        ]
    )
    alt_text = models.CharField(max_length=255, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Hotel Image'
        verbose_name_plural = 'Hotel Images'

    def save(self, *args, **kwargs):
        # Enforce max 10 images per hotel
        if not self.pk:  # Only check on create
            existing_count = HotelImage.objects.filter(hotel=self.hotel).count()
            if existing_count >= 10:
                raise ValidationError('Maximum 10 images allowed per hotel.')
        
        # If this is set as primary, unset others
        if self.is_primary:
            HotelImage.objects.filter(hotel=self.hotel, is_primary=True).update(is_primary=False)
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.hotel.name} (#{self.order})"


class RoomImage(models.Model):
    """Multiple images for a room."""
    room = models.ForeignKey(
        'hotels.Room',
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(
        upload_to=room_image_path,
        validators=[
            validate_image_size,
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp'])
        ]
    )
    alt_text = models.CharField(max_length=255, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Room Image'
        verbose_name_plural = 'Room Images'

    def save(self, *args, **kwargs):
        # Enforce max 10 images per room
        if not self.pk:  # Only check on create
            existing_count = RoomImage.objects.filter(room=self.room).count()
            if existing_count >= 10:
                raise ValidationError('Maximum 10 images allowed per room.')
        
        # If this is set as primary, unset others
        if self.is_primary:
            RoomImage.objects.filter(room=self.room, is_primary=True).update(is_primary=False)
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.room.room_name} (#{self.order})"
