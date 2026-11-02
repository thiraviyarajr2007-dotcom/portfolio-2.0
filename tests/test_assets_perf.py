"""
Empirical Asset & Performance Adversarial Stress Test Suite
Author: teamwork_challenger_m1_2
Target: Portfolio 2.0 Rebuild (Thiraviaraj R)
Scope:
  1. Transfer Size Budget (< 300KB for index.html + styles.css)
  2. Profile WebP Integrity & Budget (< 80KB, valid binary WebP)
  3. Asset Path Integrity (Zero 404s for relative links/assets in index.html and styles.css)
  4. WCAG AA Color Contrast (4.5:1 body, 3:1 UI/large text in dark and light modes)
  5. prefers-reduced-motion Complete Overrides
"""

import os
import sys
import re
import struct
import gzip
from pathlib import Path
from html.parser import HTMLParser
import json

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLES_CSS = ROOT_DIR / "styles.css"
PROFILE_WEBP = ROOT_DIR / "assets" / "images" / "profile.webp"

passed_tests = []
failed_tests = []
warnings = []

def report(name, status, details):
    if status == "PASS":
        passed_tests.append((name, details))
        print(f"[PASS] {name}: {details}")
    elif status == "FAIL":
        failed_tests.append((name, details))
        print(f"[FAIL] {name}: {details}")
    else:
        warnings.append((name, details))
        print(f"[WARN] {name}: {details}")

# ==============================================================================
# TEST 1: FILE BUDGET CHECK
# ==============================================================================
def test_file_budget():
    print("\n--- Test 1: File Transfer Budget Check ---")
    if not INDEX_HTML.exists():
        report("index.html exists", "FAIL", f"File not found at {INDEX_HTML}")
        return
    if not STYLES_CSS.exists():
        report("styles.css exists", "FAIL", f"File not found at {STYLES_CSS}")
        return

    html_size = INDEX_HTML.stat().st_size
    css_size = STYLES_CSS.stat().st_size
    total_size = html_size + css_size
    total_kb = total_size / 1024

    html_content = INDEX_HTML.read_bytes()
    css_content = STYLES_CSS.read_bytes()
    gzip_total = len(gzip.compress(html_content)) + len(gzip.compress(css_content))
    gzip_kb = gzip_total / 1024

    details = (f"index.html={html_size:,} bytes ({html_size/1024:.2f} KB), "
               f"styles.css={css_size:,} bytes ({css_size/1024:.2f} KB), "
               f"Total={total_size:,} bytes ({total_kb:.2f} KB), "
               f"Gzipped={gzip_total:,} bytes ({gzip_kb:.2f} KB)")
    
    # Requirement: transfer size < 300KB
    if total_size < 300 * 1024:
        report("File Transfer Budget (< 300KB)", "PASS", details)
    else:
        report("File Transfer Budget (< 300KB)", "FAIL", 
               f"Exceeded 300KB limit: {details}")

    # Project target: ~180KB
    if total_size <= 180 * 1024:
        report("File Target Budget (<= 180KB)", "PASS", f"Under 180KB ceiling ({total_kb:.2f} KB)")
    else:
        report("File Target Budget (<= 180KB)", "WARN", f"Above 180KB ideal target: {total_kb:.2f} KB (but within 300KB max)")

# ==============================================================================
# TEST 2: IMAGE CHECK (assets/images/profile.webp)
# ==============================================================================
def test_image_webp():
    print("\n--- Test 2: Profile Image WebP Check ---")
    if not PROFILE_WEBP.exists():
        report("Profile WebP Exists", "FAIL", f"File not found at {PROFILE_WEBP}")
        return

    size_bytes = PROFILE_WEBP.stat().st_size
    size_kb = size_bytes / 1024
    details_size = f"{size_bytes:,} bytes ({size_kb:.2f} KB)"

    # Budget check (< 80KB = 81,920 bytes)
    if size_bytes < 80 * 1024:
        report("Profile WebP Size Budget (< 80KB)", "PASS", details_size)
    else:
        report("Profile WebP Size Budget (< 80KB)", "FAIL", f"Exceeds 80KB: {details_size}")

    # Binary WebP validation
    data = PROFILE_WEBP.read_bytes()
    if len(data) < 12:
        report("Profile WebP Header", "FAIL", "File too short to be WebP")
        return

    riff_header = data[0:4]
    file_size_field = struct.unpack('<I', data[4:8])[0]
    webp_header = data[8:12]

    if riff_header == b'RIFF' and webp_header == b'WEBP':
        chunk_type = data[12:16].decode('latin-1', errors='ignore')
        report("Profile WebP Binary RIFF Header", "PASS", 
               f"Valid RIFF/WEBP container, primary chunk '{chunk_type}', payload size {file_size_field:,} bytes")
    else:
        report("Profile WebP Binary RIFF Header", "FAIL", 
               f"Invalid magic bytes: riff={riff_header}, webp={webp_header}")

    # Optional Pillow check
    try:
        from PIL import Image
        with Image.open(PROFILE_WEBP) as img:
            report("Pillow WebP Decoding", "PASS", 
                   f"Decoded successfully: format={img.format}, size={img.size}, mode={img.mode}")
    except ImportError:
        report("Pillow WebP Decoding", "WARN", "Pillow not installed in environment; binary parsing passed")
    except Exception as e:
        report("Pillow WebP Decoding", "FAIL", f"Pillow failed to decode image: {e}")

# ==============================================================================
# TEST 3: ASSET PATH INTEGRITY (Zero 404s)
# ==============================================================================
class AssetExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.asset_paths = []
        self.json_ld_contents = []
        self.in_script = False
        self.script_type = None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        # Check href on link and a
        if tag == "link" and "href" in attrs_dict:
            self.asset_paths.append((tag, "href", attrs_dict["href"]))
        elif tag == "a" and "href" in attrs_dict:
            self.asset_paths.append((tag, "href", attrs_dict["href"]))
        elif tag == "script":
            if "src" in attrs_dict:
                self.asset_paths.append((tag, "src", attrs_dict["src"]))
            self.in_script = True
            self.script_type = attrs_dict.get("type", "")
        elif tag == "img" and "src" in attrs_dict:
            self.asset_paths.append((tag, "src", attrs_dict["src"]))
        elif tag in ("source", "video", "audio") and "src" in attrs_dict:
            self.asset_paths.append((tag, "src", attrs_dict["src"]))
        elif tag == "meta" and attrs_dict.get("property") in ("og:image", "og:image:secure_url") and "content" in attrs_dict:
            self.asset_paths.append((tag, "content", attrs_dict["content"]))
        elif tag == "meta" and attrs_dict.get("name") in ("twitter:image",) and "content" in attrs_dict:
            self.asset_paths.append((tag, "content", attrs_dict["content"]))

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False
            self.script_type = None

    def handle_data(self, data):
        if self.in_script and self.script_type == "application/ld+json":
            self.json_ld_contents.append(data)

def is_relative_local_path(val):
    val = val.strip()
    if not val:
        return False
    # Skip fragments, protocols, mailto, tel, javascript, data URLs
    if val.startswith(('#', 'http://', 'https://', '//', 'mailto:', 'tel:', 'javascript:', 'data:')):
        return False
    return True

def test_asset_paths():
    print("\n--- Test 3: Asset Path Check (Zero 404s) ---")
    if not INDEX_HTML.exists():
        return

    content = INDEX_HTML.read_text(encoding="utf-8")
    parser = AssetExtractor()
    parser.feed(content)

    # Also parse JSON-LD
    for raw_json in parser.json_ld_contents:
        try:
            parsed = json.loads(raw_json)
            if "image" in parsed and isinstance(parsed["image"], str):
                parser.asset_paths.append(("json-ld", "image", parsed["image"]))
        except Exception:
            pass

    # Regex search for any missed url(...) in inline styles or tags
    inline_urls = re.findall(r'url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)', content)
    for u in inline_urls:
        parser.asset_paths.append(("style-url", "url", u))

    missing_paths = []
    found_paths = []

    for tag, attr, path_val in parser.asset_paths:
        clean_path = path_val.split('?')[0].split('#')[0].strip()
        if not is_relative_local_path(clean_path):
            continue

        resolved = (ROOT_DIR / clean_path).resolve()
        if resolved.exists():
            found_paths.append((tag, attr, clean_path, resolved))
        else:
            missing_paths.append((tag, attr, clean_path, resolved))

    # Also check styles.css for url(...) references
    if STYLES_CSS.exists():
        css_text = STYLES_CSS.read_text(encoding="utf-8")
        css_urls = re.findall(r'url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)', css_text)
        for u in css_urls:
            clean_path = u.split('?')[0].split('#')[0].strip()
            if is_relative_local_path(clean_path):
                resolved = (ROOT_DIR / clean_path).resolve()
                if resolved.exists():
                    found_paths.append(("css", "url", clean_path, resolved))
                else:
                    missing_paths.append(("css", "url", clean_path, resolved))

    if missing_paths:
        details = f"{len(missing_paths)} broken/missing relative paths found:\n"
        for tag, attr, clean_path, resolved in missing_paths:
            details += f"  - <{tag} {attr}=\"{clean_path}\"> => File not found at {resolved}\n"
        report("Relative Asset Paths (Zero 404s)", "FAIL", details.strip())
    else:
        report("Relative Asset Paths (Zero 404s)", "PASS", 
               f"All {len(found_paths)} referenced relative paths exist on disk without 404s.")

# ==============================================================================
# TEST 4: WCAG AA CONTRAST CHECK
# ==============================================================================
def hex_to_rgb(hex_str):
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c * 2 for c in hex_str)
    if len(hex_str) == 6:
        return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    if len(hex_str) == 8:
        # RGBA - ignoring alpha for simple hex
        return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))
    raise ValueError(f"Invalid hex: {hex_str}")

def parse_rgba(rgba_str):
    m = re.match(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d\.]+))?\s*\)', rgba_str)
    if m:
        r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
        a = float(m.group(4)) if m.group(4) is not None else 1.0
        return (r, g, b, a)
    return None

def blend_rgba_over_rgb(rgba, bg_rgb):
    r, g, b, a = rgba
    bg_r, bg_g, bg_b = bg_rgb
    out_r = round(r * a + bg_r * (1.0 - a))
    out_g = round(g * a + bg_g * (1.0 - a))
    out_b = round(b * a + bg_b * (1.0 - a))
    return (out_r, out_g, out_b)

def srgb_channel_to_linear(c):
    s = c / 255.0
    if s <= 0.04045:
        return s / 12.92
    return ((s + 0.055) / 1.055) ** 2.4

def relative_luminance(rgb):
    r_lin = srgb_channel_to_linear(rgb[0])
    g_lin = srgb_channel_to_linear(rgb[1])
    b_lin = srgb_channel_to_linear(rgb[2])
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin

def contrast_ratio(rgb1, rgb2):
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def parse_css_vars(css_text, selector):
    # Extract declarations inside selector
    pattern = re.escape(selector) + r'\s*\{([^}]+)\}'
    matches = re.findall(pattern, css_text, re.DOTALL)
    tokens = {}
    for block in matches:
        for line in block.split(';'):
            line = line.strip()
            if line.startswith('--') and ':' in line:
                key, val = line.split(':', 1)
                tokens[key.strip()] = val.strip()
    return tokens

def test_contrast():
    print("\n--- Test 4: WCAG AA Color Contrast Audit ---")
    if not STYLES_CSS.exists():
        return

    css_text = STYLES_CSS.read_text(encoding="utf-8")

    # Tokens defined in :root or [data-theme="dark"]
    root_tokens = parse_css_vars(css_text, ":root")
    dark_tokens = parse_css_vars(css_text, '[data-theme="dark"]')
    # Merge root and dark
    merged_dark = {**root_tokens, **dark_tokens}

    light_tokens = parse_css_vars(css_text, '[data-theme="light"]')
    merged_light = {**root_tokens, **light_tokens}

    # Helper to resolve hex/rgb
    def resolve_color(val_str, theme_dict):
        val_str = val_str.strip()
        if val_str.startswith('var('):
            var_name = val_str[4:-1].strip()
            return resolve_color(theme_dict.get(var_name, '#000000'), theme_dict)
        if val_str.startswith('#'):
            return hex_to_rgb(val_str)
        rgba = parse_rgba(val_str)
        if rgba:
            return rgba[:3]
        return None

    # Dark Mode Pairs
    dark_bg_base = resolve_color(merged_dark.get('--bg-base', '#090d16'), merged_dark)
    dark_bg_surface = resolve_color(merged_dark.get('--bg-surface', '#111827'), merged_dark)
    dark_bg_elevated = resolve_color(merged_dark.get('--bg-surface-elevated', '#1a2234'), merged_dark)
    dark_text_primary = resolve_color(merged_dark.get('--text-primary', '#f8fafc'), merged_dark)
    dark_text_secondary = resolve_color(merged_dark.get('--text-secondary', '#94a3b8'), merged_dark)
    dark_text_muted = resolve_color(merged_dark.get('--text-muted', '#64748b'), merged_dark)
    dark_accent = resolve_color(merged_dark.get('--accent', '#6366f1'), merged_dark)
    dark_accent_light = resolve_color(merged_dark.get('--accent-light', '#818cf8'), merged_dark)

    dark_checks = [
        ("Dark: Primary Text on Base BG", dark_text_primary, dark_bg_base, 4.5, "normal"),
        ("Dark: Primary Text on Surface BG", dark_text_primary, dark_bg_surface, 4.5, "normal"),
        ("Dark: Primary Text on Elevated Surface", dark_text_primary, dark_bg_elevated, 4.5, "normal"),
        ("Dark: Secondary Text on Base BG", dark_text_secondary, dark_bg_base, 4.5, "normal"),
        ("Dark: Secondary Text on Surface BG", dark_text_secondary, dark_bg_surface, 4.5, "normal"),
        ("Dark: Muted Text on Base BG", dark_text_muted, dark_bg_base, 4.5, "normal"),
        ("Dark: Muted Text on Surface BG", dark_text_muted, dark_bg_surface, 4.5, "normal"),
        ("Dark: Accent-Light on Base BG", dark_accent_light, dark_bg_base, 4.5, "normal"),
        ("Dark: Accent on Base BG (large/UI)", dark_accent, dark_bg_base, 3.0, "large/UI"),
        ("Dark: White text on Accent Button", (255, 255, 255), dark_accent, 4.5, "normal"),
    ]

    for name, fg, bg, threshold, kind in dark_checks:
        ratio = contrast_ratio(fg, bg)
        details = f"{ratio:.2f}:1 (threshold {threshold}:1 for {kind})"
        if ratio >= threshold:
            report(name, "PASS", details)
        else:
            report(name, "FAIL", f"Contrast too low: {details}")

    # Light Mode Pairs
    light_bg_base = resolve_color(merged_light.get('--bg-base', '#f8fafc'), merged_light)
    light_bg_surface = resolve_color(merged_light.get('--bg-surface', '#ffffff'), merged_light)
    light_bg_elevated = resolve_color(merged_light.get('--bg-surface-elevated', '#f1f5f9'), merged_light)
    light_text_primary = resolve_color(merged_light.get('--text-primary', '#0f172a'), merged_light)
    light_text_secondary = resolve_color(merged_light.get('--text-secondary', '#334155'), merged_light)
    light_text_muted = resolve_color(merged_light.get('--text-muted', '#64748b'), merged_light)
    light_accent = resolve_color(merged_light.get('--accent', '#6366f1'), merged_light)
    light_accent_dark = resolve_color(merged_light.get('--accent-dark', '#4f46e5'), merged_light)
    light_badge_text = resolve_color(merged_light.get('--badge-text', '#4338ca'), merged_light)

    light_checks = [
        ("Light: Primary Text on Base BG", light_text_primary, light_bg_base, 4.5, "normal"),
        ("Light: Primary Text on Surface BG", light_text_primary, light_bg_surface, 4.5, "normal"),
        ("Light: Primary Text on Elevated Surface", light_text_primary, light_bg_elevated, 4.5, "normal"),
        ("Light: Secondary Text on Base BG", light_text_secondary, light_bg_base, 4.5, "normal"),
        ("Light: Secondary Text on Surface BG", light_text_secondary, light_bg_surface, 4.5, "normal"),
        ("Light: Muted Text on Base BG", light_text_muted, light_bg_base, 4.5, "normal"),
        ("Light: Muted Text on Surface BG", light_text_muted, light_bg_surface, 4.5, "normal"),
        ("Light: Accent-Dark on Base BG", light_accent_dark, light_bg_base, 4.5, "normal"),
        ("Light: Badge Text on Surface BG", light_badge_text, light_bg_surface, 4.5, "normal"),
        ("Light: Accent on Base BG (UI/large)", light_accent, light_bg_base, 3.0, "large/UI"),
        ("Light: White text on Accent Button", (255, 255, 255), light_accent, 4.5, "normal"),
    ]

    for name, fg, bg, threshold, kind in light_checks:
        ratio = contrast_ratio(fg, bg)
        details = f"{ratio:.2f}:1 (threshold {threshold}:1 for {kind})"
        if ratio >= threshold:
            report(name, "PASS", details)
        else:
            report(name, "FAIL", f"Contrast too low: {details}")

# ==============================================================================
# TEST 5: PREFERS-REDUCED-MOTION CHECK
# ==============================================================================
def test_reduced_motion():
    print("\n--- Test 5: Prefers-Reduced-Motion Audit ---")
    if not STYLES_CSS.exists():
        return

    css_text = STYLES_CSS.read_text(encoding="utf-8")

    # Find the media query
    match = re.search(r'@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{([\s\S]*?)\n\}', css_text)
    if not match:
        report("prefers-reduced-motion block", "FAIL", "No @media (prefers-reduced-motion: reduce) found in styles.css")
        return

    block_content = match.group(1)

    # Check universal animation and transition kill
    has_universal_anim_duration = "animation-duration:" in block_content and "!important" in block_content
    has_universal_anim_count = "animation-iteration-count:" in block_content and "!important" in block_content
    has_universal_trans_duration = "transition-duration:" in block_content and "!important" in block_content
    has_scroll_behavior = "scroll-behavior: auto" in block_content

    if has_universal_anim_duration and has_universal_anim_count and has_universal_trans_duration and has_scroll_behavior:
        report("Universal Reduced-Motion Reset", "PASS", 
               "Universally resets animation-duration, iteration-count, transition-duration, and scroll-behavior: auto with !important")
    else:
        report("Universal Reduced-Motion Reset", "FAIL", 
               f"Missing reset components: anim_dur={has_universal_anim_duration}, anim_cnt={has_universal_anim_count}, trans_dur={has_universal_trans_duration}, scroll={has_scroll_behavior}")

    # Check scroll-reveal override
    if ".reveal-on-scroll" in block_content and "opacity: 1" in block_content and "transform: none" in block_content:
        report("Scroll-Reveal Reduced-Motion Override", "PASS", "Forces .reveal-on-scroll elements visible (opacity: 1, transform: none)")
    else:
        report("Scroll-Reveal Reduced-Motion Override", "FAIL", ".reveal-on-scroll not properly overridden in reduced-motion query")

    # Check hover/card transform resets
    if "transform: none !important" in block_content and "transition: none !important" in block_content:
        report("Card & Button Hover Transform Reset", "PASS", "Resets transform and transition to none with !important on interactive cards and buttons")
    else:
        report("Card & Button Hover Transform Reset", "FAIL", "Card hover transforms not reset with !important")

def main():
    print("=" * 70)
    print("RUNNING ADVERSARIAL ASSETS & PERFORMANCE STRESS SUITE (M1)")
    print("=" * 70)

    test_file_budget()
    test_image_webp()
    test_asset_paths()
    test_contrast()
    test_reduced_motion()

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total Passed:   {len(passed_tests)}")
    print(f"Total Failed:   {len(failed_tests)}")
    print(f"Total Warnings: {len(warnings)}")

    if failed_tests:
        print("\nFAILURES:")
        for name, details in failed_tests:
            print(f"  - {name}: {details}")
        sys.exit(1)
    else:
        print("\nALL STRESS TESTS PASSED!")
        sys.exit(0)

if __name__ == "__main__":
    main()
