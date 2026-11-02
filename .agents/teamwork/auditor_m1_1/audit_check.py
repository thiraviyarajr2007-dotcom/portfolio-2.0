import os
import re
from bs4 import BeautifulSoup
from PIL import Image
import pypdf

print("========================================")
print("FORENSIC INTEGRITY AUDIT — MILESTONE 1")
print("========================================")

findings = []
violations = []

# --- 1. ASSET INTEGRITY ---
src_path = 'C29AIML_THIRAVIARAJ R.png'
webp_path = 'assets/images/profile.webp'

if not os.path.exists(webp_path):
    violations.append("CRITICAL: assets/images/profile.webp does not exist.")
else:
    webp_size = os.path.getsize(webp_path)
    src_size = os.path.getsize(src_path)
    print(f"[ASSET] Source PNG size: {src_size} bytes")
    print(f"[ASSET] Target WebP size: {webp_size} bytes ({webp_size / 1024:.2f} KB)")
    
    if webp_size > 81920: # 80 KB
        violations.append(f"WebP exceeds 80KB limit: {webp_size} bytes")
    
    src_img = Image.open(src_path)
    webp_img = Image.open(webp_path)
    print(f"[ASSET] Source dims: {src_img.size}, mode: {src_img.mode}")
    print(f"[ASSET] WebP dims: {webp_img.size}, mode: {webp_img.mode}")
    
    extrema = webp_img.getextrema()
    print(f"[ASSET] WebP channel extrema: {extrema}")
    if extrema == ((0, 0), (0, 0), (0, 0)) or extrema == ((255, 255), (255, 255), (255, 255)):
        violations.append("WebP is blank or monochrome dummy!")

# Favicon SVG
svg_path = 'assets/favicon.svg'
if not os.path.exists(svg_path):
    violations.append("CRITICAL: assets/favicon.svg does not exist.")
else:
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()
    print(f"[ASSET] Favicon SVG size: {len(svg_content)} bytes")
    if '<svg' not in svg_content or '</svg>' not in svg_content:
        violations.append("assets/favicon.svg is not valid SVG markup.")

# Resume PDF
pdf_path = 'assets/resume.pdf'
if not os.path.exists(pdf_path):
    violations.append("CRITICAL: assets/resume.pdf does not exist.")
else:
    pdf_size = os.path.getsize(pdf_path)
    print(f"[ASSET] Resume PDF size: {pdf_size} bytes")
    try:
        reader = pypdf.PdfReader(pdf_path)
        print(f"[ASSET] Resume pages: {len(reader.pages)}")
        pdf_text = reader.pages[0].extract_text()
        if not re.search(r'thiraviaraj', pdf_text, re.I) or "9.46" not in pdf_text:
            violations.append("Resume PDF content does not contain candidate credentials.")
        else:
            print("[ASSET] Resume PDF content verified authentic.")
    except Exception as e:
        violations.append(f"Resume PDF parsing error: {e}")

# Project screenshots directory
proj_dir = 'assets/projects'
if not os.path.isdir(proj_dir):
    violations.append("CRITICAL: assets/projects directory does not exist.")
else:
    print(f"[ASSET] Project screenshot slot dir exists: {os.listdir(proj_dir)}")

# --- 2. HTML SEMANTICS & SECTIONS ---
html_path = 'index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, 'html.parser')

# H1 count
h1_tags = soup.find_all('h1')
print(f"[HTML] H1 tag count: {len(h1_tags)}")
if len(h1_tags) != 1:
    violations.append(f"Expected exactly 1 H1 tag, found {len(h1_tags)}")

# Section order & presence
expected_sections = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact']
sections = soup.find_all('section')
actual_section_ids = [s.get('id') for s in sections if s.get('id') in expected_sections]
print(f"[HTML] Sections found: {actual_section_ids}")
if actual_section_ids != expected_sections:
    violations.append(f"Section order mismatch. Expected {expected_sections}, got {actual_section_ids}")

# Projects
projects = soup.find_all('article', class_=lambda c: c and 'project-card' in c.split())
print(f"[HTML] Project article cards: {len(projects)}")
if len(projects) != 7:
    violations.append(f"Expected 7 project cards, found {len(projects)}")

expected_project_titles = [
    "Namma Nellai",
    "SwiftShare",
    "HabitAI",
    "AI Notes & Productivity App",
    "Car Front Display GPS Tracker",
    "Road Hazard Risk Classifier",
    "Medicine Identification Platform"
]

project_links_count = 0
for i, p in enumerate(projects, 1):
    t_el = p.find(class_=re.compile(r'project-title'))
    t_text = t_el.get_text(strip=True) if t_el else ""
    footer = p.find(class_=re.compile(r'project-footer'))
    links = footer.find_all('a') if footer else []
    project_links_count += len(links)
    bullets = p.find_all('li')
    chips = p.find_all(class_=re.compile(r'tech-chip'))
    print(f"  * Project {i}: '{t_text}' | Links: {[a.get('href') for a in links]} | Bullets: {len(bullets)} | Tech: {len(chips)}")
    if len(bullets) < 2 or len(bullets) > 3:
        violations.append(f"Project '{t_text}' has {len(bullets)} bullets (expected 2-3)")

print(f"[HTML] Total project link buttons: {project_links_count}")
if project_links_count != 3:
    violations.append(f"Expected exactly 3 project links (only where user provided URLs), found {project_links_count}")

# Check project addition comment
if "add new project cards" not in html_content.lower() and "add more projects" not in html_content.lower():
    violations.append("Missing code comment marking where to add more projects")
else:
    print("[HTML] Project addition marker comment verified.")

# Skills
skill_groups = soup.find_all(class_=lambda c: c and 'skill-group-card' in c.split())
print(f"[HTML] Skill group cards: {len(skill_groups)}")
if len(skill_groups) != 6:
    violations.append(f"Expected 6 skill groups, found {len(skill_groups)}")

expected_categories = ["Languages", "App & Web", "Data & ML", "Security", "Tools", "Core CS"]
for sc in skill_groups:
    gt_el = sc.find(class_=re.compile(r'skill-group-title'))
    gt_text = gt_el.get_text(strip=True) if gt_el else ""
    chips_container = sc.find(class_=re.compile(r'skill-chips'))
    chips = chips_container.find_all(class_=re.compile(r'skill-chip')) if chips_container else []
    print(f"  * Skill Category: '{gt_text}' ({len(chips)} chips): {[c.get_text(strip=True) for c in chips]}")

# Achievements / Hackathons
achievements = soup.find_all(class_=lambda c: c and 'achievement-card' in c.split())
print(f"[HTML] Achievement cards: {len(achievements)}")
if len(achievements) != 9:
    violations.append(f"Expected 9 achievement cards (8 legacy + Samsung 2026), found {len(achievements)}")

for i, a in enumerate(achievements, 1):
    at_el = a.find(class_=re.compile(r'achievement-title'))
    print(f"  * Hackathon {i}: {at_el.get_text(strip=True) if at_el else 'N/A'}")

# Certifications
certs = soup.find_all(class_=lambda c: c and 'timeline-item' in c.split())
print(f"[HTML] Certification timeline items: {len(certs)}")
if len(certs) != 8:
    violations.append(f"Expected 8 certification items, found {len(certs)}")

for i, c in enumerate(certs, 1):
    ct_el = c.find(class_=re.compile(r'credential-title'))
    print(f"  * Cert {i}: {ct_el.get_text(strip=True) if ct_el else 'N/A'}")

# Contact Section
contact = soup.find('section', id='contact')
if not contact:
    violations.append("Contact section missing!")
else:
    contact_text = contact.get_text()
    if 'thiraviyaraj2007@gmail.com' not in contact_text:
        violations.append("Expected email thiraviyaraj2007@gmail.com not found in contact section")
    else:
        print("[HTML] Contact email verified.")
    phone_found = re.search(r'(\+91[\s-]?\d{10}|\b\d{10}\b)', contact_text)
    if phone_found:
        violations.append(f"Phone number detected in contact section: {phone_found.group(0)}")
    else:
        print("[HTML] Zero phone numbers verified in contact section.")

# --- 3. PROHIBITED PATTERNS & REGRESSION CHECKS ---
# Typos
typos = re.findall(r'\bdevoleper\b', html_content, re.IGNORECASE)
if typos:
    violations.append(f"Found 'devoleper' typo ({len(typos)} occurrences)")
else:
    print("[INTEGRITY] No 'devoleper' typo found.")

# MS Office
ms_office = re.findall(r'\bMS\s+(Word|Excel|PowerPoint|Forms|Office)\b', html_content, re.IGNORECASE)
if ms_office:
    violations.append(f"Found prohibited MS Office references: {ms_office}")
else:
    print("[INTEGRITY] No MS Office tools found.")

# Percentage progress bars
p_bar_classes = soup.find_all(class_=lambda c: c and ('progress-bar' in c.split() or c.split() == ['progress']))
if p_bar_classes:
    violations.append(f"Found percentage progress bar classes in HTML: {p_bar_classes}")
else:
    print("[INTEGRITY] No progress-bar classes found in HTML.")

# Absolute paths
abs_paths = re.findall(r'(?:href|src)=["\']/(?!/)[^"\']*["\']', html_content)
if abs_paths:
    violations.append(f"Found absolute root-relative paths in HTML: {abs_paths}")
else:
    print("[INTEGRITY] No absolute root-relative paths found.")

# JSON-LD Structured Data
json_ld = soup.find('script', type='application/ld+json')
if not json_ld:
    violations.append("Missing Person JSON-LD script")
else:
    print("[HTML] JSON-LD schema found.")
    import json
    try:
        data = json.loads(json_ld.string)
        if data.get('@type') != 'Person' or data.get('name') != 'Thiraviaraj R':
            violations.append("JSON-LD is not valid Person schema for Thiraviaraj R")
        else:
            print(f"[HTML] JSON-LD valid: {data.get('name')}, {data.get('jobTitle')}")
    except Exception as e:
        violations.append(f"JSON-LD parsing error: {e}")

# --- 4. CSS TOKENS & ARCHITECTURE ---
css_path = 'styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

print(f"[CSS] Length: {len(css_content)} bytes")
# Check dark/light tokens
if ':root' not in css_content or '[data-theme="light"]' not in css_content:
    violations.append("CSS missing :root or [data-theme='light'] definitions")
else:
    print("[CSS] Theme tokens found.")

# Check reduced-motion
if '@media (prefers-reduced-motion: reduce)' not in css_content:
    violations.append("CSS missing prefers-reduced-motion media query")
else:
    print("[CSS] prefers-reduced-motion block found.")

# Check responsive breakpoints
for bp in ['360px', '768px', '1280px']:
    if bp not in css_content:
        findings.append(f"CSS breakpoint note: {bp} not explicitly written as string (may be max-width/min-width variant)")
    else:
        print(f"[CSS] Breakpoint reference found: {bp}")

# Check progress-bar in CSS
if '.progress-bar' in css_content:
    violations.append("CSS still defines .progress-bar rule")
else:
    print("[CSS] No .progress-bar rules in CSS.")

print("========================================")
print(f"TOTAL VIOLATIONS: {len(violations)}")
for v in violations:
    print(" - [VIOLATION]", v)
print(f"TOTAL FINDINGS/NOTES: {len(findings)}")
for fn in findings:
    print(" - [NOTE]", fn)
print("========================================")
