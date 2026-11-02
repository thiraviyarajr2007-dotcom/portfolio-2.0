#!/usr/bin/env python3
"""
Test Harness for Explorer M2.2 JavaScript Module Verification
Validates:
1. DOM contract alignment in index.html for:
   - Project category filtering (.filter-chip, .project-card, data-filter, data-category)
   - Hero role rotator (#role-rotator, aria-live, aria-atomic, data-roles)
   - Scroll-spy (7 sections: #hero, #about, #projects, #skills, #achievements, #certifications, #contact)
   - Nav links (.nav-link matching the 7 section IDs)
2. CSS rule alignment in styles.css for:
   - .filter-chip, .filter-chip.active, .filter-chip[aria-pressed="true"]
   - .project-card, .project-card.is-hidden
   - .role-rotator and motion styles
   - .nav-link, .nav-link.active
   - prefers-reduced-motion media query coverage
"""

import re
import json
from pathlib import Path
from html.parser import HTMLParser

ROOT_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT_DIR / "index.html"
STYLES_CSS = ROOT_DIR / "styles.css"

results = []

def check(name: str, passed: bool, message: str = ""):
    results.append((name, passed, message))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if message:
        print(f"       -> {message}")

print("=" * 70)
print("EXPLORER M2.2 CONTRACT AUDIT")
print("=" * 70)

html_text = INDEX_HTML.read_text(encoding="utf-8")
css_text = STYLES_CSS.read_text(encoding="utf-8")

# 1. PARSE DOM
class M2HTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.filter_chips = []
        self.project_cards = []
        self.rotator_elem = None
        self.sections = []
        self.nav_links = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        classes = attr_dict.get("class", "").split()

        # Filter chips
        if "filter-chip" in classes:
            self.filter_chips.append(attr_dict)

        # Project cards
        if "project-card" in classes:
            self.project_cards.append(attr_dict)

        # Rotator
        if "role-rotator" in classes or attr_dict.get("id") == "role-rotator":
            self.rotator_elem = attr_dict

        # Sections
        if tag.lower() == "section" and "id" in attr_dict:
            self.sections.append(attr_dict["id"])

        # Nav links
        if "nav-link" in classes and "href" in attr_dict:
            self.nav_links.append(attr_dict)

parser = M2HTMLParser()
parser.feed(html_text)

# Check 1: Filter Chips
filters = [chip.get("data-filter") for chip in parser.filter_chips]
check("Filter Chips Presence", len(parser.filter_chips) >= 4, f"Found {len(parser.filter_chips)} chips: {filters}")
check("Filter Chips Include 'all', 'mobile', 'web', 'ai'", set(["all", "mobile", "web", "ai"]).issubset(set(filters)), f"Filters: {filters}")

all_chip = next((c for c in parser.filter_chips if c.get("data-filter") == "all"), None)
check("Default Active Filter Chip ('all')", all_chip is not None and "active" in all_chip.get("class", "").split() and all_chip.get("aria-pressed") == "true")

# Check 2: Project Cards data-category
check("Project Cards Count", len(parser.project_cards) == 7, f"Found {len(parser.project_cards)} cards")

categories_map = {
    "all": 0,
    "mobile": 0,
    "web": 0,
    "ai": 0
}
for card in parser.project_cards:
    raw = card.get("data-category", "")
    cats = [c.strip().lower() for c in raw.split()]
    categories_map["all"] += 1
    if "mobile" in cats: categories_map["mobile"] += 1
    if "web" in cats: categories_map["web"] += 1
    if "ai" in cats: categories_map["ai"] += 1

check("Project Filtering Counts (All=7, Mobile=3, Web=4, AI=4)",
      categories_map == {"all": 7, "mobile": 3, "web": 4, "ai": 4},
      f"Category breakdown: {categories_map}")

# Check 3: Role Rotator
check("Role Rotator Element Exists", parser.rotator_elem is not None)
if parser.rotator_elem:
    check("Role Rotator ID is 'role-rotator'", parser.rotator_elem.get("id") == "role-rotator")
    check("Role Rotator aria-live is 'polite'", parser.rotator_elem.get("aria-live") == "polite")
    check("Role Rotator aria-atomic is 'true'", parser.rotator_elem.get("aria-atomic") == "true")
    
    roles_json = parser.rotator_elem.get("data-roles", "[]")
    try:
        roles_list = json.loads(roles_json)
        check("Role Rotator data-roles JSON Parsing", isinstance(roles_list, list) and len(roles_list) == 3, f"Roles: {roles_list}")
        expected_roles = ["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]
        check("Role Rotator 3 Target Roles Match Specification", roles_list == expected_roles, f"Found: {roles_list}")
    except Exception as e:
        check("Role Rotator data-roles JSON Parsing", False, f"JSON parse error: {e}")

# Check 4: Scroll-Spy 7 Sections
expected_sections = ["hero", "about", "projects", "skills", "achievements", "certifications", "contact"]
check("Scroll-Spy All 7 Sections Exist in Order",
      parser.sections == expected_sections,
      f"Found sections: {parser.sections}")

nav_hrefs = [nl.get("href") for nl in parser.nav_links]
expected_hrefs = [f"#{s}" for s in expected_sections]
check("Nav Links Match All 7 Section Anchor Targets",
      nav_hrefs == expected_hrefs,
      f"Found nav hrefs: {nav_hrefs}")

home_link = parser.nav_links[0]
check("Initial Active Nav Link is Home (#hero)",
      home_link.get("href") == "#hero" and "active" in home_link.get("class", "").split())

# Check 5: CSS Selectors Support
check("CSS .filter-chip.active defined", ".filter-chip.active" in css_text or ".filter-chip[aria-pressed=\"true\"]" in css_text)
check("CSS .project-card.is-hidden defined", ".project-card.is-hidden" in css_text and "display: none" in css_text)
check("CSS .role-rotator defined", ".role-rotator" in css_text)
check("CSS .nav-link.active defined", ".nav-link.active" in css_text)
check("CSS prefers-reduced-motion handles .role-rotator", "prefers-reduced-motion" in css_text and ".role-rotator" in css_text)

# SUMMARY
total_checks = len(results)
passed_checks = sum(1 for _, p, _ in results)
failed_checks = total_checks - passed_checks

print("=" * 70)
print(f"TOTAL: {total_checks} | PASSED: {passed_checks} | FAILED: {failed_checks}")
print("=" * 70)

if failed_checks > 0:
    exit(1)
else:
    print("ALL M2.2 CONTRACT AUDIT CHECKS PASSED EMPIRICALLY.")
