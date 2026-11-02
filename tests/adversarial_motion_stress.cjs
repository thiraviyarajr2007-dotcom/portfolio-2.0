/**
 * ============================================================================
 * ADVERSARIAL MOTION, TIMING & REDUCED-MOTION EMPIRICAL STRESS TEST
 * Target: script.js & styles.css (Portfolio 2.0)
 * Evaluator: Teamwork Challenger M2.2
 * ============================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(78));
console.log('ADVERSARIAL EMPIRICAL MOTION & REDUCED-MOTION STRESS TEST SUITE');
console.log('='.repeat(78));

// --- LOAD STATIC ASSETS FOR CONTRACT VERIFICATION ---
const rootDir = path.resolve(__dirname, '..');
const scriptPath = path.join(rootDir, 'script.js');
const stylesPath = path.join(rootDir, 'styles.css');
const indexPath = path.join(rootDir, 'index.html');

const scriptSource = fs.readFileSync(scriptPath, 'utf8');
const stylesSource = fs.readFileSync(stylesPath, 'utf8');
const indexSource = fs.readFileSync(indexPath, 'utf8');

// --- METRICS COUNTERS ---
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failureDetails.push({ name, error: err.message, stack: err.stack });
    console.log(`  [FAIL] ${name}`);
    console.log(`         Error: ${err.message}`);
  }
}

// --- DOM & BOM MOCKS ---
class MockClassList {
  constructor(initial = []) {
    this._classes = new Set(initial);
  }
  add(...names) { names.forEach(n => this._classes.add(n)); }
  remove(...names) { names.forEach(n => this._classes.delete(n)); }
  contains(name) { return this._classes.has(name); }
  toggle(name, force) {
    if (force === undefined) {
      if (this._classes.has(name)) {
        this._classes.delete(name);
        return false;
      } else {
        this._classes.add(name);
        return true;
      }
    }
    if (force) this._classes.add(name);
    else this._classes.delete(name);
    return force;
  }
  toString() { return Array.from(this._classes).join(' '); }
}

class MockElement {
  constructor(tag, id = '', classes = [], attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = new MockClassList(classes);
    this.attributes = { ...attrs };
    if (id) this.attributes['id'] = id;
    this.dataset = {};
    for (const key of Object.keys(attrs)) {
      if (key.startsWith('data-')) {
        const camel = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        this.dataset[camel] = attrs[key];
      }
    }
    this.textContent = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetHeight = 100;
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[camel] = String(val);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      delete this.dataset[camel];
    }
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(f => f !== fn);
  }

  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
  }

  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (selector.startsWith('#') && this.id === selector.slice(1)) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
  }
}

class MockIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = options;
    this.observedElements = new Set();
    MockIntersectionObserver.instances.push(this);
  }
  observe(target) {
    this.observedElements.add(target);
  }
  unobserve(target) {
    this.observedElements.delete(target);
  }
  disconnect() {
    this.observedElements.clear();
  }
  triggerIntersection(target, isIntersecting = true, ratio = 1.0) {
    this.callback([{
      target,
      isIntersecting,
      intersectionRatio: ratio
    }], this);
  }
}
MockIntersectionObserver.instances = [];

class TestHarness {
  constructor(options = {}) {
    this.options = {
      prefersReduced: false,
      isDocHidden: false,
      hasIntersectionObserver: true,
      ...options
    };

    this.currentTime = 1000;
    this.rafCallbacks = new Map();
    this.nextRafId = 1;
    this.intervals = new Map();
    this.nextIntervalId = 1;
    this.timeouts = new Map();
    this.nextTimeoutId = 1;

    this.docListeners = {};
    this.winListeners = {};
    this.mediaQueryListeners = { reducedMotion: [] };

    this.documentElement = new MockElement('html', '', [], { 'data-theme': 'dark' });
    this.body = new MockElement('body');
    this.documentElement.appendChild(this.body);

    this.elementsById = new Map();
    this.allElements = [];

    MockIntersectionObserver.instances = [];

    this._setupGlobalEnvironment();
  }

  registerElement(el) {
    this.allElements.push(el);
    if (el.id) this.elementsById.set(el.id, el);
    return el;
  }

  advanceTime(ms) {
    const targetTime = this.currentTime + ms;
    while (this.currentTime < targetTime) {
      this.currentTime += Math.min(16.67, targetTime - this.currentTime);

      // Process rAF callbacks
      const currentRafs = Array.from(this.rafCallbacks.entries());
      this.rafCallbacks.clear();
      for (const [id, cb] of currentRafs) {
        cb(this.currentTime);
      }

      // Process timeouts
      for (const [id, t] of Array.from(this.timeouts.entries())) {
        if (this.currentTime >= t.due) {
          this.timeouts.delete(id);
          t.cb();
        }
      }

      // Process intervals
      for (const [id, iv] of Array.from(this.intervals.entries())) {
        if (this.currentTime >= iv.next) {
          iv.next += iv.interval;
          iv.cb();
        }
      }
    }
  }

  triggerAllRafs() {
    this.currentTime += 16.67;
    const currentRafs = Array.from(this.rafCallbacks.entries());
    this.rafCallbacks.clear();
    for (const [id, cb] of currentRafs) {
      cb(this.currentTime);
    }
  }

  getRafCount() {
    return this.rafCallbacks.size;
  }

  getActiveIntervalCount() {
    return this.intervals.size;
  }

  getActiveTimeoutCount() {
    return this.timeouts.size;
  }

  _setupGlobalEnvironment() {
    const harness = this;

    const mockWindow = {
      matchMedia: (query) => {
        const isMotion = query.includes('prefers-reduced-motion');
        return {
          matches: isMotion ? harness.options.prefersReduced : false,
          media: query,
          addEventListener: (event, fn) => {
            if (isMotion && event === 'change') harness.mediaQueryListeners.reducedMotion.push(fn);
          },
          removeEventListener: (event, fn) => {
            if (isMotion && event === 'change') {
              harness.mediaQueryListeners.reducedMotion = harness.mediaQueryListeners.reducedMotion.filter(f => f !== fn);
            }
          },
          addListener: (fn) => {
            if (isMotion) harness.mediaQueryListeners.reducedMotion.push(fn);
          },
          removeListener: (fn) => {
            if (isMotion) {
              harness.mediaQueryListeners.reducedMotion = harness.mediaQueryListeners.reducedMotion.filter(f => f !== fn);
            }
          }
        };
      },
      requestAnimationFrame: (cb) => {
        const id = harness.nextRafId++;
        harness.rafCallbacks.set(id, cb);
        return id;
      },
      cancelAnimationFrame: (id) => {
        harness.rafCallbacks.delete(id);
      },
      setTimeout: (cb, delay) => {
        const id = harness.nextTimeoutId++;
        harness.timeouts.set(id, { cb, due: harness.currentTime + (delay || 0) });
        return id;
      },
      clearTimeout: (id) => {
        harness.timeouts.delete(id);
      },
      setInterval: (cb, interval) => {
        const id = harness.nextIntervalId++;
        harness.intervals.set(id, { cb, interval, next: harness.currentTime + interval });
        return id;
      },
      clearInterval: (id) => {
        harness.intervals.delete(id);
      },
      addEventListener: (type, fn) => {
        if (!harness.winListeners[type]) harness.winListeners[type] = [];
        harness.winListeners[type].push(fn);
      },
      removeEventListener: (type, fn) => {
        if (!harness.winListeners[type]) return;
        harness.winListeners[type] = harness.winListeners[type].filter(f => f !== fn);
      },
      dispatchEvent: (event) => {
        (harness.winListeners[event.type] || []).forEach(f => f(event));
      },
      localStorage: {
        _store: {},
        getItem: (k) => mockWindow.localStorage._store[k] || null,
        setItem: (k, v) => { mockWindow.localStorage._store[k] = String(v); },
        removeItem: (k) => { delete mockWindow.localStorage._store[k]; }
      },
      pageYOffset: 0,
      innerHeight: 900,
      innerWidth: 1200
    };

    const mockDocument = {
      documentElement: harness.documentElement,
      body: harness.body,
      hidden: harness.options.isDocHidden,
      readyState: 'complete',
      getElementById: (id) => harness.elementsById.get(id) || null,
      querySelector: (sel) => {
        if (sel.startsWith('#')) return harness.elementsById.get(sel.slice(1)) || null;
        if (sel.startsWith('.')) {
          const cls = sel.slice(1);
          return harness.allElements.find(e => e.classList.contains(cls)) || null;
        }
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel.includes('.stat-number[data-target]')) {
          return harness.allElements.filter(e => e.classList.contains('stat-number') && e.getAttribute('data-target') !== null);
        }
        if (sel.includes('.reveal-on-scroll')) {
          return harness.allElements.filter(e => e.classList.contains('reveal-on-scroll'));
        }
        if (sel.includes('.filter-chip')) {
          return harness.allElements.filter(e => e.classList.contains('filter-chip'));
        }
        if (sel.includes('.project-card')) {
          return harness.allElements.filter(e => e.classList.contains('project-card'));
        }
        if (sel.startsWith('.')) {
          const cls = sel.slice(1);
          return harness.allElements.filter(e => e.classList.contains(cls));
        }
        return [];
      },
      addEventListener: (type, fn) => {
        if (!harness.docListeners[type]) harness.docListeners[type] = [];
        harness.docListeners[type].push(fn);
      },
      removeEventListener: (type, fn) => {
        if (!harness.docListeners[type]) return;
        harness.docListeners[type] = harness.docListeners[type].filter(f => f !== fn);
      },
      dispatchEvent: (event) => {
        (harness.docListeners[event.type] || []).forEach(f => f(event));
      }
    };

    if (harness.options.hasIntersectionObserver) {
      mockWindow.IntersectionObserver = MockIntersectionObserver;
      global.IntersectionObserver = MockIntersectionObserver;
    } else {
      delete mockWindow.IntersectionObserver;
      delete global.IntersectionObserver;
    }

    this.mockWindow = mockWindow;
    this.mockDocument = mockDocument;

    // Attach to NodeJS globals so script.js module execution sees them continuously
    global.window = mockWindow;
    global.document = mockDocument;
    global.matchMedia = mockWindow.matchMedia;
    global.requestAnimationFrame = mockWindow.requestAnimationFrame;
    global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;
    global.setInterval = mockWindow.setInterval;
    global.clearInterval = mockWindow.clearInterval;
    global.setTimeout = mockWindow.setTimeout;
    global.clearTimeout = mockWindow.clearTimeout;
  }

  loadPortfolio() {
    delete require.cache[require.resolve('../script.js')];
    return require('../script.js');
  }

  cleanup() {
    delete global.window;
    delete global.document;
    delete global.matchMedia;
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
    delete global.setInterval;
    delete global.clearInterval;
    delete global.setTimeout;
    delete global.clearTimeout;
    delete global.IntersectionObserver;
  }
}

// ==============================================================================
// TEST SUITE 1: NUMERICAL COUNTER PRECISION & MATHEMATICAL STRESS TEST
// ==============================================================================
console.log('\n--- SUITE 1: Numerical Counter Precision & Floating-Point Stress ---');

test('SUITE 1.1: Math easeOutExpo curve strictly bounded [0, 1] without overshoot', () => {
  const harness = new TestHarness();
  const Portfolio = harness.loadPortfolio();
  const { easeOutExpo } = Portfolio.utils;

  assert.strictEqual(easeOutExpo(0), 0, 'easeOutExpo(0) must equal 0');
  assert.strictEqual(easeOutExpo(1), 1, 'easeOutExpo(1) must equal 1');

  // Sample 20,000 fractional points
  let prev = 0;
  for (let i = 0; i <= 20000; i++) {
    const x = i / 20000;
    const y = easeOutExpo(x);
    assert(y >= 0 && y <= 1, `easeOutExpo(${x}) = ${y} is outside [0, 1]`);
    assert(y >= prev, `easeOutExpo is not monotonically non-decreasing at x=${x}`);
    prev = y;
  }
  harness.cleanup();
});

test('SUITE 1.2: formatNumber outputs exact decimal precision without floating point drift on 9.46', () => {
  const harness = new TestHarness();
  const Portfolio = harness.loadPortfolio();
  const { formatNumber, easeOutExpo } = Portfolio.utils;

  const target = 9.46;
  const decimals = 2;

  // Simulate 10,000 animation progress steps
  for (let i = 0; i <= 10000; i++) {
    const progress = i / 10000;
    const eased = easeOutExpo(progress);
    const val = 0 + target * eased;
    const formatted = formatNumber(val, decimals);

    assert.match(formatted, /^\d+\.\d{2}$/, `Output "${formatted}" must strictly have 2 decimal digits`);
    const num = parseFloat(formatted);
    assert(!isNaN(num), `Formatted value should not parse to NaN: ${formatted}`);
    assert(num >= 0.00 && num <= 9.46, `Value ${num} outside valid range [0, 9.46]`);
    assert(!formatted.includes('9.459999'), `Floating-point representation artifact found: ${formatted}`);
  }

  assert.strictEqual(formatNumber(target, decimals), '9.46');
  assert.strictEqual(formatNumber(0, decimals), '0.00');
  harness.cleanup();
});

test('SUITE 1.3: formatNumber handles integers, suffixes and missing decimal configs', () => {
  const harness = new TestHarness();
  const Portfolio = harness.loadPortfolio();
  const { formatNumber } = Portfolio.utils;

  assert.strictEqual(formatNumber(7, 0), '7');
  assert.strictEqual(formatNumber(9, 0), '9');
  assert.strictEqual(formatNumber(7.00, 0), '7');
  assert.strictEqual(formatNumber(9.46, 2), '9.46');
  assert.strictEqual(formatNumber(0, 0), '0');
  assert.strictEqual(formatNumber(6.999, 0), '7');
  harness.cleanup();
});

test('SUITE 1.4: rAF Stat Counter step-by-step animation execution for 9.46 and integers', () => {
  const harness = new TestHarness({ prefersReduced: false, hasIntersectionObserver: true });

  const stat946 = harness.registerElement(new MockElement('span', 'stat-cgpa', ['stat-number'], {
    'data-target': '9.46',
    'data-decimals': '2'
  }));
  const stat7 = harness.registerElement(new MockElement('span', 'stat-projects', ['stat-number'], {
    'data-target': '7'
  }));
  const statBadge = harness.registerElement(new MockElement('span', 'stat-ceh', ['stat-badge']));
  statBadge.textContent = 'CEH';

  const Portfolio = harness.loadPortfolio();

  // Reset animated state if init ran
  delete stat946.dataset.animated;
  delete stat7.dataset.animated;

  // Trigger counters manually
  Portfolio.MotionSubsystem.animateStatCounter(stat946, 9.46, 2, 1800);
  Portfolio.MotionSubsystem.animateStatCounter(stat7, 7, 0, 1800);

  // Initial state right after call
  assert.strictEqual(stat946.textContent, '0.00', 'Initial counter for 9.46 must be 0.00');
  assert.strictEqual(stat7.textContent, '0', 'Initial counter for 7 must be 0');
  assert.strictEqual(statBadge.textContent, 'CEH', 'CEH badge must remain untouched');

  // Step through 500ms
  harness.advanceTime(500);
  assert.match(stat946.textContent, /^\d+\.\d{2}$/);
  assert.match(stat7.textContent, /^\d+$/);
  const midVal = parseFloat(stat946.textContent);
  assert(midVal > 0 && midVal < 9.46, `Mid-animation value ${midVal} should be between 0 and 9.46`);

  // Step through remaining time beyond 1800ms
  harness.advanceTime(1500);
  assert.strictEqual(stat946.textContent, '9.46', 'Final value for 9.46 must be strictly "9.46"');
  assert.strictEqual(stat7.textContent, '7', 'Final value for 7 must be strictly "7"');
  assert.strictEqual(statBadge.textContent, 'CEH', 'CEH badge must not be altered');
  assert.strictEqual(stat946.dataset.animated, 'true');

  harness.cleanup();
});

test('SUITE 1.5: Production index.html counter attributes contract audit', () => {
  // Verify index.html contains exact required structure
  assert(indexSource.includes('data-target="9.46"'), 'index.html must have data-target="9.46"');
  assert(indexSource.includes('data-decimals="2"'), 'index.html must have data-decimals="2"');
  assert(indexSource.includes('data-target="7"'), 'index.html must have data-target="7"');
  assert(indexSource.includes('data-target="9"'), 'index.html must have data-target="9"');
  assert(indexSource.includes('<span class="stat-badge">CEH</span>'), 'index.html must keep CEH as badge without data-target');
});

// ==============================================================================
// TEST SUITE 2: STRICT BYPASS OF ANIMATIONS UNDER PREFERS-REDUCED-MOTION
// ==============================================================================
console.log('\n--- SUITE 2: Strict Bypass Under prefers-reduced-motion: reduce ---');

test('SUITE 2.1: CSS verification of prefers-reduced-motion media query rules', () => {
  assert(stylesSource.includes('@media (prefers-reduced-motion: reduce)'), 'styles.css must contain prefers-reduced-motion query');
  assert(stylesSource.includes('animation-duration: 0.001ms !important'), 'Global animation duration override must be 0.001ms !important');
  assert(stylesSource.includes('transition-duration: 0.001ms !important'), 'Global transition duration override must be 0.001ms !important');
  assert(stylesSource.includes('scroll-behavior: auto !important'), 'Global scroll-behavior must be auto !important');
  assert(stylesSource.includes('.reveal-on-scroll {'), 'Reveal-on-scroll rule must exist under reduced-motion');
  assert(stylesSource.includes('opacity: 1 !important'), 'Reveal elements must be forced to opacity 1 !important');
  assert(stylesSource.includes('transform: none !important'), 'Transforms must be forced to none !important');
});

test('SUITE 2.2: Stat counters bypass rAF completely when prefers-reduced-motion is active', () => {
  const harness = new TestHarness({ prefersReduced: true });

  const statEl = harness.registerElement(new MockElement('span', 'cgpa-stat', ['stat-number'], {
    'data-target': '9.46',
    'data-decimals': '2'
  }));

  const Portfolio = harness.loadPortfolio();

  assert.strictEqual(Portfolio.utils.prefersReducedMotion(), true, 'Utility must report true');

  delete statEl.dataset.animated;
  Portfolio.MotionSubsystem.animateStatCounter(statEl, 9.46, 2, 1800);

  // Must immediately have final value
  assert.strictEqual(statEl.textContent, '9.46', 'Reduced motion must immediately set final text "9.46"');
  assert.strictEqual(harness.getRafCount(), 0, 'ZERO requestAnimationFrame callbacks should be queued');

  harness.cleanup();
});

test('SUITE 2.3: forceRevealAll & forceFinalStatValues execute at initialization when reduced-motion active', () => {
  const harness = new TestHarness({ prefersReduced: true });

  const reveal1 = harness.registerElement(new MockElement('div', 'r1', ['reveal-on-scroll']));
  const reveal2 = harness.registerElement(new MockElement('div', 'r2', ['reveal-on-scroll']));
  const stat1 = harness.registerElement(new MockElement('span', 's1', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' }));
  const stat2 = harness.registerElement(new MockElement('span', 's2', ['stat-number'], { 'data-target': '7' }));

  const Portfolio = harness.loadPortfolio();

  Portfolio.MotionSubsystem.init();

  assert(reveal1.classList.contains('revealed'), 'r1 must be marked revealed immediately');
  assert(reveal2.classList.contains('revealed'), 'r2 must be marked revealed immediately');
  assert.strictEqual(stat1.textContent, '9.46', 's1 must have final value 9.46');
  assert.strictEqual(stat2.textContent, '7', 's2 must have final value 7');
  assert.strictEqual(harness.getRafCount(), 0, 'No rAF scheduled');

  harness.cleanup();
});

test('SUITE 2.4: Dynamic media query transition (user switches OS to reduced-motion mid-flight)', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const statEl = harness.registerElement(new MockElement('span', 's-dyn', ['stat-number'], { 'data-target': '9.46', 'data-decimals': '2' }));
  const revealEl = harness.registerElement(new MockElement('div', 'r-dyn', ['reveal-on-scroll']));

  const Portfolio = harness.loadPortfolio();
  Portfolio.MotionSubsystem.init();

  delete statEl.dataset.animated;
  // Start counter animation
  Portfolio.MotionSubsystem.animateStatCounter(statEl, 9.46, 2, 1800);

  // Advance time partially
  harness.advanceTime(200);
  assert(harness.getRafCount() > 0, 'rAF should be active mid-animation');
  assert(statEl.textContent !== '9.46', 'Counter should still be animating');

  // Trigger OS media query change to reduced-motion = true
  harness.options.prefersReduced = true;
  const changeHandlers = harness.mediaQueryListeners.reducedMotion;
  assert(changeHandlers.length > 0, 'Media query listener must have been registered');
  changeHandlers.forEach(h => h({ matches: true }));

  // Post-change: Counter must immediately be final value 9.46, reveals revealed
  assert.strictEqual(statEl.textContent, '9.46', 'Dynamic reduced motion change must snap counter to 9.46');
  assert(revealEl.classList.contains('revealed'), 'Dynamic reduced motion change must reveal all elements');

  harness.cleanup();
});

test('SUITE 2.5: ProjectFilter bypasses scale/opacity animations under prefers-reduced-motion', () => {
  const harness = new TestHarness({ prefersReduced: true });

  const chipAll = harness.registerElement(new MockElement('button', 'f-all', ['filter-chip', 'active'], { 'data-filter': 'all' }));
  const chipMobile = harness.registerElement(new MockElement('button', 'f-mob', ['filter-chip'], { 'data-filter': 'mobile' }));

  const card1 = harness.registerElement(new MockElement('div', 'c1', ['project-card'], { 'data-category': 'mobile flutter' }));
  const card2 = harness.registerElement(new MockElement('div', 'c2', ['project-card'], { 'data-category': 'web react' }));

  const Portfolio = harness.loadPortfolio();

  Portfolio.ProjectFilter.applyFilter('mobile', chipMobile);

  assert(!card1.classList.contains('is-hidden'), 'Matching card1 should not be hidden');
  assert(card2.classList.contains('is-hidden'), 'Non-matching card2 must be is-hidden');

  // Verify inline styles are NOT set with transitions or opacity
  assert.strictEqual(card1.style.transition || '', '', 'No inline transition style should be added');
  assert.strictEqual(card1.style.opacity || '', '', 'No inline opacity style should be added');
  assert.strictEqual(card1.style.transform || '', '', 'No inline transform style should be added');

  harness.cleanup();
});

test('SUITE 2.6: RoleRotator instant text update without CSS transition when reduced-motion active', () => {
  const harness = new TestHarness({ prefersReduced: true });

  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'data-roles': '["Role A", "Role B", "Role C"]'
  }));
  rotator.textContent = 'Role A';

  const Portfolio = harness.loadPortfolio();
  Portfolio.RoleRotator.init();

  assert.strictEqual(rotator.textContent, 'Role A');

  // Trigger rotation
  Portfolio.RoleRotator.next();

  // In reduced-motion mode, text changes synchronously without transition or setTimeout
  assert.strictEqual(rotator.textContent, 'Role B', 'Role must advance immediately to Role B');
  assert.strictEqual(rotator.style.transition || '', '', 'No transition style applied');
  assert.strictEqual(rotator.style.transform || '', '', 'No transform translateY applied');
  assert.strictEqual(harness.getActiveTimeoutCount(), 0, 'No transition timeout should be queued');

  harness.cleanup();
});

// ==============================================================================
// TEST SUITE 3: ROLE ROTATOR TIMING, VISIBILITY & BACKGROUNDING STRESS
// ==============================================================================
console.log('\n--- SUITE 3: Role Rotator Timing, Visibility & Backgrounding ---');

test('SUITE 3.1: Sequential role rotation across full cycle (2.5s interval)', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const wrapper = harness.registerElement(new MockElement('div', 'wrapper', ['hero-role-wrapper']));
  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]'
  }));
  rotator.textContent = 'AI/ML Engineer';
  wrapper.appendChild(rotator);

  const Portfolio = harness.loadPortfolio();
  Portfolio.RoleRotator.init();

  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');
  assert.strictEqual(harness.getActiveIntervalCount(), 1, 'Exactly one interval timer should be active');

  // Advance by 2500ms
  harness.advanceTime(2500);
  // Advance by transition duration 250ms
  harness.advanceTime(300);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Flutter & Firebase Developer');

  // Advance next cycle
  harness.advanceTime(2500);
  harness.advanceTime(300);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Full-stack Builder');

  // Advance to wrap around
  harness.advanceTime(2500);
  harness.advanceTime(300);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'AI/ML Engineer');

  harness.cleanup();
});

test('SUITE 3.2: Tab backgrounding halts interval and prevents ghost rotations', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const wrapper = harness.registerElement(new MockElement('div', 'wrapper', ['hero-role-wrapper']));
  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'data-roles': '["Role 1", "Role 2", "Role 3"]'
  }));
  rotator.textContent = 'Role 1';
  wrapper.appendChild(rotator);

  const Portfolio = harness.loadPortfolio();
  Portfolio.RoleRotator.init();

  assert.strictEqual(harness.getActiveIntervalCount(), 1, 'Timer active initially');

  // Background tab: document.hidden = true
  harness.mockDocument.hidden = true;
  harness.mockDocument.dispatchEvent({ type: 'visibilitychange' });

  assert.strictEqual(harness.getActiveIntervalCount(), 0, 'Timer must be stopped when tab is hidden');

  // Advance time by 30 seconds (12 intervals) while hidden
  harness.advanceTime(30000);

  // Role must remain strictly unchanged
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Role 1', 'Role must NOT advance while tab is backgrounded');

  // Foreground tab: document.hidden = false
  harness.mockDocument.hidden = false;
  harness.mockDocument.dispatchEvent({ type: 'visibilitychange' });

  assert.strictEqual(harness.getActiveIntervalCount(), 1, 'Timer must restart when tab is foregrounded');
  // Immediately upon returning, role should still be Role 1 (no catchup burst)
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Role 1', 'No burst rotation on tab refocus');

  // After 2.5s + transition, it advances normally
  harness.advanceTime(2500);
  harness.advanceTime(300);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'Role 2', 'Resumed rotation should advance smoothly');

  harness.cleanup();
});

test('SUITE 3.3: Rapid visibility toggling stress test (100 switches)', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const wrapper = harness.registerElement(new MockElement('div', 'wrapper', ['hero-role-wrapper']));
  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'data-roles': '["R1", "R2"]'
  }));
  rotator.textContent = 'R1';
  wrapper.appendChild(rotator);

  const Portfolio = harness.loadPortfolio();
  Portfolio.RoleRotator.init();

  // Rapidly toggle visibility 100 times
  for (let i = 0; i < 100; i++) {
    harness.mockDocument.hidden = (i % 2 === 0);
    harness.mockDocument.dispatchEvent({ type: 'visibilitychange' });
  }

  // Final state: visible
  harness.mockDocument.hidden = false;
  harness.mockDocument.dispatchEvent({ type: 'visibilitychange' });

  assert.strictEqual(harness.getActiveIntervalCount(), 1, 'Must maintain exactly ONE active interval, no interval stacking leaks');

  harness.cleanup();
});

test('SUITE 3.4: WCAG 2.2.2 Pause on hover and focus', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const wrapper = harness.registerElement(new MockElement('div', 'wrapper', ['hero-role-wrapper']));
  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'data-roles': '["A", "B"]'
  }));
  rotator.textContent = 'A';
  wrapper.appendChild(rotator);

  const Portfolio = harness.loadPortfolio();
  Portfolio.RoleRotator.init();

  // Mouse enter wrapper
  wrapper.dispatchEvent({ type: 'mouseenter' });

  // Advance time by 10 seconds
  harness.advanceTime(10000);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'A', 'Must not rotate while mouse is hovered');

  // Mouse leave wrapper
  wrapper.dispatchEvent({ type: 'mouseleave' });

  // Advance 2.5s + transition
  harness.advanceTime(2500);
  harness.advanceTime(300);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'B', 'Must resume rotation after mouse leaves');

  // Focus in wrapper
  wrapper.dispatchEvent({ type: 'focusin' });
  harness.advanceTime(10000);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'B', 'Must not rotate while focused');

  // Focus out wrapper
  wrapper.dispatchEvent({ type: 'focusout' });
  harness.advanceTime(2500);
  harness.advanceTime(300);
  assert.strictEqual(Portfolio.RoleRotator.getCurrentRole(), 'A', 'Must resume rotation after focus lost');

  harness.cleanup();
});

test('SUITE 3.5: Defensive fallback on corrupted data-roles attribute', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator'], {
    'data-roles': 'INVALID_JSON{[['
  }));

  const Portfolio = harness.loadPortfolio();

  // Must not throw exception
  Portfolio.RoleRotator.init();

  const roles = Portfolio.RoleRotator.getRoles();
  assert(Array.isArray(roles) && roles.length === 3, 'Must gracefully fallback to default 3 roles');
  assert.strictEqual(roles[0], 'AI/ML Engineer');

  harness.cleanup();
});

// ==============================================================================
// TEST SUITE 4: EXTREME CONCURRENCY, FUZZING & CONTRACT BOUNDARY STRESS
// ==============================================================================
console.log('\n--- SUITE 4: Extreme Concurrency, Fuzzing & Boundary Stress ---');

test('SUITE 4.1: Concurrent 50-counter stress test', () => {
  const harness = new TestHarness({ prefersReduced: false });
  const elements = [];

  for (let i = 0; i < 50; i++) {
    const el = harness.registerElement(new MockElement('span', `stat-${i}`, ['stat-number'], {
      'data-target': (i * 1.5).toFixed(2),
      'data-decimals': '2'
    }));
    elements.push({ el, target: i * 1.5 });
  }

  const Portfolio = harness.loadPortfolio();

  elements.forEach(({ el, target }) => {
    delete el.dataset.animated;
    Portfolio.MotionSubsystem.animateStatCounter(el, target, 2, 1000);
  });

  // Advance through full duration
  harness.advanceTime(1200);

  // Verify all 50 reached target with exact formatting
  elements.forEach(({ el, target }) => {
    assert.strictEqual(el.textContent, target.toFixed(2), `Counter ${el.id} failed to reach exact value`);
  });

  harness.cleanup();
});

test('SUITE 4.2: Mid-flight cancellation and cleanup via forceFinalStatValues', () => {
  const harness = new TestHarness({ prefersReduced: false });

  const stat = harness.registerElement(new MockElement('span', 's-cancel', ['stat-number'], {
    'data-target': '9.46',
    'data-decimals': '2'
  }));

  const Portfolio = harness.loadPortfolio();
  delete stat.dataset.animated;
  Portfolio.MotionSubsystem.animateStatCounter(stat, 9.46, 2, 1800);

  harness.advanceTime(300);
  assert(harness.getRafCount() > 0, 'rAF should be active');

  Portfolio.MotionSubsystem.forceFinalStatValues();

  assert.strictEqual(stat.textContent, '9.46', 'forceFinalStatValues must snap text to 9.46');
  assert.strictEqual(harness.getRafCount(), 0, 'All active counter rAF callbacks must be cancelled');

  harness.cleanup();
});

test('SUITE 4.3: Accessibility attributes integrity (aria-live and aria-atomic)', () => {
  const harness = new TestHarness();

  const rotator = harness.registerElement(new MockElement('span', 'role-rotator', ['role-rotator']));
  const Portfolio = harness.loadPortfolio();
  Portfolio.RoleRotator.init();

  assert.strictEqual(rotator.getAttribute('aria-live'), 'polite', 'aria-live must be polite for screen readers');
  assert.strictEqual(rotator.getAttribute('aria-atomic'), 'true', 'aria-atomic must be true for full phrase re-announcements');

  harness.cleanup();
});

test('SUITE 4.4: Static code audit of script.js for forbidden constructs and safety', () => {
  // Check for eval or document.write
  assert(!scriptSource.includes('eval('), 'script.js must never contain eval');
  assert(!scriptSource.includes('document.write'), 'script.js must never contain document.write');
  // Check that prefersReducedMotion is properly queried
  assert(scriptSource.includes('(prefers-reduced-motion: reduce)'), 'script.js must check prefers-reduced-motion: reduce');
  // Check that easeOutExpo is implemented
  assert(scriptSource.includes('easeOutExpo'), 'script.js must implement easeOutExpo');
  // Check that visibilitychange is attached
  assert(scriptSource.includes('visibilitychange'), 'script.js must listen to visibilitychange');
});

// ==============================================================================
// SUMMARY & VERDICT
// ==============================================================================
console.log('\n' + '='.repeat(78));
console.log(`TOTAL TESTS RUN : ${totalTests}`);
console.log(`PASSED          : ${passedTests}`);
console.log(`FAILED          : ${failedTests}`);
console.log('='.repeat(78));

if (failedTests > 0) {
  console.log('\nFAILURE DETAILS:');
  failureDetails.forEach(({ name, error }, idx) => {
    console.log(`${idx + 1}. ${name}\n   Error: ${error}`);
  });
  process.exit(1);
} else {
  console.log('\nALL ADVERSARIAL STRESS TESTS PASSED SUCCESSFULLY.');
  process.exit(0);
}
