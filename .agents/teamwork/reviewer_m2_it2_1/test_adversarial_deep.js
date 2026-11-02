/**
 * Independent Adversarial Stress Test Suite - Reviewer M2 Iteration 2
 * Agent: reviewer_m2_it2_1
 */

const assert = require('assert');
const path = require('path');

class MockElement {
  constructor(tagName, id = '', classList = [], attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = {
      _classes: new Set(classList),
      contains: (cls) => this.classList._classes.has(cls),
      add: (cls) => this.classList._classes.add(cls),
      remove: (cls) => this.classList._classes.delete(cls),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (this.classList.contains(cls)) {
            this.classList.remove(cls);
            return false;
          } else {
            this.classList.add(cls);
            return true;
          }
        } else if (force) {
          this.classList.add(cls);
          return true;
        } else {
          this.classList.remove(cls);
          return false;
        }
      }
    };
    this.attributes = Object.assign({}, attributes);
    this.style = {};
    this.listeners = {};
    this.children = [];
    this.parentElement = null;
    this.offsetParent = {};
    this.textContent = '';
    this.value = '';
  }

  getAttribute(attr) {
    return Object.prototype.hasOwnProperty.call(this.attributes, attr) ? this.attributes[attr] : null;
  }

  setAttribute(attr, val) {
    this.attributes[attr] = String(val);
  }

  removeAttribute(attr) {
    delete this.attributes[attr];
  }

  hasAttribute(attr) {
    return Object.prototype.hasOwnProperty.call(this.attributes, attr);
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
    const handlers = this.listeners[event.type] || [];
    handlers.forEach(fn => fn(event));
  }

  focus() {
    global.document.activeElement = this;
  }

  contains(child) {
    if (child === this) return true;
    for (let c of this.children) {
      if (c === child || (c.contains && c.contains(child))) return true;
    }
    return false;
  }

  querySelectorAll(selector) {
    let matches = [];
    if (selector.includes('a[href]') && this.tagName === 'A' && this.hasAttribute('href')) matches.push(this);
    if (selector.includes('button') && this.tagName === 'BUTTON') matches.push(this);
    for (let c of this.children) {
      matches = matches.concat(c.querySelectorAll(selector));
    }
    return matches;
  }
}

// Global mocks
const docElem = new MockElement('html', '', [], { 'data-theme': 'dark' });
const bodyElem = new MockElement('body');
const navToggleBtn = new MockElement('button', 'nav-toggle', ['nav-toggle-btn'], {
  'aria-label': 'Open navigation menu',
  'aria-expanded': 'false',
  'aria-controls': 'nav-menu'
});
const navMenu = new MockElement('nav', 'site-nav', ['site-nav', 'nav-menu']);
const navMenuUl = new MockElement('ul', 'nav-menu', ['nav-list', 'nav-links']);
navMenu.children.push(navMenuUl);

const linkIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
const navLinks = linkIds.map(id => {
  const link = new MockElement('a', '', ['nav-link'], { 'href': `#${id}` });
  link.parentElement = navMenuUl;
  navMenuUl.children.push(link);
  return link;
});

const listenersDoc = {};
global.document = {
  documentElement: docElem,
  body: bodyElem,
  activeElement: null,
  getElementById: (id) => {
    if (id === 'nav-toggle') return navToggleBtn;
    if (id === 'site-nav') return navMenu;
    if (id === 'nav-menu') return navMenuUl;
    return null;
  },
  querySelector: (sel) => {
    if (sel === '.nav-toggle-btn') return navToggleBtn;
    if (sel === '.nav-menu') return navMenu;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.nav-link')) return navLinks;
    return [];
  },
  addEventListener: (type, fn) => {
    if (!listenersDoc[type]) listenersDoc[type] = [];
    listenersDoc[type].push(fn);
  },
  removeEventListener: (type, fn) => {
    if (!listenersDoc[type]) return;
    listenersDoc[type] = listenersDoc[type].filter(f => f !== fn);
  },
  dispatchEvent: (e) => {
    const list = listenersDoc[e.type] || [];
    list.forEach(fn => fn(e));
  }
};

global.window = {
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  innerWidth: 375,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
};

function createKeyEvent(key, shiftKey = false) {
  let prevented = false;
  return {
    key,
    shiftKey,
    preventDefault: () => { prevented = true; },
    get defaultPrevented() { return prevented; }
  };
}

const scriptPath = path.resolve(__dirname, '../../../script.js');
const Portfolio = require(scriptPath);

console.log('=== STARTING INDEPENDENT ADVERSARIAL AUDIT ===');
let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// Initialize MobileNavManager
Portfolio.MobileNavManager.init();

test('1. Drawer Open sets correct ARIA and classes', () => {
  Portfolio.MobileNavManager.open();
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), true);
  assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'true');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'false');
  assert.strictEqual(bodyElem.classList.contains('menu-open'), true);
});

test('2. Forward Tab from navToggle wraps to first link (#hero) and calls preventDefault', () => {
  navToggleBtn.focus();
  const evt = createKeyEvent('Tab', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(global.document.activeElement, navLinks[0]);
});

test('3. Backward Shift+Tab from first link (#hero) wraps to navToggle and calls preventDefault', () => {
  navLinks[0].focus();
  const evt = createKeyEvent('Tab', true);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(global.document.activeElement, navToggleBtn);
});

test('4. Forward Tab from last link (#contact) bridges to navToggle and calls preventDefault', () => {
  navLinks[6].focus();
  const evt = createKeyEvent('Tab', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(global.document.activeElement, navToggleBtn);
});

test('5. Backward Shift+Tab from navToggle bridges to last link (#contact) and calls preventDefault', () => {
  navToggleBtn.focus();
  const evt = createKeyEvent('Tab', true);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(global.document.activeElement, navLinks[6]);
});

test('6. Normal forward Tab on middle link (#about) does NOT call preventDefault and does NOT hijack focus', () => {
  navLinks[1].focus();
  const evt = createKeyEvent('Tab', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, false);
  assert.strictEqual(global.document.activeElement, navLinks[1]);
});

test('7. Normal backward Shift+Tab on middle link (#skills) does NOT call preventDefault and does NOT hijack focus', () => {
  navLinks[3].focus();
  const evt = createKeyEvent('Tab', true);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, false);
  assert.strictEqual(global.document.activeElement, navLinks[3]);
});

test('8. Drift Recapture: Focus outside drawer is caught on Tab and redirected to first link', () => {
  const outsider = new MockElement('div', 'outside');
  outsider.focus();
  assert.strictEqual(global.document.activeElement, outsider);
  const evt = createKeyEvent('Tab', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(global.document.activeElement, navLinks[0]);
});

test('9. Escape key dismisses drawer, locks DOM, and restores focus to navToggleBtn', () => {
  navLinks[2].focus();
  const evt = createKeyEvent('Escape', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, true);
  assert.strictEqual(Portfolio.MobileNavManager.isOpen(), false);
  assert.strictEqual(navToggleBtn.getAttribute('aria-expanded'), 'false');
  assert.strictEqual(navMenu.getAttribute('aria-hidden'), 'true');
  assert.strictEqual(bodyElem.classList.contains('menu-open'), false);
  assert.strictEqual(global.document.activeElement, navToggleBtn);
});

test('10. Escape key on closed drawer is safe no-op (no preventDefault)', () => {
  const evt = createKeyEvent('Escape', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, false);
});

test('11. Keydown events on closed drawer are completely ignored (listener detached)', () => {
  const evt = createKeyEvent('Tab', false);
  const handlers = listenersDoc['keydown'] || [];
  handlers.forEach(h => h(evt));
  assert.strictEqual(evt.defaultPrevented, false);
});

console.log(`\nAUDIT RESULT: ${passed}/${total} passed.`);
if (passed === total) {
  console.log('ALL INDEPENDENT ADVERSARIAL CHECKS PASSED EMPIRICALLY!');
  process.exit(0);
} else {
  console.error(`FAILED: ${total - passed} checks failed.`);
  process.exit(1);
}
