# Task Assignment for Worker M2-1: Milestone 2 Implementation (`script.js`)

## Original Request Path
c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\ORIGINAL_REQUEST.md

## Scope Document
c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\orchestrator\PROJECT.md

## Write Ownership
You exclusively own and will write/modify:
- `script.js`

## Blueprints and Instructions
Assemble and deploy the unified, production-ready vanilla JavaScript into `script.js`:
1. **Theme Engine**:
   - Source: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_1\handoff.md`
   - Synchronize with the zero-flash inline script in `index.html`.
   - Event listener on `#theme-toggle`.
   - Toggles `data-theme` between `dark` and `light` on `document.documentElement`.
   - Safe persistence in `localStorage.setItem('portfolio-theme', ...)`.
   - Dynamic listener for `window.matchMedia('(prefers-color-scheme: dark)')`.
   - Update `aria-label` and `title` on theme toggle button.
2. **Accessible Mobile Navigation Drawer**:
   - Source: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_1\handoff.md`
   - Trigger `#nav-toggle`, toggle `.is-open` / `.active` on `#nav-menu` and `.menu-open` on body.
   - Update `aria-expanded` on button.
   - Trap keyboard Tab focus within drawer while open.
   - Close on Escape key or nav-link click.
3. **Project Category Filtering**:
   - Source: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_2\handoff.md`
   - Handles chips `.filter-chip[data-filter]` and cards `.project-card[data-category]`.
   - Updates `aria-pressed`. Shows matching cards with smooth transitions, hides non-matching.
4. **Hero Accessible Role Rotator**:
   - Source: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_2\handoff.md`
   - Cycles: `"AI/ML Engineer"`, `"Flutter & Firebase Developer"`, `"Full-stack Builder"` every 2.5s.
   - Targets `#role-rotator`. Sets `aria-live="polite"` and pauses on hover/focus.
5. **Scroll-Spy Navigation**:
   - Source: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_2\handoff.md`
   - Observes sections with header offset root margin and updates `.nav-link.active` and `aria-current="page"`.
6. **Scroll-Reveal & Animated Counters**:
   - Source: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_3\proposed_motion.js`
   - `IntersectionObserver` adding `.revealed` to `.reveal-on-scroll`.
   - `requestAnimationFrame` animated counters (9.46, 7+, 9) with easeOutExpo. Preserves `CEH`.
7. **Strict Prefers-Reduced-Motion Adherence**:
   - If `prefers-reduced-motion` is active, bypass animations and immediately show final counter numbers and revealed states.
8. **Verification**:
   - Run Node.js / Python tests to verify syntax and execution without errors.
   - Document all verification results in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-11-02T05:54:55Z
You are teamwork_worker_m2_1.
Your working directory is: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\worker_m2_1\
Your task dispatch file is: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\worker_m2_1\DISPATCH.md

MANDATORY: Read ORIGINAL_REQUEST.md at: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\ORIGINAL_REQUEST.md before starting work.
Also read PROJECT.md at: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\orchestrator\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership:
You exclusively own and will write/modify:
- `script.js`

Instructions:
1. Initialize your BRIEFING.md and progress.md in your working directory.
2. Synthesize and implement all modules into `script.js`:
   - Theme toggle engine with localStorage persistence and prefers-color-scheme sync.
   - Accessible mobile drawer with keyboard focus trap, Escape handler, and nav-link click auto-close.
   - Project category filtering chips with aria-pressed.
   - Hero accessible role rotator cycling 3 roles every 2.5s with aria-live="polite".
   - Scroll-spy navigation with header offset root margin.
   - IntersectionObserver scroll reveal.
   - requestAnimationFrame animated stat counters with easeOutExpo.
   - Strict prefers-reduced-motion bypasses.
3. Verify `script.js` syntax using Node.js (`node -c script.js`) and run DOM/motion test suites.
4. Write your complete handoff report to handoff.md following the Handoff Protocol.
5. Send a completion message to parent when done.
