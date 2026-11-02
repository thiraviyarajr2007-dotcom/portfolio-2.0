# Project: Portfolio 2.0 Rebuild (Thiraviaraj R)

## Architecture
- **Type**: Pure static web application (HTML5, CSS3, vanilla ES6+ JS). Zero external build step or bundler.
- **Path Resolution**: Strictly directory-relative (`./styles.css`, `./assets/...`) ensuring seamless serving on GitHub Pages (`/portfolio-2.0/`) as well as local file systems.
- **Budget**: Total transfer under ~180KB excluding images. Images optimized as WebP under ~80KB.
- **Theming & Tokens**: Dark-first by default with instant toggle to light theme, zero-flash head script, `localStorage` persistence, and `prefers-color-scheme` matching.
- **Typography**: Space Grotesk display headings, Inter body, with complete native system fallbacks.
- **Accessibility & Motion**: Semantic HTML5, single `h1`, WCAG AA contrast (4.5:1+), skip link, keyboard navigation trap for mobile drawer, and strict adherence to `prefers-reduced-motion` in CSS and JS.
- **SEO & Structured Data**: Open Graph, Twitter Cards, SVG favicon, and Schema.org `Person` JSON-LD.

## Code Layout
- `index.html` — Semantic single-page structure covering all 7 sections. Owned by M1 (structure/content) and M2 (interactive bindings).
- `styles.css` — CSS custom properties, dark/light themes, Bento grid layouts, responsive rules, motion & reduced-motion queries. Owned by M1 (layout/styles) and M2 (interactive classes).
- `script.js` — Vanilla JavaScript: theme toggle, project filter, hero role rotator, IntersectionObserver scroll reveal, animated counters, mobile menu. Owned by M2.
- `README.md` — Project documentation, features, architecture, and preview guide. Owned by M3.
- `assets/` — Directory layout:
  - `assets/images/profile.webp` — Converted and compressed profile picture (<80KB). Owned by M1.
  - `assets/projects/<slug>.webp` — Slots for project preview screenshots. Owned by M1.
  - `assets/resume.pdf` — Resume download placeholder. Owned by M1.
  - `assets/favicon.svg` & `assets/favicon.ico` — Lightweight site icons. Owned by M1.
- `tests/` — Automated test harness for verifying features, accessibility, responsiveness, and performance. Owned by M3.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Asset Pipeline & Profile WebP | Compress 2.41MB PNG to WebP (<80KB), create asset directories and placeholders | M1 | Survey 1, Survey 2 |
| 2 | Design Token System & CSS Architecture | CSS variables for dark/light themes, typography, spacing, shadows, reset | M1 | Survey 2 |
| 3 | SEO & Metadata | Open Graph, Twitter Card, meta description, favicon, Person JSON-LD schema | M1 | Survey 2 |
| 4 | Section 1: Hero Structure & Content | Name, rotating roles markup, value statement, 3 CTAs, 4 stat counter elements | M1 | Survey 3 |
| 5 | Section 2: About (Bento Grid) | Grounded narrative (Tirunelveli, farming family, school pupil leader, RTC CGPA 9.46), portrait slot, pillars | M1 | Survey 1, Survey 3 |
| 6 | Section 3: Projects (Uniform Cards) | 7 projects, uniform cards, tech chips, 2-3 bullets, links only where given, gradient/mockup slots, addition marker | M1 | Survey 3 |
| 7 | Section 4: Skills (Grouped Chips) | 6 categories, chips with icons, NO percentage progress bars, NO MS Office | M1 | Survey 1, Survey 3 |
| 8 | Section 5: Achievements | All 8 existing hackathons from index.html restyled + Samsung Solve for Tomorrow 2026 (9 total) | M1 | Survey 1, Survey 3 |
| 9 | Section 6: Certifications Timeline | 8 chronological credentials (CEH, IBM GenAI 2025, Scaler MLOps Nov 2025, Google UX, 3 LinkedIn Learning, NPTEL) | M1 | Survey 3 |
| 10 | Section 7: Contact | Email `thiraviyaraj2007@gmail.com`, form, social icons (GitHub, LinkedIn/LeetCode TODO), zero phone number | M1 | Survey 1, Survey 3 |
| 11 | Typo & Syntax Bug Fixes | Fix "devoleper", unclosed/capitalized tags, malformed contact section | M1 | Survey 1 |
| 12 | Dark/Light Theme Switching | Theme toggle button, localStorage persistence, prefers-color-scheme sync, zero FOIT | M2 | Survey 2 |
| 13 | Project Category Filtering | Interactive chips (All, Mobile, Web, AI) with accessible aria-pressed states | M2 | Survey 2, Survey 3 |
| 14 | Accessible Hero Role Rotator | Smooth rotation of 3 roles with aria-live="polite" and reduced-motion fallback | M2 | Survey 2 |
| 15 | Scroll-Reveal & Stat Counters | IntersectionObserver scroll animation and rAF animated counters with reduced-motion bypass | M2 | Survey 2 |
| 16 | Mobile Navigation Drawer | Hamburger button, glass backdrop, keyboard trap, Escape handling, active scroll spy | M2 | Survey 1, Survey 2 |
| 17 | E2E Test Suite & Test Runner | Test script validating all tiers (Feature coverage, boundaries, combinations, workloads) | M3 | Survey 2 |
| 18 | Quality Bar & WCAG AA Audit | Single h1, WCAG AA contrast, focus-visible states, responsive check at 360/768/1280/1920px | M3 | Survey 2 |
| 19 | Documentation (README.md) | Comprehensive recruiter-ready README for Portfolio 2.0 | M3 | Survey 1, Survey 2 |
| 20 | Git Sync & Release | Git status, remote origin verification, main branch, clean commit, push without --force | M3 | Survey 1, Survey 2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation & Semantic Content | Asset optimization & WebP conversion, CSS design tokens, typography, full semantic HTML5 rewrite with all 7 content sections, Bento layout, uniform project cards, typo fixes, zero 404s, WCAG AA contrast | None | **DONE** |
| M2 | Client-Side Interactions & Dynamic Motion | Vanilla JS theme engine, project category filter, accessible hero rotator, scroll reveal, animated counters, mobile glass drawer, prefers-reduced-motion | M1 | IN_PROGRESS |
| M3 | E2E Testing Track, Quality Audit, README & Git Sync | Comprehensive test suite (Tiers 1-4), TEST_READY.md, responsiveness, WCAG AA, README.md, git commit and push | M2 | PLANNED |

## Interface Contracts
### Stylesheet ↔ HTML Contract (`styles.css` ↔ `index.html`)
- CSS variables defined on `:root` and `[data-theme="dark"]` / `[data-theme="light"]`:
  - `--bg-base`, `--bg-surface`, `--bg-surface-elevated`, `--bg-glass`
  - `--text-primary`, `--text-secondary`, `--text-muted`
  - `--accent`, `--accent-light`, `--accent-dark`, `--accent-glow`
  - `--border-subtle`, `--border-medium`, `--border-focus`
- Bento grid classes: `.bento-grid`, `.bento-card`, `.bento-card-narrative`, `.bento-card-visual`, `.bento-card-stat`
- Project card classes: `.project-card[data-category]`, `.project-tech-chips`, `.tech-chip`, `.project-bullets`, `.project-footer`
- Skills classes: `.skills-bento-grid`, `.skill-group-card`, `.skill-chips`, `.skill-chip` (no `.progress-bar`)
- Motion classes: `.reveal-on-scroll`, `.revealed`

### JavaScript ↔ DOM Contract (`script.js` ↔ `index.html`)
- Theme Toggle: `#theme-toggle` button triggers toggle between `data-theme="dark"` and `data-theme="light"` on `document.documentElement`, saves to `localStorage.getItem('theme')`.
- Project Filters: `.filter-chip[data-filter]` clicks toggle active class and filter `.project-card[data-category]`.
- Hero Rotator: `.role-rotator` text element updated dynamically every 2.5s.
- Stat Counters: `.stat-number[data-target]` animated via requestAnimationFrame when in viewport.
- Mobile Nav: `#nav-toggle` opens `#nav-menu`, adds `.menu-open` to body, traps Tab focus, closes on link click or Escape.
- Scroll Spy: updates `.nav-link.active` based on IntersectionObserver or scroll position of sections (`#hero`, `#about`, `#projects`, `#skills`, `#achievements`, `#certifications`, `#contact`).
