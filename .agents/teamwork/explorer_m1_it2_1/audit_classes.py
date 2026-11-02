import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

html_classes = set()
for m in re.finditer(r'class=["\']([^"\']+)["\']', html):
    for c in m.group(1).split():
        html_classes.add(c)

css_selectors = set(re.findall(r'\.([a-zA-Z0-9_\-]+)', css))
valid_css_classes = {c for c in css_selectors if not c.isdigit()}

print(f"Total HTML classes: {len(html_classes)}")
print(f"Total CSS classes: {len(valid_css_classes)}")

unmatched_in_css = sorted([c for c in html_classes if c not in valid_css_classes])
print(f"\nHTML classes not in CSS ({len(unmatched_in_css)}):")
for c in unmatched_in_css:
    print(f"  {c}")

unmatched_in_html = sorted([c for c in valid_css_classes if c not in html_classes])
print(f"\nCSS classes not in HTML ({len(unmatched_in_html)}):")
for c in unmatched_in_html:
    print(f"  {c}")

