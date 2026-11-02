#!/usr/bin/env python3
"""
generate_missing_assets.py
Author: teamwork_explorer_m1_it2_2
Purpose: Generates valid, ultra-lightweight assets for:
  1. assets/favicon.ico (multi-res 32x32 & 16x16 ICO monogram matching assets/favicon.svg, ~1KB)
  2. assets/projects/<slug>.webp (7 sleek 16:9 device mockup covers, ~2.5KB each, ~18KB total)
Eliminates all 8 HTTP 404 network errors while strictly honoring the transfer budget and ORIGINAL_REQUEST.md.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw

def generate_all_missing_assets(target_root: Path = None):
    if target_root is None:
        # Default to repo root
        target_root = Path(__file__).resolve().parent.parent.parent.parent

    assets_dir = target_root / "assets"
    projects_dir = assets_dir / "projects"
    projects_dir.mkdir(parents=True, exist_ok=True)

    print(f"Target Assets Directory: {assets_dir}")

    # =========================================================================
    # 1. GENERATE assets/favicon.ico (Multi-size 32x32 and 16x16)
    # =========================================================================
    favicon_path = assets_dir / "favicon.ico"
    
    # 32x32 master canvas
    img32 = Image.new("RGBA", (32, 32), (11, 15, 25, 255))
    d32 = ImageDraw.Draw(img32)
    # Squircle border with subtle indigo glow
    d32.rounded_rectangle([1, 1, 30, 30], radius=6, outline=(99, 102, 241, 180), width=1)
    # 'T' Monogram Component
    d32.line([(6, 8), (17, 8)], fill=(129, 140, 248, 255), width=2)
    d32.line([(11, 8), (11, 23)], fill=(129, 140, 248, 255), width=2)
    # 'R' Monogram Component
    d32.line([(18, 8), (18, 23)], fill=(248, 250, 252, 255), width=2)
    d32.line([(18, 8), (23, 8)], fill=(248, 250, 252, 255), width=2)
    d32.line([(23, 8), (25, 11), (25, 14), (23, 16), (18, 16)], fill=(248, 250, 252, 255), width=2)
    d32.line([(22, 16), (25, 23)], fill=(248, 250, 252, 255), width=2)
    # AI/ML Accent Dot
    d32.point([(26, 6)], fill=(236, 72, 153, 255))

    # 16x16 crisp small icon
    img16 = Image.new("RGBA", (16, 16), (11, 15, 25, 255))
    d16 = ImageDraw.Draw(img16)
    d16.rectangle([0, 0, 15, 15], outline=(99, 102, 241, 200), width=1)
    d16.line([(3, 4), (8, 4)], fill=(129, 140, 248, 255), width=1)
    d16.line([(5, 4), (5, 12)], fill=(129, 140, 248, 255), width=1)
    d16.line([(9, 4), (9, 12)], fill=(248, 250, 252, 255), width=1)
    d16.line([(9, 4), (12, 4)], fill=(248, 250, 252, 255), width=1)
    d16.line([(12, 4), (13, 6), (12, 8), (9, 8)], fill=(248, 250, 252, 255), width=1)
    d16.line([(11, 8), (13, 12)], fill=(248, 250, 252, 255), width=1)

    img32.save(favicon_path, format="ICO", sizes=[(32, 32), (16, 16)])
    print(f"Generated {favicon_path.name}: {favicon_path.stat().st_size:,} bytes")

    # =========================================================================
    # 2. GENERATE 7 Project WebP Mockup Covers
    # =========================================================================
    projects = [
        (
            "namma-nellai.webp",
            "Namma Nellai",
            "Civic Transit Utility",
            (13, 43, 38),   # Emerald dark
            (9, 26, 36),    # Deep slate
            (16, 185, 129), # Emerald accent
        ),
        (
            "swiftshare.webp",
            "SwiftShare",
            "P2P Wi-Fi Direct",
            (30, 27, 75),   # Indigo dark
            (11, 15, 25),   # Deep obsidian
            (139, 92, 246), # Violet accent
        ),
        (
            "habitai.webp",
            "HabitAI",
            "Behavioral Analytics",
            (46, 16, 101),  # Purple dark
            (15, 23, 42),   # Midnight
            (217, 70, 239), # Fuchsia accent
        ),
        (
            "ai-notes.webp",
            "AI Notes & Productivity",
            "Task Synthesis & Agenda",
            (30, 41, 59),   # Slate
            (15, 23, 42),   # Midnight
            (99, 102, 241), # Electric indigo accent
        ),
        (
            "gps-tracker.webp",
            "Car Front Display GPS",
            "Telematics Heads-Up Display",
            (4, 47, 46),    # Cyan dark
            (2, 6, 23),     # Obsidian
            (6, 182, 212),  # Cyan HUD accent
        ),
        (
            "road-safety.webp",
            "Road Hazard Classifier",
            "Predictive Risk Scoring",
            (69, 26, 3),    # Amber dark
            (24, 24, 27),   # Charcoal
            (245, 158, 11), # Amber alert accent
        ),
        (
            "medicine-chem-platform.webp",
            "Medicine Identification",
            "Therapeutic Properties DB",
            (8, 51, 68),    # Medical ocean dark
            (15, 23, 42),   # Midnight
            (56, 189, 248), # Sky blue accent
        ),
    ]

    total_webp_bytes = 0
    w, h = 640, 360  # Standard 16:9 ratio matching .project-media

    for slug, title, subtitle, grad_start, grad_end, accent_color in projects:
        img = Image.new("RGB", (w, h), grad_start)
        draw = ImageDraw.Draw(img)

        # Smooth vertical gradient
        r1, g1, b1 = grad_start
        r2, g2, b2 = grad_end
        for y in range(h):
            t = y / (h - 1)
            r = int(r1 + (r2 - r1) * t)
            g = int(g1 + (g2 - g1) * t)
            b = int(b1 + (b2 - b1) * t)
            draw.line([(0, y), (w, y)], fill=(r, g, b))

        # Subtle geometric grid pattern
        for x in range(0, w, 40):
            draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 8))
        for y in range(0, h, 40):
            draw.line([(0, y), (w, y)], fill=(255, 255, 255, 8))

        # Device Mockup Window
        fx, fy, fw, fh = 40, 35, 560, 290
        draw.rounded_rectangle([fx, fy, fx + fw, fy + fh], radius=12, fill=(15, 23, 42), outline=(255, 255, 255, 40), width=1)

        # Window Title bar
        draw.rectangle([fx, fy, fx + fw, fy + 32], fill=(24, 32, 47))
        # Traffic light buttons
        draw.ellipse([fx + 14, fy + 11, fx + 24, fy + 21], fill=(239, 68, 68))
        draw.ellipse([fx + 30, fy + 11, fx + 40, fy + 21], fill=(245, 158, 11))
        draw.ellipse([fx + 46, fy + 11, fx + 56, fy + 21], fill=(16, 185, 129))

        # Mock Address Pill
        draw.rounded_rectangle([fx + 70, fy + 8, fx + 360, fy + 24], radius=4, fill=(15, 23, 42), outline=(255, 255, 255, 30), width=1)

        # Inner Wireframe Elements
        # Sidebar
        draw.rounded_rectangle([fx + 16, fy + 44, fx + 110, fy + fh - 16], radius=6, fill=(24, 32, 47))
        # Hero Banner with Project Accent Tint
        draw.rounded_rectangle([fx + 124, fy + 44, fx + fw - 16, fy + 110], radius=8, fill=accent_color)

        # Content Grid Cards
        card_w = (fw - 16 - 124 - 12) // 2
        draw.rounded_rectangle([fx + 124, fy + 122, fx + 124 + card_w, fy + fh - 16], radius=6, fill=(24, 32, 47))
        draw.rounded_rectangle([fx + 124 + card_w + 12, fy + 122, fx + fw - 16, fy + fh - 16], radius=6, fill=(24, 32, 47))

        # Save to WebP
        out_file = projects_dir / slug
        img.save(out_file, format="WEBP", quality=70, method=6)
        file_size = out_file.stat().st_size
        total_webp_bytes += file_size
        print(f"Generated {slug}: {file_size:,} bytes")

    print(f"\nSuccessfully generated 1 favicon.ico + 7 project WebP mockups!")
    print(f"Total 7 WebP size: {total_webp_bytes:,} bytes ({total_webp_bytes / 1024:.2f} KB)")
    print(f"Average WebP size: {total_webp_bytes / 7 / 1024:.2f} KB/file")

if __name__ == "__main__":
    generate_all_missing_assets()

