"""
Serializers for Hotel and Room images.
"""
from rest_framework import serializers
from .image_models import HotelImage, RoomImage


class HotelImageSerializer(serializers.ModelSerializer):
    """Serializer for hotel images."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HotelImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary', 'order', 'created_at']
        read_only_fields = ['id', 'image_url', 'created_at']

    def get_image_url(self, obj):
        """Return the full URL of the image."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class RoomImageSerializer(serializers.ModelSerializer):
    """Serializer for room images."""
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RoomImage
        fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary', 'order', 'created_at']
        read_only_fields = ['id', 'image_url', 'created_at']

    def get_image_url(self, obj):
        """Return the full URL of the image."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class HotelImageUploadSerializer(serializers.Serializer):
    """Serializer for uploading hotel images."""
    image = serializers.ImageField()
    alt_text = serializers.CharField(max_length=255, required=False, default='')
    is_primary = serializers.BooleanField(required=False, default=False)
    order = serializers.IntegerField(required=False, default=0)

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(f'Image size must be under 5MB. Current: {value.size / (1024*1024):.2f}MB')
        
        # Check file extension
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f'Invalid file type. Allowed: {", ".join(allowed_extensions)}')
        
        return value


class RoomImageUploadSerializer(serializers.Serializer):
    """Serializer for uploading room images."""
    image = serializers.ImageField()
    alt_text = serializers.CharField(max_length=255, required=False, default='')
    is_primary = serializers.BooleanField(required=False, default=False)
    order = serializers.IntegerField(required=False, default=0)

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(f'Image size must be under 5MB. Current: {value.size / (1024*1024):.2f}MB')
        
        # Check file extension
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f'Invalid file type. Allowed: {", ".join(allowed_extensions)}')
        
        return value
