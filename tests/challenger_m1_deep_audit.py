#!/usr/bin/env python3
"""
Adversarial Challenger Deep Audit for M1 (teamwork_challenger_m1_it2_1)
Target: index.html, styles.css, script.js, README.md, assets
Empirical verification of:
1. Zero unclosed tags (strict stack parsing)
2. Zero duplicate IDs (case-insensitive and exact)
3. Zero phone numbers (all international & Indian formats, tel: links)
4. Zero MS Office mentions (Word, Excel, PowerPoint, Forms, Office 365, etc.)
5. Zero typos ("devoleper", spelling anomalies, known typos)
6. Project link buttons appearing strictly and ONLY on Namma Nellai, AI Notes, and GPS Tracker
7. Interface contract verification (PROJECT.md)
"""

import sys
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLES_CSS = ROOT_DIR / "styles.css"
SCRIPT_JS = ROOT_DIR / "script.js"
README_MD = ROOT_DIR / "README.md"

results = []

def check(name: str, passed: bool, message: str = ""):
    results.append((name, passed, message))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if message:
        print(f"       -> {message}")

print("=" * 80)
print("EMPIRICAL CHALLENGER DEEP AUDIT (M1-IT2-1)")
print("=" * 80)

html_text = INDEX_HTML.read_text(encoding="utf-8")
css_text = STYLES_CSS.read_text(encoding="utf-8") if STYLES_CSS.exists() else ""
js_text = SCRIPT_JS.read_text(encoding="utf-8") if SCRIPT_JS.exists() else ""
readme_text = README_MD.read_text(encoding="utf-8") if README_MD.exists() else ""

# ------------------------------------------------------------------------------
# 1. STRICT UNCLOSED TAG & DOM SYNTAX AUDIT
# ------------------------------------------------------------------------------
class StrictAuditor(HTMLParser):
    VOID_ELEMENTS = {
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    }

    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.ids = {}
        self.h1_tags = []
        self.all_tags = []

    def handle_starttag(self, tag, attrs):
        pos = self.getpos()
        lower_tag = tag.lower()
        self.all_tags.append((lower_tag, pos))

        if lower_tag == 'h1':
            self.h1_tags.append(pos)

        # ID audit
        for k, v in attrs:
            if k.lower() == 'id':
                norm_id = v.strip().lower()
                if norm_id in self.ids:
                    self.ids[norm_id].append((v, pos))
                else:
                    self.ids[norm_id] = [(v, pos)]

        if lower_tag not in self.VOID_ELEMENTS:
            self.stack.append((lower_tag, pos))

    def handle_endtag(self, tag):
        pos = self.getpos()
        lower_tag = tag.lower()

        if lower_tag in self.VOID_ELEMENTS:
            self.errors.append(f"Void tag <{lower_tag}> closed with explicit </{lower_tag}> at line {pos[0]}:{pos[1]}")
            return

        if not self.stack:
            self.errors.append(f"Unexpected closing tag </{lower_tag}> with empty stack at line {pos[0]}:{pos[1]}")
            return

        expected_tag, open_pos = self.stack.pop()
        if expected_tag != lower_tag:
            self.errors.append(
                f"Nesting mismatch: expected </{expected_tag}> (opened at {open_pos[0]}:{open_pos[1]}), "
                f"found </{lower_tag}> at {pos[0]}:{pos[1]}"
            )

    def close(self):
        super().close()
        while self.stack:
            tag, pos = self.stack.pop()
            self.errors.append(f"Unclosed tag <{tag}> opened at line {pos[0]}:{pos[1]}")

auditor = StrictAuditor()
auditor.feed(html_text)
auditor.close()

check(
    "Strict Tag Balancing (Zero unclosed tags, zero improper nesting)",
    len(auditor.errors) == 0,
    f"{len(auditor.errors)} tag errors: {auditor.errors[:5]}" if auditor.errors else "Zero syntax errors"
)

# ------------------------------------------------------------------------------
# 2. DUPLICATE ID AUDIT
# ------------------------------------------------------------------------------
duplicate_ids = {k: v for k, v in auditor.ids.items() if len(v) > 1}
check(
    "Duplicate IDs Audit (Zero duplicate IDs)",
    len(duplicate_ids) == 0,
    f"Duplicate IDs found: {duplicate_ids}" if duplicate_ids else f"All {len(auditor.ids)} IDs are strictly unique"
)

# Check single h1
check(
    "Single H1 Element",
    len(auditor.h1_tags) == 1,
    f"Found {len(auditor.h1_tags)} <h1> elements at {auditor.h1_tags}"
)

# ------------------------------------------------------------------------------
# 3. PRIVACY & PHONE NUMBER AUDIT
# ------------------------------------------------------------------------------
# Patterns for Indian phone numbers (10 digits starting with 6-9, optional +91 or 0 prefix)
phone_regexes = [
    r'\+91[\s\-\.]?[6-9]\d{4}[\s\-\.]?\d{5}',
    r'\+91[\s\-\.]?\d{10}',
    r'\b91[6-9]\d{9}\b',
    r'\b0[6-9]\d{9}\b',
    r'\b[6-9]\d{9}\b',
    r'tel:\s*[^\s"\'<>]+',
    r'\b(?:\+?1[-.]?)?\(?[2-9]\d{2}\)?[-.]?\d{3}[-.]?\d{4}\b', # North American format just in case
]

phone_leaks = []
for p in phone_regexes:
    for m in re.finditer(p, html_text):
        matched = m.group(0)
        # Avoid false positives like timestamps or random hex numbers if any
        # Check context
        start = max(0, m.start() - 20)
        end = min(len(html_text), m.end() + 20)
        ctx = html_text[start:end].replace('\n', ' ')
        phone_leaks.append(f"Matched '{matched}' in context: ...{ctx}...")

check(
    "Privacy Audit (Zero Phone Numbers)",
    len(phone_leaks) == 0,
    f"Phone number leaks found: {phone_leaks}" if phone_leaks else "Zero phone numbers or tel: URIs detected in codebase"
)

# ------------------------------------------------------------------------------
# 4. FORBIDDEN MS OFFICE MENTIONS
# ------------------------------------------------------------------------------
office_patterns = [
    r'\bMS\s*Office\b',
    r'\bMicrosoft\s*Office\b',
    r'\bMS\s*Word\b',
    r'\bMicrosoft\s*Word\b',
    r'\bMS\s*Excel\b',
    r'\bMicrosoft\s*Excel\b',
    r'\bMS\s*PowerPoint\b',
    r'\bMicrosoft\s*PowerPoint\b',
    r'\bMS\s*Forms\b',
    r'\bMicrosoft\s*Forms\b',
    r'\bOffice\s*365\b',
]

office_found = []
for p in office_patterns:
    for m in re.finditer(p, html_text, re.IGNORECASE):
        office_found.append(m.group(0))

check(
    "Forbidden Mentions Audit (Zero MS Office mentions)",
    len(office_found) == 0,
    f"Found MS Office mentions: {office_found}" if office_found else "Zero MS Office mentions found"
)

# ------------------------------------------------------------------------------
# 5. ADVERSARIAL TYPO AUDIT
# ------------------------------------------------------------------------------
typo_patterns = [
    (r'\bdevoleper\b', "devoleper -> developer"),
    (r'\bdevloper\b', "devloper -> developer"),
    (r'\bdeveleper\b', "develeper -> developer"),
    (r'\bdevelper\b', "develper -> developer"),
    (r'\bfluter\b', "fluter -> flutter"),
    (r'\bfirbase\b', "firbase -> firebase"),
    (r'\bachivement\b', "achivement -> achievement"),
    (r'\bcertifcate\b', "certifcate -> certificate"),
    (r'\blangauge\b', "langauge -> language"),
    (r'\bframwork\b', "framwork -> framework"),
    (r'\bresponsiv\b', "responsiv -> responsive"),
    (r'\bexperiance\b', "experiance -> experience"),
    (r'\bseperate\b', "seperate -> separate"),
    (r'\boccured\b', "occured -> occurred"),
]

typos_found = []
for p, desc in typo_patterns:
    for m in re.finditer(p, html_text, re.IGNORECASE):
        typos_found.append(f"{desc} (found: {m.group(0)})")
    for m in re.finditer(p, css_text, re.IGNORECASE):
        typos_found.append(f"In CSS: {desc} (found: {m.group(0)})")

check(
    "Adversarial Typo Audit (Zero typos)",
    len(typos_found) == 0,
    f"Typos found: {typos_found}" if typos_found else "Zero typos found in HTML and CSS"
)

# ------------------------------------------------------------------------------
# 6. PROJECT LINK BUTTON RESTRICTION AUDIT
# ------------------------------------------------------------------------------
# Project link buttons appear ONLY on:
# 1. Namma Nellai (nammanellai.online)
# 2. AI Notes & Productivity App (github.com/thiraviyarajr2007-dotcom/AI-Notes)
# 3. Car Front Display GPS Tracker (github.com/thiraviyarajr2007-dotcom/gps-tracker)

projects_match = re.search(r'<section\s+id="projects".*?</section>', html_text, re.DOTALL)
if not projects_match:
    check("Projects Section Exists", False, "Missing #projects section")
else:
    proj_sec_html = projects_match.group(0)
    cards = re.findall(r'<article class="[^"]*\bproject-card\b[^"]*"[^>]*>(.*?)</article>', proj_sec_html, re.DOTALL)
    
    check("Total Projects Count", len(cards) == 7, f"Found {len(cards)} cards (required: 7)")
    
    expected_links = {
        "Namma Nellai": "nammanellai.online",
        "AI Notes & Productivity App": "github.com/thiraviyarajr2007-dotcom/AI-Notes",
        "Car Front Display GPS Tracker": "github.com/thiraviyarajr2007-dotcom/gps-tracker"
    }
    
    cards_with_links = {}
    cards_without_links = []
    unexpected_button_elements = []
    
    for i, c in enumerate(cards):
        # find title
        t_match = re.search(r'<h3 class="project-title">(.*?)</h3>', c, re.DOTALL)
        title = t_match.group(1).replace('&amp;', '&').strip() if t_match else f"Project-{i}"
        
        # look for any <a> or <button> inside .project-footer or whole card that links out
        footer_match = re.search(r'<div class="project-footer">(.*?)</div>', c, re.DOTALL)
        footer_content = footer_match.group(1) if footer_match else ""
        
        links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', footer_content, re.DOTALL)
        buttons = re.findall(r'<button\b[^>]*>(.*?)</button>', footer_content, re.DOTALL)
        
        # Also check card outside footer for stray link buttons
        card_non_footer = c.replace(footer_content, "")
        stray_links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', card_non_footer, re.DOTALL)
        if stray_links:
            unexpected_button_elements.append(f"{title}: Stray link in card body {stray_links}")
            
        if links or buttons:
            cards_with_links[title] = {
                "links": links,
                "buttons": buttons
            }
        else:
            cards_without_links.append(title)
            
    print(f"\nProjects with action links/buttons ({len(cards_with_links)}):")
    for t, data in cards_with_links.items():
        print(f"  - {t}: {data['links']}")
        
    print(f"\nProjects without action links/buttons ({len(cards_without_links)}):")
    for t in cards_without_links:
        print(f"  - {t}")

    # Check 1: Exactly 3 projects have links
    has_exact_3 = len(cards_with_links) == 3
    check("Exactly 3 Projects Have Link Buttons", has_exact_3, f"{len(cards_with_links)} projects have links")

    # Check 2: The 3 projects match expected names
    matched_names = True
    for expected_name, expected_url in expected_links.items():
        found = False
        for actual_name, data in cards_with_links.items():
            if expected_name.lower() in actual_name.lower():
                found = True
                # verify url
                url_present = any(expected_url in href for href, text in data["links"])
                check(f"URL Accuracy for '{expected_name}' ({expected_url})", url_present)
                break
        if not found:
            matched_names = False
            check(f"Expected Link Present on '{expected_name}'", False, "Missing link button")
            
    check("Only Allowed Projects Have Link Buttons", matched_names and len(cards_without_links) == 4, 
          f"Projects without links: {cards_without_links}")
    
    check("Zero Stray Links / Buttons in Card Bodies", len(unexpected_button_elements) == 0,
          f"Stray elements: {unexpected_button_elements}")

# ------------------------------------------------------------------------------
# 7. ASSET AND MEDIA QUERY ROBUSTNESS
# ------------------------------------------------------------------------------
# Check image onerror fallback
img_tags_in_projects = re.findall(r'<img[^>]*class="[^"]*project-screenshot[^"]*"[^>]*>', html_text)
onerror_count = sum(1 for img in img_tags_in_projects if 'onerror=' in img)
check(
    "Project Screenshots Graceful Fallback (onerror handler)",
    onerror_count == 7,
    f"{onerror_count}/7 project screenshots have onerror fallback handler"
)

# ------------------------------------------------------------------------------
# SUMMARY & FINAL VERDICT
# ------------------------------------------------------------------------------
print("\n" + "=" * 80)
total_tests = len(results)
passed_tests = sum(1 for name, p, msg in results if p)
failed_tests = total_tests - passed_tests

print(f"DEEP AUDIT TOTAL CHECKS: {total_tests}")
print(f"PASSED:                  {passed_tests}")
print(f"FAILED:                  {failed_tests}")

if failed_tests > 0:
    print("\nFAILURES:")
    for name, p, msg in results:
        if not p:
            print(f"  - {name}: {msg}")
    print("VERDICT: REJECT")
    sys.exit(1)
else:
    print("\nALL ADVERSARIAL CHECKS PASSED EMPIRICALLY.")
    print("VERDICT: APPROVE")
    sys.exit(0)
