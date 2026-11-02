# Thiraviaraj R — Portfolio 2.0

> Premium, recruiter-ready developer portfolio for **Thiraviaraj R**, 2nd-year B.E. Computer Science and Engineering (AI & ML) student at Rathinam Technical Campus, Coimbatore (CGPA 9.46), CEH certified. Designed for SWE, ML, and R&D internship / placement applications (Google, Microsoft, Samsung R&D).

---

## ⚡ Live Preview & Hosting

- **Deployment**: Configured for static hosting on GitHub Pages (served from `/portfolio-2.0/`).
- **Tech Stack**: Pure Semantic HTML5, CSS3 with Modern Custom Properties & Bento Grids, and Vanilla ES6+ JavaScript.
- **Zero Build Step**: No webpack, Vite, npm, or bundler dependencies required.
- **Footprint**: Lightweight performance budget (< 300KB excluding images; compressed WebP visual assets).

---

## 📐 Architecture & Features

### 1. Design System & Theme Engine
- **Dark-First Architecture**: High-contrast, recruiter-focused dark aesthetic with seamless light-mode toggle.
- **System Preference & Persistence**: Automatically respects `prefers-color-scheme`, synchronizes across multi-tab sessions via `localStorage`, and handles sandboxed iframe security policies gracefully.
- **Color Palette & Typography**: Curated single accent (`#6366f1` / `#4f46e5`) paired with neutral slates (`#090d16`, `#0f172a`, `#1e293b`), using display typography (`Space Grotesk` / `Sora`) for headings and `Inter` for body copy.
- **WCAG AA Compliance**: High-contrast ratios (> 4.5:1 text, > 3.0:1 UI elements), visible keyboard focus rings (`:focus-visible`), and accessible ARIA attributes across interactive components.

### 2. Sections Order
1. **Hero**: Recruiter metric counters (CGPA 9.46, 7+ projects, CEH credential), dynamic live-region role rotator (*AI/ML Engineer*, *Flutter & Firebase Developer*, *Full-stack Builder*), and clear action CTAs.
2. **About**: First-person authentic narrative detailing background from Tirunelveli district, farming-family heritage, School Pupil Leader leadership (2022–2025), and structured technical self-learning ethos presented in an asymmetrical Bento Grid.
3. **Projects**: Uniform card grid with category filter chips (`All`, `Mobile`, `Web`, `AI`), compound category tagging, and keyboard navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`). Shows external links only for projects with verified URLs (`nammanellai.online`, `AI-Notes`, `gps-tracker`).
4. **Skills**: Categorized chip groups across Languages, App & Web, Data & ML, Security, Tools, and Core CS. Zero arbitrary percentage bars.
5. **Achievements**: Complete hackathon and competition highlights including Central India Hackathon 3.0, TATA Crucible Campus Quiz 2025, National Road Safety Hackathon 2025, GameTrade Hackathon, StratQuest, Equity Research Challenge, and Samsung Solve for Tomorrow 2026.
6. **Certifications Timeline**: Chronological journey featuring Certified Ethical Hacker (EC-Council), IBM SkillsBuild Generative AI, Scaler MLOps Fundamentals, Google UX Design, LinkedIn Learning technical series, and NPTEL Joy of Computing using Python.
7. **Contact**: Direct email communication (`thiraviyaraj2007@gmail.com`), Formspree-ready contact form with input validation, and GitHub profile link with clear placeholders for LinkedIn and LeetCode.

### 3. Motion & Accessibility Engine
- **Reduced Motion Respect**: Strict enforcement of `prefers-reduced-motion: reduce`. Instantly disables transitions, cancels animation frames, and snaps metric counters to target values without delay.
- **Accessible Mobile Drawer**: Hamburger menu with complete keyboard focus trapping, `Escape` key dismissal, backdrop-click dismissal, and auto-dismissal on viewport resizing across the 1024px breakpoint.
- **Scroll-Spy Navigation**: Header offset tracking with smooth section highlight indicators.

---

## 📁 Repository Structure

```text
portfolio_thiraviarajR-2/
├── assets/
│   ├── favicon.ico                   # Standard browser favicon
│   ├── favicon.svg                   # Vector SVG brand icon
│   ├── resume.pdf                    # Resume PDF placeholder
│   ├── images/
│   │   └── profile.webp              # Compressed profile portrait (< 80KB)
│   └── projects/                     # WebP visual slots for project previews
│       ├── ai-notes.webp
│       ├── gps-tracker.webp
│       ├── habitai.webp
│       ├── medicine-chem-platform.webp
│       ├── namma-nellai.webp
│       ├── road-safety.webp
│       └── swiftshare.webp
├── index.html                        # Semantic HTML5 markup with JSON-LD SEO schema
├── styles.css                        # Design tokens, bento layout, responsive breakpoints
├── script.js                         # Modular vanilla JS interaction & motion engine
├── tests/                            # Comprehensive empirical test & audit suite
└── README.md                         # Documentation & developer guide
```

---

## 🛠️ Local Development

To run and preview the site locally:

1. Clone or open the workspace folder.
2. Serve using any local HTTP static server:
   ```bash
   # Using Python 3 built-in server
   python -m http.server 8000
   ```
   Or use the VS Code *Live Server* extension.
3. Open `http://localhost:8000` in your browser.

### Running Automated Test Suites

```bash
# Run Python empirical tests & audits
python -m pytest tests/
python tests/stress_test_m1.py
python tests/challenger_m1_deep_audit.py
python tests/test_reviewer_m1_2.py
python tests/test_explorer_m2_2.py

# Run Node.js motion, focus-trap, and a11y tests
node tests/test_adversarial_m2_it2_2.cjs
node tests/test_mobile_nav_focus_trap_it2.cjs
node tests/adversarial_motion_stress.cjs
node tests/test_js_modules_m2_2.cjs
```

---

## 📋 Action Items & Developer TODOs

The following placeholders are deliberately prepared in the codebase for Thiraviaraj R to fill in:

1. **LinkedIn Profile URL**:
   - Location: `index.html` (Hero section and Contact section social links)
   - Search for: `<!-- TODO: Thiraviaraj to add LinkedIn profile URL -->`
   - Update `href="#"` with your actual LinkedIn profile link (`https://linkedin.com/in/<your-handle>`).

2. **LeetCode Profile URL**:
   - Location: `index.html` (Hero section and Contact section social links)
   - Search for: `<!-- TODO: Thiraviaraj to add LeetCode profile URL -->`
   - Update `href="#"` with your actual LeetCode profile link (`https://leetcode.com/u/<your-handle>`).

3. **Resume Document (`assets/resume.pdf`)**:
   - Location: `assets/resume.pdf`
   - Replace the placeholder PDF binary with your updated, ATS-optimized one-page resume.

4. **Project Screenshots**:
   - Location: `assets/projects/<project-slug>.webp`
   - High-fidelity CSS gradient covers and fallback error handlers are active. When real UI screenshots are ready, place WebP screenshots into:
     - `assets/projects/namma-nellai.webp`
     - `assets/projects/swiftshare.webp`
     - `assets/projects/habitai.webp`
     - `assets/projects/ai-notes.webp`
     - `assets/projects/gps-tracker.webp`
     - `assets/projects/road-safety.webp`
     - `assets/projects/medicine-chem-platform.webp`

5. **Formspree Endpoint ID**:
   - Location: `index.html` line inside `<form class="contact-form" ...>`
   - Update the action attribute: `action="https://formspree.io/f/YOUR_FORM_ID"` with your personal Formspree endpoint ID to receive messages directly in your inbox.

---

## 📄 License & Attribution

Designed and engineered for **Thiraviaraj R**. All rights reserved.
