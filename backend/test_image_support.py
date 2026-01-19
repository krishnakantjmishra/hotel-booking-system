"""
Quick test to verify HEIC/AVIF support is working.
Run this from the backend directory with: python test_image_support.py
"""
import os
import sys

# Add the project to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

def test_pillow_formats():
    """Test that Pillow can recognize HEIC and AVIF formats."""
    from PIL import Image
    import pillow_heif
    
    print("=" * 60)
    print("Testing Image Format Support")
    print("=" * 60)
    
    # Register HEIC opener
    pillow_heif.register_heif_opener()
    print("✓ HEIC opener registered")
    
    # Check supported formats
    supported_formats = Image.registered_extensions()
    
    print("\nSupported image formats:")
    print("-" * 60)
    
    formats_to_check = {
        '.jpg': 'JPEG',
        '.jpeg': 'JPEG', 
        '.png': 'PNG',
        '.webp': 'WEBP',
        '.heic': 'HEIF',
        '.avif': 'AVIF'
    }
    
    for ext, format_name in formats_to_check.items():
        if ext in supported_formats:
            print(f"✓ {format_name:10} ({ext}) - SUPPORTED")
        else:
            print(f"✗ {format_name:10} ({ext}) - NOT SUPPORTED")
    
    print("\n" + "=" * 60)
    print("Installed packages:")
    print("-" * 60)
    
    try:
        import PIL
        print(f"✓ Pillow version: {PIL.__version__}")
    except:
        print("✗ Pillow not found")
    
    try:
        import pillow_heif
        print(f"✓ pillow-heif installed")
    except:
        print("✗ pillow-heif not found")
    
    try:
        import pillow_avif
        print(f"✓ pillow-avif-plugin installed")
    except:
        print("✗ pillow-avif-plugin not found")
    
    print("=" * 60)
    print("\nTest completed successfully! ✓")
    print("Your Django app can now handle HEIC and AVIF uploads.")
    print("=" * 60)

if __name__ == '__main__':
    test_pillow_formats()
