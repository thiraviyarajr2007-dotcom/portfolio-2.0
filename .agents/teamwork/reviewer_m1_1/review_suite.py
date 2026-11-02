import os
import re
import json
import html.parser
from PIL import Image

def run_comprehensive_audit():
    print("=" * 70)
    print("COMPREHENSIVE ADVERSARIAL AUDIT - MILESTONE 1")
    print("=" * 70)

    findings = []
    
    # Check index.html
    if not os.path.exists('index.html'):
        findings.append(("CRITICAL", "index.html missing", "index.html does not exist in root."))
        return findings
        
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
        
    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # 1. Section Order Check
    print("\n[1] Section Order Verification:")
    expected_sections = [
        'hero',
        'about',
        'projects',
        'skills',
        'achievements',
        'certifications',
        'contact'
    ]
    actual_sections = re.findall(r'<section\s+[^>]*id=["\']([^"\']+)["\']', html)
    print(f"  Actual sections:   {actual_sections}")
    print(f"  Expected sections: {expected_sections}")
    if actual_sections != expected_sections:
        findings.append(("CRITICAL", "Section order mismatch", f"Expected {expected_sections}, found {actual_sections}"))
    else:
        print("  -> PASS: All 7 sections present in exact required order.")

    # 2. Semantic Landmark Tags
    print("\n[2] Semantic HTML5 Landmarks:")
    has_header = bool(re.search(r'<header\b', html))
    has_nav = bool(re.search(r'<nav\b', html))
    has_main = bool(re.search(r'<main\b', html))
    has_footer = bool(re.search(r'<footer\b', html))
    article_count = len(re.findall(r'<article\b', html))
    h1_matches = re.findall(r'<h1\b[^>]*>(.*?)</h1>', html, re.DOTALL | re.IGNORECASE)
    
    print(f"  <header>: {has_header}, <nav>: {has_nav}, <main>: {has_main}, <footer>: {has_footer}")
    print(f"  <article> tags count: {article_count}")
    print(f"  <h1> count: {len(h1_matches)}, Content: {[h.strip() for h in h1_matches]}")
    
    if not (has_header and has_nav and has_main and has_footer):
        findings.append(("MAJOR", "Missing semantic landmarks", "Header, nav, main, or footer missing."))
    if len(h1_matches) != 1:
        findings.append(("CRITICAL", "H1 count violation", f"Expected exactly 1 h1, found {len(h1_matches)}."))
    elif "Thiraviaraj R" not in h1_matches[0]:
        findings.append(("MAJOR", "H1 content mismatch", f"Expected candidate name in h1, got: {h1_matches[0]}"))
    else:
        print("  -> PASS: Semantic landmarks and single h1 verified.")

    # 3. Skip Link
    print("\n[3] Skip Link:")
    skip_link = re.search(r'<a\s+[^>]*href=["\']#([^"\']+)["\'][^>]*class=["\'][^"\']*skip-link[^"\']*["\'][^>]*>(.*?)</a>', html, re.I)
    if skip_link:
        target_id = skip_link.group(1)
        target_exists = bool(re.search(r'id=["\']' + target_id + r'["\']', html))
        print(f"  Skip link found targeting #{target_id}, target exists in DOM: {target_exists}")
        if not target_exists:
            findings.append(("MAJOR", "Skip link broken", f"Skip link targets #{target_id} but element not found in DOM."))
        else:
            print("  -> PASS: Skip link is valid and points to existing landmark.")
    else:
        findings.append(("MAJOR", "Skip link missing", "No skip-link class anchor found."))

    # 4. Hero Section Verification
    print("\n[4] Hero Section Elements:")
    hero_section = re.search(r'<section\s+[^>]*id=["\']hero["\'][^>]*>(.*?)</section>', html, re.DOTALL)
    if hero_section:
        h_content = hero_section.group(1)
        # Roles
        roles_match = re.search(r"data-roles='([^']+)'|" + r'data-roles="([^"]+)"', h_content)
        if roles_match:
            raw_roles = roles_match.group(1) or roles_match.group(2)
            roles = json.loads(raw_roles.replace('&quot;', '"'))
        else:
            roles = []
        expected_roles = ["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]
        print(f"  Configured roles: {roles}")
        if roles != expected_roles:
            findings.append(("MAJOR", "Hero roles mismatch", f"Expected {expected_roles}, found {roles}"))
            
        # Rotating role element aria-live
        has_aria_live = 'aria-live="polite"' in h_content
        print(f"  Hero role aria-live='polite': {has_aria_live}")
        if not has_aria_live:
            findings.append(("MINOR", "Hero role missing aria-live", "Role rotator should have aria-live='polite'."))
            
        # CTAs
        has_resume_link = 'assets/resume.pdf' in h_content
        print(f"  Resume link present: {has_resume_link}")
        if not has_resume_link:
            findings.append(("CRITICAL", "Resume download CTA missing", "Hero must link to assets/resume.pdf."))
            
        # Stats
        cgpa_stat = "9.46" in h_content
        ceh_stat = "CEH" in h_content
        projects_stat = "7" in h_content
        print(f"  Stats - CGPA: {cgpa_stat}, CEH: {ceh_stat}, 7+ Projects: {projects_stat}")
        if not (cgpa_stat and ceh_stat and projects_stat):
            findings.append(("MAJOR", "Hero stats missing", "Expected CGPA 9.46, CEH certified, and 7+ projects in hero stats."))
    else:
        findings.append(("CRITICAL", "Hero section missing", "id='hero' section not found."))

    # 5. About Section Verification
    print("\n[5] About Section Verification:")
    about_section = re.search(r'<section\s+[^>]*id=["\']about["\'][^>]*>(.*?)</section>', html, re.DOTALL)
    if about_section:
        ab_content = about_section.group(1)
        mentions_tirunelveli = "Tirunelveli" in ab_content
        mentions_farming = "farming" in ab_content.lower()
        mentions_spl = "School Pupil Leader" in ab_content or "pupil leader" in ab_content.lower()
        mentions_profile_webp = 'assets/images/profile.webp' in ab_content
        rambling_bio_removed = "Passionate and enthusiastic web devoleper" not in ab_content
        thank_you_removed = "Thank you for taking the time to review my work" not in html
        
        print(f"  Tirunelveli mentioned: {mentions_tirunelveli}")
        print(f"  Farming background: {mentions_farming}")
        print(f"  School Pupil Leader: {mentions_spl}")
        print(f"  Profile WebP image used: {mentions_profile_webp}")
        print(f"  Old rambling bio removed: {rambling_bio_removed}")
        print(f"  Old 'Thank you' text removed: {thank_you_removed}")
        
        if not (mentions_tirunelveli and mentions_farming and mentions_spl and mentions_profile_webp):
            findings.append(("MAJOR", "About section details missing", "About section must include genuine bio details and WebP profile."))
        if not (rambling_bio_removed and thank_you_removed):
            findings.append(("CRITICAL", "Legacy text not removed", "Old bio or Thank you message still present."))
    else:
        findings.append(("CRITICAL", "About section missing", "id='about' section not found."))

    # 6. Projects Section Verification
    print("\n[6] Projects Section Verification:")
    proj_cards = re.findall(r'<article\s+class=["\']project-card\b[^"\']*["\']([^>]*)>(.*?)</article>', html, re.DOTALL)
    print(f"  Total project cards found: {len(proj_cards)}")
    
    if len(proj_cards) != 7:
        findings.append(("CRITICAL", "Project count violation", f"Expected exactly 7 projects, found {len(proj_cards)}."))
    
    expected_projects = [
        "Namma Nellai",
        "SwiftShare",
        "HabitAI",
        "AI Notes & Productivity App",
        "Car Front Display GPS Tracker",
        "Road Safety Hackathon Project",
        "Medicine Identification & Chemistry Learning Platform"
    ]
    
    has_addition_comment = bool(re.search(r'<!--.*?Add (?:new )?project.*?-->', html, re.I))
    print(f"  Project addition code comment present: {has_addition_comment}")
    if not has_addition_comment:
        findings.append(("MAJOR", "Project addition comment missing", "Expected code comment marking where to add more projects."))
        
    filter_chips = re.findall(r'class=["\']filter-chip\b[^"\']*["\'][^>]*data-filter=["\']([^"\']+)["\']', html)
    print(f"  Filter chips: {filter_chips}")
    expected_filters = ['all', 'mobile', 'web', 'ai']
    if [f.lower() for f in filter_chips] != expected_filters:
        findings.append(("MAJOR", "Filter chips mismatch", f"Expected {expected_filters}, found {filter_chips}"))
        
    projects_with_links = []
    projects_without_links = []
    for attr, card in proj_cards:
        title_m = re.search(r'<h3[^>]*>(.*?)</h3>', card, re.DOTALL)
        raw_title = title_m.group(1).strip() if title_m else 'NO TITLE'
        title = raw_title.replace('&amp;', '&')
        links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', card, re.DOTALL)
        bullets = re.findall(r'<li[^>]*>(.*?)</li>', card, re.DOTALL)
        tech_chips = re.findall(r'class=["\']tech-chip["\'][^>]*>(.*?)</span>', card)
        
        # Check uniform template: title, summary (p), tech-chips, 2-3 bullets, footer
        has_summary = bool(re.search(r'<p\s+class=["\']project-summary["\']', card))
        has_bullets = 2 <= len(bullets) <= 3
        has_tech = len(tech_chips) >= 2
        
        if not (has_summary and has_bullets and has_tech):
            findings.append(("MAJOR", f"Project card template non-uniform: {title}", f"summary={has_summary}, bullets={len(bullets)}, tech={len(tech_chips)}"))
            
        if links:
            projects_with_links.append((title, links))
        else:
            projects_without_links.append(title)
            
    print(f"  Projects with links ({len(projects_with_links)}):")
    for t, l in projects_with_links:
        print(f"    - {t}: {l}")
    print(f"  Projects without links ({len(projects_without_links)}):")
    for t in projects_without_links:
        print(f"    - {t}")
        
    expected_linked = ["Namma Nellai", "AI Notes & Productivity App", "Car Front Display GPS Tracker"]
    actual_linked = [t for t, _ in projects_with_links]
    
    if len(actual_linked) != 3 or any(e not in actual_linked for e in expected_linked):
        findings.append(("CRITICAL", "Project link constraint violated", 
                         f"Only Namma Nellai, AI Notes, and GPS Tracker must have links! Found: {actual_linked}"))
    else:
        print("  -> PASS: Exactly and only 3 specified projects have links.")

    # Check for placeholder images (via.placeholder.com)
    if "via.placeholder.com" in html:
        findings.append(("CRITICAL", "via.placeholder.com used", "via.placeholder.com forbidden by user request."))
    else:
        print("  -> PASS: Zero via.placeholder.com references found.")

    # 7. Skills Section Verification
    print("\n[7] Skills Section Verification:")
    # Find all h3 titles within skill-group-card
    skill_headers = re.findall(r'<div\s+class=["\']skill-group-card\b[^"\']*["\']>.*?<h3\s+class=["\']skill-group-title["\']>(.*?)</h3>', html, re.DOTALL)
    print(f"  Total skill group cards: {len(skill_headers)}")
    if len(skill_headers) != 6:
        findings.append(("CRITICAL", "Skill group count mismatch", f"Expected exactly 6 skill groups, found {len(skill_headers)}."))
        
    # Check 6 categories
    expected_categories = ["Programming Languages", "App & Web", "Data & Machine Learning", "Cybersecurity & Systems", "Developer Tools", "Core Computer Science"]
    actual_categories = [h.strip().replace('&amp;', '&') for h in skill_headers]
    print(f"  Found categories: {actual_categories}")
    for exp_cat in expected_categories:
        if not any(exp_cat.lower() in ac.lower() for ac in actual_categories):
            findings.append(("MAJOR", f"Missing skill category: {exp_cat}", f"Expected category {exp_cat} not found in {actual_categories}"))
            
    # Check no progress bars in html or css
    html_progress_bars = len(re.findall(r'class=["\'][^"\']*progress(?:-bar)?\b[^"\']*["\']', html))
    css_progress_bars = len(re.findall(r'\.progress\b|\.progress-bar\b', css))
    print(f"  Progress bars in HTML: {html_progress_bars}, in CSS: {css_progress_bars}")
    if html_progress_bars > 0 or css_progress_bars > 0:
        findings.append(("CRITICAL", "Progress bars present", f"HTML: {html_progress_bars}, CSS: {css_progress_bars}. Progress bars are strictly prohibited!"))
    else:
        print("  -> PASS: Zero progress bars found.")
        
    # Check no MS Office
    ms_mentions = re.findall(r'\bMS\s*(?:Word|Excel|Office|PowerPoint|Forms)\b|PowerPoint|Microsoft Office', html, re.I)
    print(f"  MS Office mentions: {ms_mentions}")
    if ms_mentions:
        findings.append(("CRITICAL", "MS Office tools present", f"Found MS Office mentions: {ms_mentions}"))
    else:
        print("  -> PASS: Zero MS Office tools found.")

    # 8. Achievements Section Verification
    print("\n[8] Achievements Section Verification:")
    achieve_cards = re.findall(r'class=["\']achievement-card\b[^"\']*["\']', html)
    print(f"  Total achievement cards found: {len(achieve_cards)}")
    if len(achieve_cards) != 9:
        findings.append(("CRITICAL", "Achievement count mismatch", f"Expected exactly 9 hackathons/achievements, found {len(achieve_cards)}."))
    else:
        print("  -> PASS: Exactly 9 achievement cards found.")
    
    # Check Central India Hackathon, TATA Crucible, Samsung Solve for Tomorrow
    if "Central India Hackathon" not in html:
        findings.append(("MAJOR", "Central India Hackathon missing", "Central India Hackathon must be preserved."))
    if "TATA Crucible" not in html:
        findings.append(("MAJOR", "TATA Crucible missing", "TATA Crucible must be preserved."))
    if "Samsung Solve for Tomorrow" not in html:
        findings.append(("CRITICAL", "Samsung Solve for Tomorrow missing", "Samsung Solve for Tomorrow 2026 must be included."))

    # 9. Certifications Section Verification
    print("\n[9] Certifications Section Verification:")
    cert_items = re.findall(r'class=["\']timeline-item\b[^"\']*["\']', html)
    print(f"  Total certifications found: {len(cert_items)}")
    if len(cert_items) != 8:
        findings.append(("CRITICAL", "Certifications count mismatch", f"Expected exactly 8 certifications, found {len(cert_items)}."))
    else:
        print("  -> PASS: Exactly 8 certifications found.")
        
    required_certs = [
        "Certified Ethical Hacker", # CEH
        "Generative AI", # IBM
        "MLOps", # Scaler
        "UX Design", # Google Coursera
        "Machine Learning with Python", # LinkedIn
        "Deep Learning Optimization", # LinkedIn
        "Cybersecurity Threat Landscape", # LinkedIn
        "Joy of Computing" # NPTEL
    ]
    for rc in required_certs:
        if rc.lower() not in html.lower():
            findings.append(("MAJOR", f"Certification missing: {rc}", f"Expected {rc} in certifications section."))

    # 10. Contact Section & Privacy Verification
    print("\n[10] Contact Section & Privacy Verification:")
    if "thiraviyaraj2007@gmail.com" not in html:
        findings.append(("CRITICAL", "Email missing", "Contact email thiraviyaraj2007@gmail.com missing."))
    else:
        print("  -> PASS: Correct contact email present.")
        
    phone_matches = re.findall(r'(?:\+91[\s-]?)?[6-9]\d{9}\b|\+91\d{10}', html)
    print(f"  Phone number pattern matches: {phone_matches}")
    if phone_matches:
        findings.append(("CRITICAL", "INTEGRITY VIOLATION: Phone number published", f"Found phone numbers: {phone_matches}"))
    else:
        print("  -> PASS: Zero phone numbers published.")
        
    github_link = "github.com/thiraviyarajr2007-dotcom" in html
    linkedin_todo = "TODO" in html and "LinkedIn" in html
    leetcode_todo = "TODO" in html and "LeetCode" in html
    print(f"  GitHub link: {github_link}, LinkedIn TODO: {linkedin_todo}, LeetCode TODO: {leetcode_todo}")
    if not (github_link and linkedin_todo and leetcode_todo):
        findings.append(("MAJOR", "Contact social links issue", "GitHub link or LinkedIn/LeetCode TODO markers missing."))

    # 11. Typo Verification
    print("\n[11] Typo Verification:")
    devoleper_typos = re.findall(r'devoleper', html + css, re.I)
    print(f"  'devoleper' occurrences: {len(devoleper_typos)}")
    if devoleper_typos:
        findings.append(("CRITICAL", "devoleper typo present", f"Found {len(devoleper_typos)} occurrences of 'devoleper'."))
    else:
        print("  -> PASS: Zero occurrences of 'devoleper'.")

    # 12. Strict Relative Asset Paths
    print("\n[12] Asset Path Resolution Check:")
    abs_links = re.findall(r'(?:href|src)=["\']/(?!/)[^"\']*["\']', html)
    print(f"  Absolute paths starting with '/': {abs_links}")
    if abs_links:
        findings.append(("CRITICAL", "Absolute paths detected", f"Found absolute paths that break GitHub Pages: {abs_links}"))
    else:
        print("  -> PASS: All paths are strictly relative.")

    # 13. Security: Target _blank external links
    print("\n[13] External Link Security (rel='noopener noreferrer'):")
    target_blanks = re.findall(r'<a\s+[^>]*target=["\']_blank["\'][^>]*>', html)
    insecure_blanks = []
    for tag in target_blanks:
        if 'rel=' not in tag or 'noopener' not in tag:
            insecure_blanks.append(tag)
    print(f"  Total target='_blank' links: {len(target_blanks)}, Insecure links: {len(insecure_blanks)}")
    if insecure_blanks:
        findings.append(("MINOR", "Insecure target='_blank'", f"Found target='_blank' without rel='noopener noreferrer': {insecure_blanks}"))
    else:
        print("  -> PASS: All target='_blank' links include rel='noopener noreferrer'.")

    # 14. SEO & Structured Data
    print("\n[14] SEO & JSON-LD Structured Data:")
    title_m = re.search(r'<title>(.*?)</title>', html)
    meta_desc = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', html)
    og_title = re.search(r'<meta\s+property=["\']og:title["\']', html)
    twitter_card = re.search(r'<meta\s+name=["\']twitter:card["\']', html)
    favicon_svg = 'assets/favicon.svg' in html
    json_ld = re.search(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', html, re.DOTALL)
    
    print(f"  <title>: {title_m.group(1) if title_m else 'NONE'}")
    print(f"  <meta description>: {bool(meta_desc)}")
    print(f"  OpenGraph: {bool(og_title)}, Twitter: {bool(twitter_card)}, Favicon: {favicon_svg}")
    print(f"  JSON-LD present: {bool(json_ld)}")
    
    if not (title_m and meta_desc and og_title and twitter_card and favicon_svg and json_ld):
        findings.append(("MAJOR", "SEO metadata incomplete", "Missing title, description, OG tags, Twitter card, favicon, or JSON-LD."))
    else:
        # Validate JSON-LD
        try:
            parsed_json_ld = json.loads(json_ld.group(1))
            if parsed_json_ld.get('@type') != 'Person':
                findings.append(("MINOR", "JSON-LD @type mismatch", f"Expected @type: Person, got: {parsed_json_ld.get('@type')}"))
            else:
                print("  -> PASS: JSON-LD Person schema is valid JSON.")
        except Exception as e:
            findings.append(("CRITICAL", "JSON-LD invalid JSON", str(e)))

    # 15. CSS Design System and Accessibility
    print("\n[15] CSS Architecture & Tokens:")
    root_tokens = re.search(r':root\s*\{(.*?)\}', css, re.DOTALL)
    light_tokens = re.search(r'\[data-theme=["\']light["\']\]\s*\{(.*?)\}', css, re.DOTALL)
    reduced_motion = re.search(r'@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\}', css, re.DOTALL)
    accent_check = "--accent: #6366f1" in css
    font_space_grotesk = "Space Grotesk" in css
    font_inter = "Inter" in css
    
    print(f"  :root tokens present: {bool(root_tokens)}")
    print(f"  [data-theme='light'] tokens present: {bool(light_tokens)}")
    print(f"  --accent: #6366f1 present: {accent_check}")
    print(f"  Space Grotesk present: {font_space_grotesk}, Inter present: {font_inter}")
    
    if not (root_tokens and light_tokens and accent_check and font_space_grotesk and font_inter):
        findings.append(("CRITICAL", "CSS token or typography deficiency", "Missing required CSS variables or fonts."))
    else:
        print("  -> PASS: Core CSS variables and typography tokens present.")

    # 16. Assets Validation
    print("\n[16] Physical Assets Verification:")
    # Profile WebP
    if os.path.exists('assets/images/profile.webp'):
        sz = os.path.getsize('assets/images/profile.webp')
        with Image.open('assets/images/profile.webp') as im:
            fmt = im.format
            dims = im.size
        print(f"  profile.webp: size={sz} bytes (< 81920: {sz < 81920}), format={fmt}, dims={dims}")
        if sz >= 81920:
            findings.append(("CRITICAL", "Profile WebP exceeds 80KB", f"Size is {sz} bytes"))
        if fmt != 'WEBP':
            findings.append(("CRITICAL", "Profile is not valid WebP", f"Format is {fmt}"))
    else:
        findings.append(("CRITICAL", "assets/images/profile.webp missing", "Profile image not found."))

    # Resume PDF
    if os.path.exists('assets/resume.pdf'):
        pdf_sz = os.path.getsize('assets/resume.pdf')
        with open('assets/resume.pdf', 'rb') as pf:
            pbytes = pf.read()
        is_pdf = pbytes.startswith(b'%PDF-1.4') and b'xref' in pbytes and b'%%EOF' in pbytes
        print(f"  resume.pdf: size={pdf_sz} bytes, valid PDF-1.4: {is_pdf}")
        if not is_pdf:
            findings.append(("CRITICAL", "resume.pdf invalid binary structure", "Not valid PDF-1.4 or missing xref/EOF."))
    else:
        findings.append(("CRITICAL", "assets/resume.pdf missing", "Resume PDF not found."))

    # Favicon SVG
    if os.path.exists('assets/favicon.svg'):
        with open('assets/favicon.svg', 'r', encoding='utf-8') as svgf:
            svg_content = svgf.read()
        is_svg = '<svg' in svg_content and '</svg>' in svg_content and 'viewBox' in svg_content
        print(f"  favicon.svg: valid SVG: {is_svg}")
        if not is_svg:
            findings.append(("MAJOR", "favicon.svg malformed", "Does not contain valid SVG elements."))
    else:
        findings.append(("CRITICAL", "assets/favicon.svg missing", "Favicon SVG not found."))

    # Projects directory
    if not os.path.exists('assets/projects'):
        findings.append(("MAJOR", "assets/projects directory missing", "Directory assets/projects/ must exist for project screenshot slots."))

    # 17. Class Consistency & Dead Code / CSS Check
    print("\n[17] HTML & CSS Class Consistency Check:")
    html_classes = set()
    for m in re.findall(r'class=["\']([^"\']+)["\']', html):
        for c in m.split():
            html_classes.add(c)

    css_selectors = set(re.findall(r'\.([a-zA-Z0-9_-]+)', css))
    
    missing_in_css = sorted([c for c in html_classes if c not in css_selectors])
    print(f"  Total distinct HTML classes: {len(html_classes)}")
    print(f"  Total distinct CSS class selectors: {len(css_selectors)}")
    print(f"  HTML classes without CSS selector match ({len(missing_in_css)}):")
    critical_layout_mismatches = []
    for c in missing_in_css:
        print(f"    - {c}")
        if 'grid' in c or 'bento' in c or 'card' in c or 'project' in c:
            critical_layout_mismatches.append(c)
            
    if critical_layout_mismatches:
        findings.append(("CRITICAL", "Layout class mismatch between HTML and CSS", 
                         f"HTML uses layout classes that have NO matching styles in styles.css: {critical_layout_mismatches}"))

    # Check for dead CSS classes in styles.css
    # Filter out pseudo-states, JS-added classes (like active, menu-open, dark-theme, etc.)
    js_classes = {'menu-open', 'active', 'revealed', 'submitting', 'submitted', 'valid', 'invalid'}
    unused_css = sorted([c for c in css_selectors if c not in html_classes and c not in js_classes])
    print(f"\n  CSS classes without HTML element ({len(unused_css)}):")
    for c in unused_css[:20]:
        print(f"    - {c}")
    if len(unused_css) > 20:
        print(f"    ... and {len(unused_css) - 20} more.")

    print("\n" + "=" * 70)
    print("AUDIT SUMMARY & FINDINGS:")
    print("=" * 70)
    if not findings:
        print("ALL CHECKS PASSED: 0 Findings.")
    else:
        for level, title, desc in findings:
            print(f"[{level}] {title}: {desc}")
            
    return findings

if __name__ == '__main__':
    run_comprehensive_audit()
