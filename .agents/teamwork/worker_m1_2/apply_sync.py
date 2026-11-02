#!/usr/bin/env python3
"""
apply_sync.py
Synchronizes DOM classes in index.html with styles.css, and adds selector resilience aliases in styles.css.
Author: teamwork_worker_m1_2
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent
INDEX_HTML = ROOT / "index.html"
STYLES_CSS = ROOT / "styles.css"

def sync_remaining_css():
    content = STYLES_CSS.read_text(encoding="utf-8")
    original = content

    replacements = [
        (
            '.skill-group-icon {\n  width: 36px;',
            '.skill-group-icon,\n.skill-icon-wrapper {\n  width: 36px;'
        ),
        (
            '.achievement-org {\n  font-size: 0.8rem;',
            '.achievement-org,\n.achievement-organizer {\n  font-size: 0.8rem;'
        ),
        (
            '.achievement-desc {\n  font-size: 0.9rem;',
            '.achievement-desc,\n.achievement-description {\n  font-size: 0.9rem;'
        ),
        (
            '.timeline-details {\n  font-size: 0.875rem;',
            '.timeline-details,\n.credential-summary {\n  font-size: 0.875rem;'
        ),
        (
            '.contact-intro-text {\n  font-size: 1rem;',
            '.contact-intro-text,\n.contact-panel-desc {\n  font-size: 1rem;'
        ),
        (
            '.contact-card-icon {\n  width: 42px;',
            '.contact-card-icon,\n.contact-icon {\n  width: 42px;'
        ),
        (
            '.contact-card-val {\n  font-size: 0.95rem;',
            '.contact-card-val,\n.contact-link {\n  font-size: 0.95rem;'
        ),
    ]

    for target, replacement in replacements:
        if target in content:
            count = content.count(target)
            content = content.replace(target, replacement)
            print(f"[CSS] Replaced '{target[:30]}...' -> {count} instances")
        else:
            print(f"[CSS WARN] Target not found: '{target}'")

    if content != original:
        STYLES_CSS.write_text(content, encoding="utf-8")
        print("Updated styles.css with remaining aliases successfully.")
    else:
        print("No changes needed in styles.css.")

if __name__ == "__main__":
    sync_remaining_css()
