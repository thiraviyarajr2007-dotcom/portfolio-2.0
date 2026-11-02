import os
import sys
import math
import re
from PIL import Image

def test_asset_ico(path):
    print(f"\n--- Testing ICO: {path} ---")
    if not os.path.exists(path):
        return False, f"File does not exist: {path}"
    size = os.path.getsize(path)
    print(f"File size: {size} bytes")
    if size < 50:
        return False, f"File is suspiciously small ({size} bytes)"
    
    with open(path, "rb") as f:
        header = f.read(4)
        if header != b"\x00\x00\x01\x00":
            return False, f"Invalid ICO magic bytes: {header.hex()}"
        num_images = int.from_bytes(f.read(2), "little")
        print(f"Embedded icon count in ICO header: {num_images}")
        
    try:
        im = Image.open(path)
        print(f"PIL Image format: {im.format}, size: {im.size}, mode: {im.mode}")
        extrema = im.getextrema()
        print(f"Extrema: {extrema}")
        # Check that it has non-trivial dimensions
        if im.size[0] < 16 or im.size[1] < 16:
            return False, f"ICO image dimensions too small: {im.size}"
        return True, f"Valid ICO ({size} bytes, {im.size}, count={num_images})"
    except Exception as e:
        return False, f"Failed to open ICO with PIL: {e}"

def test_webp_image(path):
    print(f"\n--- Testing WebP: {path} ---")
    if not os.path.exists(path):
        return False, f"File does not exist: {path}"
    size = os.path.getsize(path)
    print(f"File size: {size} bytes")
    if size < 100:
        return False, f"File size too small ({size} bytes)"
    
    with open(path, "rb") as f:
        riff = f.read(4)
        f.seek(8)
        webp = f.read(4)
        if riff != b"RIFF" or webp != b"WEBP":
            return False, f"Invalid WebP RIFF header: riff={riff}, webp={webp}"
            
    try:
        im = Image.open(path)
        print(f"Format: {im.format}, size: {im.size}, mode: {im.mode}")
        if im.format != "WEBP":
            return False, f"PIL detected format {im.format} != WEBP"
        if im.size[0] < 100 or im.size[1] < 100:
            return False, f"Image dimensions suspiciously small: {im.size}"
            
        # Entropy and color diversity analysis
        im_rgb = im.convert("RGB")
        colors = im_rgb.getcolors(maxcolors=2000000)
        num_unique_colors = len(colors) if colors else 2000000
        
        hist = im_rgb.histogram()
        total_pixels = im.size[0] * im.size[1] * 3
        entropy = 0.0
        for count in hist:
            if count > 0:
                p = count / total_pixels
                entropy -= p * math.log2(p)
                
        extrema = im_rgb.getextrema()
        print(f"Unique colors: {num_unique_colors}, Shannon entropy: {entropy:.4f}, Extrema: {extrema}")
        
        if num_unique_colors < 10:
            return False, f"Suspiciously few unique colors ({num_unique_colors}) - likely a blank dummy mock"
        if entropy < 1.0:
            return False, f"Extremely low Shannon entropy ({entropy:.4f}) - likely homogeneous mock"
            
        return True, f"Valid WebP ({size} bytes, {im.size}, {num_unique_colors} colors, entropy={entropy:.2f})"
    except Exception as e:
        return False, f"Failed to inspect WebP: {e}"

def main():
    failures = []
    
    # 1. Favicon.ico
    ok, msg = test_asset_ico("assets/favicon.ico")
    print(f"Result favicon.ico: {ok} -> {msg}")
    if not ok:
        failures.append(f"favicon.ico: {msg}")
        
    # 2. 7 Project WebP files
    project_slugs = [
        "namma-nellai",
        "swiftshare",
        "habitai",
        "ai-notes",
        "gps-tracker",
        "road-safety",
        "medicine-chem-platform"
    ]
    for slug in project_slugs:
        p = f"assets/projects/{slug}.webp"
        ok, msg = test_webp_image(p)
        print(f"Result {slug}.webp: {ok} -> {msg}")
        if not ok:
            failures.append(f"{slug}.webp: {msg}")
            
    # 3. Profile WebP
    ok, msg = test_webp_image("assets/images/profile.webp")
    print(f"Result profile.webp: {ok} -> {msg}")
    if not ok:
        failures.append(f"profile.webp: {msg}")
        
    # 4. Resume PDF
    print("\n--- Testing Resume PDF ---")
    if not os.path.exists("assets/resume.pdf"):
        failures.append("assets/resume.pdf missing")
    else:
        pdf_size = os.path.getsize("assets/resume.pdf")
        with open("assets/resume.pdf", "rb") as f:
            pdf_bytes = f.read()
        if not pdf_bytes.startswith(b"%PDF-"):
            failures.append("assets/resume.pdf does not have %PDF header")
        else:
            print(f"Valid PDF header, size={pdf_size} bytes")

    print(f"\n==========================================")
    print(f"TOTAL ASSET FAILURES: {len(failures)}")
    for f in failures:
        print(f"  FAILED: {f}")
    print(f"==========================================")
    
    if failures:
        sys.exit(1)
    else:
        print("ALL ASSET FORENSIC CHECKS PASSED.")
        sys.exit(0)

if __name__ == "__main__":
    main()
