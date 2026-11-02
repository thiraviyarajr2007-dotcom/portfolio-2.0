import re
import os
import math
from pathlib import Path
from html.parser import HTMLParser

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLES_CSS = ROOT_DIR / "styles.css"
ASSETS_DIR = ROOT_DIR / "assets"

print("=" * 60)
print("INDEPENDENT REVIEWER AUDIT (M1-2)")
print("=" * 60)

# 1. ASSET AUDIT
print("\n--- 1. ASSET AUDIT ---")
profile_webp = ASSETS_DIR / "images" / "profile.webp"
if profile_webp.exists():
    p_size = profile_webp.stat().st_size
    print(f"profile.webp size: {p_size} bytes ({p_size / 1024:.2f} KB) - Budget: < 80 KB (81920 bytes)")
    assert p_size < 81920, f"Profile WebP exceeds 80KB: {p_size}"
    with open(profile_webp, "rb") as f:
        header = f.read(12)
        assert header[:4] == b"RIFF" and header[8:12] == b"WEBP", "Invalid WebP header"
    print("profile.webp: VALID WebP within budget")
else:
    print("profile.webp: MISSING")

favicon_svg = ASSETS_DIR / "favicon.svg"
if favicon_svg.exists():
    f_size = favicon_svg.stat().st_size
    print(f"favicon.svg size: {f_size} bytes")
    svg_text = favicon_svg.read_text(encoding="utf-8")
    assert "<svg" in svg_text and "</svg>" in svg_text, "Invalid SVG structure"
    print("favicon.svg: VALID SVG")
else:
    print("favicon.svg: MISSING")

resume_pdf = ASSETS_DIR / "resume.pdf"
if resume_pdf.exists():
    r_size = resume_pdf.stat().st_size
    print(f"resume.pdf size: {r_size} bytes")
    with open(resume_pdf, "rb") as f:
        pdf_bytes = f.read()
    assert pdf_bytes.startswith(b"%PDF-"), "Invalid PDF header"
    assert b"%%EOF" in pdf_bytes, "Missing %%EOF in PDF"
    print("resume.pdf: VALID PDF binary")
else:
    print("resume.pdf: MISSING")

# Check favicon.ico if referenced
favicon_ico = ASSETS_DIR / "favicon.ico"
print(f"favicon.ico exists: {favicon_ico.exists()}")

# 2. STRICTLY RELATIVE PATHS AUDIT
print("\n--- 2. PATHS AUDIT (Strictly Relative) ---")
html_content = INDEX_HTML.read_text(encoding="utf-8")
css_content = STYLES_CSS.read_text(encoding="utf-8")

# Check for root-relative paths starting with single slash / (excluding //)
root_rel_html = re.findall(r'(?:href|src|content|action)=["\'](/[^/"\'].*?)["\']', html_content)
print(f"Root-relative paths in HTML (e.g. /styles.css): {root_rel_html}")
assert len(root_rel_html) == 0, f"Found root-relative paths in HTML: {root_rel_html}"

# Check all local file references in HTML
all_refs = re.findall(r'(?:href|src)=["\']([^"\'#]+)["\']', html_content)
local_refs = [r for r in all_refs if not r.startswith(('http://', 'https://', 'mailto:', 'data:'))]
print(f"Total local references in index.html: {len(local_refs)}")
for r in sorted(set(local_refs)):
    # verify if file exists or slot exists
    target = ROOT_DIR / r
    exists = target.exists()
    print(f"  {r} -> exists: {exists}")

# Check CSS url() paths
css_urls = re.findall(r'url\s*\(\s*["\']?([^"\'\)]+)["\']?\s*\)', css_content)
css_root_rel = [u for u in css_urls if u.startswith('/') and not u.startswith('//')]
print(f"Root-relative url() in styles.css: {css_root_rel}")
assert len(css_root_rel) == 0, f"Found root-relative url() in CSS: {css_root_rel}"

# 3. WCAG AA CONTRAST AUDIT
print("\n--- 3. WCAG AA CONTRAST AUDIT ---")
def hex_to_rgb(hex_str):
    hex_str = hex_str.strip().lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c * 2 for c in hex_str)
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def relative_luminance(rgb):
    vals = []
    for c in rgb:
        s = c / 255.0
        if s <= 0.03928:
            vals.append(s / 12.92)
        else:
            vals.append(((s + 0.055) / 1.055) ** 2.4)
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2]

def contrast_ratio(hex1, hex2):
    lum1 = relative_luminance(hex_to_rgb(hex1))
    lum2 = relative_luminance(hex_to_rgb(hex2))
    l_max = max(lum1, lum2)
    l_min = min(lum1, lum2)
    return (l_max + 0.05) / (l_min + 0.05)

# Extract CSS variables for theme tokens
dark_tokens = {
    "bg-base": "#090d16",
    "bg-surface": "#0f172a",
    "bg-surface-elevated": "#1e293b",
    "text-primary": "#f8fafc",
    "text-secondary": "#cbd5e1",
    "text-muted": "#94a3b8",
    "accent": "#6366f1",
    "accent-light": "#818cf8",
}

light_tokens = {
    "bg-base": "#f8fafc",
    "bg-surface": "#ffffff",
    "bg-surface-elevated": "#f1f5f9",
    "text-primary": "#0f172a",
    "text-secondary": "#334155",
    "text-muted": "#64748b",
    "accent": "#4f46e5",
    "accent-light": "#6366f1",
}

print("Dark Theme Contrast Pairs:")
for bg_name in ["bg-base", "bg-surface", "bg-surface-elevated"]:
    bg_col = dark_tokens[bg_name]
    for fg_name in ["text-primary", "text-secondary", "text-muted", "accent-light"]:
        fg_col = dark_tokens[fg_name]
        cr = contrast_ratio(bg_col, fg_col)
        status = "PASS (AA Normal 4.5+)" if cr >= 4.5 else ("PASS (AA Large 3.0+)" if cr >= 3.0 else "FAIL (< 3.0)")
        print(f"  {fg_name} ({fg_col}) on {bg_name} ({bg_col}): {cr:.2f}:1 -> {status}")

print("\nLight Theme Contrast Pairs:")
for bg_name in ["bg-base", "bg-surface", "bg-surface-elevated"]:
    bg_col = light_tokens[bg_name]
    for fg_name in ["text-primary", "text-secondary", "text-muted", "accent"]:
        fg_col = light_tokens[fg_name]
        cr = contrast_ratio(bg_col, fg_col)
        status = "PASS (AA Normal 4.5+)" if cr >= 4.5 else ("PASS (AA Large 3.0+)" if cr >= 3.0 else "FAIL (< 3.0)")
        print(f"  {fg_name} ({fg_col}) on {bg_name} ({bg_col}): {cr:.2f}:1 -> {status}")

# 4. PREFERS-REDUCED-MOTION AUDIT
print("\n--- 4. PREFERS-REDUCED-MOTION AUDIT ---")
has_reduced_motion = "@media (prefers-reduced-motion: reduce)" in css_content
print(f"Contains '@media (prefers-reduced-motion: reduce)': {has_reduced_motion}")
if has_reduced_motion:
    idx = css_content.find("@media (prefers-reduced-motion: reduce)")
    block = css_content[idx:idx+1200]
    print("Reduced motion block excerpt:")
    for line in block.splitlines()[:15]:
        print("  ", line)

# 5. RESPONSIVE BREAKPOINTS AUDIT
print("\n--- 5. RESPONSIVE BREAKPOINTS AUDIT ---")
# Check 360px, 768px, 1280px, 1920px
bps = [
    (r'@media\s*\(\s*max-width\s*:\s*(?:360px|480px|640px)', "Mobile / Small Mobile (<640px / 360px)"),
    (r'@media\s*\(\s*max-width\s*:\s*(?:768px|800px|900px)', "Tablet (<768px)"),
    (r'@media\s*\(\s*min-width\s*:\s*(?:768px|769px)', "Desktop / Tablet (>768px)"),
    (r'@media\s*\(\s*min-width\s*:\s*(?:1280px|1200px)', "Large Desktop (1280px)"),
    (r'@media\s*\(\s*min-width\s*:\s*(?:1920px|1600px)', "Ultra-wide (1920px)"),
]

for pattern, label in bps:
    m = re.findall(pattern, css_content, re.IGNORECASE)
    print(f"Breakpoint query '{label}': {len(m)} occurrences found")

# Also find all @media in styles.css
all_media = re.findall(r'@media[^{]+', css_content)
print(f"\nAll media queries defined in styles.css ({len(all_media)}):")
for mq in all_media:
    print(f"  {mq.strip()}")

# 6. SEO METADATA AUDIT
print("\n--- 6. SEO METADATA AUDIT ---")
title_match = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
print(f"Title: {title_match.group(1).strip() if title_match else 'MISSING'}")

meta_desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html_content, re.IGNORECASE)
print(f"Meta Description: {meta_desc.group(1).strip() if meta_desc else 'MISSING'}")

og_tags = re.findall(r'<meta\s+property=["\'](og:[^"\']+)["\']\s+content=["\'](.*?)["\']', html_content, re.IGNORECASE)
print(f"Open Graph Tags ({len(og_tags)}):")
for p, c in og_tags:
    print(f"  {p}: {c}")

tw_tags = re.findall(r'<meta\s+name=["\'](twitter:[^"\']+)["\']\s+content=["\'](.*?)["\']', html_content, re.IGNORECASE)
print(f"Twitter Tags ({len(tw_tags)}):")
for p, c in tw_tags:
    print(f"  {p}: {c}")

json_ld = re.search(r'<script type=["\']application/ld\+json["\']>(.*?)</script>', html_content, re.IGNORECASE | re.DOTALL)
if json_ld:
    print("Person JSON-LD Schema: PRESENT")
    import json
    try:
        schema_data = json.loads(json_ld.group(1).strip())
        print(f"  @type: {schema_data.get('@type')}, name: {schema_data.get('name')}")
        print(f"  knowsAbout count: {len(schema_data.get('knowsAbout', []))}")
        print(f"  sameAs count: {len(schema_data.get('sameAs', []))}")
    except Exception as e:
        print(f"  JSON-LD parse error: {e}")
else:
    print("Person JSON-LD Schema: MISSING")

# 7. DOM & CSS CLASS PARITY AUDIT
print("\n--- 7. DOM & CSS CLASS PARITY AUDIT ---")
html_classes = set()
for m in re.findall(r'class=["\']([^"\']+)["\']', html_content):
    for c in m.split():
        html_classes.add(c)

css_classes = set(re.findall(r'\.([a-zA-Z0-9_\-]+)', css_content))

print(f"Unique classes in index.html: {len(html_classes)}")
print(f"Unique class selectors in styles.css: {len(css_classes)}")

missing_in_css = [c for c in sorted(html_classes) if c not in css_classes]
print(f"Classes in HTML not found in CSS ({len(missing_in_css)}):")
for c in missing_in_css:
    print(f"  .{c}")

# Check key bento / project classes specifically
print("\nSpecific Key Selectors Check:")
for cls in ["bento-grid", "bento-card", "bento-card-narrative", "bento-card-visual", "bento-card-academic", "bento-card-academics", "bento-card-philosophy", "bento-card-pillars"]:
    in_html = cls in html_classes
    in_css = cls in css_classes
    print(f"  .{cls}: HTML={in_html}, CSS={in_css}")

for cls in ["project-card", "project-tech-chips", "tech-chip", "project-bullets", "project-footer"]:
    in_html = cls in html_classes
    in_css = cls in css_classes
    print(f"  .{cls}: HTML={in_html}, CSS={in_css}")

for cls in ["timeline-item", "timeline-card", "timeline-featured", "achievement-card"]:
    in_html = cls in html_classes
    in_css = cls in css_classes
    print(f"  .{cls}: HTML={in_html}, CSS={in_css}")

# 8. PER-SECTION DOM/CSS CLASS PARITY
print("\n--- 8. PER-SECTION DOM/CSS CLASS PARITY ---")
sections = ['header', 'hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact', 'footer']
for sec in sections:
    print(f"\n[SECTION: {sec.upper()}]")
    if sec == 'header':
        m = re.search(r'<header.*?</header>', html_content, re.S)
    elif sec == 'footer':
        m = re.search(r'<footer.*?</footer>', html_content, re.S)
    else:
        m = re.search(rf'<section id="{sec}".*?</section>', html_content, re.S)
    if not m:
        print("  Section element not found in HTML")
        continue
    sec_html = m.group(0)
    classes = set()
    for cm in re.findall(r'class=["\']([^"\']+)["\']', sec_html):
        for c in cm.split():
            classes.add(c)
    unmatched = [c for c in sorted(classes) if c not in css_classes]
    print(f"  Total HTML classes: {len(classes)} | Unmatched in CSS: {len(unmatched)}")
    for u in unmatched:
        print(f"    MISSING IN CSS: .{u}")


