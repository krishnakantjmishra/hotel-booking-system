#!/usr/bin/env python
"""
Diagnostic script to check HEIC/AVIF support on the server.
Run this on EC2: python check_heic_support.py
"""
import sys

print("=" * 70)
print("HEIC/AVIF Support Diagnostic Tool")
print("=" * 70)

# Check 1: Python version
print(f"\n1. Python Version: {sys.version}")

# Check 2: Pillow installation
try:
    from PIL import Image
    print(f"2. ✓ Pillow installed: {Image.__version__ if hasattr(Image, '__version__') else 'version unknown'}")
except ImportError as e:
    print(f"2. ✗ Pillow NOT installed: {e}")
    sys.exit(1)

# Check 3: pillow-heif installation
try:
    import pillow_heif
    print(f"3. ✓ pillow-heif installed")
    
    # Get version if available
    if hasattr(pillow_heif, '__version__'):
        print(f"   Version: {pillow_heif.__version__}")
except ImportError as e:
    print(f"3. ✗ pillow-heif NOT installed: {e}")
    print("\n   FIX: Run 'pip install pillow-heif==1.1.1'")
    sys.exit(1)

# Check 4: pillow-avif-plugin installation
try:
    import pillow_avif
    print(f"4. ✓ pillow-avif-plugin installed")
except ImportError as e:
    print(f"4. ✗ pillow-avif-plugin NOT installed: {e}")
    print("\n   FIX: Run 'pip install pillow-avif-plugin==1.5.2'")

# Check 5: Register HEIC opener
print("\n5. Registering HEIC opener...")
try:
    pillow_heif.register_heif_opener()
    print("   ✓ HEIC opener registered successfully")
except Exception as e:
    print(f"   ✗ Failed to register HEIC opener: {e}")
    sys.exit(1)

# Check 6: Verify supported extensions
print("\n6. Checking supported image formats:")
extensions = Image.registered_extensions()

formats_to_check = {
    '.jpg': 'JPEG',
    '.jpeg': 'JPEG',
    '.png': 'PNG',
    '.webp': 'WEBP',
    '.heic': 'HEIF',
    '.heif': 'HEIF',
    '.avif': 'AVIF'
}

all_supported = True
for ext, expected_format in formats_to_check.items():
    if ext in extensions:
        actual_format = extensions[ext]
        print(f"   ✓ {ext:8} → {actual_format}")
    else:
        print(f"   ✗ {ext:8} → NOT SUPPORTED")
        all_supported = False

# Check 7: Test HEIC opening capability
print("\n7. Testing HEIC format detection:")
try:
    # Check if HEIF format is in the list of available formats
    from PIL import Image
    if 'HEIF' in Image.OPEN:
        print("   ✓ HEIF format handler is registered in Image.OPEN")
    else:
        print("   ✗ HEIF format handler NOT found in Image.OPEN")
        print("   Available formats:", list(Image.OPEN.keys()))
except Exception as e:
    print(f"   ✗ Error checking HEIF handler: {e}")

# Check 8: System libraries
print("\n8. Checking system dependencies:")
try:
    import pillow_heif
    # Try to get libheif info
    print("   ✓ libheif bindings available")
except Exception as e:
    print(f"   ✗ libheif issue: {e}")

print("\n" + "=" * 70)
if all_supported:
    print("✓ ALL CHECKS PASSED - HEIC/AVIF support should work!")
else:
    print("✗ SOME CHECKS FAILED - See errors above")
print("=" * 70)

# Additional diagnostic info
print("\n9. Additional Information:")
print(f"   Pillow OPEN formats: {len(Image.OPEN)} formats registered")
print(f"   Pillow SAVE formats: {len(Image.SAVE)} formats registered")

# Check if we can actually identify HEIC
print("\n10. Format identification test:")
print("    To fully test, upload a HEIC file and check the error message.")
print("    The error should NOT say 'cannot identify image file'")
print("    If it does, the opener registration is failing.")

print("\n" + "=" * 70)
print("Diagnostic complete!")
print("=" * 70)
