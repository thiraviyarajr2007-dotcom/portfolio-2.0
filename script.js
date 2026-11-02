/**
 * ============================================================================
 * PORTFOLIO 2.0 — CLIENT-SIDE INTERACTION & MOTION ENGINE
 * Thiraviaraj R — B.E. CSE (AI & ML)
 *
 * Modules:
 *   1. Theme Engine (Dark/Light toggle, localStorage, matchMedia sync)
 *   2. Accessible Mobile Navigation Drawer (Focus trap, Esc dismissal, a11y)
 *   3. Project Category Filtering (Compound tags, a11y toolbar, fluid transitions)
 *   4. Hero Accessible Role Rotator (2.5s cycle, aria-live, WCAG 2.2.2 pause)
 *   5. Scroll-Spy Navigation (IntersectionObserver, header offset, page boundaries)
 *   6. Motion Subsystem (Scroll reveal, rAF easeOutExpo stat counters)
 *   7. Contact Form & Utility Handlers (Accessible status feedback, smooth anchor jumps)
 *
 * Standards:
 *   - Vanilla ES6+, Zero external build steps, Zero bundler requirements
 *   - WCAG 2.1 AA / AAA Compliance
 *   - Strict prefers-reduced-motion adherence across all modules
 * ============================================================================
 */

(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS / Node environment for testing
    module.exports = factory(root);
  } else {
    // Browser global environment
    root.Portfolio = factory(root);
  }
})(typeof window !== 'undefined' ? window : this, function (global) {
  'use strict';

  /* ==========================================================================
     GLOBAL PREFERENCES & UTILITIES
     ========================================================================== */

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  /**
   * Exponential deceleration easing curve: easeOutExpo(x)
   * f(0) = 0, f(1) = 1. Rapidly reaches ~97% at halfway then smoothly settles.
   *
   * @param {number} x - Normalized time [0, 1]
   * @returns {number} Eased progress [0, 1]
   */
  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  /**
   * Format numbers to specified decimal places or integers
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

  /* ==========================================================================
     MODULE 1: THEME TOGGLE ENGINE
     - Synchronizes with inline head loader
     - Supports 'theme' and 'portfolio-theme' localStorage keys
     - Dynamic prefers-color-scheme media listener
     - Multi-tab storage sync
     - Accessible button labels & icons
     ========================================================================== */
  var ThemeManager = (function () {
    var PRIMARY_KEY = 'theme';
    var ALIAS_KEY = 'portfolio-theme';
    var THEME_DARK = 'dark';
    var THEME_LIGHT = 'light';

    var toggleBtn = null;
    var mediaQuery = null;

    /**
     * Read theme from localStorage safely
     */
    function getStoredTheme() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          var stored = window.localStorage.getItem(PRIMARY_KEY) || window.localStorage.getItem(ALIAS_KEY);
          if (stored === THEME_DARK || stored === THEME_LIGHT) {
            return stored;
          }
        }
      } catch (e) {
        // Sandboxed environments or restricted storage
      }
      return null;
    }

    /**
     * Persist theme to localStorage safely
     */
    function setStoredTheme(theme) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (theme) {
            window.localStorage.setItem(PRIMARY_KEY, theme);
            window.localStorage.setItem(ALIAS_KEY, theme);
          } else {
            window.localStorage.removeItem(PRIMARY_KEY);
            window.localStorage.removeItem(ALIAS_KEY);
          }
        }
      } catch (e) {}
    }

    /**
     * Detect OS / browser theme preference
     */
    function getSystemPreference() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT;
        } catch (e) {}
      }
      return THEME_DARK;
    }

    /**
     * Get active theme
     */
    function getTheme() {
      if (typeof document !== 'undefined' && document.documentElement) {
        var docTheme = document.documentElement.getAttribute('data-theme');
        if (docTheme === THEME_DARK || docTheme === THEME_LIGHT) {
          return docTheme;
        }
      }
      var stored = getStoredTheme();
      if (stored) return stored;
      return getSystemPreference();
    }

    /**
     * Update button accessibility labels
     */
    function updateA11y(activeTheme) {
      if (!toggleBtn && typeof document !== 'undefined') {
        toggleBtn = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle-btn');
      }
      if (!toggleBtn) return;

      var targetTheme = activeTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      var label = 'Switch to ' + targetTheme + ' theme';

      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    }

    /**
     * Apply theme to <html> element and synchronize state
     *
     * @param {string} theme - 'dark' | 'light'
     * @param {boolean} persist - whether to write to localStorage
     */
    function setTheme(theme, persist) {
      if (persist === undefined) persist = true;
      if (theme !== THEME_DARK && theme !== THEME_LIGHT) {
        theme = THEME_DARK;
      }

      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('data-theme', theme);
      }

      updateA11y(theme);

      if (persist) {
        setStoredTheme(theme);
      }

      // Notify external observers
      try {
        if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
          var evt = new CustomEvent('themechange', {
            detail: { theme: theme, isUserAction: persist }
          });
          window.dispatchEvent(evt);
        }
      } catch (e) {}
    }

    /**
     * Toggle between dark and light
     */
    function toggleTheme() {
      var current = getTheme();
      var next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      setTheme(next, true);
      return next;
    }

    /**
     * Handle OS color scheme changes
     */
    function handleSystemChange(e) {
      if (!getStoredTheme()) {
        var newTheme = e.matches ? THEME_DARK : THEME_LIGHT;
        setTheme(newTheme, false);
      }
    }

    /**
     * Handle multi-tab storage synchronization
     */
    function handleStorageChange(e) {
      if (e.key === PRIMARY_KEY || e.key === ALIAS_KEY) {
        if (e.newValue === THEME_DARK || e.newValue === THEME_LIGHT) {
          setTheme(e.newValue, false);
        } else if (!e.newValue) {
          setTheme(getSystemPreference(), false);
        }
      }
    }

    /**
     * Initialize theme engine
     */
    function init() {
      if (typeof document === 'undefined') return;

      toggleBtn = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle-btn');

      var current = getTheme();
      setTheme(current, false);

      if (toggleBtn) {
        toggleBtn.removeEventListener('click', toggleTheme);
        toggleBtn.addEventListener('click', toggleTheme);
      }

      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemChange);
          } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handleSystemChange);
          }
        } catch (e) {}
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);
      }
    }

    return {
      init: init,
      getTheme: getTheme,
      setTheme: setTheme,
      toggleTheme: toggleTheme,
      THEME_DARK: THEME_DARK,
      THEME_LIGHT: THEME_LIGHT
    };
  })();

  /* ==========================================================================
     MODULE 2: ACCESSIBLE MOBILE NAVIGATION DRAWER
     - Hamburger to 'X' state transitions
     - Full keyboard Tab focus trapping
     - Escape key dismissal with focus restoration
     - Auto-close on link navigation and outside clicks
     - Breakpoint watcher (>= 1024px)
     ========================================================================== */
  var MobileNavManager = (function () {
    var navToggle = null;
    var navMenu = null;
    var navMenuUl = null;
    var breakpointMedia = null;

    var isOpen = false;
    var previousFocusedElement = null;

    var FOCUSABLE_SELECTOR = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    function isMobile() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          return !window.matchMedia('(min-width: 1024px)').matches;
        } catch (e) {}
      }
      return typeof window !== 'undefined' ? window.innerWidth < 1024 : true;
    }

    function getFocusableElements() {
      if (!navMenu) return [];
      var nodes = Array.prototype.slice.call(navMenu.querySelectorAll(FOCUSABLE_SELECTOR));
      return nodes.filter(function (node) {
        return node.offsetParent !== null && !node.hasAttribute('disabled');
      });
    }

    function open() {
      if (isOpen || !navToggle || !navMenu) return;

      isOpen = true;
      previousFocusedElement = document.activeElement;

      navMenu.classList.add('is-open');
      if (navMenuUl && navMenuUl !== navMenu) {
        navMenuUl.classList.add('is-open');
      }
      if (document.body) {
        document.body.classList.add('menu-open');
      }

      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close navigation menu');
      navMenu.setAttribute('aria-hidden', 'false');

      document.addEventListener('keydown', handleKeyDown);
      setTimeout(function () {
        if (isOpen) {
          document.addEventListener('click', handleOutsideClick);
        }
      }, 0);

      var focusables = getFocusableElements();
      if (focusables.length > 0) {
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          window.requestAnimationFrame(function () {
            focusables[0].focus();
          });
        } else {
          focusables[0].focus();
        }
      }

      try {
        if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('navopen'));
        }
      } catch (e) {}
    }

    function close(restoreFocus) {
      if (restoreFocus === undefined) restoreFocus = true;
      if (!isOpen || !navToggle || !navMenu) return;

      isOpen = false;

      navMenu.classList.remove('is-open');
      if (navMenuUl && navMenuUl !== navMenu) {
        navMenuUl.classList.remove('is-open');
      }
      if (document.body) {
        document.body.classList.remove('menu-open');
      }

      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');

      if (isMobile()) {
        navMenu.setAttribute('aria-hidden', 'true');
      } else {
        navMenu.removeAttribute('aria-hidden');
      }

      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleOutsideClick);

      if (restoreFocus && navToggle && typeof navToggle.focus === 'function') {
        navToggle.focus();
      }

      try {
        if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('navclose'));
        }
      } catch (e) {}
    }

    function toggle() {
      if (isOpen) {
        close(true);
      } else {
        open();
      }
    }

    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        e.preventDefault();
        close(true);
        return;
      }

      if (e.key === 'Tab' || e.keyCode === 9) {
        var focusables = getFocusableElements();
        if (focusables.length === 0) {
          e.preventDefault();
          if (navToggle && typeof navToggle.focus === 'function') {
            navToggle.focus();
          }
          return;
        }

        var ring = focusables.concat([navToggle]);
        var firstLink = focusables[0];
        var lastLink = focusables[focusables.length - 1];

        // Recapture focus if it has drifted outside the modal drawer
        if (ring.indexOf(document.activeElement) === -1) {
          e.preventDefault();
          if (firstLink && typeof firstLink.focus === 'function') {
            firstLink.focus();
          } else if (navToggle && typeof navToggle.focus === 'function') {
            navToggle.focus();
          }
          return;
        }

        if (e.shiftKey) {
          // Backward navigation (Shift + Tab)
          if (document.activeElement === firstLink) {
            e.preventDefault();
            if (navToggle && typeof navToggle.focus === 'function') {
              navToggle.focus();
            }
          } else if (document.activeElement === navToggle) {
            e.preventDefault();
            if (lastLink && typeof lastLink.focus === 'function') {
              lastLink.focus();
            }
          }
        } else {
          // Forward navigation (Tab)
          if (document.activeElement === navToggle) {
            e.preventDefault();
            if (firstLink && typeof firstLink.focus === 'function') {
              firstLink.focus();
            }
          } else if (document.activeElement === lastLink) {
            e.preventDefault();
            if (navToggle && typeof navToggle.focus === 'function') {
              navToggle.focus();
            }
          }
        }
      }
    }

    function handleOutsideClick(e) {
      if (!isOpen) return;
      var target = e.target;
      if (navMenu.contains(target) || (navToggle && navToggle.contains(target))) {
        return;
      }
      close(false);
    }

    function handleBreakpoint(e) {
      var isDesktop = e.matches !== undefined ? e.matches : (window.innerWidth >= 1024);
      if (isDesktop) {
        if (isOpen) {
          close(false);
        }
        if (navMenu) {
          navMenu.removeAttribute('aria-hidden');
        }
        if (navToggle) {
          navToggle.setAttribute('aria-expanded', 'false');
        }
      } else {
        if (navMenu && !isOpen) {
          navMenu.setAttribute('aria-hidden', 'true');
        }
      }
    }

    function init() {
      if (typeof document === 'undefined') return;

      navToggle = document.getElementById('nav-toggle') || document.querySelector('.nav-toggle-btn');
      navMenu = document.querySelector('.nav-menu') || document.getElementById('site-nav') || document.getElementById('nav-menu');
      navMenuUl = document.getElementById('nav-menu');

      if (!navToggle || !navMenu) return;

      navToggle.removeEventListener('click', toggle);
      navToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggle();
      });

      var navLinks = navMenu.querySelectorAll('a');
      Array.prototype.forEach.call(navLinks, function (link) {
        link.addEventListener('click', function () {
          if (isOpen) {
            close(false);
          }
        });
      });

      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          breakpointMedia = window.matchMedia('(min-width: 1024px)');
          if (breakpointMedia.addEventListener) {
            breakpointMedia.addEventListener('change', handleBreakpoint);
          } else if (breakpointMedia.addListener) {
            breakpointMedia.addListener(handleBreakpoint);
          }
          handleBreakpoint(breakpointMedia);
        } catch (e) {
          handleBreakpoint({ matches: window.innerWidth >= 1024 });
        }
      } else if (typeof window !== 'undefined') {
        handleBreakpoint({ matches: window.innerWidth >= 1024 });
      }
    }

    return {
      init: init,
      open: open,
      close: close,
      toggle: toggle,
      isOpen: function () { return isOpen; }
    };
  })();

  /* ==========================================================================
     MODULE 3: PROJECT CATEGORY FILTERING
     - Matches compound categories (e.g. 'web ai', 'web mobile')
     - Updates aria-pressed and .active state
     - Respects prefers-reduced-motion for fluid fade/scale transitions
     - Keyboard navigation for role="toolbar"
     ========================================================================== */
  var ProjectFilter = (function () {
    var activeFilter = 'all';
    var transitionTimeout = null;

    function applyFilter(filter, clickedChip) {
      var filterChips = document.querySelectorAll('.filter-chip[data-filter]');
      var projectCards = document.querySelectorAll('.project-card[data-category]');

      if (!filterChips.length || !projectCards.length) return;

      activeFilter = filter;
      var reduced = prefersReducedMotion();

      // Update chip states
      Array.prototype.forEach.call(filterChips, function (chip) {
        var isMatch = chip === clickedChip || chip.getAttribute('data-filter') === filter;
        chip.classList.toggle('active', isMatch);
        chip.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
      }

      // Filter project cards
      Array.prototype.forEach.call(projectCards, function (card) {
        var rawCategories = card.getAttribute('data-category') || '';
        var categories = rawCategories.toLowerCase().trim().split(/\s+/);
        var isMatch = filter === 'all' || categories.indexOf(filter.toLowerCase()) !== -1;

        card.classList.toggle('is-hidden', !isMatch);

        if (reduced) {
          card.style.opacity = '';
          card.style.transform = '';
          card.style.transition = '';
          return;
        }

        if (isMatch) {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          card.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';

          void card.offsetHeight;
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(function () {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          } else {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }

          setTimeout(function () {
            if (!card.classList.contains('is-hidden')) {
              card.style.opacity = '';
              card.style.transform = '';
              card.style.transition = '';
            }
          }, 260);
        } else {
          card.style.opacity = '';
          card.style.transform = '';
          card.style.transition = '';
        }
      });
    }

    function handleChipClick(e) {
      e.preventDefault();
      var filter = this.getAttribute('data-filter') || 'all';
      applyFilter(filter, this);
    }

    function handleBarKeyDown(e) {
      var filterChips = document.querySelectorAll('.filter-chip[data-filter]');
      var chipsArray = Array.prototype.slice.call(filterChips);
      var currentIndex = chipsArray.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      var targetIndex = null;
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
        var filter = chipsArray[targetIndex].getAttribute('data-filter') || 'all';
        applyFilter(filter, chipsArray[targetIndex]);
      }
    }

    function init() {
      if (typeof document === 'undefined') return;

      var filterChips = document.querySelectorAll('.filter-chip[data-filter]');
      var projectCards = document.querySelectorAll('.project-card[data-category]');

      if (!filterChips.length || !projectCards.length) return;

      Array.prototype.forEach.call(filterChips, function (chip) {
        chip.removeEventListener('click', handleChipClick);
        chip.addEventListener('click', handleChipClick);
      });

      var filterBar = document.querySelector('.project-filters');
      if (filterBar) {
        filterBar.removeEventListener('keydown', handleBarKeyDown);
        filterBar.addEventListener('keydown', handleBarKeyDown);
      }
    }

    return {
      init: init,
      applyFilter: applyFilter,
      getActiveFilter: function () { return activeFilter; }
    };
  })();

  /* ==========================================================================
     MODULE 4: HERO ACCESSIBLE ROLE ROTATOR
     - Cycles professional roles every 2.5 seconds
     - aria-live="polite" and aria-atomic="true"
     - Respects prefers-reduced-motion bypass
     - Pauses on hover, focus, and document background (WCAG 2.2.2)
     ========================================================================== */
  var RoleRotator = (function () {
    var defaultRoles = [
      'AI/ML Engineer',
      'Flutter & Firebase Developer',
      'Full-stack Builder'
    ];

    var rotatorElement = null;
    var roles = defaultRoles;
    var currentIndex = 0;
    var timerId = null;
    var isPaused = false;
    var ROTATE_INTERVAL = 2500;
    var TRANSITION_DURATION = 250;

    function rotateToNext() {
      if (isPaused || !rotatorElement) return;

      currentIndex = (currentIndex + 1) % roles.length;
      var nextRole = roles[currentIndex];

      if (prefersReducedMotion()) {
        rotatorElement.textContent = nextRole;
        return;
      }

      rotatorElement.style.transition = 'opacity ' + TRANSITION_DURATION + 'ms cubic-bezier(0.4, 0, 0.2, 1), transform ' + TRANSITION_DURATION + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
      rotatorElement.style.opacity = '0';
      rotatorElement.style.transform = 'translateY(-10px)';

      setTimeout(function () {
        if (!rotatorElement) return;
        rotatorElement.textContent = nextRole;
        rotatorElement.style.transition = 'none';
        rotatorElement.style.transform = 'translateY(10px)';
        rotatorElement.style.opacity = '0';

        void rotatorElement.offsetHeight;

        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(function () {
            rotatorElement.style.transition = 'opacity ' + TRANSITION_DURATION + 'ms cubic-bezier(0.16, 1, 0.3, 1), transform ' + TRANSITION_DURATION + 'ms cubic-bezier(0.16, 1, 0.3, 1)';
            rotatorElement.style.opacity = '1';
            rotatorElement.style.transform = 'translateY(0)';
          });
        } else {
          rotatorElement.style.opacity = '1';
          rotatorElement.style.transform = 'translateY(0)';
        }
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

    function init() {
      if (typeof document === 'undefined') return;

      rotatorElement = document.getElementById('role-rotator') || document.querySelector('.role-rotator');
      if (!rotatorElement) return;

      try {
        var rawAttr = rotatorElement.getAttribute('data-roles');
        if (rawAttr) {
          var parsed = JSON.parse(rawAttr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            roles = parsed;
          }
        }
      } catch (e) {
        roles = defaultRoles;
      }

      if (!rotatorElement.getAttribute('aria-live')) {
        rotatorElement.setAttribute('aria-live', 'polite');
      }
      if (!rotatorElement.getAttribute('aria-atomic')) {
        rotatorElement.setAttribute('aria-atomic', 'true');
      }

      var currentText = rotatorElement.textContent ? rotatorElement.textContent.trim() : '';
      currentIndex = roles.indexOf(currentText);
      if (currentIndex === -1) currentIndex = 0;

      var wrapper = rotatorElement.closest('.hero-role-wrapper') || rotatorElement.parentElement;
      if (wrapper) {
        wrapper.addEventListener('mouseenter', function () { isPaused = true; });
        wrapper.addEventListener('mouseleave', function () { isPaused = false; });
        wrapper.addEventListener('focusin', function () { isPaused = true; });
        wrapper.addEventListener('focusout', function () { isPaused = false; });
      }

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          stopTimer();
        } else {
          startTimer();
        }
      });

      startTimer();
    }

    return {
      init: init,
      next: rotateToNext,
      getCurrentRole: function () { return roles[currentIndex]; },
      getRoles: function () { return roles; },
      setPaused: function (p) { isPaused = p; },
      stopTimer: stopTimer,
      startTimer: startTimer
    };
  })();

  /* ==========================================================================
     MODULE 5: SCROLL-SPY NAVIGATION
     - Tracks active section with IntersectionObserver
     - Header offset root margin: -75px 0px -35% 0px
     - Handles top of page (<80px -> hero) and bottom of page (-> contact)
     - Applies .active and aria-current="page"
     ========================================================================== */
  var ScrollSpy = (function () {
    var sectionIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
    var activeSectionId = 'hero';
    var isClickScrolling = false;
    var clickScrollTimeout = null;

    function updateActiveNav(targetId) {
      if (activeSectionId === targetId) return;
      activeSectionId = targetId;

      var navLinks = document.querySelectorAll('.site-nav .nav-link[href^="#"], .nav-links a[href^="#"]');
      Array.prototype.forEach.call(navLinks, function (link) {
        var href = link.getAttribute('href');
        var isMatch = href === '#' + targetId;
        link.classList.toggle('active', isMatch);
        if (isMatch) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function checkScrollPosition(suggestedId) {
      if (isClickScrolling || typeof window === 'undefined') return;

      var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var windowHeight = window.innerHeight || 800;
      var documentHeight = document.documentElement.scrollHeight || 5000;

      // Top boundary
      if (scrollY < 80) {
        updateActiveNav('hero');
        return;
      }

      // Bottom boundary
      if (windowHeight + scrollY >= documentHeight - 60) {
        updateActiveNav('contact');
        return;
      }

      if (suggestedId) {
        updateActiveNav(suggestedId);
      }
    }

    function init() {
      if (typeof document === 'undefined') return;

      var navLinks = document.querySelectorAll('.site-nav .nav-link[href^="#"], .nav-links a[href^="#"]');
      if (!navLinks.length) return;

      var sections = sectionIds
        .map(function (id) { return document.getElementById(id); })
        .filter(function (sec) { return sec !== null; });

      if (!sections.length) return;

      if ('IntersectionObserver' in window) {
        var observerOptions = {
          root: null,
          rootMargin: '-75px 0px -35% 0px',
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
        };

        var visibleRatios = new Map();

        var observer = new IntersectionObserver(function (entries) {
          if (isClickScrolling) return;

          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              visibleRatios.set(entry.target.id, entry.intersectionRatio);
            } else {
              visibleRatios.delete(entry.target.id);
            }
          });

          if (visibleRatios.size === 0) return;

          var bestId = activeSectionId;
          var highestRatio = -1;
          visibleRatios.forEach(function (ratio, id) {
            if (ratio > highestRatio) {
              highestRatio = ratio;
              bestId = id;
            }
          });

          checkScrollPosition(bestId);
        }, observerOptions);

        sections.forEach(function (sec) { observer.observe(sec); });
      }

      var scrollThrottleTimer = null;
      window.addEventListener('scroll', function () {
        if (scrollThrottleTimer || isClickScrolling) return;
        scrollThrottleTimer = requestAnimationFrame(function () {
          checkScrollPosition(null);
          scrollThrottleTimer = null;
        });
      }, { passive: true });

      Array.prototype.forEach.call(navLinks, function (link) {
        link.addEventListener('click', function () {
          var href = link.getAttribute('href');
          if (!href || href.indexOf('#') !== 0) return;

          var targetId = href.substring(1);
          if (!document.getElementById(targetId)) return;

          isClickScrolling = true;
          if (clickScrollTimeout) clearTimeout(clickScrollTimeout);
          updateActiveNav(targetId);

          clickScrollTimeout = setTimeout(function () {
            isClickScrolling = false;
            checkScrollPosition(null);
          }, 850);
        });
      });

      checkScrollPosition('hero');
    }

    return {
      init: init,
      updateActiveNav: updateActiveNav,
      checkScrollPosition: checkScrollPosition,
      getActiveSectionId: function () { return activeSectionId; }
    };
  })();

  /* ==========================================================================
     MODULE 6: MOTION SUBSYSTEM (SCROLL REVEAL & STAT COUNTERS)
     - IntersectionObserver adds .revealed to .reveal-on-scroll
     - rAF easeOutExpo animated counters (9.46, 7+, 9) preserving CEH badge
     - Full prefers-reduced-motion bypasses and dynamic change listener
     ========================================================================== */
  var MotionSubsystem = (function () {
    var activeAnimationFrames = new Set();

    function cancelAllCounterAnimations() {
      activeAnimationFrames.forEach(function (id) {
        if (typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(id);
        }
      });
      activeAnimationFrames.clear();
    }

    function forceFinalStatValues() {
      cancelAllCounterAnimations();
      if (typeof document === 'undefined') return;

      var statElements = document.querySelectorAll('.stat-number[data-target]');
      Array.prototype.forEach.call(statElements, function (el) {
        var rawTarget = el.getAttribute('data-target');
        var target = parseFloat(rawTarget);
        if (isNaN(target)) return;

        var rawDecimals = el.getAttribute('data-decimals');
        var decimals = rawDecimals !== null
          ? parseInt(rawDecimals, 10)
          : (target % 1 !== 0 ? 2 : 0);

        el.textContent = formatNumber(target, decimals);
        el.dataset.animated = 'true';
      });
    }

    function forceRevealAll() {
      if (typeof document === 'undefined') return;
      var revealElements = document.querySelectorAll('.reveal-on-scroll');
      Array.prototype.forEach.call(revealElements, function (el) {
        el.classList.add('revealed');
      });
    }

    function animateStatCounter(element, target, decimals, duration) {
      if (!element || element.dataset.animated === 'true') return;
      element.dataset.animated = 'true';

      if (prefersReducedMotion()) {
        element.textContent = formatNumber(target, decimals);
        return;
      }

      var animDuration = typeof duration === 'number' ? duration : 1800;
      var startVal = 0;
      var startTimestamp = null;
      var frameId = null;

      element.textContent = formatNumber(0, decimals);

      function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        var elapsed = timestamp - startTimestamp;
        var progress = Math.min(elapsed / animDuration, 1);
        var easedProgress = easeOutExpo(progress);
        var currentVal = startVal + (target - startVal) * easedProgress;

        element.textContent = formatNumber(currentVal, decimals);

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
          activeAnimationFrames.add(frameId);
        } else {
          element.textContent = formatNumber(target, decimals);
          if (frameId) {
            activeAnimationFrames.delete(frameId);
          }
        }
      }

      frameId = requestAnimationFrame(step);
      activeAnimationFrames.add(frameId);
    }

    function initStatCounters() {
      if (typeof document === 'undefined') return;

      var statElements = document.querySelectorAll('.stat-number[data-target]');
      if (!statElements || statElements.length === 0) return;

      if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        forceFinalStatValues();
        return;
      }

      var observerOptions = {
        root: null,
        rootMargin: '0px 0px -20px 0px',
        threshold: 0.15
      };

      var statObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            observer.unobserve(el);

            var rawTarget = el.getAttribute('data-target');
            var target = parseFloat(rawTarget);
            if (isNaN(target)) return;

            var rawDecimals = el.getAttribute('data-decimals');
            var decimals = rawDecimals !== null
              ? parseInt(rawDecimals, 10)
              : (target % 1 !== 0 ? 2 : 0);

            animateStatCounter(el, target, decimals, 1800);
          }
        });
      }, observerOptions);

      Array.prototype.forEach.call(statElements, function (el) {
        statObserver.observe(el);
      });
    }

    function initScrollReveal() {
      if (typeof document === 'undefined') return;

      var revealElements = document.querySelectorAll('.reveal-on-scroll');
      if (!revealElements || revealElements.length === 0) return;

      if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        forceRevealAll();
        return;
      }

      var observerOptions = {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.1
      };

      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      Array.prototype.forEach.call(revealElements, function (el) {
        revealObserver.observe(el);
      });
    }

    function initReducedMotionListener() {
      if (typeof window === 'undefined' || !window.matchMedia) return;

      try {
        var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

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
      } catch (err) {}
    }

    function init() {
      initReducedMotionListener();
      initScrollReveal();
      initStatCounters();
    }

    return {
      init: init,
      easeOutExpo: easeOutExpo,
      formatNumber: formatNumber,
      animateStatCounter: animateStatCounter,
      forceRevealAll: forceRevealAll,
      forceFinalStatValues: forceFinalStatValues,
      initScrollReveal: initScrollReveal,
      initStatCounters: initStatCounters
    };
  })();

  /* ==========================================================================
     MODULE 7: CONTACT FORM & UTILITY HANDLERS
     - Accessible contact form submission feedback in #form-status
     - Clean smooth scrolling anchor links
     ========================================================================== */
  var UtilityHandlers = (function () {
    function initContactForm() {
      var form = document.getElementById('contact-form') || document.querySelector('.contact-form');
      var status = document.getElementById('form-status');

      if (!form) return;

      form.addEventListener('submit', function (e) {
        // Formspree placeholder handling
        var action = form.getAttribute('action') || '';
        if (action.indexOf('placeholder') !== -1) {
          e.preventDefault();

          var nameInput = document.getElementById('contact-name');
          var emailInput = document.getElementById('contact-email');
          var messageInput = document.getElementById('contact-message');

          if (!nameInput || !emailInput || !messageInput) return;

          var name = nameInput.value.trim();
          var email = emailInput.value.trim();
          var message = messageInput.value.trim();

          if (!name || !email || !message) {
            if (status) {
              status.textContent = 'Please fill out all required fields.';
              status.style.color = '#ef4444';
            }
            return;
          }

          if (status) {
            status.textContent = 'Thank you, ' + name + '! Your message has been prepared (endpoint placeholder). Please email directly at thiraviyaraj2007@gmail.com.';
            status.style.color = '#10b981';
          }

          form.reset();
        }
      });
    }

    function initBackToTop() {
      var backToTopLinks = document.querySelectorAll('.back-to-top, a[href="#hero"]');
      Array.prototype.forEach.call(backToTopLinks, function (btn) {
        btn.addEventListener('click', function (e) {
          var heroSec = document.getElementById('hero');
          if (heroSec && typeof heroSec.scrollIntoView === 'function') {
            e.preventDefault();
            heroSec.scrollIntoView({
              behavior: prefersReducedMotion() ? 'auto' : 'smooth',
              block: 'start'
            });
          }
        });
      });
    }

    function init() {
      initContactForm();
      initBackToTop();
    }

    return {
      init: init
    };
  })();

  /* ==========================================================================
     MASTER ORCHESTRATION & INITIALIZATION
     ========================================================================== */
  function initAll() {
    ThemeManager.init();
    MobileNavManager.init();
    ProjectFilter.init();
    RoleRotator.init();
    ScrollSpy.init();
    MotionSubsystem.init();
    UtilityHandlers.init();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  // Construct unified exports
  var Portfolio = {
    init: initAll,
    ThemeManager: ThemeManager,
    MobileNavManager: MobileNavManager,
    ProjectFilter: ProjectFilter,
    RoleRotator: RoleRotator,
    ScrollSpy: ScrollSpy,
    MotionSubsystem: MotionSubsystem,
    UtilityHandlers: UtilityHandlers,
    utils: {
      easeOutExpo: easeOutExpo,
      formatNumber: formatNumber,
      prefersReducedMotion: prefersReducedMotion
    }
  };

  // Expose global aliases for backwards compatibility and test harnesses
  if (typeof global !== 'undefined') {
    global.ThemeManager = ThemeManager;
    global.MobileNavManager = MobileNavManager;
    global.ProjectFilter = ProjectFilter;
    global.RoleRotator = RoleRotator;
    global.ScrollSpy = ScrollSpy;
    global.MotionSubsystem = MotionSubsystem;
  }

  return Portfolio;
});
