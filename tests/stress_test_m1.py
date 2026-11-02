#!/usr/bin/env python3
"""
Adversarial Stress Test Suite for Milestone 1 (Foundation & Semantic Content)
Author: teamwork_challenger_m1_1
Target: index.html, styles.css, assets/
"""

import os
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLES_CSS = ROOT_DIR / "styles.css"
ASSETS_DIR = ROOT_DIR / "assets"
PROFILE_WEBP = ASSETS_DIR / "images" / "profile.webp"
FAVICON_SVG = ASSETS_DIR / "favicon.svg"
RESUME_PDF = ASSETS_DIR / "resume.pdf"

test_results = []

def record_test(name: str, passed: bool, details: str = ""):
    test_results.append({
        "name": name,
        "passed": passed,
        "details": details
    })
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if details:
        print(f"       Details: {details}")

# ==============================================================================
# 1. HTML PARSING & TAG BALANCING TEST
# ==============================================================================
class StrictTagBalanceParser(HTMLParser):
    VOID_TAGS = {
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    }

    def __init__(self):
        super().__init__()
        self.tag_stack = []
        self.errors = []
        self.ids = set()
        self.duplicate_ids = []
        self.h1_count = 0
        self.uppercase_tags = []

    def handle_starttag(self, tag, attrs):
        lower_tag = tag.lower()
        if tag != lower_tag:
            self.uppercase_tags.append((tag, self.getpos()))

        if lower_tag == 'h1':
            self.h1_count += 1

        for attr, val in attrs:
            if attr.lower() == 'id':
                if val in self.ids:
                    self.duplicate_ids.append((val, self.getpos()))
                else:
                    self.ids.add(val)

        if lower_tag not in self.VOID_TAGS:
            self.tag_stack.append((lower_tag, self.getpos()))

    def handle_endtag(self, tag):
        lower_tag = tag.lower()
        if lower_tag in self.VOID_TAGS:
            self.errors.append(f"Void tag <{tag}> should not have an end tag at {self.getpos()}")
            return

        if not self.tag_stack:
            self.errors.append(f"Unexpected closing tag </{tag}> with empty stack at {self.getpos()}")
            return

        expected_tag, pos = self.tag_stack.pop()
        if expected_tag != lower_tag:
            self.errors.append(
                f"Tag mismatch at {self.getpos()}: expected </{expected_tag}> (opened at {pos}), found </{lower_tag}>"
            )

    def close(self):
        super().close()
        while self.tag_stack:
            tag, pos = self.tag_stack.pop()
            self.errors.append(f"Unclosed tag <{tag}> opened at {pos}")


def test_html_tag_balance():
    content = INDEX_HTML.read_text(encoding='utf-8')
    parser = StrictTagBalanceParser()
    try:
        parser.feed(content)
        parser.close()
    except Exception as e:
        record_test("HTML Parsing Execution", False, f"Parser exception: {e}")
        return

    record_test(
        "HTML Tag Balancing",
        len(parser.errors) == 0,
        f"{len(parser.errors)} errors: {parser.errors[:5]}"
    )
    record_test(
        "HTML Duplicate IDs",
        len(parser.duplicate_ids) == 0,
        f"Duplicates: {parser.duplicate_ids}"
    )
    record_test(
        "HTML Single H1 Tag",
        parser.h1_count == 1,
        f"Found {parser.h1_count} <h1> tags (expected 1)"
    )
    record_test(
        "HTML Tag Case (No uppercase tags)",
        len(parser.uppercase_tags) == 0,
        f"Found uppercase tags: {parser.uppercase_tags[:5]}"
    )

# ==============================================================================
# 2. ADVERSARIAL TYPO DETECTION
# ==============================================================================
def test_typo_detection():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    css_content = STYLES_CSS.read_text(encoding='utf-8')

    known_typos = [
        r'\bdevoleper\b', r'\bdevloper\b', r'\bdeveleper\b', r'\bdevelper\b',
        r'\blangauge\b', r'\blangauges\b',
        r'\bframwork\b', r'\bframworks\b',
        r'\bcertifcate\b', r'\bcertifcates\b',
        r'\bachivement\b', r'\bachivements\b',
        r'\bportflio\b',
        r'\brecruitor\b',
        r'\bfirbase\b',
        r'\bfluter\b',
        r'\bartifical\b',
        r'\binteligence\b',
        r'\bexperiance\b',
        r'\bresponsiv\b',
        r'\blibary\b',
        r'\bdatabse\b',
        r'\bsuccesful\b',
        r'\bcomputre\b',
        r'\bapplicaton\b'
    ]

    found_typos = []
    for pattern in known_typos:
        matches_html = re.findall(pattern, html_content, re.IGNORECASE)
        matches_css = re.findall(pattern, css_content, re.IGNORECASE)
        if matches_html:
            found_typos.append(f"HTML match: {pattern} -> {matches_html}")
        if matches_css:
            found_typos.append(f"CSS match: {pattern} -> {matches_css}")

    record_test(
        "Adversarial Typo Audit",
        len(found_typos) == 0,
        f"Found typos: {found_typos}"
    )

# ==============================================================================
# 3. PRIVACY & PHONE NUMBER LEAK AUDIT
# ==============================================================================
def test_privacy_and_phone_numbers():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    css_content = STYLES_CSS.read_text(encoding='utf-8')

    phone_patterns = [
        r'\+91[\s\-\.]?[6-9]\d{4}[\s\-\.]?\d{5}',
        r'\+91[\s\-\.]?\d{10}',
        r'\b[6-9]\d{9}\b',
        r'tel:[^\s"\'<>]+',
        r'phone\s*[:=]\s*["\']?[+0-9\s\-()]{7,15}'
    ]

    detected_leaks = []
    for pattern in phone_patterns:
        matches = re.finditer(pattern, html_content, re.IGNORECASE)
        for m in matches:
            val = m.group(0)
            detected_leaks.append(f"HTML line match: {val}")

        matches_css = re.finditer(pattern, css_content, re.IGNORECASE)
        for m in matches_css:
            detected_leaks.append(f"CSS match: {m.group(0)}")

    record_test(
        "Privacy Audit (Zero Phone Numbers)",
        len(detected_leaks) == 0,
        f"Detected leaks: {detected_leaks}"
    )

# ==============================================================================
# 4. FORBIDDEN ELEMENTS (PROGRESS BARS & MS OFFICE)
# ==============================================================================
def test_forbidden_elements():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    css_content = STYLES_CSS.read_text(encoding='utf-8')

    # Progress bar checks
    pb_matches_html = re.findall(r'(\bprogress[-_]bar\b|<progress\b|role=["\']progressbar["\'])', html_content, re.IGNORECASE)
    pb_matches_css = re.findall(r'\.progress[-_]bar\b', css_content, re.IGNORECASE)

    record_test(
        "Prohibited Progress Bars (HTML)",
        len(pb_matches_html) == 0,
        f"Found: {pb_matches_html}"
    )
    record_test(
        "Prohibited Progress Bars (CSS)",
        len(pb_matches_css) == 0,
        f"Found: {pb_matches_css}"
    )

    # MS Office checks
    office_patterns = [
        r'\bMS\s+(Word|Excel|PowerPoint|Office|Forms)\b',
        r'\bMicrosoft\s+(Word|Excel|PowerPoint|Office|Forms)\b',
        r'\b(Word|Excel|PowerPoint)\s+skills\b'
    ]
    office_matches = []
    for pat in office_patterns:
        m = re.findall(pat, html_content, re.IGNORECASE)
        if m:
            office_matches.extend(m)

    record_test(
        "Prohibited MS Office Tools",
        len(office_matches) == 0,
        f"Found: {office_matches}"
    )

# ==============================================================================
# 5. PROJECTS SECTION & BUTTON RESTRICTIONS
# ==============================================================================
def test_projects_specification():
    html_content = INDEX_HTML.read_text(encoding='utf-8')

    required_projects = [
        "Namma Nellai",
        "SwiftShare",
        "HabitAI",
        "AI Notes & Productivity App",
        "Car Front Display GPS Tracker",
        "Road Hazard Risk Classifier", # matches Road Safety Hackathon Project
        "Medicine Identification"
    ]

    for proj in required_projects:
        present = proj.lower() in html_content.lower()
        record_test(f"Project Exists: {proj}", present)

    projects_section_match = re.search(r'<section\s+id="projects".*?</section>', html_content, re.DOTALL)
    if not projects_section_match:
        record_test("Projects Section Exists", False, "Could not find <section id='projects'>")
        return

    projects_sec = projects_section_match.group(0)

    # Check addition marker comment
    has_marker = bool(re.search(r'<!--.*?Add\s+new\s+project\s+cards.*?-->', projects_sec, re.IGNORECASE | re.DOTALL))
    record_test("Projects Addition Marker Comment", has_marker, "Comment marking where to add more projects")

    # Extract all project cards
    cards = re.findall(r'<article class="[^"]*\bproject-card\b[^"]*"[^>]*>(.*?)</article>', projects_sec, re.DOTALL)
    record_test("Project Card Count (7 total)", len(cards) == 7, f"Found {len(cards)} project cards (expected 7)")

    allowed_link_projects = ["namma nellai", "ai notes", "gps tracker"]
    unexpected_links = []
    missing_links = []
    card_structure_errors = []

    for idx, card in enumerate(cards):
        title_match = re.search(r'<h3 class="project-title">(.*?)</h3>', card, re.DOTALL)
        title = title_match.group(1).strip() if title_match else f"Unknown-{idx}"

        summary_match = re.search(r'<p class="project-summary">(.*?)</p>', card, re.DOTALL)
        tech_chips = re.findall(r'<span class="tech-chip">(.*?)</span>', card, re.DOTALL)
        bullets = re.findall(r'<li>(.*?)</li>', card, re.DOTALL)

        if not summary_match:
            card_structure_errors.append(f"{title}: missing summary")
        if len(tech_chips) < 2:
            card_structure_errors.append(f"{title}: insufficient tech chips ({len(tech_chips)})")
        if len(bullets) < 2 or len(bullets) > 3:
            card_structure_errors.append(f"{title}: expected 2-3 bullets, found {len(bullets)}")

        links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', card, re.DOTALL)
        action_links = [l for l in links if not l[0].startswith('#')]

        is_allowed = any(p in title.lower() for p in allowed_link_projects)
        if is_allowed:
            if len(action_links) == 0:
                missing_links.append(f"{title}: expected link button, none found")
        else:
            if len(action_links) > 0:
                unexpected_links.append(f"{title}: FORBIDDEN link found: {action_links}")

    record_test(
        "Project Uniform Card Structure (Title, Summary, Chips, Bullets)",
        len(card_structure_errors) == 0,
        f"Errors: {card_structure_errors}"
    )

    record_test(
        "Project Button Strict Restriction (Allowed on 3 only)",
        len(unexpected_links) == 0 and len(missing_links) == 0,
        f"Unexpected links: {unexpected_links}, Missing links: {missing_links}"
    )

    # Check project specific link targets
    nn_link = "nammanellai.online" in projects_sec
    ai_notes_link = "github.com/thiraviyarajr2007-dotcom/AI-Notes" in projects_sec
    gps_link = "github.com/thiraviyarajr2007-dotcom/gps-tracker" in projects_sec
    record_test("Namma Nellai Correct Target URL", nn_link)
    record_test("AI Notes Correct Target URL", ai_notes_link)
    record_test("GPS Tracker Correct Target URL", gps_link)

    # Check no placeholder images
    has_placeholder_img = "via.placeholder.com" in html_content or "placeholder.png" in html_content
    record_test("No External Placeholder Images", not has_placeholder_img)

# ==============================================================================
# 6. SKILLS SECTION CONTENT & CATEGORIES
# ==============================================================================
def test_skills_categories():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    skills_sec = re.search(r'<section\s+id="skills".*?</section>', html_content, re.DOTALL)
    if not skills_sec:
        record_test("Skills Section Exists", False)
        return

    sec_text = skills_sec.group(0)

    # 6 Categories
    skill_groups = re.findall(r'<div class="[^"]*\bskill-group-card\b[^"]*"[^>]*>', sec_text)
    record_test("Skill Group Cards Count (6 total)", len(skill_groups) == 6, f"Found {len(skill_groups)} groups")

    # Match category topics
    categories = [
        ("Languages", "Programming Languages"),
        ("App & Web", "App &amp; Web Development"),
        ("Data & ML", "Data &amp; Machine Learning"),
        ("Security", "Cybersecurity &amp; Systems"),
        ("Tools", "Developer Tools &amp; Platforms"),
        ("Core CS", "Core Computer Science")
    ]

    for short_name, full_name in categories:
        record_test(f"Skill Category: {short_name}", full_name.lower() in sec_text.lower())

    key_skills = [
        "Python", "Java", "C", "JavaScript", "SQL",
        "Flutter", "Kotlin", "Firebase", "React", "Node.js REST APIs", "Responsive Web Design",
        "Pandas", "NumPy", "Matplotlib", "ML fundamentals", "Deep Learning", "Generative AI",
        "Ethical Hacking (CEH)", "Secure Auth Design",
        "Git", "GitHub", "VS Code", "Android Studio", "Google Colab", "Jupyter",
        "DSA", "OOP", "Problem Solving"
    ]

    missing_skills = []
    for s in key_skills:
        if s.lower() not in sec_text.lower():
            missing_skills.append(s)

    # HTML/CSS check
    has_html_css = "html" in sec_text.lower() and "css" in sec_text.lower()
    record_test("Skill HTML/CSS Present", has_html_css)
    record_test("Required Skills Present", len(missing_skills) == 0, f"Missing: {missing_skills}")

# ==============================================================================
# 7. ACHIEVEMENTS & CERTIFICATIONS
# ==============================================================================
def test_achievements_and_certifications():
    html_content = INDEX_HTML.read_text(encoding='utf-8')

    achieve_sec = re.search(r'<section\s+id="achievements".*?</section>', html_content, re.DOTALL)
    cert_sec = re.search(r'<section\s+id="certifications".*?</section>', html_content, re.DOTALL)

    if not achieve_sec or not cert_sec:
        record_test("Achievements & Certifications Sections Exist", False)
        return

    # Count achievements cards
    achieve_cards = re.findall(r'<div class="[^"]*\bachievement-card\b[^"]*"[^>]*>', achieve_sec.group(0))
    record_test("Achievements Count (9 total)", len(achieve_cards) == 9, f"Found {len(achieve_cards)} cards")

    # Check key achievements
    key_achievements = [
        "Samsung Solve for Tomorrow 2026",
        "Central India Hackathon 3.0",
        "TATA Crucible Campus Quiz 2025",
        "National Road Safety Hackathon 2025",
        "GameTrade Hackathon",
        "StratQuest",
        "Equity Research Challenge 2025-26"
    ]
    for ach in key_achievements:
        record_test(f"Achievement Present: {ach}", ach.lower() in achieve_sec.group(0).lower())

    # Count certifications timeline items
    cert_items = re.findall(r'<div class="[^"]*\btimeline-item\b[^"]*"[^>]*>', cert_sec.group(0))
    record_test("Certifications Count (8 total)", len(cert_items) == 8, f"Found {len(cert_items)} items")

    required_certs = [
        "Certified Ethical Hacker",
        "IBM SkillsBuild",
        "Scaler",
        "Google UX Design",
        "Python",
        "Deep Learning Optimization",
        "Cybersecurity Threat Landscape",
        "Joy of Computing using Python"
    ]
    for c in required_certs:
        record_test(f"Cert Present: {c}", c.lower() in cert_sec.group(0).lower())

# ==============================================================================
# 8. CONTACT SECTION & SOCIALS
# ==============================================================================
def test_contact_section():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    contact_sec = re.search(r'<section\s+id="contact".*?</section>', html_content, re.DOTALL)
    if not contact_sec:
        record_test("Contact Section Exists", False)
        return

    sec_text = contact_sec.group(0)

    record_test("Contact Email: thiraviyaraj2007@gmail.com", "thiraviyaraj2007@gmail.com" in sec_text)
    record_test("Contact GitHub: github.com/thiraviyarajr2007-dotcom", "github.com/thiraviyarajr2007-dotcom" in sec_text)

    has_linkedin_todo = "TODO" in sec_text and "LinkedIn" in sec_text
    has_leetcode_todo = "TODO" in sec_text and "LeetCode" in sec_text
    record_test("LinkedIn / LeetCode TODO Markers Present", has_linkedin_todo and has_leetcode_todo)

# ==============================================================================
# 9. SECTION ORDERING & NAVIGATION
# ==============================================================================
def test_section_order():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    section_ids = re.findall(r'<section\s+[^>]*id=["\']([^"\']+)["\']', html_content)
    expected_order = [
        "hero",
        "about",
        "projects",
        "skills",
        "achievements",
        "certifications",
        "contact"
    ]

    record_test(
        "Section Order Compliance",
        section_ids == expected_order,
        f"Found: {section_ids}, Expected: {expected_order}"
    )

    nav_links = re.findall(r'<a\s+[^>]*href=["\']#([^"\']+)["\'][^>]*class=["\']nav-link', html_content)
    record_test(
        "Nav Links Match Sections",
        nav_links == expected_order,
        f"Nav links: {nav_links}"
    )

# ==============================================================================
# 10. RELATIVE ASSET PATHS
# ==============================================================================
def test_relative_paths():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    absolute_matches = re.findall(r'(?:href|src)=["\']/(?![/])([^"\']*)["\']', html_content)
    record_test(
        "Strictly Relative Asset Paths",
        len(absolute_matches) == 0,
        f"Found absolute paths: {absolute_matches}"
    )

# ==============================================================================
# 11. ASSETS PHYSICAL VALIDATION
# ==============================================================================
def test_physical_assets():
    # Profile WebP
    if PROFILE_WEBP.exists():
        size = PROFILE_WEBP.stat().st_size
        record_test("Profile WebP Exists", True)
        record_test("Profile WebP Size (< 80KB)", size < 81920, f"{size} bytes")
        with open(PROFILE_WEBP, 'rb') as f:
            header = f.read(12)
            is_webp = header[:4] == b'RIFF' and header[8:12] == b'WEBP'
            record_test("Profile WebP Magic Header", is_webp)
    else:
        record_test("Profile WebP Exists", False)

    # Favicon SVG
    if FAVICON_SVG.exists():
        record_test("Favicon SVG Exists", True)
        try:
            tree = ET.parse(FAVICON_SVG)
            root = tree.getroot()
            record_test("Favicon SVG Valid XML", root.tag.endswith('svg'))
        except Exception as e:
            record_test("Favicon SVG Valid XML", False, f"XML error: {e}")
    else:
        record_test("Favicon SVG Exists", False)

    # Resume PDF
    if RESUME_PDF.exists():
        record_test("Resume PDF Exists", True)
        with open(RESUME_PDF, 'rb') as f:
            pdf_bytes = f.read()
            valid_pdf = pdf_bytes.startswith(b'%PDF-') and b'%%EOF' in pdf_bytes
            record_test("Resume PDF Header & EOF", valid_pdf, f"Length: {len(pdf_bytes)} bytes")
    else:
        record_test("Resume PDF Exists", False)

# ==============================================================================
# 12. CSS DESIGN SYSTEM & TOKENS AUDIT
# ==============================================================================
def test_css_design_system():
    css_content = STYLES_CSS.read_text(encoding='utf-8')

    required_tokens = [
        "--bg-base", "--bg-surface", "--bg-surface-elevated", "--bg-glass",
        "--text-primary", "--text-secondary", "--text-muted",
        "--accent", "--accent-light", "--accent-dark", "--accent-glow",
        "--border-subtle", "--border-medium", "--border-focus"
    ]

    missing_tokens = [t for t in required_tokens if t not in css_content]
    record_test("CSS Design Tokens Present", len(missing_tokens) == 0, f"Missing: {missing_tokens}")

    has_reduced_motion = "@media (prefers-reduced-motion: reduce)" in css_content
    record_test("CSS Prefers-Reduced-Motion Support", has_reduced_motion)

    for bp in ["360px", "768px", "1280px"]:
        record_test(f"CSS Responsive Breakpoint {bp}", bp in css_content)

    for bento_cls in [".bento-grid", ".bento-card"]:
        record_test(f"CSS Bento Class {bento_cls}", bento_cls in css_content)

# ==============================================================================
# 13. WCAG AA CONTRAST RATIO CALCULATION
# ==============================================================================
def luminance(hex_color: str) -> float:
    hex_color = hex_color.lstrip('#')
    r, g, b = [int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    rgb = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in (r, g, b)]
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]

def contrast_ratio(c1: str, c2: str) -> float:
    l1 = luminance(c1)
    l2 = luminance(c2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def test_wcag_contrast():
    # Dark mode pairs
    # bg: #090d16, text: #f8fafc, text-secondary: #94a3b8
    ratio_dark_primary = contrast_ratio('#090d16', '#f8fafc')
    ratio_dark_secondary = contrast_ratio('#090d16', '#94a3b8')

    # Light mode pairs
    # bg: #f8fafc, text: #0f172a, text-secondary: #334155
    ratio_light_primary = contrast_ratio('#f8fafc', '#0f172a')
    ratio_light_secondary = contrast_ratio('#f8fafc', '#334155')

    record_test("WCAG Contrast: Dark Primary Text (>= 4.5:1)", ratio_dark_primary >= 4.5, f"Ratio: {ratio_dark_primary:.2f}:1")
    record_test("WCAG Contrast: Dark Secondary Text (>= 4.5:1)", ratio_dark_secondary >= 4.5, f"Ratio: {ratio_dark_secondary:.2f}:1")
    record_test("WCAG Contrast: Light Primary Text (>= 4.5:1)", ratio_light_primary >= 4.5, f"Ratio: {ratio_light_primary:.2f}:1")
# ==============================================================================
# 14. HERO SECTION SPECIFICATION TEST
# ==============================================================================
def test_hero_section():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    hero_sec = re.search(r'<section\s+id="hero".*?</section>', html_content, re.DOTALL)
    if not hero_sec:
        record_test("Hero Section Exists", False)
        return

    sec_text = hero_sec.group(0)

    # Name and roles
    record_test("Hero Name: Thiraviaraj R", "Thiraviaraj R" in sec_text)
    record_test("Hero Role: AI/ML Engineer", "AI/ML Engineer" in sec_text)
    record_test("Hero Role: Flutter & Firebase Developer", "Flutter &amp; Firebase Developer" in sec_text or "Flutter & Firebase Developer" in sec_text)
    record_test("Hero Role: Full-stack Builder", "Full-stack Builder" in sec_text)

    # CTAs
    record_test("Hero CTA: View Projects (#projects)", 'href="#projects"' in sec_text)
    record_test("Hero CTA: Download Resume (assets/resume.pdf)", 'href="assets/resume.pdf"' in sec_text)
    record_test("Hero CTA: Contact (#contact)", 'href="#contact"' in sec_text)

    # Stats
    record_test("Hero Stat: CGPA 9.46", "9.46" in sec_text)
    has_7_plus = (('data-target="7"' in sec_text or '>7<' in sec_text) and '+' in sec_text and 'Projects Built' in sec_text)
    record_test("Hero Stat: 7+ Projects Built", has_7_plus)
    record_test("Hero Stat: CEH Certified", "CEH" in sec_text)

# ==============================================================================
# 15. ABOUT SECTION NARRATIVE TEST
# ==============================================================================
def test_about_section():
    html_content = INDEX_HTML.read_text(encoding='utf-8')
    about_sec = re.search(r'<section\s+id="about".*?</section>', html_content, re.DOTALL)
    if not about_sec:
        record_test("About Section Exists", False)
        return

    sec_text = about_sec.group(0)

    record_test("About: Tirunelveli District", "Tirunelveli" in sec_text)
    record_test("About: Farming Family Background", "farming family" in sec_text.lower())
    record_test("About: School Pupil Leader 2022-25", "School Pupil Leader" in sec_text and "2022" in sec_text and "2025" in sec_text)
    record_test("About: Rathinam Technical Campus", "Rathinam Technical Campus" in sec_text)
    record_test("About: CGPA 9.46", "9.46" in sec_text)
    record_test("About: No 'Thank You' Text", "thank you" not in sec_text.lower())

# ==============================================================================
# 16. METADATA & PERSON JSON-LD SCHEMA TEST
# ==============================================================================
def test_metadata_and_jsonld():
    html_content = INDEX_HTML.read_text(encoding='utf-8')

    # SEO tags
    record_test("Meta Description Present", '<meta name="description"' in html_content)
    record_test("Open Graph Tags Present", '<meta property="og:title"' in html_content and '<meta property="og:image"' in html_content)
    record_test("Twitter Card Tags Present", '<meta name="twitter:card"' in html_content)
    record_test("Favicon SVG Link Present", 'href="assets/favicon.svg"' in html_content)

    # JSON-LD Schema
    json_ld_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', html_content, re.DOTALL)
    if json_ld_match:
        import json
        try:
            data = json.loads(json_ld_match.group(1))
            record_test("Person JSON-LD Valid JSON", True)
            record_test("Person JSON-LD Type 'Person'", data.get("@type") == "Person")
            record_test("Person JSON-LD Name 'Thiraviaraj R'", data.get("name") == "Thiraviaraj R")
            record_test("Person JSON-LD Email Present", "mailto:thiraviyaraj2007@gmail.com" in data.get("email", ""))
        except Exception as e:
            record_test("Person JSON-LD Valid JSON", False, f"JSON decode error: {e}")
    else:
        record_test("Person JSON-LD Script Present", False)


def main():
    print("=" * 80)
    print("STARTING ADVERSARIAL EMPIRICAL STRESS TEST (MILESTONE 1)")
    print("=" * 80)

    test_html_tag_balance()
    test_typo_detection()
    test_privacy_and_phone_numbers()
    test_forbidden_elements()
    test_projects_specification()
    test_skills_categories()
    test_achievements_and_certifications()
    test_contact_section()
    test_section_order()
    test_relative_paths()
    test_physical_assets()
    test_css_design_system()
    test_wcag_contrast()
    test_hero_section()
    test_about_section()
    test_metadata_and_jsonld()

    print("=" * 80)
    total_tests = len(test_results)
    passed_tests = sum(1 for t in test_results if t["passed"])
    failed_tests = total_tests - passed_tests

    print(f"TOTAL TESTS: {total_tests}")
    print(f"PASSED:      {passed_tests}")
    print(f"FAILED:      {failed_tests}")

    if failed_tests > 0:
        print("\nFAILURE SUMMARY:")
        for t in test_results:
            if not t["passed"]:
                print(f"  - {t['name']}: {t['details']}")
        print("VERDICT: REJECT")
        sys.exit(1)
    else:
        print("\nALL STRESS TESTS PASSED SUCCESSFULLY.")
        print("VERDICT: APPROVE")
        sys.exit(0)

if __name__ == '__main__':
    main()
