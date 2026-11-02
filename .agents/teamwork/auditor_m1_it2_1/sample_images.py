import os
from PIL import Image

project_slugs = [
    "namma-nellai",
    "swiftshare",
    "habitai",
    "ai-notes",
    "gps-tracker",
    "road-safety",
    "medicine-chem-platform"
]

print("=== IMAGE VISUAL INSPECTION ===")
for slug in project_slugs:
    p = f"assets/projects/{slug}.webp"
    im = Image.open(p)
    w, h = im.size
    # Sample corner, center, top bar, and text/device areas
    c_tl = im.getpixel((10, 10))
    c_tr = im.getpixel((w - 10, 10))
    c_bl = im.getpixel((10, h - 10))
    c_br = im.getpixel((w - 10, h - 10))
    c_mid = im.getpixel((w // 2, h // 2))
    
    print(f"\nFile: {slug}.webp ({w}x{h}, {im.mode})")
    print(f"  Top-left: {c_tl}, Top-right: {c_tr}")
    print(f"  Bottom-left: {c_bl}, Bottom-right: {c_br}")
    print(f"  Center: {c_mid}")
    
    # Check if there is internal structure / borders
    sample_y = [h // 6, h // 4, h // 2, 3 * h // 4]
    row_variations = []
    for y in sample_y:
        pixels_in_row = [im.getpixel((x, y)) for x in range(0, w, 20)]
        unique_in_row = len(set(pixels_in_row))
        row_variations.append(unique_in_row)
    print(f"  Row color variation counts across x at 4 heights: {row_variations}")
