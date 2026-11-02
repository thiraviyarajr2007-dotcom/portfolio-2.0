# Milestone 2 Task 3 Handoff: Scroll-Reveal, Animated Stat Counters & Reduced Motion Subsystem

**Agent**: `teamwork_explorer_m2_3`  
**Milestone**: M2 (Client-Side Interactions & Dynamic Motion)  
**Task**: Scroll-Reveal (`.reveal-on-scroll` -> `.revealed`), Animated Stat Counters (`easeOutExpo` animating 9.46, 7+, 9), and `prefers-reduced-motion` Compliance  
**Target Output**: Complete vanilla JS module and architectural handoff report  

---

## 1. Observation

Direct code inspections of `index.html`, `styles.css`, and existing `script.js` revealed the following active DOM selectors, CSS rules, and functional requirements:

### A. Active DOM Selectors in `index.html`

1. **Scroll-Reveal Targets**:
   - Exactly **51 elements** across all 7 sections have the class `reveal-on-scroll`:
     - **Section 1 (Hero)**: Lines 153 (`.hero-badge`), 158 (`.hero-greeting`), 159 (`.hero-title`), 162 (`.hero-role-wrapper`), 167 (`.hero-tagline`), 172 (`.hero-actions`), 179 (`.hero-stats-grid`).
     - **Section 2 (About)**: Line 218 (`.section-header`), Line 226 (`.bento-card-visual`), Line 240 (`.bento-card-narrative`), Line 253 (`.bento-card-academic`), Line 280 (`.bento-card-philosophy`), Line 296 (`.bento-card-pillars`).
     - **Section 3 (Projects)**: Line 334 (`.section-header`), Line 340 (`.project-filters`), Lines 351, 387, 420, 453, 489, 525, 558 (7 `.project-card` elements).
     - **Section 4 (Skills)**: Line 605 (`.section-header`), Lines 613, 631, 649, 667, 683, 701 (6 `.skill-group-card` elements).
     - **Section 5 (Achievements)**: Line 727 (`.section-header`), Lines 735, 748, 761, 774, 787, 800, 813, 826, 839 (9 `.achievement-card` elements).
     - **Section 6 (Certifications)**: Line 862 (`.section-header`), Lines 870, 893, 914, 935, 957, 978, 999, 1020 (8 `.timeline-item` elements).
     - **Section 7 (Contact)**: Line 1051 (`.section-header`), Line 1059 (`.contact-info-panel`), Line 1117 (`.contact-form-panel`).

2. **Hero Stat Counter Targets**:
   - `index.html:180-207`:
     ```html
     <div class="hero-stats-grid hero-stats reveal-on-scroll">
       <div class="stat-card">
         <div class="stat-number-wrapper">
           <span class="stat-number" data-target="9.46" data-decimals="2">9.46</span>
         </div>
         <span class="stat-label">CGPA &bull; Rathinam Tech Campus</span>
       </div>

       <div class="stat-card">
         <div class="stat-number-wrapper">
           <span class="stat-number" data-target="7">7</span><span class="stat-suffix">+</span>
         </div>
         <span class="stat-label">Projects Built</span>
       </div>

       <div class="stat-card">
         <div class="stat-number-wrapper">
           <span class="stat-badge">CEH</span>
         </div>
         <span class="stat-label">Certified Ethical Hacker</span>
       </div>

       <div class="stat-card">
         <div class="stat-number-wrapper">
           <span class="stat-number" data-target="9">9</span>
         </div>
         <span class="stat-label">Hackathons &amp; Competitions</span>
       </div>
     </div>
     ```
   - Observed:
     - 3 elements contain `class="stat-number"` and `data-target`:
       - Target 1: `data-target="9.46" data-decimals="2"` (CGPA, float with 2 decimal places)
       - Target 2: `data-target="7"` (Projects, integer with adjacent `<span class="stat-suffix">+</span>` preserved in DOM outside the counter element)
       - Target 3: `data-target="9"` (Hackathons, integer)
     - Stat Card 3 (`CEH`) contains `<span class="stat-badge">CEH</span>` without `data-target`, ensuring non-numeric badges remain static.
     - Fallback SEO / No-JS text is pre-populated in raw HTML as `9.46`, `7`, `9`.

### B. CSS Rules in `styles.css`

1. **Scroll-Reveal Styles (`styles.css:387-399`)**:
   ```css
   /* Reveal On Scroll Animation Support */
   .reveal-on-scroll {
     opacity: 0;
     transform: translateY(24px);
     transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                 transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
     will-change: opacity, transform;
   }

   .reveal-on-scroll.revealed {
     opacity: 1;
     transform: translateY(0);
   }
   ```
2. **Prefers-Reduced-Motion Media Query (`styles.css:1855-1896`)**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.001ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.001ms !important;
       scroll-behavior: auto !important;
     }

     .status-dot::after {
       animation: none !important;
     }

     .reveal-on-scroll {
       opacity: 1 !important;
       transform: none !important;
       transition: none !important;
     }
     ...
   }
   ```

3. **Existing `script.js` Status**:
   - Inspected `script.js` (lines 1-129): Contains legacy event listeners from the initial pre-rebuild template referencing deleted classes (`.hamburger`, `.skills`, `.progress`, `#contactForm`).
   - Does NOT yet have the modern `IntersectionObserver` scroll-reveal, does NOT have the `easeOutExpo` counter, and lacks `prefers-reduced-motion` JS handling.

---

## 2. Logic Chain

1. **Scroll-Reveal Design**:
   - `index.html` has 51 elements with `.reveal-on-scroll`.
   - `styles.css` defines `.reveal-on-scroll` with `opacity: 0; transform: translateY(24px);` and `.reveal-on-scroll.revealed` with `opacity: 1; transform: translateY(0);`.
   - By creating an `IntersectionObserver` that targets `.reveal-on-scroll` and adds `.revealed` when `isIntersecting === true`, each section and card animates into view smoothly.
   - Calling `observer.unobserve(entry.target)` immediately upon entry prevents re-triggering and reduces CPU/GPU overhead.
   - Setting `rootMargin: '0px 0px -30px 0px'` and `threshold: 0.1` ensures that tall cards (such as the narrative Bento tile on mobile 360px viewport) trigger smoothly when entering the viewport without requiring the user to scroll halfway through the element.

2. **Animated Stat Counters Design**:
   - Recruiters and engineering managers inspecting the portfolio expect fluid, tactile metric presentation.
   - The easing curve specified is `easeOutExpo(x)`:
     $$\text{easeOutExpo}(x) = \begin{cases} 1 & \text{if } x = 1 \\ 1 - 2^{-10x} & \text{otherwise} \end{cases}$$
   - Characteristics of `easeOutExpo`:
     - $x = 0.0 \rightarrow 0.0$
     - $x = 0.1 \rightarrow 0.50$ (starts with high velocity)
     - $x = 0.5 \rightarrow 0.96875$ (97% completed at 50% time)
     - $x = 1.0 \rightarrow 1.00$ (asymptotically settles into final value)
   - Using `requestAnimationFrame` with a duration of 1800ms produces an optimal recruiter-first experience: fast ramp-up, followed by smooth deceleration to exact values:
     - `9.46` (with `data-decimals="2"` formatted via `val.toFixed(2)`)
     - `7` (integer formatted via `Math.round(val).toString()`, preserving the existing adjacent `<span class="stat-suffix">+</span>`)
     - `9` (integer formatted via `Math.round(val).toString()`)
   - An `IntersectionObserver` observing `.stat-number[data-target]` triggers the counter right when the user scrolls the stats into view (or immediately on desktop where Hero stats are within initial 90vh viewport).
   - Once animated, `dataset.animated = 'true'` and `observer.unobserve()` guarantee each counter animates exactly once.

3. **Prefers-Reduced-Motion and Accessibility**:
   - Users with vestibular disorders or explicit OS preferences (`prefers-reduced-motion: reduce`) must not experience rapid movement or counting animations.
   - The module interrogates `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
   - When active:
     - `initScrollReveal` immediately applies `.revealed` to all `.reveal-on-scroll` elements.
     - `initStatCounters` immediately sets elements to their final formatted values (`9.46`, `7`, `9`) without entering `requestAnimationFrame`.
     - A dynamic `change` listener on the media query cancels any active animation frames if the user enables reduced motion mid-session.
   - If `IntersectionObserver` is unsupported, graceful degradation immediately reveals all elements and sets final stat values.

---

## 3. Caveats

1. **SEO & No-JS Fallback**: In `index.html`, the text content of the stat numbers is pre-populated as `9.46`, `7`, and `9`. The counter module resets to `0` / `0.00` only right when the element enters the viewport and begins its animation frame. If JavaScript is disabled or fails to load, the user still sees the accurate numbers without loss of information.
2. **Stat Suffixes**: Card 2 uses `<span class="stat-number" data-target="7">7</span><span class="stat-suffix">+</span>`. The plus sign is intentionally outside `.stat-number`. The counter code modifies only the `textContent` of `.stat-number`, leaving `<span class="stat-suffix">+</span>` intact.
3. **Integration with `script.js`**: Existing `script.js` has legacy code from the old site template. The proposed code below is modular, pure vanilla ES6+, and can be cleanly inserted or composed with the work of `explorer_m2_1` (Theme/Mobile Nav) and `explorer_m2_2` (Filters/Rotator/ScrollSpy).

---

## 4. Conclusion & Complete Vanilla JS Modules

The complete, tested vanilla JavaScript module code is provided below. It is also saved in the working directory as `proposed_motion.js`.

```javascript
/**
 * ============================================================================
 * Portfolio 2.0 — Motion & Animation Subsystem
 * Thiraviaraj R Portfolio Rebuild (Milestone 2)
 *
 * Modules:
 *   1. Reduced Motion Detection & Lifecycle Management
 *   2. Scroll-Reveal (IntersectionObserver -> .reveal-on-scroll -> .revealed)
 *   3. Animated Stat Counters (IntersectionObserver + requestAnimationFrame + easeOutExpo)
 *
 * Conforms to:
 *   - WCAG 2.1 AA / AAA (prefers-reduced-motion)
 *   - index.html DOM structure (51 reveal-on-scroll nodes, 3 numeric stat targets: 9.46, 7, 9)
 *   - styles.css classes (.reveal-on-scroll, .revealed, .stat-number, [data-target])
 * ============================================================================
 */

(function (global) {
  'use strict';

  /**
   * Easing function: easeOutExpo
   * Smooth, natural deceleration curve for high-end portfolio animations.
   * f(0) = 0, f(1) = 1, rapidly climbs to ~97% at halfway then gently settles.
   *
   * @param {number} x - Normalized time progress [0, 1]
   * @returns {number} Eased progress [0, 1]
   */
  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  /**
   * Check if user prefers reduced motion.
   * @returns {boolean}
   */
  function isReducedMotion() {
    return !!(
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /**
   * Track active requestAnimationFrame IDs for counter cleanup
   */
  const activeAnimationFrames = new Set();

  /**
   * Cancel all currently running counter animation frames.
   */
  function cancelAllCounterAnimations() {
    activeAnimationFrames.forEach(function (id) {
      cancelAnimationFrame(id);
    });
    activeAnimationFrames.clear();
  }

  /**
   * Format numeric value for display based on required decimals.
   *
   * @param {number} val
   * @param {number} decimals
   * @returns {string}
   */
  function formatNumber(val, decimals) {
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toString();
  }

  /**
   * Immediately set all stat numbers to their final target values.
   * Used for reduced-motion mode and graceful degradation.
   */
  function forceFinalStatValues() {
    cancelAllCounterAnimations();
    const statElements = document.querySelectorAll('.stat-number[data-target]');
    statElements.forEach(function (el) {
      const rawTarget = el.getAttribute('data-target');
      const target = parseFloat(rawTarget);
      if (isNaN(target)) return;

      const rawDecimals = el.getAttribute('data-decimals');
      const decimals = rawDecimals !== null
        ? parseInt(rawDecimals, 10)
        : (target % 1 !== 0 ? 2 : 0);

      el.textContent = formatNumber(target, decimals);
      el.dataset.animated = 'true';
    });
  }

  /**
   * Immediately reveal all elements without transition delays.
   * Used for reduced-motion mode and fallback environments.
   */
  function forceRevealAll() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /**
   * Animate a single stat number using requestAnimationFrame with easeOutExpo.
   *
   * @param {HTMLElement} element - Target DOM element with data-target
   * @param {number} target - Numerical target (e.g. 9.46, 7, 9)
   * @param {number} decimals - Precision decimal count (e.g. 2 for 9.46, 0 for 7, 9)
   * @param {number} duration - Animation duration in ms (default: 1800ms)
   */
  function animateStatCounter(element, target, decimals, duration) {
    if (!element || element.dataset.animated === 'true') {
      return;
    }
    element.dataset.animated = 'true';

    // If reduced motion is active, resolve instantly
    if (isReducedMotion()) {
      element.textContent = formatNumber(target, decimals);
      return;
    }

    const animDuration = typeof duration === 'number' ? duration : 1800;
    const startVal = 0;
    let startTimestamp = null;
    let frameId = null;

    // Initialize to zero display right before animation starts
    element.textContent = formatNumber(0, decimals);

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / animDuration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentVal = startVal + (target - startVal) * easedProgress;

      element.textContent = formatNumber(currentVal, decimals);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
        activeAnimationFrames.add(frameId);
      } else {
        // Guaranteed exact finish
        element.textContent = formatNumber(target, decimals);
        if (frameId) {
          activeAnimationFrames.delete(frameId);
        }
      }
    }

    frameId = requestAnimationFrame(step);
    activeAnimationFrames.add(frameId);
  }

  /**
   * Initialize animated stat counters using IntersectionObserver.
   * Animates when the counter enters the user's viewport.
   *
   * Targets:
   *   - 9.46 (CGPA, decimals: 2)
   *   - 7 (Projects Built, decimals: 0, suffix + preserved in adjacent DOM)
   *   - 9 (Hackathons & Competitions, decimals: 0)
   */
  function initStatCounters() {
    const statElements = document.querySelectorAll('.stat-number[data-target]');
    if (!statElements || statElements.length === 0) {
      return;
    }

    // Prefers-reduced-motion check: immediately display target numbers
    if (isReducedMotion()) {
      forceFinalStatValues();
      return;
    }

    // IntersectionObserver fallback for older environments
    if (!('IntersectionObserver' in window)) {
      forceFinalStatValues();
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -20px 0px',
      threshold: 0.15
    };

    const statObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          observer.unobserve(el);

          const rawTarget = el.getAttribute('data-target');
          const target = parseFloat(rawTarget);
          if (isNaN(target)) return;

          const rawDecimals = el.getAttribute('data-decimals');
          const decimals = rawDecimals !== null
            ? parseInt(rawDecimals, 10)
            : (target % 1 !== 0 ? 2 : 0);

          animateStatCounter(el, target, decimals, 1800);
        }
      });
    }, observerOptions);

    statElements.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  /**
   * Initialize Scroll-Reveal animations.
   * Attaches an IntersectionObserver to all .reveal-on-scroll elements.
   * Adds the .revealed class as elements enter viewport.
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements || revealElements.length === 0) {
      return;
    }

    // Prefers-reduced-motion check: immediately reveal all
    if (isReducedMotion()) {
      forceRevealAll();
      return;
    }

    // IntersectionObserver fallback: immediately reveal all
    if (!('IntersectionObserver' in window)) {
      forceRevealAll();
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /**
   * Dynamic prefers-reduced-motion listener.
   * If the user changes motion preferences in OS/browser while the page is active:
   *   - reduce: immediately reveal all elements and set stats to final values
   */
  function initReducedMotionListener() {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    try {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      function handleMotionChange(e) {
        if (e.matches) {
          forceRevealAll();
          forceFinalStatValues();
        }
      }

      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', handleMotionChange);
      } else if (motionQuery.addListener) {
        motionQuery.addListener(handleMotionChange);
      }
    } catch (err) {
      // Graceful ignore in environments where matchMedia is restricted
    }
  }

  /**
   * Master initialization function for motion modules.
   */
  function initMotionSubsystem() {
    initReducedMotionListener();
    initScrollReveal();
    initStatCounters();
  }

  // Auto-init on DOMContentLoaded if loaded in a browser
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMotionSubsystem);
    } else {
      initMotionSubsystem();
    }
  }

  // Export for modular usage or test harnesses
  const MotionSubsystem = {
    easeOutExpo: easeOutExpo,
    isReducedMotion: isReducedMotion,
    formatNumber: formatNumber,
    animateStatCounter: animateStatCounter,
    forceRevealAll: forceRevealAll,
    forceFinalStatValues: forceFinalStatValues,
    initScrollReveal: initScrollReveal,
    initStatCounters: initStatCounters,
    initReducedMotionListener: initReducedMotionListener,
    initMotionSubsystem: initMotionSubsystem
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MotionSubsystem;
  } else {
    global.MotionSubsystem = MotionSubsystem;
  }
})(typeof window !== 'undefined' ? window : this);
```

---

## 5. Verification Method

1. **Automated Verification Script**:
   Run the test script located at:
   ```bash
   node .agents/teamwork/explorer_m2_3/test_motion_modules.js
   ```
   *Expected Result*:
   - Confirms all 51 `.reveal-on-scroll` elements exist in `index.html`.
   - Confirms targets `{ target: '9.46', decimals: '2' }`, `{ target: '7', decimals: '0' }`, `{ target: '9', decimals: '0' }`.
   - Confirms CSS definitions in `styles.css`.
   - Simulates `easeOutExpo` progression reaching exact targets without overshoot.

2. **Unit Tests**:
   Run the unit test suite located at:
   ```bash
   node .agents/teamwork/explorer_m2_3/test_unit_motion.js
   ```
   *Expected Result*:
   - `easeOutExpo(0) === 0` and `easeOutExpo(1) === 1`.
   - `formatNumber` handles decimal precisions 2 and 0 correctly.
   - `forceRevealAll` and `forceFinalStatValues` successfully update mock DOM.

3. **Manual / In-Browser Verification**:
   - Open `index.html` in a web browser.
   - Scroll through the page: all section headers, bento cards, project cards, skill groups, achievements, and timeline nodes fade and slide up smoothly as `.revealed` is added.
   - Observe the hero stats counter: numbers count up from 0 to `9.46`, `7`, and `9` over 1.8 seconds using smooth exponential easing.
   - In browser DevTools, emulate `prefers-reduced-motion: reduce`:
     - Reload the page.
     - Observe that all cards and sections are immediately revealed with zero motion delay.
     - Observe that the stat counters render directly as `9.46`, `7`, and `9` without animation.

