/**
 * ============================================================================
 * EMPIRICAL CHALLENGER ADVERSARIAL STRESS TEST
 * Portfolio 2.0 — MobileNavManager Focus Trap & Keyboard Navigation
 *
 * Target: script.js (MobileNavManager)
 * Agent: challenger_m2_it2_1
 *
 * Test Specifications:
 *   1. 100+ simulated rapid Tab and Shift+Tab keydown events across all boundaries:
 *      - Boundary A: #hero (first link) backward (Shift+Tab) -> navToggleBtn
 *      - Boundary B: navToggleBtn forward (Tab) -> #hero (first link)
 *      - Boundary C: #contact (last link) forward (Tab) -> navToggleBtn (skipping #theme-toggle)
 *      - Boundary D: navToggleBtn backward (Shift+Tab) -> #contact (skipping #theme-toggle)
 *   2. Inner link tabbing: asserting defaultPrevented is strictly FALSE
 *   3. Random key sequences (500+ events) including Escape, Space, Enter, Arrows, unregistered keys
 *   4. Focus drift outside modal ring: asserting immediate recapture to drawer
 *   5. Continuous full traversal loop stress (100 forward cycles, 100 backward cycles)
 *   6. Empty focusables boundary fallback
 *   7. Legacy event keyCode (9, 27) fallback
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('='.repeat(80));
console.log('EMPIRICAL ADVERSARIAL STRESS TEST: MOBILENAVMANAGER FOCUS TRAP (M2-IT2)');
console.log('='.repeat(80));

// ----------------------------------------------------------------------------
// MOCK DOM ENVIRONMENT
// ----------------------------------------------------------------------------

class MockClassList {
  constructor(initialClasses = []) {
    this._set = new Set(initialClasses.filter(Boolean));
  }
  add(...classes) {
    classes.forEach(c => c && this._set.add(c));
  }
  remove(...classes) {
    classes.forEach(c => this._set.delete(c));
  }
  toggle(c, force) {
    if (force === undefined) {
      if (this._set.has(c)) {
        this._set.delete(c);
        return false;
      } else {
        this._set.add(c);
        return true;
      }
    }
    if (force) {
      this._set.add(c);
    } else {
      this._set.delete(c);
    }
    return force;
  }
  contains(c) {
    return this._set.has(c);
  }
  get length() {
    return this._set.size;
  }
  toString() {
    return Array.from(this._set).join(' ');
  }
}

class MockDOMElement {
  constructor(tagName, id = '', classes = [], attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new MockClassList(classes);
    this.attributes = { ...attributes };
    if (id) this.attributes['id'] = id;
    this.textContent = '';
    this.value = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.children = [];
    this.offsetParent = {}; // Non-null to simulate visible rendered element
    this.offsetHeight = 50;
    this.offsetWidth = 150;
    this.dataset = {};
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name.startsWith('data-')) {
      const prop = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      this.dataset[prop] = String(val);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name.startsWith('data-')) {
      const prop = name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      delete this.dataset[prop];
    }
  }

  hasAttribute(name) {
    return name in this.attributes;
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type, fn) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== fn);
    }
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    const handlers = (this.listeners[event.type] || []).slice();
    for (let fn of handlers) {
      fn.call(this, event);
    }
    if (event.bubbles && this.parentElement) {
      this.parentElement.dispatchEvent(event);
    }
  }

  focus() {
    global.document.activeElement = this;
    if (this.listeners['focus']) {
      this.dispatchEvent({ type: 'focus', target: this });
    }
  }

  blur() {
    if (global.document.activeElement === this) {
      global.document.activeElement = null;
    }
    if (this.listeners['blur']) {
      this.dispatchEvent({ type: 'blur', target: this });
    }
  }

  contains(target) {
    if (!target) return false;
    if (this === target) return true;
    for (let child of this.children) {
      if (child.contains(target)) return true;
    }
    return false;
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  _matches(sel) {
    sel = sel.trim();
    if (!sel) return false;

    // Pseudo-class :not(...) e.g. button:not([disabled]) or [tabindex]:not([tabindex="-1"])
    const notMatch = sel.match(/^([a-zA-Z0-9_-]*)\[?([a-zA-Z0-9_-]*)\]?:not\(\[([a-zA-Z0-9_-]+)(?:="([^"]+)")?\]\)$/);
    if (notMatch) {
      const [_, tag, attr, notAttr, notVal] = notMatch;
      if (tag && this.tagName.toLowerCase() !== tag.toLowerCase()) return false;
      if (attr && !this.hasAttribute(attr)) return false;
      if (notVal !== undefined) {
        return this.getAttribute(notAttr) !== notVal;
      }
      return !this.hasAttribute(notAttr);
    }

    // a[href]
    if (sel === 'a[href]') {
      return this.tagName.toLowerCase() === 'a' && this.hasAttribute('href');
    }

    // button:not([disabled])
    if (sel === 'button:not([disabled])') {
      return this.tagName.toLowerCase() === 'button' && !this.hasAttribute('disabled');
    }

    // ID selector
    if (sel.startsWith('#')) {
      return this.id === sel.slice(1);
    }

    // Class selector
    if (sel.startsWith('.')) {
      return this.classList.contains(sel.slice(1));
    }

    // Tag selector
    if (this.tagName.toLowerCase() === sel.toLowerCase()) {
      return true;
    }

    return false;
  }

  querySelectorAll(selector) {
    const results = [];
    const selectors = selector.split(',').map(s => s.trim());

    const recurse = (node) => {
      for (let s of selectors) {
        if (node._matches(s)) {
          results.push(node);
          break;
        }
      }
      for (let child of node.children) {
        recurse(child);
      }
    };

    this.children.forEach(recurse);
    return results;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }
}

// ----------------------------------------------------------------------------
// HARNESS BUILDER
// ----------------------------------------------------------------------------
function createTestHarness() {
  const root = new MockDOMElement('html', '', [], { 'data-theme': 'dark' });
  const body = new MockDOMElement('body');
  root.appendChild(body);

  // Skip link
  const skipLink = new MockDOMElement('a', '', ['skip-link'], { href: '#hero' });
  body.appendChild(skipLink);

  // Header
  const header = new MockDOMElement('header', 'header', ['site-header']);
  const navContainer = new MockDOMElement('div', '', ['header-container', 'navbar']);
  header.appendChild(navContainer);

  const brandLogo = new MockDOMElement('a', '', ['brand-logo', 'logo'], { href: '#hero' });
  navContainer.appendChild(brandLogo);

  // Navigation menu: <nav class="site-nav nav-menu" id="site-nav">
  const siteNav = new MockDOMElement('nav', 'site-nav', ['site-nav', 'nav-menu'], { 'aria-label': 'Main Navigation' });
  const navList = new MockDOMElement('ul', 'nav-menu', ['nav-list', 'nav-links']);
  siteNav.appendChild(navList);

  const linksData = [
    { href: '#hero', text: 'Home', active: true },
    { href: '#about', text: 'About', active: false },
    { href: '#projects', text: 'Projects', active: false },
    { href: '#skills', text: 'Skills', active: false },
    { href: '#achievements', text: 'Achievements', active: false },
    { href: '#certifications', text: 'Certifications', active: false },
    { href: '#contact', text: 'Contact', active: false }
  ];

  const links = [];
  linksData.forEach(item => {
    const li = new MockDOMElement('li');
    const a = new MockDOMElement('a', '', ['nav-link', ...(item.active ? ['active'] : [])], {
      href: item.href,
      ...(item.active ? { 'aria-current': 'page' } : {})
    });
    a.textContent = item.text;
    li.appendChild(a);
    navList.appendChild(li);
    links.push(a);
  });
  navContainer.appendChild(siteNav);

  // Controls: #theme-toggle and #nav-toggle
  const headerControls = new MockDOMElement('div', '', ['header-controls', 'nav-actions']);
  const themeToggle = new MockDOMElement('button', 'theme-toggle', ['theme-toggle-btn'], {
    type: 'button',
    'aria-label': 'Toggle theme'
  });
  const navToggle = new MockDOMElement('button', 'nav-toggle', ['nav-toggle-btn'], {
    type: 'button',
    'aria-label': 'Open navigation menu',
    'aria-expanded': 'false',
    'aria-controls': 'nav-menu'
  });
  headerControls.appendChild(themeToggle);
  headerControls.appendChild(navToggle);
  navContainer.appendChild(headerControls);
  body.appendChild(header);

  // Main content (outside elements for drift testing)
  const main = new MockDOMElement('main');
  const heroSection = new MockDOMElement('section', 'hero');
  const heroCta1 = new MockDOMElement('a', 'hero-cta-projects', ['btn'], { href: '#projects' });
  const heroCta2 = new MockDOMElement('a', 'hero-cta-resume', ['btn'], { href: 'assets/resume.pdf' });
  heroSection.appendChild(heroCta1);
  heroSection.appendChild(heroCta2);
  main.appendChild(heroSection);

  const contactSection = new MockDOMElement('section', 'contact');
  const contactInput = new MockDOMElement('input', 'contact-name', [], { type: 'text' });
  contactSection.appendChild(contactInput);
  main.appendChild(contactSection);

  body.appendChild(main);

  // Document mock
  const docListeners = {};
  const mockDocument = {
    documentElement: root,
    body: body,
    activeElement: body,
    getElementById(id) {
      if (id === 'theme-toggle') return themeToggle;
      if (id === 'nav-toggle') return navToggle;
      if (id === 'site-nav') return siteNav;
      if (id === 'nav-menu') return navList;
      if (id === 'header') return header;
      if (id === 'hero') return heroSection;
      if (id === 'contact') return contactSection;
      if (id === 'contact-name') return contactInput;
      return null;
    },
    querySelector(selector) {
      if (selector === '.nav-menu') return siteNav;
      if (selector === '#site-nav') return siteNav;
      if (selector === '#nav-menu') return navList;
      if (selector === '#nav-toggle' || selector === '.nav-toggle-btn') return navToggle;
      if (selector === '#theme-toggle' || selector === '.theme-toggle-btn') return themeToggle;
      return root.querySelector(selector);
    },
    querySelectorAll(selector) {
      return root.querySelectorAll(selector);
    },
    addEventListener(type, fn) {
      if (!docListeners[type]) docListeners[type] = [];
      docListeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      if (docListeners[type]) {
        docListeners[type] = docListeners[type].filter(f => f !== fn);
      }
    },
    dispatchEvent(event) {
      const handlers = (docListeners[event.type] || []).slice();
      for (let fn of handlers) {
        fn.call(mockDocument, event);
      }
    }
  };

  // Window mock
  const winListeners = {};
  const mockWindow = {
    document: mockDocument,
    innerWidth: 375,
    innerHeight: 667,
    matchMedia(query) {
      return {
        matches: query === '(min-width: 1024px)' ? false : true,
        media: query,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {}
      };
    },
    requestAnimationFrame(cb) {
      cb();
      return 1;
    },
    addEventListener(type, fn) {
      if (!winListeners[type]) winListeners[type] = [];
      winListeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      if (winListeners[type]) {
        winListeners[type] = winListeners[type].filter(f => f !== fn);
      }
    },
    dispatchEvent(event) {}
  };

  // Assign globals
  global.window = mockWindow;
  global.document = mockDocument;
  global.CustomEvent = function (name, opts) {
    this.type = name;
    this.detail = opts ? opts.detail : null;
  };

  // Clear node module cache for script.js to ensure clean re-initialization
  const scriptPath = path.resolve(__dirname, '..', '..', '..', 'script.js');
  delete require.cache[require.resolve(scriptPath)];
  const Portfolio = require(scriptPath);

  return {
    Portfolio,
    document: mockDocument,
    window: mockWindow,
    navToggle,
    themeToggle,
    siteNav,
    navList,
    links,
    skipLink,
    heroCta1,
    contactInput,
    body
  };
}

// ----------------------------------------------------------------------------
// TEST RUNNER
// ----------------------------------------------------------------------------
let passedCount = 0;
let failedCount = 0;
const testResults = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
    testResults.push({ name, status: 'PASS' });
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err.message}`);
    failedCount++;
    testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
  }
}

function simulateKeydown(doc, opts) {
  let defaultPrevented = false;
  let propagationStopped = false;

  const event = {
    type: 'keydown',
    key: opts.key || '',
    keyCode: opts.keyCode || (opts.key === 'Tab' ? 9 : opts.key === 'Escape' ? 27 : 0),
    shiftKey: Boolean(opts.shiftKey),
    altKey: Boolean(opts.altKey),
    ctrlKey: Boolean(opts.ctrlKey),
    metaKey: Boolean(opts.metaKey),
    preventDefault() {
      defaultPrevented = true;
    },
    stopPropagation() {
      propagationStopped = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    }
  };

  doc.dispatchEvent(event);
  return event;
}

// ============================================================================
// TEST SUITE 1: RAPID BOUNDARY TRANSITIONS STRESS (100+ CYCLES EACH)
// ============================================================================
console.log('\n--- SUITE 1: Rapid Boundary Transitions Stress (100+ Cycles Each) ---');

test('1.1: 150 cycles — Boundary A: From #hero (first link) backward (Shift+Tab) -> navToggleBtn', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const heroLink = env.links[0];
  const navToggle = env.navToggle;

  for (let i = 0; i < 150; i++) {
    heroLink.focus();
    assert.strictEqual(env.document.activeElement, heroLink, `Pre-condition failed at cycle ${i}`);

    const evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });

    assert.strictEqual(evt.defaultPrevented, true, `Shift+Tab from firstLink must be defaultPrevented at cycle ${i}`);
    assert.strictEqual(env.document.activeElement, navToggle, `Focus must wrap to navToggle at cycle ${i}`);
  }
});

test('1.2: 150 cycles — Boundary B: From navToggleBtn forward (Tab) -> #hero (first link)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const heroLink = env.links[0];
  const navToggle = env.navToggle;

  for (let i = 0; i < 150; i++) {
    navToggle.focus();
    assert.strictEqual(env.document.activeElement, navToggle, `Pre-condition failed at cycle ${i}`);

    const evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });

    assert.strictEqual(evt.defaultPrevented, true, `Tab forward from navToggle must be defaultPrevented at cycle ${i}`);
    assert.strictEqual(env.document.activeElement, heroLink, `Focus must wrap to #hero at cycle ${i}`);
  }
});

test('1.3: 150 cycles — Boundary C: From #contact (last link) forward (Tab) -> navToggleBtn (skipping #theme-toggle)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const contactLink = env.links[env.links.length - 1]; // #contact
  const navToggle = env.navToggle;
  const themeToggle = env.themeToggle;

  for (let i = 0; i < 150; i++) {
    contactLink.focus();
    assert.strictEqual(env.document.activeElement, contactLink, `Pre-condition failed at cycle ${i}`);

    const evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });

    assert.strictEqual(evt.defaultPrevented, true, `Tab forward from lastLink must be defaultPrevented at cycle ${i}`);
    assert.strictEqual(env.document.activeElement, navToggle, `Focus must land on navToggle at cycle ${i}`);
    assert.notStrictEqual(env.document.activeElement, themeToggle, `Focus MUST NOT land on #theme-toggle at cycle ${i}`);
  }
});

test('1.4: 150 cycles — Boundary D: From navToggleBtn backward (Shift+Tab) -> #contact (skipping #theme-toggle)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const contactLink = env.links[env.links.length - 1]; // #contact
  const navToggle = env.navToggle;
  const themeToggle = env.themeToggle;

  for (let i = 0; i < 150; i++) {
    navToggle.focus();
    assert.strictEqual(env.document.activeElement, navToggle, `Pre-condition failed at cycle ${i}`);

    const evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });

    assert.strictEqual(evt.defaultPrevented, true, `Shift+Tab from navToggle must be defaultPrevented at cycle ${i}`);
    assert.strictEqual(env.document.activeElement, contactLink, `Focus must wrap backwards to #contact at cycle ${i}`);
    assert.notStrictEqual(env.document.activeElement, themeToggle, `Focus MUST NOT land on #theme-toggle at cycle ${i}`);
  }
});

// ============================================================================
// TEST SUITE 2: CONTINUOUS FULL TRAVERSAL CYCLES (100 FORWARD, 100 BACKWARD)
// ============================================================================
console.log('\n--- SUITE 2: Continuous Full Traversal Loops ---');

test('2.1: 100 full forward boundary loops (navToggle -> #hero -> links -> #contact -> navToggle)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const navToggle = env.navToggle;
  const links = env.links;
  const firstLink = links[0];
  const lastLink = links[links.length - 1];

  navToggle.focus();

  for (let cycle = 0; cycle < 100; cycle++) {
    // 1. From navToggle -> forward Tab
    let evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });
    assert.strictEqual(evt.defaultPrevented, true, `Cycle ${cycle}: navToggle -> firstLink must be intercepted`);
    assert.strictEqual(env.document.activeElement, firstLink, `Cycle ${cycle}: focus should be on firstLink`);

    // 2. Traverse through inner links: simulate browser advancing focus
    for (let idx = 0; idx < links.length - 1; idx++) {
      links[idx].focus();
      let innerEvt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });
      assert.strictEqual(innerEvt.defaultPrevented, false, `Cycle ${cycle}: inner link [${idx}] Tab must NOT be intercepted`);
      // Simulate browser native focus jump
      links[idx + 1].focus();
    }

    // 3. From lastLink -> forward Tab
    assert.strictEqual(env.document.activeElement, lastLink, `Cycle ${cycle}: focus must be at lastLink`);
    evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });
    assert.strictEqual(evt.defaultPrevented, true, `Cycle ${cycle}: lastLink -> navToggle must be intercepted`);
    assert.strictEqual(env.document.activeElement, navToggle, `Cycle ${cycle}: focus must be back at navToggle`);
  }
});

test('2.2: 100 full backward boundary loops (navToggle -> #contact -> links -> #hero -> navToggle)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const navToggle = env.navToggle;
  const links = env.links;
  const firstLink = links[0];
  const lastLink = links[links.length - 1];

  navToggle.focus();

  for (let cycle = 0; cycle < 100; cycle++) {
    // 1. From navToggle -> Shift+Tab
    let evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });
    assert.strictEqual(evt.defaultPrevented, true, `Cycle ${cycle}: navToggle -> lastLink must be intercepted`);
    assert.strictEqual(env.document.activeElement, lastLink, `Cycle ${cycle}: focus should wrap backwards to lastLink`);

    // 2. Traverse backward through inner links
    for (let idx = links.length - 1; idx > 0; idx--) {
      links[idx].focus();
      let innerEvt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });
      assert.strictEqual(innerEvt.defaultPrevented, false, `Cycle ${cycle}: inner link [${idx}] Shift+Tab must NOT be intercepted`);
      // Simulate browser native backward focus jump
      links[idx - 1].focus();
    }

    // 3. From firstLink -> Shift+Tab
    assert.strictEqual(env.document.activeElement, firstLink, `Cycle ${cycle}: focus must be at firstLink`);
    evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });
    assert.strictEqual(evt.defaultPrevented, true, `Cycle ${cycle}: firstLink -> navToggle must be intercepted`);
    assert.strictEqual(env.document.activeElement, navToggle, `Cycle ${cycle}: focus must wrap backwards to navToggle`);
  }
});

// ============================================================================
// TEST SUITE 3: INNER LINK TABBING (ASSERTING defaultPrevented IS FALSE)
// ============================================================================
console.log('\n--- SUITE 3: Inner Link Tabbing (defaultPrevented === false) ---');

test('3.1: Strict assertion that inner links [1..5] do not call preventDefault on Tab or Shift+Tab', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  // Links: 0: #hero, 1: #about, 2: #projects, 3: #skills, 4: #achievements, 5: #certifications, 6: #contact
  const innerIndices = [1, 2, 3, 4, 5];

  for (let round = 0; round < 25; round++) {
    for (let idx of innerIndices) {
      const link = env.links[idx];
      link.focus();

      // Forward Tab
      const forwardEvt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });
      assert.strictEqual(
        forwardEvt.defaultPrevented,
        false,
        `Forward Tab on inner link ${link.getAttribute('href')} (idx: ${idx}) must NOT preventDefault`
      );

      // Backward Shift+Tab
      const backwardEvt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });
      assert.strictEqual(
        backwardEvt.defaultPrevented,
        false,
        `Backward Shift+Tab on inner link ${link.getAttribute('href')} (idx: ${idx}) must NOT preventDefault`
      );
    }
  }
});

// ============================================================================
// TEST SUITE 4: FOCUS DRIFT RECAPTURE (100+ ITERATIONS)
// ============================================================================
console.log('\n--- SUITE 4: Focus Drift Recapture Outside Modal Ring ---');

test('4.1: 150 drift events from arbitrary DOM elements recaptured to #hero', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const heroLink = env.links[0];
  const outsideElements = [
    env.themeToggle,
    env.skipLink,
    env.body,
    env.heroCta1,
    env.contactInput,
    null // simulate unfocused state or null activeElement
  ];

  for (let i = 0; i < 150; i++) {
    const target = outsideElements[i % outsideElements.length];
    env.document.activeElement = target;

    // Both forward Tab and backward Shift+Tab should trigger recapture
    const isShift = i % 2 === 1;
    const evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: isShift });

    assert.strictEqual(evt.defaultPrevented, true, `Drift event ${i} must preventDefault`);
    assert.strictEqual(
      env.document.activeElement,
      heroLink,
      `Drift event ${i} (target: ${target ? target.tagName + '#' + target.id : 'null'}) must be recaptured to #hero`
    );
  }
});

test('4.2: Drift recapture fallback to navToggle when firstLink is missing focus method', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const firstLink = env.links[0];
  const originalFocus = firstLink.focus;
  firstLink.focus = null; // simulate un-focusable first element

  env.document.activeElement = env.themeToggle; // drifted outside
  const evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });

  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(env.document.activeElement, env.navToggle, 'Must fallback to navToggle if firstLink cannot be focused');

  firstLink.focus = originalFocus;
});

// ============================================================================
// TEST SUITE 5: RANDOM KEY SEQUENCES & FUZZING (500+ EVENTS)
// ============================================================================
console.log('\n--- SUITE 5: Random Key Sequence & Fuzzing (500+ Events) ---');

test('5.1: 500 random keydown events under open drawer (Escape, Space, Enter, Arrows, Fuzz)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const candidateKeys = [
    'Escape', 'Tab', 'Space', ' ', 'Enter', 'ArrowUp', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'Home', 'End', 'KeyA', 'a', 'Digit1',
    'F5', 'Shift', 'Control', 'Alt', 'Backspace', 'UnknownKey'
  ];

  const focusRing = [env.navToggle, ...env.links];

  for (let i = 0; i < 500; i++) {
    // Pick random key and modifier
    const key = candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
    const shiftKey = Math.random() < 0.5;

    // Pick random element from focus ring
    const elem = focusRing[Math.floor(Math.random() * focusRing.length)];
    elem.focus();

    const evt = simulateKeydown(env.document, { key, shiftKey });

    if (key === 'Escape') {
      assert.strictEqual(evt.defaultPrevented, true, `Escape event ${i} must preventDefault`);
      assert.strictEqual(mn.isOpen(), false, `Escape event ${i} must close drawer`);
      assert.strictEqual(env.document.activeElement, env.navToggle, `Escape event ${i} must restore focus to navToggle`);
      // Re-open drawer for next iterations
      mn.open();
      assert.strictEqual(mn.isOpen(), true);
    } else if (key === 'Tab') {
      // Tab may or may not preventDefault depending on whether boundary was hit,
      // but activeElement MUST ALWAYS remain strictly inside the focus ring!
      assert.ok(
        focusRing.includes(env.document.activeElement),
        `Tab key event ${i} resulted in focus outside modal ring: ${env.document.activeElement ? env.document.activeElement.tagName + '#' + env.document.activeElement.id : 'null'}`
      );
    } else {
      // Non-navigation keys must NOT be prevented by MobileNavManager
      assert.strictEqual(evt.defaultPrevented, false, `Key "${key}" event ${i} should not be prevented`);
    }
  }
});

// ============================================================================
// TEST SUITE 6: EMPTY FOCUSABLES AND EDGE CASES
// ============================================================================
console.log('\n--- SUITE 6: Empty Focusables & Edge Cases ---');

test('6.1: Empty nav list traps Tab to navToggle without throwing', () => {
  const env = createTestHarness();
  // Clear all children from navList
  env.navList.children = [];

  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  env.navToggle.focus();

  // Tab forward
  let evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: false });
  assert.strictEqual(evt.defaultPrevented, true, 'Empty focusables must preventDefault on Tab');
  assert.strictEqual(env.document.activeElement, env.navToggle, 'Focus must stay on navToggle');

  // Shift+Tab backward
  evt = simulateKeydown(env.document, { key: 'Tab', shiftKey: true });
  assert.strictEqual(evt.defaultPrevented, true, 'Empty focusables must preventDefault on Shift+Tab');
  assert.strictEqual(env.document.activeElement, env.navToggle, 'Focus must stay on navToggle');
});

test('6.2: Legacy event keyCode support (keyCode 9 for Tab, 27 for Escape)', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();
  mn.open();

  const heroLink = env.links[0];
  heroLink.focus();

  // Legacy Tab event with key = '' but keyCode = 9 and shiftKey = true
  let evt = simulateKeydown(env.document, { key: '', keyCode: 9, shiftKey: true });
  assert.strictEqual(evt.defaultPrevented, true, 'Legacy keyCode 9 Shift+Tab must be caught');
  assert.strictEqual(env.document.activeElement, env.navToggle, 'Focus must wrap to navToggle');

  // Legacy Escape event with key = '' but keyCode = 27
  evt = simulateKeydown(env.document, { key: '', keyCode: 27 });
  assert.strictEqual(evt.defaultPrevented, true, 'Legacy keyCode 27 must be caught');
  assert.strictEqual(mn.isOpen(), false, 'Drawer must close on legacy keyCode 27');
  assert.strictEqual(env.document.activeElement, env.navToggle, 'Focus must return to navToggle');
});

test('6.3: 100 rapid toggle open/close cycles under keyboard interaction', () => {
  const env = createTestHarness();
  const mn = env.Portfolio.MobileNavManager;
  mn.init();

  for (let i = 0; i < 100; i++) {
    mn.open();
    assert.strictEqual(mn.isOpen(), true);
    assert.strictEqual(env.navToggle.getAttribute('aria-expanded'), 'true');
    assert.strictEqual(env.siteNav.getAttribute('aria-hidden'), 'false');

    // Simulate Escape key
    const evt = simulateKeydown(env.document, { key: 'Escape' });
    assert.strictEqual(evt.defaultPrevented, true);
    assert.strictEqual(mn.isOpen(), false);
    assert.strictEqual(env.navToggle.getAttribute('aria-expanded'), 'false');
    assert.strictEqual(env.siteNav.getAttribute('aria-hidden'), 'true');
  }
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(80));
console.log(`STRESS TEST EXECUTION COMPLETE:`);
console.log(`  Passed: ${passedCount}`);
console.log(`  Failed: ${failedCount}`);
console.log(`  Total:  ${passedCount + failedCount}`);
console.log(`  Pass Rate: ${((passedCount / (passedCount + failedCount)) * 100).toFixed(2)}%`);
console.log('='.repeat(80));

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('\n>>> EMPIRICAL VERDICT: 100% PASS RATE CONFIRMED. ZERO FOCUS LEAKS DETECTED. <<<');
  process.exit(0);
}
