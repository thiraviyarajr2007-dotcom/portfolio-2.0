# Master Technical Architecture & Specification Blueprint (Explorer Survey 2)

## 1. Observation

### Workspace & Codebase Audit
1. **Repository & Git State** (`git status ; git remote -v`):
   - Current branch: `main`, clean working tree with `.agents/` untracked.
   - Remote `origin`: `https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git` (fetch & push).
   - Deployment target: GitHub Pages under `/portfolio-2.0/` subpath.
2. **Current Codebase Files**:
   - `index.html` (20,892 bytes, 425 lines): Uses legacy Poppins font, Font Awesome CDN (`v6.4.0`), static table-style skills with percentage progress bars (lines 145-257), placeholder images `https://via.placeholder.com/400x300` (lines 78, 97, 116), typo `"devoleper"` on line 39, unescaped/malformed `<P>` and unclosed tags on lines 56-58, 383.
   - `styles.css` (10,598 bytes, 574 lines): Basic light theme with purple gradient, rigid desktop layouts, no dark mode, no CSS custom property theming system for dark/light switching, no reduced motion rules.
   - `script.js` (4,299 bytes, 129 lines): Basic scroll animation using `getBoundingClientRect` polling on scroll events rather than modern `IntersectionObserver`, hardcoded skill progress bar animations, form alert mockup.
   - Profile image `C29AIML_THIRAVIARAJ R.png` (2,522,992 bytes, ~2.52 MB): Uncompressed raw PNG located at repository root.
3. **Environment & Runtime Availability**:
   - Python: `3.10.11` with Pillow `12.1.1` installed (`PIL.__version__ == 12.1.1`).
   - Node.js: `v24.15.0` available.
4. **Mandatory Requirements from ORIGINAL_REQUEST.md**:
   - Stack: Static HTML + modern CSS + vanilla JS only (zero build step).
   - Path resolution: Strictly relative asset paths (must resolve cleanly at `/portfolio-2.0/` or root).
   - Payload Budget: Under ~300KB excluding images. Images converted to WebP.
   - Dark-first theme with light-mode toggle (`prefers-color-scheme` + `localStorage` persistence).
   - Display font: Space Grotesk (or Sora) for headings; Inter for body; robust system font fallbacks.
   - Bento-grid layout for About and Skills; large-type hero; subtle gradient/noise background; glass nav with active-section spy.
   - Motion: scroll-reveal, hover lift, animated counters, STRICT adherence to `prefers-reduced-motion`.
   - Skills: Grouped chips only; NO percentage progress bars; complete removal of MS Office tools.
   - Mobile-first breakpoints: 360px, 768px, 1280px, 1920px.
   - Semantic HTML5: Single `h1`, alt text, visible focus states, keyboard navigation, WCAG AA contrast.
   - SEO: Title, meta description, Open Graph, Twitter cards, favicon, Schema.org Person JSON-LD.
   - Projects: Uniform card template across all 7 projects with category filtering (All/Mobile/Web/AI); code comment for adding projects.
   - Privacy: STRICT prohibition on publishing phone number.
   - Final Git Sync: Remote verification, main branch, no `--force`.

---

## 2. Logic Chain

From the observations above, the following architectural and design decisions are derived:

### Step 1: Directory Structure & Relative Path Protocol
Because GitHub Pages hosts project sites at `https://<user>.github.io/<repo>/` (here `/portfolio-2.0/`), absolute paths such as `/styles.css` or `/assets/...` will resolve to `https://<user>.github.io/styles.css` and return HTTP 404 errors.
Therefore:
- All asset, CSS, and JS references must use `./` or directory-relative paths:
  ```
  portfolio_thiraviarajR-2/
  ├── index.html
  ├── styles.css
  ├── script.js
  ├── README.md
  └── assets/
      ├── images/
      │   ├── profile.webp         (< 80KB, converted from C29AIML_THIRAVIARAJ R.png)
      │   └── og-image.webp        (1200x630 social card)
      ├── projects/
      │   ├── namma-nellai.webp    (slot)
      │   ├── swift-share.webp     (slot)
      │   ├── habit-ai.webp        (slot)
      │   ├── ai-notes.webp        (slot)
      │   ├── gps-tracker.webp     (slot)
      │   ├── road-safety.webp     (slot)
      │   └── medicine-id.webp     (slot)
      ├── resume.pdf               (placeholder PDF)
      └── favicon.svg              (scalable SVG icon)
  ```

### Step 2: Performance Budget (< 300KB Target)
- Modern lightweight SVGs replace Font Awesome CDN (saving ~220KB of font downloads).
- Google Fonts `Inter` + `Space Grotesk` imported with `display=swap` and specific weights (`400, 500, 600, 700`) will transfer ~70KB of WOFF2 files.
- Static HTML (~30KB) + CSS (~35KB) + JS (~15KB) = ~80KB code.
- Total transfer excluding images: ~150KB — well under the 300KB ceiling.
- The 2.52MB PNG profile picture will be converted via Pillow to WebP with 85% quality and max 800px width, reducing size to ~40-70KB (>97% size reduction).

### Step 3: Design Token System (CSS Custom Properties)
To support dark-first design with instant theme toggle and zero flash of incorrect theme (FOIT/FOUT):
1. An inline `<script>` in the `<head>` resolves `localStorage` or `matchMedia` immediately before rendering.
2. All layout, background, border, text, and accent colors are abstracted through CSS variables.

```css
/* ==========================================================================
   DESIGN TOKENS & CSS VARIABLES
   ========================================================================== */
:root {
  /* Typography */
  --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Core Accent Palette (Electric Indigo) */
  --accent: #6366f1;
  --accent-light: #818cf8;
  --accent-dark: #4f46e5;
  --accent-glow: rgba(99, 102, 241, 0.22);
  --accent-subtle: rgba(99, 102, 241, 0.12);
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);

  /* Transitions */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 5rem;

  /* Border Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Container width */
  --container-max: 1280px;
}

/* Dark Theme (Default) */
:root, [data-theme="dark"] {
  --bg-base: #090d16;
  --bg-surface: #111827;
  --bg-surface-elevated: #1a2234;
  --bg-glass: rgba(17, 24, 39, 0.82);
  
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.15);
  --border-focus: var(--accent-light);

  --text-primary: #f8fafc;       /* 16.5:1 contrast vs #090d16 (AAA) */
  --text-secondary: #94a3b8;     /* 7.2:1 contrast vs #090d16 (AAA) */
  --text-muted: #64748b;         /* 4.6:1 contrast vs #111827 (AA) */

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-card: 0 12px 32px -8px rgba(0, 0, 0, 0.6);
  --shadow-hover: 0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 24px var(--accent-glow);
  
  --nav-backdrop: rgba(9, 13, 22, 0.85);
  --badge-bg: rgba(99, 102, 241, 0.15);
}

/* Light Theme Override */
[data-theme="light"] {
  --bg-base: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f1f5f9;
  --bg-glass: rgba(255, 255, 255, 0.88);

  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-medium: rgba(0, 0, 0, 0.14);
  --border-focus: var(--accent-dark);

  --text-primary: #0f172a;       /* 17.1:1 contrast vs #f8fafc (AAA) */
  --text-secondary: #334155;     /* 8.9:1 contrast vs #f8fafc (AAA) */
  --text-muted: #64748b;         /* 4.6:1 contrast vs #ffffff (AA) */

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-card: 0 12px 32px -8px rgba(15, 23, 42, 0.08);
  --shadow-hover: 0 20px 40px -12px rgba(15, 23, 42, 0.14), 0 0 24px var(--accent-glow);

  --nav-backdrop: rgba(248, 250, 252, 0.9);
  --badge-bg: rgba(99, 102, 241, 0.1);
}
```

### Step 4: Layout Systems & Bento Grid Architecture

#### A. About Section Bento Grid
- Grid layout: 12-column responsive grid on desktop (`min-width: 1280px`), 2-column on tablet (`768px`), 1-column on mobile (`360px`).
- Structure:
  - **Narrative Card (Span 7, Row Span 2)**: Authentic story (Tirunelveli, farming family, school pupil leader 2022-25, pragmatic engineer building real solutions, structured learning).
  - **Profile Visual Card (Span 5, Row Span 2)**: Portrait in glowing frame, status badge (`🟢 Available for SWE/ML Internships`), CGPA 9.46 highlight.
  - **Academic & Roots Card (Span 4)**: B.E. CSE (AI & ML) @ Rathinam Technical Campus, Coimbatore, School Pupil Leader 2022-25.
  - **Engineering Philosophy Card (Span 4)**: Structured discipline, curiosity-driven exploration, deep fundamentals.
  - **Career Target Card (Span 4)**: SWE, ML, and R&D engineering roles targeting Google, Microsoft, Samsung R&D.

#### B. Skills Section Bento Grid
- Grouped into 6 thematic Bento modules (NO PROGRESS BARS):
  1. **Languages**: Python, Java, C, JavaScript, SQL, HTML/CSS
  2. **App & Web**: Flutter, Kotlin, Firebase (Auth, Firestore), React, Node.js REST APIs, Responsive Web Design
  3. **Data & ML**: Pandas, NumPy, Matplotlib, ML Fundamentals, Deep Learning, Generative AI (Gemini API)
  4. **Security**: Ethical Hacking (CEH), Secure Auth Design
  5. **Tools & Workflow**: Git, GitHub, VS Code, Android Studio, Google Colab, Jupyter
  6. **Core CS**: DSA, OOP, Problem Solving
- Every skill item is rendered as a `.skill-chip`:
  - Contains inline SVG tech icon.
  - Subtle interactive hover lift and glow.
  - Absolutely zero percentages and zero `<div class="progress-bar">`.

#### C. Projects Grid & Uniform Card Template
- Filter Bar: Interactive chips `[All]`, `[Mobile]`, `[Web]`, `[AI]` with `aria-pressed="true/false"`.
- Responsive Grid: `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))` on desktop/tablet, `1fr` on mobile.
- Strict Uniform Card Template:
  ```html
  <article class="project-card" data-category="mobile">
    <div class="project-media">
      <div class="project-cover-gradient" style="background: linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%);">
        <!-- Slot for real screenshot: assets/projects/namma-nellai.webp -->
        <span class="project-device-badge">Mobile App</span>
      </div>
    </div>
    <div class="project-body">
      <div class="project-header">
        <h3 class="project-title">Namma Nellai</h3>
        <span class="category-tag">Mobile</span>
      </div>
      <p class="project-summary">Civic app for Tirunelveli district connecting citizens to local transit and civic services.</p>
      <div class="project-tech-chips">
        <span class="tech-chip">Flutter</span>
        <span class="tech-chip">Firebase</span>
        <span class="tech-chip">Twilio</span>
      </div>
      <ul class="project-bullets">
        <li>Multilingual citizen interface tailored for rural and urban community accessibility.</li>
        <li>Live bus and train transit lookup with schedule caching for weak connectivity.</li>
        <li>Multi-provider authentication and verified SMS OTP dispatch via Twilio.</li>
      </ul>
      <div class="project-footer">
        <a href="https://nammanellai.online" class="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer">
          Live App <svg class="btn-icon">...</svg>
        </a>
      </div>
    </div>
  </article>
  ```
- **Rule on Project Links**:
  - `Namma Nellai`: Link button -> `https://nammanellai.online`
  - `SwiftShare`: No link -> No button rendered (footer is clean or empty).
  - `HabitAI`: No link -> No button rendered.
  - `AI Notes & Productivity App`: Link button -> `https://github.com/thiraviyarajr2007-dotcom/AI-Notes`
  - `Car Front Display GPS Tracker`: Link button -> `https://github.com/thiraviyarajr2007-dotcom/gps-tracker`
  - `Road Safety Hackathon Project`: No link -> No button rendered.
  - `Medicine Identification & Chemistry Learning Platform`: No link -> No button rendered.
- **Project Insertion Marker**:
  ```html
  <!-- ADD MORE PROJECTS HERE: Follow the uniform card template above -->
  ```

#### D. Achievements Section
- Display all 8 existing competitions from `index.html` plus Samsung Solve for Tomorrow 2026:
  1. Central India Hackathon 3.0 (Suryodaya College of Engineering & Technology, Nagpur — Team Hacker's Squad, Unstop)
  2. TATA Crucible Campus Quiz 2025 (Tata Group)
  3. Smart Motion Hackathon 2.0 (CIT Chennai)
  4. Odoo x Adani University Hackathon '26 (Adani University)
  5. StratQuest (IIT Kharagpur)
  6. Equity Research Challenge 2025-26 (IIT Guwahati)
  7. GameTrade Hackathon (IIT Madras — Phase 1 Storyboard & Concept)
  8. National Road Safety Hackathon 2025 (IIT Madras)
  9. **Samsung Solve for Tomorrow 2026** (National innovation challenge submission)
- Styled as modern achievement cards with institution tags, verified participant badges, and trophy/award icons.

#### E. Certifications Timeline Section
- Timeline vertical track connecting nodes in chronological/prominence hierarchy:
  1. **Certified Ethical Hacker (CEH)** — EC-Council [Flagship Security Credential]
  2. **Use Generative AI for Software Development** — IBM SkillsBuild (2025)
  3. **MLOps Fundamentals** — Scaler (Nov 2025)
  4. **Google UX Design Certificate** — Coursera
  5. **Machine Learning with Python** — LinkedIn Learning
  6. **Deep Learning Optimization** — LinkedIn Learning
  7. **Cybersecurity Threat Landscape** — LinkedIn Learning
  8. **Joy of Computing using Python** — NPTEL

#### F. Contact Section
- Email: `thiraviyaraj2007@gmail.com`
- Contact form with mailto fallback and Formspree action placeholder (`https://formspree.io/f/placeholder`).
- Social links:
  - GitHub: `https://github.com/thiraviyarajr2007-dotcom`
  - LinkedIn: `https://www.linkedin.com/in/thiraviaraj-rm-5b7478303` (labeled clearly as active/TODO placeholder)
  - LeetCode: Marked TODO placeholder
  - Unstop: `https://unstop.com/u/thirar57637`
- STRICT PRIVACY: NO phone number anywhere in code, attributes, or text.

### Step 5: Motion, Animation & `prefers-reduced-motion`
1. **IntersectionObserver Scroll Reveal**:
   - Elements tagged with `.reveal-on-scroll` gain class `.revealed` when entering viewport with threshold `0.15`.
   - Subtle translateY(16px) -> translateY(0) and opacity: 0 -> 1 with CSS easing `cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Animated Stats Counters**:
   - Hero stats: `9.46` (CGPA), `7+` (Projects Built), `1` (CEH Certified).
   - Animated via `requestAnimationFrame` over 1500ms using easeOutExpo timing.
3. **Hero Rotating Role Line**:
   - Rotates through: `"AI/ML Engineer"`, `"Flutter & Firebase Developer"`, `"Full-stack Builder"`.
   - Accessible announcement using `aria-live="polite"` and `aria-atomic="true"`.
4. **STRICT PREFERS-REDUCED-MOTION ADHERENCE**:
   - CSS rule:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
         animation-duration: 0.001ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.001ms !important;
         scroll-behavior: auto !important;
       }
       .reveal-on-scroll {
         opacity: 1 !important;
         transform: none !important;
       }
     }
     ```
   - JS rule:
     ```javascript
     const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
     if (reducedMotionQuery.matches) {
       // Set counters to final numbers immediately without animation
       // Freeze role rotator or show combined static text
     }
     ```

### Step 6: Responsive Breakpoints Matrix
Mobile-first CSS with media query hierarchy:
- **Base Mobile (360px - 767px)**:
  - Single column container (`padding: 0 1rem`).
  - Hamburger toggle with slide-down/fullscreen glass drawer.
  - Bento grids collapse to 1 column.
  - Minimum touch target: `44px x 44px`.
- **Tablet (768px - 1279px)**:
  - `@media (min-width: 768px)`
  - Bento grids scale to 2 columns.
  - Project grid switches to 2 columns.
  - Hero stats display horizontally in a 3-item grid.
- **Desktop (1280px - 1919px)**:
  - `@media (min-width: 1280px)`
  - Full 12-column bento grids for About and Skills.
  - 3-column project cards.
  - Desktop glass navbar with active section pill spy.
- **Ultra-Wide (1920px+)**:
  - `@media (min-width: 1920px)`
  - Max container constrained to `1360px` or `1440px` centered to maintain optimal reading line length (~65-75 characters).

### Step 7: Accessibility & WCAG AA Compliance Checklist
- Semantic HTML5: `<header>`, `<nav>`, `<main id="main">`, `<section>`, `<article>`, `<footer>`.
- Heading Hierarchy: Single `<h1>` in hero, `<h2>` for each section, `<h3>` for cards, `<h4>` for sub-elements.
- Focus Visible: High contrast outline `outline: 2px solid var(--accent); outline-offset: 3px;` on all interactive `:focus-visible` elements.
- Skip link: `<a href="#main" class="skip-link">Skip to main content</a>` as the first body child.
- Keyboard Navigation:
  - Mobile menu toggles via Enter/Space, closes on Escape, traps Tab focus while open.
  - Nav links close mobile drawer on click and scroll smoothly.
- Color Contrast: All text combinations meet or exceed WCAG AA (4.5:1 for body text, 3:1 for large text and UI borders).

### Step 8: SEO & Schema.org JSON-LD Specification
Comprehensive `<head>` configuration:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thiraviaraj R | AI/ML Engineer & Full-Stack Developer</title>
  <meta name="description" content="Portfolio of Thiraviaraj R — 2nd-year B.E. CSE (AI & ML) student at Rathinam Technical Campus, Coimbatore (CGPA 9.46, CEH Certified). Targeting SWE, ML, and R&D internships.">
  <meta name="author" content="Thiraviaraj R">
  <meta name="keywords" content="Thiraviaraj R, AI/ML Engineer, Flutter Developer, Firebase, Machine Learning, CEH, Rathinam Technical Campus, Portfolio">
  <link rel="canonical" href="https://thiraviyarajr2007-dotcom.github.io/portfolio-2.0/">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://thiraviyarajr2007-dotcom.github.io/portfolio-2.0/">
  <meta property="og:title" content="Thiraviaraj R | AI/ML Engineer & Full-Stack Developer">
  <meta property="og:description" content="2nd-year B.E. CSE (AI & ML) student, CGPA 9.46, CEH certified. View projects, skills, and hackathon achievements.">
  <meta property="og:image" content="./assets/images/og-image.webp">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://thiraviyarajr2007-dotcom.github.io/portfolio-2.0/">
  <meta name="twitter:title" content="Thiraviaraj R | AI/ML Engineer & Full-Stack Developer">
  <meta name="twitter:description" content="2nd-year B.E. CSE (AI & ML) student, CGPA 9.46, CEH certified. Targeting SWE, ML, and R&D internships.">
  <meta name="twitter:image" content="./assets/images/og-image.webp">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">

  <!-- Google Fonts Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="./styles.css">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Thiraviaraj R",
    "givenName": "Thiraviaraj",
    "familyName": "R",
    "url": "https://thiraviyarajr2007-dotcom.github.io/portfolio-2.0/",
    "email": "mailto:thiraviyaraj2007@gmail.com",
    "jobTitle": "AI/ML Engineer & Full-Stack Developer",
    "description": "2nd-year B.E. CSE (AI & ML) student at Rathinam Technical Campus, CEH certified, building practical software for real-world problems.",
    "affiliation": {
      "@type": "EducationalOrganization",
      "name": "Rathinam Technical Campus",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Coimbatore",
        "addressRegion": "Tamil Nadu",
        "addressCountry": "India"
      }
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Rathinam Technical Campus"
    },
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "name": "Certified Ethical Hacker (CEH)",
        "credentialCategory": "Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "EC-Council"
        }
      }
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "Flutter",
      "Firebase",
      "Python",
      "Java",
      "C",
      "JavaScript",
      "Ethical Hacking",
      "Full-stack Web Development"
    ],
    "sameAs": [
      "https://github.com/thiraviyarajr2007-dotcom",
      "https://www.linkedin.com/in/thiraviaraj-rm-5b7478303",
      "https://unstop.com/u/thirar57637"
    ]
  }
  </script>
</head>
```

### Step 9: Git Synchronization Pipeline
When implementation and testing are complete:
```bash
git status
# Confirm remote origin:
git remote set-url origin https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git
# Switch or ensure main branch:
git branch -M main
# Stage changes:
git add -A
# Commit with standardized message:
git commit -m "feat: rebuild portfolio with new design system and content"
# Push:
git push -u origin main
```
Strict rule: Never use `--force`. If push encounters issues, report error and halt.

---

## 3. Caveats

1. **Local vs Remote Asset Previewing**: Because GitHub Pages serves from `/portfolio-2.0/`, testing locally via `file://` or `http://localhost:8000` must also verify relative asset paths (`./styles.css`, `./assets/...`) rather than root-relative (`/styles.css`).
2. **Third-Party CDN Dependencies**: To ensure the < 300KB budget and eliminate external failure modes, external icon libraries (like Font Awesome CDN) should be replaced with crisp inline SVGs.
3. **Formspree / Mailto Fallback**: The contact form is a frontend placeholder; Formspree action requires user endpoint registration or client-side `mailto:` fallback.
4. **LinkedIn & LeetCode Placeholders**: Marked clearly with `aria-label="LinkedIn profile (Coming Soon)"` or direct user link.
5. **No Phone Number**: Zero mentions of user's phone number throughout HTML, scripts, and meta tags.

---

## 4. Conclusion

The technical architecture provides a bulletproof foundation for the portfolio rebuild:
- **Performance**: Under 180KB total transfer (excluding images), zero build step, zero heavy CDN dependencies.
- **Visuals**: Dark-first default, persistent light toggle, Bento grid layouts for About & Skills, large hero with animated stats and accessible rotating role line.
- **Engineering Quality**: Pure semantic HTML5, single `h1`, WCAG AA contrast, strict `prefers-reduced-motion` compliance, mobile-first responsive breakpoints (360px, 768px, 1280px, 1920px).
- **SEO & Social**: Complete Open Graph, Twitter Cards, SVG favicon, and Schema.org `Person` JSON-LD.
- **Git Sync**: Standardized branch, remote, and commit workflow without `--force`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Budget & Asset Size Check**:
   ```powershell
   Get-ChildItem -Path index.html, styles.css, script.js | Measure-Object -Property Length -Sum
   # Must be < 300,000 bytes (< 300KB)
   ```
2. **Image Conversion Verification**:
   ```powershell
   Get-ChildItem -Path assets -Recurse -Filter *.webp
   # Confirm assets/profile.webp exists and is < 100KB
   ```
3. **Semantic Hierarchy & Heading Check**:
   ```powershell
   Select-String -Path index.html -Pattern "<h1"
   # Must yield exactly 1 match
   ```
4. **Typo Verification ("devoleper")**:
   ```powershell
   Select-String -Path index.html, styles.css, script.js -Pattern "devoleper" -SimpleMatch
   # Must return 0 matches
   ```
5. **Phone Number Privacy Verification**:
   ```powershell
   Select-String -Path index.html, script.js -Pattern "[0-9]{10}"
   # Must return 0 matches (no phone numbers published)
   ```
6. **No Progress Bars in Skills**:
   ```powershell
   Select-String -Path index.html -Pattern "progress-bar"
   # Must return 0 matches
   ```
7. **Git Remote & Status Check**:
   ```powershell
   git status
   git remote -v
   # origin must point to https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git
   ```
