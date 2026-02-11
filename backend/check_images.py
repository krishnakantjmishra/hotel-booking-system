
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.files.storage import default_storage
print(f"Active Storage Backend: {default_storage.__class__}")
# In newer Django, we might need to check the 'default' storage in STORAGES
try:
    from django.conf import settings
    print(f"DEFAULT_FILE_STORAGE: {settings.DEFAULT_FILE_STORAGE}")
except AttributeError:
    print("DEFAULT_FILE_STORAGE not set")

print(f"Media URL: {settings.MEDIA_URL}")

from hotels.models import Hotel
from hotels.image_models import HotelImage, RoomImage

print("--- Hotels ---")
for h in Hotel.objects.all():
    print(f"ID: {h.id}, Name: {h.name}")

print("--- Hotel Images ---")
for img in HotelImage.objects.all():
    print(f"ID: {img.id}, Hotel: {img.hotel.name}, Path: {img.image.name}, URL: {img.image.url}")

print("\n--- Room Images ---")
for img in RoomImage.objects.all():
    print(f"ID: {img.id}, Room: {img.room.room_name}, Path: {img.image.name}, URL: {img.image.url}")
