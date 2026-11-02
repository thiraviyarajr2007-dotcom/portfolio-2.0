# Handoff Report: Explorer M2.2 (Interactive JS Modules)

## 1. Observation

Direct code and DOM inspection across `index.html` and `styles.css` identified the active selectors, markup structure, and styling rules:

### A. Project Category Filtering
- **DOM Structure** (`index.html`, lines 340–345):
  ```html
  <div class="project-filters filter-bar reveal-on-scroll" role="toolbar" aria-label="Filter projects by category">
    <button class="filter-chip active" data-filter="all" aria-pressed="true" type="button">All (7)</button>
    <button class="filter-chip" data-filter="mobile" aria-pressed="false" type="button">Mobile (3)</button>
    <button class="filter-chip" data-filter="web" aria-pressed="false" type="button">Web (4)</button>
    <button class="filter-chip" data-filter="ai" aria-pressed="false" type="button">AI (4)</button>
  </div>
  ```
- **Project Cards** (`index.html`, lines 351, 387, 420, 453, 489, 525, 558):
  - Card 1 (Namma Nellai): `data-category="mobile"`
  - Card 2 (SwiftShare): `data-category="mobile"`
  - Card 3 (HabitAI): `data-category="web ai"`
  - Card 4 (AI Notes & Productivity App): `data-category="web ai"`
  - Card 5 (Car Front Display GPS Tracker): `data-category="web mobile"`
  - Card 6 (Road Hazard Risk Classifier): `data-category="ai"`
  - Card 7 (Medicine Identification Platform): `data-category="web ai"`
- **Category Counts**:
  - `all`: 7 cards total
  - `mobile`: 3 cards (Namma Nellai, SwiftShare, Car Front Display)
  - `web`: 4 cards (HabitAI, AI Notes, Car Front Display, Medicine Identification)
  - `ai`: 4 cards (HabitAI, AI Notes, Road Hazard, Medicine Identification)
- **Active CSS Classes** (`styles.css`, lines 916–922, 950–952):
  ```css
  .filter-chip.active,
  .filter-chip[aria-pressed="true"] {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
    box-shadow: 0 2px 10px var(--accent-glow);
  }
  .project-card.is-hidden {
    display: none;
  }
  ```

### B. Hero Role Rotator
- **DOM Markup** (`index.html`, lines 162–165):
  ```html
  <div class="hero-role-wrapper hero-roles reveal-on-scroll" aria-label="Role specialization">
    <span class="role-static">Specializing in </span>
    <span class="role-rotator" id="role-rotator" aria-live="polite" aria-atomic="true" data-roles='["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]'>AI/ML Engineer</span>
  </div>
  ```
- **Styling & Motion** (`styles.css`, lines 660–663, 1889–1891):
  ```css
  .role-rotator {
    display: inline-block;
    transition: opacity var(--transition-normal), transform var(--transition-normal);
  }
  @media (prefers-reduced-motion: reduce) {
    .role-rotator {
      transition: none !important;
    }
  }
  ```

### C. Scroll-Spy Navigation
- **Navigation Links** (`index.html`, lines 105–113):
  ```html
  <ul class="nav-list nav-links" id="nav-menu">
    <li><a href="#hero" class="nav-link active">Home</a></li>
    <li><a href="#about" class="nav-link">About</a></li>
    <li><a href="#projects" class="nav-link">Projects</a></li>
    <li><a href="#skills" class="nav-link">Skills</a></li>
    <li><a href="#achievements" class="nav-link">Achievements</a></li>
    <li><a href="#certifications" class="nav-link">Certifications</a></li>
    <li><a href="#contact" class="nav-link">Contact</a></li>
  </ul>
  ```
- **Sections**: 7 section IDs present in order: `hero` (line 150), `about` (line 215), `projects` (line 331), `skills` (line 602), `achievements` (line 724), `certifications` (line 859), `contact` (line 1048).
- **Sticky Header**: Fixed at top with height `72px` (`--header-height: 72px`).
- **Active Navigation Styling** (`styles.css`, lines 477–481):
  ```css
  .nav-link.active {
    color: var(--accent-light);
    background: var(--accent-subtle);
    font-weight: 600;
  }
  ```

---

## 2. Logic Chain

1. **Filtering Multi-Category Logic**:
   - From Observation 1.A, project cards feature compound `data-category` attributes (e.g., `web ai`, `web mobile`).
   - Therefore, filtering cannot rely on simple string equality (`===`). It must split categories by whitespace (`.split(/\s+/)`) and evaluate whether `filter === 'all' || categories.includes(filter)`.
   - Cards matching the filter must be displayed (remove `.is-hidden`); cards not matching must receive `.is-hidden`.
   - To deliver smooth transitions, when `prefers-reduced-motion` is false, cards fading in/out use opacity and scale transitions with cleanup to avoid breaking hover styles. When `prefers-reduced-motion` is true, the class toggle is immediate.
   - For accessibility, `aria-pressed="true"` is set on the active chip and `"false"` on all others. Keyboard arrow keys navigate within the `role="toolbar"`.

2. **Hero Role Rotator Logic**:
   - From Observation 1.B, the role rotator element has `id="role-rotator"`, `aria-live="polite"`, `aria-atomic="true"`, and `data-roles`.
   - The cycle interval is strictly 2.5s (2500ms).
   - In each cycle, the rotator transitions out (`opacity: 0`, `translateY(-8px)`), updates text, and transitions in from bottom (`opacity: 1`, `translateY(0)`).
   - Under `prefers-reduced-motion: reduce`, the transition is bypassed, instantly swapping `textContent`.
   - WCAG 2.2.2 compliance requires pausing when hovered or focused, and pausing when the document tab is inactive (`document.visibilityState === 'hidden'`).

3. **Scroll-Spy Navigation Logic**:
   - From Observation 1.C, 7 sections exist under a fixed `72px` header.
   - Using `IntersectionObserver` with `rootMargin: '-75px 0px -35% 0px'` accounts for the 72px header and focuses activation on the section occupying the upper focal area of the viewport.
   - Edge case 1: Top of page (`scrollY < 80`) unconditionally activates `#hero`.
   - Edge case 2: Bottom of page (`windowHeight + scrollY >= documentHeight - 60`) unconditionally activates `#contact`, preventing cases where the contact section is too short to reach the observer threshold.
   - Edge case 3: User clicking a navigation link triggers a temporary scroll-lock flag (~850ms) to prevent visual link flickering while smooth scrolling is in progress.
   - Active link receives `.active` and `aria-current="page"`; other links have `aria-current` removed.

---

## 3. Caveats

- **Scope Boundary**: This exploration focuses exclusively on:
  1. Project category filtering
  2. Hero role rotator
  3. Scroll-spy navigation
  Theme switching and mobile menu are handled by `explorer_m2_1`; scroll-reveal and animated counters are handled by `explorer_m2_3`.
- **Existing `script.js`**: The workspace currently has a legacy `script.js` from before the redesign. The implementer must replace legacy logic with the new modular architecture.
- **Assumptions**: Smooth scrolling behavior assumes the CSS rule `html { scroll-behavior: smooth; }` is active.

---

## 4. Conclusion & Proposed JavaScript Implementation

Here are the complete, standalone vanilla JavaScript implementations for the 3 modules:

### Module 1: Project Category Filtering (`initProjectFilter`)
```javascript
/**
 * Module: Project Category Filtering
 * Handles filtering of project cards by category with accessible aria-pressed
 * toggles, smooth fade/scale animations, and keyboard toolbar navigation.
 */
function initProjectFilter() {
  const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
  const projectCards = document.querySelectorAll('.project-card[data-category]');

  if (!filterChips.length || !projectCards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeFilter = 'all';
  let transitionTimeout = null;

  function applyFilter(filter, clickedChip) {
    if (filter === activeFilter && clickedChip && clickedChip.classList.contains('active')) {
      return;
    }
    activeFilter = filter;

    // 1. Update filter chips active state and ARIA
    filterChips.forEach(chip => {
      const isActive = chip === clickedChip || chip.getAttribute('data-filter') === filter;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // 2. Clear any pending animation timeout
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }

    // 3. Filter project cards
    projectCards.forEach(card => {
      const rawCategories = card.getAttribute('data-category') || '';
      const categories = rawCategories.toLowerCase().trim().split(/\s+/);
      const isMatch = filter === 'all' || categories.includes(filter);

      if (prefersReducedMotion) {
        card.classList.toggle('is-hidden', !isMatch);
        card.style.opacity = '';
        card.style.transform = '';
        card.style.transition = '';
        return;
      }

      if (isMatch) {
        const wasHidden = card.classList.contains('is-hidden') || card.style.display === 'none';
        if (wasHidden) {
          card.classList.remove('is-hidden');
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          card.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          
          void card.offsetHeight; // Force reflow
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });

          setTimeout(() => {
            if (!card.classList.contains('is-hidden')) {
              card.style.opacity = '';
              card.style.transform = '';
              card.style.transition = '';
            }
          }, 260);
        } else {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }
      } else {
        card.style.transition = 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
      }
    });

    if (!prefersReducedMotion) {
      transitionTimeout = setTimeout(() => {
        projectCards.forEach(card => {
          const rawCategories = card.getAttribute('data-category') || '';
          const categories = rawCategories.toLowerCase().trim().split(/\s+/);
          const isMatch = activeFilter === 'all' || categories.includes(activeFilter);
          if (!isMatch) {
            card.classList.add('is-hidden');
          }
          card.style.opacity = '';
          card.style.transform = '';
          card.style.transition = '';
        });
      }, 210);
    }
  }

  // Click event listeners
  filterChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = chip.getAttribute('data-filter') || 'all';
      applyFilter(filter, chip);
    });
  });

  // Keyboard navigation support for role="toolbar"
  const filterBar = document.querySelector('.project-filters');
  if (filterBar) {
    filterBar.addEventListener('keydown', (e) => {
      const chipsArray = Array.from(filterChips);
      const currentIndex = chipsArray.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let targetIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % chipsArray.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + chipsArray.length) % chipsArray.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = chipsArray.length - 1;
      }

      if (targetIndex !== null) {
        chipsArray[targetIndex].focus();
        const filter = chipsArray[targetIndex].getAttribute('data-filter') || 'all';
        applyFilter(filter, chipsArray[targetIndex]);
      }
    });
  }
}
```

---

### Module 2: Hero Role Rotator (`initRoleRotator`)
```javascript
/**
 * Module: Hero Role Rotator
 * Smoothly cycles 3 professional roles every 2.5s with aria-live="polite",
 * pause on hover/focus (WCAG 2.2.2), and prefers-reduced-motion bypass.
 */
function initRoleRotator() {
  const rotatorElement = document.getElementById('role-rotator') || document.querySelector('.role-rotator');
  if (!rotatorElement) return;

  const defaultRoles = [
    "AI/ML Engineer",
    "Flutter & Firebase Developer",
    "Full-stack Builder"
  ];

  let roles = defaultRoles;
  try {
    const rawAttr = rotatorElement.getAttribute('data-roles');
    if (rawAttr) {
      const parsed = JSON.parse(rawAttr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        roles = parsed;
      }
    }
  } catch (e) {
    roles = defaultRoles;
  }

  // Ensure accessibility attributes
  if (!rotatorElement.getAttribute('aria-live')) {
    rotatorElement.setAttribute('aria-live', 'polite');
  }
  if (!rotatorElement.getAttribute('aria-atomic')) {
    rotatorElement.setAttribute('aria-atomic', 'true');
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentIndex = roles.indexOf(rotatorElement.textContent.trim());
  if (currentIndex === -1) currentIndex = 0;

  let timerId = null;
  let isPaused = false;
  const ROTATE_INTERVAL = 2500;
  const TRANSITION_DURATION = 250;

  function rotateToNext() {
    if (isPaused) return;

    currentIndex = (currentIndex + 1) % roles.length;
    const nextRole = roles[currentIndex];

    if (prefersReducedMotion.matches) {
      rotatorElement.textContent = nextRole;
      return;
    }

    // Slide up & fade out
    rotatorElement.style.transition = `opacity ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    rotatorElement.style.opacity = '0';
    rotatorElement.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      rotatorElement.textContent = nextRole;
      rotatorElement.style.transition = 'none';
      rotatorElement.style.transform = 'translateY(10px)';
      rotatorElement.style.opacity = '0';

      void rotatorElement.offsetHeight; // Reflow

      requestAnimationFrame(() => {
        rotatorElement.style.transition = `opacity ${TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${TRANSITION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        rotatorElement.style.opacity = '1';
        rotatorElement.style.transform = 'translateY(0)';
      });
    }, TRANSITION_DURATION);
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(rotateToNext, ROTATE_INTERVAL);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // Pause on hover or focus (WCAG 2.2.2)
  const wrapper = rotatorElement.closest('.hero-role-wrapper') || rotatorElement.parentElement;
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => { isPaused = true; });
    wrapper.addEventListener('mouseleave', () => { isPaused = false; });
    wrapper.addEventListener('focusin', () => { isPaused = true; });
    wrapper.addEventListener('focusout', () => { isPaused = false; });
  }

  // Pause when backgrounded
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimer();
    } else {
      startTimer();
    }
  });

  startTimer();
}
```

---

### Module 3: Scroll-Spy Navigation (`initScrollSpy`)
```javascript
/**
 * Module: Scroll-Spy Navigation
 * Highlights the active navigation link based on IntersectionObserver over all
 * 7 page sections, accounting for sticky header and page boundaries.
 */
function initScrollSpy() {
  const sectionIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
  const navLinks = document.querySelectorAll('.site-nav .nav-link[href^="#"], .nav-links a[href^="#"]');
  
  if (!navLinks.length) return;

  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(sec => sec !== null);

  if (!sections.length) return;

  let activeSectionId = 'hero';
  let isClickScrolling = false;
  let clickScrollTimeout = null;

  function updateActiveNav(targetId) {
    if (activeSectionId === targetId) return;
    activeSectionId = targetId;

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isMatch = href === `#${targetId}`;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // IntersectionObserver configuration (offsets 72px fixed header)
  const observerOptions = {
    root: null,
    rootMargin: '-75px 0px -35% 0px',
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
  };

  const visibleRatios = new Map();

  const observer = new IntersectionObserver((entries) => {
    if (isClickScrolling) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleRatios.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleRatios.delete(entry.target.id);
      }
    });

    if (visibleRatios.size === 0) return;

    let bestId = activeSectionId;
    let highestRatio = -1;
    for (const [id, ratio] of visibleRatios.entries()) {
      if (ratio > highestRatio) {
        highestRatio = ratio;
        bestId = id;
      }
    }

    checkScrollPosition(bestId);
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  function checkScrollPosition(suggestedId) {
    if (isClickScrolling) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Top boundary: Hero
    if (scrollY < 80) {
      updateActiveNav('hero');
      return;
    }

    // Bottom boundary: Contact
    if (windowHeight + scrollY >= documentHeight - 60) {
      updateActiveNav('contact');
      return;
    }

    if (suggestedId) {
      updateActiveNav(suggestedId);
    }
  }

  // Throttled scroll listener for page boundary fallbacks
  let scrollThrottleTimer = null;
  window.addEventListener('scroll', () => {
    if (scrollThrottleTimer || isClickScrolling) return;
    scrollThrottleTimer = requestAnimationFrame(() => {
      checkScrollPosition(null);
      scrollThrottleTimer = null;
    });
  }, { passive: true });

  // Prevent jitter during smooth click scrolls
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      if (!document.getElementById(targetId)) return;

      isClickScrolling = true;
      if (clickScrollTimeout) clearTimeout(clickScrollTimeout);
      updateActiveNav(targetId);

      clickScrollTimeout = setTimeout(() => {
        isClickScrolling = false;
        checkScrollPosition(null);
      }, 850);
    });
  });

  checkScrollPosition('hero');
}
```

---

## 5. Verification Method

To independently verify all findings and module implementations, execute the following commands in the workspace root:

1. **Python Contract Test**:
   ```bash
   python tests/test_explorer_m2_2.py
   ```
   *Expected outcome*: 19/19 checks PASS (validates all selectors in `index.html` and `styles.css`).
2. **Node.js Unit Test**:
   ```bash
   node tests/test_js_modules_m2_2.cjs
   ```
   *Expected outcome*: All test suites pass (validates filtering counts, aria-pressed states, rotator cycling, and scroll-spy boundary logic).
3. **Invalidation Conditions**:
   - Changing `.filter-chip` or `.project-card` CSS classes without updating the query selectors.
   - Removing any of the 7 section IDs (`#hero`, `#about`, `#projects`, `#skills`, `#achievements`, `#certifications`, `#contact`).
   - Changing `#role-rotator`'s `data-roles` format.
