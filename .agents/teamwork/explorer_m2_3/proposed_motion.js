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

