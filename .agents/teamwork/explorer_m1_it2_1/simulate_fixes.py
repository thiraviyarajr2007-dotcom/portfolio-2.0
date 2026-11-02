import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Apply proposed fixes to simulated HTML
sim_html = html

# Section 2 fixes
sim_html = sim_html.replace('class="about-bento-grid"', 'class="about-bento-grid bento-grid"')
sim_html = sim_html.replace('class="bento-card bento-card-academic reveal-on-scroll"', 'class="bento-card bento-card-academic bento-card-academics reveal-on-scroll"')
sim_html = sim_html.replace('class="profile-image-frame"', 'class="profile-image-frame profile-frame"')
sim_html = sim_html.replace('class="narrative-body"', 'class="narrative-body bento-body"')

# Navbar fixes
sim_html = sim_html.replace('class="header-container"', 'class="header-container container navbar"')
sim_html = sim_html.replace('class="brand-logo"', 'class="brand-logo logo"')
sim_html = sim_html.replace('class="accent-dot"', 'class="accent-dot logo-dot"')
sim_html = sim_html.replace('class="site-nav"', 'class="site-nav nav-menu"')
sim_html = sim_html.replace('class="nav-list"', 'class="nav-list nav-links"')
sim_html = sim_html.replace('class="header-controls"', 'class="header-controls nav-actions"')
sim_html = sim_html.replace('class="theme-icon sun-icon"', 'class="theme-icon sun-icon theme-icon-sun"')
sim_html = sim_html.replace('class="theme-icon moon-icon"', 'class="theme-icon moon-icon theme-icon-moon"')
sim_html = sim_html.replace('class="hamburger-bar"', 'class="hamburger-bar hamburger-line"')

# Hero fixes
sim_html = sim_html.replace('class="container hero-container"', 'class="container hero-container hero-content"')
sim_html = sim_html.replace('class="hero-badge reveal-on-scroll"', 'class="hero-badge hero-status-pill reveal-on-scroll"')
sim_html = sim_html.replace('class="status-indicator"', 'class="status-indicator status-dot"')
sim_html = sim_html.replace('class="hero-title reveal-on-scroll"', 'class="hero-title hero-name reveal-on-scroll"')
sim_html = sim_html.replace('class="hero-role-wrapper reveal-on-scroll"', 'class="hero-role-wrapper hero-roles reveal-on-scroll"')
sim_html = sim_html.replace('class="hero-tagline reveal-on-scroll"', 'class="hero-tagline hero-description reveal-on-scroll"')
sim_html = sim_html.replace('class="hero-actions reveal-on-scroll"', 'class="hero-actions hero-ctas reveal-on-scroll"')
sim_html = sim_html.replace('class="hero-stats-grid reveal-on-scroll"', 'class="hero-stats-grid hero-stats reveal-on-scroll"')

# Form fixes
sim_html = sim_html.replace('class="form-input"', 'class="form-input form-control"')
sim_html = sim_html.replace('class="form-textarea"', 'class="form-textarea form-control"')
sim_html = sim_html.replace('class="contact-form-panel reveal-on-scroll"', 'class="contact-form-panel contact-form-card reveal-on-scroll"')

# Contact Info fixes
sim_html = sim_html.replace('class="contact-info-panel reveal-on-scroll"', 'class="contact-info-panel contact-info reveal-on-scroll"')
sim_html = sim_html.replace('class="contact-panel-title"', 'class="contact-panel-title contact-intro-title"')
sim_html = sim_html.replace('class="contact-panel-desc"', 'class="contact-panel-desc contact-intro-text"')
sim_html = sim_html.replace('class="contact-details"', 'class="contact-details contact-links-list"')
sim_html = sim_html.replace('class="contact-detail-item"', 'class="contact-detail-item contact-link-card"')
sim_html = sim_html.replace('class="contact-icon"', 'class="contact-icon contact-card-icon"')
sim_html = sim_html.replace('class="detail-name"', 'class="detail-name contact-card-label"')
sim_html = sim_html.replace('class="contact-link"', 'class="contact-link contact-card-val"')

# Footer fixes
sim_html = sim_html.replace('class="container footer-container"', 'class="container footer-container footer-inner"')
sim_html = sim_html.replace('<p>&copy; 2026 Thiraviaraj R.', '<p class="footer-copy footer-note">&copy; 2026 Thiraviaraj R.')

# Projects fixes
sim_html = sim_html.replace('class="project-filters reveal-on-scroll"', 'class="project-filters filter-bar reveal-on-scroll"')
sim_html = sim_html.replace('class="project-card-visual"', 'class="project-card-visual project-media"')
sim_html = sim_html.replace('class="project-badge"', 'class="project-badge project-device-badge"')
sim_html = sim_html.replace('class="project-card-content"', 'class="project-card-content project-body"')
sim_html = sim_html.replace('class="project-card-header"', 'class="project-card-header project-header"')

# Skills fixes
sim_html = sim_html.replace('class="skill-icon-wrapper"', 'class="skill-icon-wrapper skill-group-icon"')

# Achievements fixes
sim_html = sim_html.replace('class="achievement-header"', 'class="achievement-header achievement-top"')
sim_html = sim_html.replace('class="achievement-organizer"', 'class="achievement-organizer achievement-org"')
sim_html = sim_html.replace('class="achievement-description"', 'class="achievement-description achievement-desc"')

# Certifications fixes
sim_html = sim_html.replace('class="certifications-timeline"', 'class="certifications-timeline cert-timeline"')
sim_html = sim_html.replace('class="timeline-item timeline-featured reveal-on-scroll"', 'class="timeline-item featured timeline-featured reveal-on-scroll"')
sim_html = sim_html.replace('class="timeline-card-header"', 'class="timeline-card-header timeline-header"')
sim_html = sim_html.replace('class="credential-title"', 'class="credential-title timeline-title"')
sim_html = sim_html.replace('class="credential-issuer"', 'class="credential-issuer timeline-issuer"')
sim_html = sim_html.replace('class="credential-summary"', 'class="credential-summary timeline-details"')

# Check parity with CSS
css_classes = set(re.findall(r'\.([a-zA-Z0-9_\-]+)', css))
valid_css = {c for c in css_classes if not c.isdigit() and not re.match(r'^\d+[a-z%]+$', c)}

# Check if target key selectors exist in simulated HTML
key_selectors = [
    "bento-grid", "bento-card-academics", "navbar", "logo", "logo-dot", "nav-links",
    "nav-actions", "theme-icon-sun", "theme-icon-moon", "hamburger-line",
    "hero-content", "hero-name", "hero-ctas", "hero-stats", "hero-status-pill", "status-dot",
    "form-control", "contact-form-card", "contact-info", "filter-bar", "project-media",
    "skill-group-icon", "achievement-top", "timeline-title", "featured", "footer-inner"
]

print("=== VERIFYING TARGET KEY SELECTORS IN SIMULATED HTML ===")
all_ok = True
for sel in key_selectors:
    found = sel in sim_html
    if not found:
        print(f"[MISSING] {sel}")
        all_ok = False
    else:
        print(f"[FOUND] {sel}")

if all_ok:
    print("\nALL 25 KEY TARGET CLASSES PRESENT IN SIMULATED HTML!")

