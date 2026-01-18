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
    image = serializers.FileField()
    alt_text = serializers.CharField(max_length=255, required=False, default='')
    is_primary = serializers.BooleanField(required=False, default=False)
    order = serializers.IntegerField(required=False, default=0)

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(f'Image size must be under 5MB. Current: {value.size / (1024*1024):.2f}MB')
        
        # Check file extension
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'avif']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f'Invalid file type. Allowed: {", ".join(allowed_extensions)}')

        # Manually verify it's an image since we're using FileField
        from PIL import Image
        import io
        from django.core.files.base import ContentFile

        try:
            # We must open and verify to ensure it's a valid image
            img = Image.open(value)
            # Use load() to ensure the image data is actually readable/not corrupted
            img.load()
            value.seek(0)
            # Re-open/Refresh for actual processing
            img = Image.open(value)
        except Exception as e:
            err_msg = str(e)
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Image validation failed: {err_msg}")
            print(f"DEBUG: Image validation failed: {err_msg}")
            raise serializers.ValidationError(f"Unsupported format or corrupted file ({err_msg}). Please try another image.")
        
        # Convert HEIC to JPEG for better browser compatibility
        if ext == 'heic':
            from PIL import Image
            import io
            from django.core.files.base import ContentFile
            
            try:
                img = Image.open(value)
                buffer = io.BytesIO()
                img.convert('RGB').save(buffer, format='JPEG', quality=95)
                
                # Create a new ContentFile with the same name but .jpg extension
                new_filename = value.name.rsplit('.', 1)[0] + '.jpg'
                value = ContentFile(buffer.getvalue(), name=new_filename)
            except Exception as e:
                raise serializers.ValidationError(f"Could not process HEIC image: {str(e)}")
        
        return value


class RoomImageUploadSerializer(serializers.Serializer):
    """Serializer for uploading room images."""
    image = serializers.FileField()
    alt_text = serializers.CharField(max_length=255, required=False, default='')
    is_primary = serializers.BooleanField(required=False, default=False)
    order = serializers.IntegerField(required=False, default=0)

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError(f'Image size must be under 5MB. Current: {value.size / (1024*1024):.2f}MB')
        
        # Check file extension
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'avif']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f'Invalid file type. Allowed: {", ".join(allowed_extensions)}')

        # Manually verify it's an image since we're using FileField
        from PIL import Image
        import io
        from django.core.files.base import ContentFile

        try:
            img = Image.open(value)
            img.load()
            value.seek(0)
            img = Image.open(value)
        except Exception as e:
            err_msg = str(e)
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Image validation failed: {err_msg}")
            print(f"DEBUG: Image validation failed: {err_msg}")
            raise serializers.ValidationError(f"Unsupported format or corrupted file ({err_msg}). Please try another image.")
        
        # Convert HEIC to JPEG for better browser compatibility
        if ext == 'heic':
            from PIL import Image
            import io
            from django.core.files.base import ContentFile
            
            try:
                img = Image.open(value)
                buffer = io.BytesIO()
                img.convert('RGB').save(buffer, format='JPEG', quality=95)
                
                # Create a new ContentFile with the same name but .jpg extension
                new_filename = value.name.rsplit('.', 1)[0] + '.jpg'
                value = ContentFile(buffer.getvalue(), name=new_filename)
            except Exception as e:
                raise serializers.ValidationError(f"Could not process HEIC image: {str(e)}")
        
        return value
