import os
import re
import html.parser
from PIL import Image

def run_checks():
    print('=== RUNNING VERIFICATION SUITE FOR MILESTONE 1 ===')

    # 1. File existence and sizes
    print('\n--- 1. File existence and sizes ---')
    files_to_check = {
        'index.html': (10000, 150000),
        'styles.css': (10000, 80000),
        'assets/images/profile.webp': (1000, 81920),
        'assets/favicon.svg': (500, 5000),
        'assets/resume.pdf': (1000, 10000),
    }

    all_passed = True
    for fpath, (min_sz, max_sz) in files_to_check.items():
        if not os.path.exists(fpath):
            print(f'FAIL: {fpath} does not exist!')
            all_passed = False
            continue
        sz = os.path.getsize(fpath)
        ok = min_sz <= sz <= max_sz
        status = 'PASS' if ok else 'FAIL'
        print(f'{status}: {fpath} -> {sz:,} bytes (budget: [{min_sz:,}, {max_sz:,}])')
        if not ok:
            all_passed = False

    # 2. HTML Tag Balancing & Nesting Check
    print('\n--- 2. HTML Tag Balancing Check ---')
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    class TagValidator(html.parser.HTMLParser):
        def __init__(self):
            super().__init__()
            self.stack = []
            self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
            self.errors = []
        def handle_starttag(self, tag, attrs):
            if tag.lower() not in self.void_tags:
                self.stack.append((tag.lower(), self.getpos()))
        def handle_endtag(self, tag):
            tag_lower = tag.lower()
            if tag_lower in self.void_tags:
                return
            if not self.stack:
                self.errors.append(f'Unexpected closing tag </{tag_lower}> at line {self.getpos()[0]}')
                return
            last_tag, pos = self.stack.pop()
            if last_tag != tag_lower:
                self.errors.append(f'Mismatched closing tag </{tag_lower}> at line {self.getpos()[0]}, expected </{last_tag}> from line {pos[0]}')

    validator = TagValidator()
    validator.feed(html_content)
    if not validator.stack and not validator.errors:
        print('PASS: HTML tags are 100% perfectly balanced! (0 unclosed tags, 0 mismatches)')
    else:
        print(f'FAIL: Errors={validator.errors}, Unclosed={validator.stack}')
        all_passed = False

    # 3. Content and Quality Checks
    print('\n--- 3. Content and Quality Checks on index.html ---')
    projects = len(re.findall(r'<article class="project-card\b', html_content))
    achievements = len(re.findall(r'class="achievement-card\b', html_content))
    certifications = len(re.findall(r'class="timeline-item\b', html_content))
    skills = len(re.findall(r'class="skill-group-card\b', html_content))
    typos = len(re.findall(r'devoleper', html_content, re.I))
    ms = len(re.findall(r'MS (Word|Excel|Office|PowerPoint|Forms)', html_content, re.I))
    phones = len(re.findall(r'(\+91|\b\d{10}\b)', html_content))
    links = len(re.findall(r'class="btn btn-(?:primary|secondary) btn-sm"', html_content))
    h1_tags = re.findall(r'<h1\b[^>]*>(.*?)</h1>', html_content, re.I | re.S)

    p_check = projects == 7
    a_check = achievements == 9
    c_check = certifications == 8
    s_check = skills == 6
    t_check = typos == 0
    m_check = ms == 0
    ph_check = phones == 0
    l_check = links == 3
    h_check = len(h1_tags) == 1

    print(f'Projects count: {projects} (Expected: 7) -> {"PASS" if p_check else "FAIL"}')
    print(f'Achievements count: {achievements} (Expected: 9) -> {"PASS" if a_check else "FAIL"}')
    print(f'Certifications count: {certifications} (Expected: 8) -> {"PASS" if c_check else "FAIL"}')
    print(f'Skill groups count: {skills} (Expected: 6) -> {"PASS" if s_check else "FAIL"}')
    print(f'Devoleper typos count: {typos} (Expected: 0) -> {"PASS" if t_check else "FAIL"}')
    print(f'MS Office tools count: {ms} (Expected: 0) -> {"PASS" if m_check else "FAIL"}')
    print(f'Phone numbers count: {phones} (Expected: 0) -> {"PASS" if ph_check else "FAIL"}')
    print(f'Project link buttons count: {links} (Expected: 3) -> {"PASS" if l_check else "FAIL"}')
    print(f'H1 count: {len(h1_tags)} (Expected: 1) -> {"PASS" if h_check else "FAIL"}')

    if not all([p_check, a_check, c_check, s_check, t_check, m_check, ph_check, l_check, h_check]):
        all_passed = False

    # 4. Strict Relative Paths Check
    print('\n--- 4. Relative Paths Check ---')
    absolute_hrefs = re.findall(r'href=["\']/(?!/)[^"\']*["\']', html_content)
    absolute_srcs = re.findall(r'src=["\']/(?!/)[^"\']*["\']', html_content)
    href_ok = len(absolute_hrefs) == 0
    src_ok = len(absolute_srcs) == 0
    print(f'Absolute href paths: {len(absolute_hrefs)} -> {"PASS" if href_ok else "FAIL: " + str(absolute_hrefs)}')
    print(f'Absolute src paths: {len(absolute_srcs)} -> {"PASS" if src_ok else "FAIL: " + str(absolute_srcs)}')
    if not (href_ok and src_ok):
        all_passed = False

    # 5. Stylesheet Checks
    print('\n--- 5. Stylesheet Quality Checks ---')
    with open('styles.css', 'r', encoding='utf-8') as f:
        css_content = f.read()

    progress_bars = len(re.findall(r'\.progress-bar\b', css_content))
    reduced_motion = len(re.findall(r'@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)', css_content))
    dark_tokens = '--bg-base: #090d16' in css_content
    light_tokens = '--bg-base: #f8fafc' in css_content
    accent_tokens = '--accent: #6366f1' in css_content

    pb_ok = progress_bars == 0
    rm_ok = reduced_motion >= 1
    dt_ok = dark_tokens
    lt_ok = light_tokens
    at_ok = accent_tokens

    print(f'Progress bar count: {progress_bars} (Expected: 0) -> {"PASS" if pb_ok else "FAIL"}')
    print(f'prefers-reduced-motion queries: {reduced_motion} (Expected: >= 1) -> {"PASS" if rm_ok else "FAIL"}')
    print(f'Dark theme tokens present: {dark_tokens} -> {"PASS" if dt_ok else "FAIL"}')
    print(f'Light theme tokens present: {light_tokens} -> {"PASS" if lt_ok else "FAIL"}')
    print(f'Accent color #6366f1 present: {accent_tokens} -> {"PASS" if at_ok else "FAIL"}')

    if not all([pb_ok, rm_ok, dt_ok, lt_ok, at_ok]):
        all_passed = False

    # 6. PDF and WebP validation
    print('\n--- 6. Binary Asset Validation ---')
    with open('assets/resume.pdf', 'rb') as f:
        pdf_bytes = f.read()
    pdf_ok = pdf_bytes.startswith(b'%PDF-1.4') and b'xref' in pdf_bytes and b'%%EOF' in pdf_bytes
    print(f'Resume PDF is valid PDF-1.4: {pdf_ok} ({len(pdf_bytes)} bytes) -> {"PASS" if pdf_ok else "FAIL"}')

    with Image.open('assets/images/profile.webp') as im:
        webp_ok = im.format == 'WEBP' and im.size == (640, 960)
        print(f'Profile WebP format={im.format}, size={im.size} -> {"PASS" if webp_ok else "FAIL"}')

    if not (pdf_ok and webp_ok):
        all_passed = False

    print('\n=============================================')
    if all_passed:
        print('FINAL VERIFICATION VERDICT: ALL PASS (100%)')
    else:
        print('FINAL VERIFICATION VERDICT: SOME CHECKS FAILED')
    print('=============================================')

if __name__ == '__main__':
    run_checks()
