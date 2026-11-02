# E2E Test Infra: Portfolio 2.0 (Thiraviaraj R)

## Test Philosophy
- **Requirement-Driven & Opaque-Box**: Tests derived directly from `ORIGINAL_REQUEST.md` and user-facing requirements. Tests evaluate output DOM, computed styles, responsive behavior, performance budgets, and user interactions without coupling to internal variable names.
- **Methodology**: Systematic 4-tier testing (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, and Real-World Workload Testing).

## Feature Inventory & Test Mapping
| # | Feature | Requirement Source | Tier 1 (Coverage) | Tier 2 (Boundary/Edge) | Tier 3 (Interactions) |
|---|---------|-------------------|:-----------------:|:---------------------:|:---------------------:|
| 1 | Asset Pipeline & WebP | ORIGINAL_REQUEST line 8 | ≥5 checks | Image <80KB, 404 check | Profile load in Bento |
| 2 | Design Token System | ORIGINAL_REQUEST lines 10-13 | ≥5 tokens | Contrast ratios, fallbacks | Theme var cascade |
| 3 | SEO & Metadata | ORIGINAL_REQUEST lines 44-46 | ≥5 meta tags | Escaping, image resolution | Social card validation |
| 4 | Hero Section | ORIGINAL_REQUEST lines 18-19 | ≥5 elements | Empty stat fallback | CTA clicks to sections |
| 5 | About Section | ORIGINAL_REQUEST line 20 | ≥5 items | Text length, profile tag | Bento grid responsiveness |
| 6 | Projects Section | ORIGINAL_REQUEST lines 21, 34-42 | ≥7 cards | Non-link button omission | Category filter + render |
| 7 | Skills Section | ORIGINAL_REQUEST lines 22-29 | ≥6 categories | 0 progress bars, 0 MS Office | Hover state on chips |
| 8 | Achievements | ORIGINAL_REQUEST line 30 | ≥9 entries | Preserves 8 old + 1 new | Badge rendering |
| 9 | Certifications | ORIGINAL_REQUEST line 31 | ≥8 items | Chronology | Timeline link/badges |
| 10 | Contact & Privacy | ORIGINAL_REQUEST lines 32, 415 | ≥5 elements | 0 phone numbers regex | Mailto / form submit |
| 11 | Theme Engine | ORIGINAL_REQUEST line 11 | Light & dark | LocalStorage null/tamper | Toggle + reload persist |
| 12 | Reduced Motion | ORIGINAL_REQUEST line 14 | All animations | prefers-reduced-motion: reduce | Animation disablement |

## Test Architecture
- **Test Runner**: Node.js test script `tests/run-e2e-tests.js` executing DOM and asset verifications.
- **Test Invocations**:
  - `node tests/run-e2e-tests.js`
  - Exit code `0` on 100% pass, non-zero on any failure.
- **Directory Layout**:
  ```
  tests/
  ├── run-e2e-tests.js
  ├── fixtures/
  └── reports/
  ```

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Target / Complexity |
|---|----------|--------------------|---------------------|
| 1 | Recruiter Fast-Scan (Mobile 360px) | Hero stats, single h1, responsive bento, touch targets >=44px, hamburger navigation | High |
| 2 | Technical Screener Project Deep-Dive | Filter tabs (Mobile/Web/AI), project cards, verified link triggers, uniform card heights | High |
| 3 | Accessibility & Low-Motion User Audit | prefers-reduced-motion: reduce, keyboard Tab sequence, visible focus, WCAG AA contrast (4.5:1) | High |
| 4 | SEO, Social Share & Performance Audit | Open Graph tags, JSON-LD Schema.org Person validation, bundle transfer budget < 300KB | High |
| 5 | Dark/Light Mode Preference & Persistence | System preference detection, manual toggle, localStorage reload verification, zero flash | High |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 test assertions per major feature (≥60 assertions total).
- **Tier 2 (Boundary & Corner)**: Rigorous checks for missing links, phone number absence, MS Office absence, zero typo "devoleper".
- **Tier 3 (Cross-Feature Combinations)**: Filtering + animation state, theme change + contrast preservation, responsive drawer + skip link.
- **Tier 4 (Real-World Application Scenarios)**: 5 comprehensive scenarios covering end-user journeys.
- **Pass Criterion**: 100% test pass with zero integrity violations.

