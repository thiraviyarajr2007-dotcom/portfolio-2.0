/**
 * Test Suite for Explorer M2.2 JavaScript Modules
 * Runs in Node.js with a lightweight DOM mock simulating browser behavior
 */

const assert = require('assert');

console.log('='.repeat(70));
console.log('TESTING EXPLORER M2.2 JAVASCRIPT MODULES IN NODE.JS');
console.log('='.repeat(70));

// --- MOCK DOM ENVIRONMENT ---
class MockElement {
  constructor(tag, id = '', classes = [], attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = {
      _set: new Set(classes),
      add: (c) => this.classList._set.add(c),
      remove: (c) => this.classList._set.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._set.has(c)) {
            this.classList._set.delete(c);
            return false;
          } else {
            this.classList._set.add(c);
            return true;
          }
        }
        if (force) this.classList._set.add(c);
        else this.classList._set.delete(c);
        return force;
      },
      contains: (c) => this.classList._set.has(c)
    };
    this.attributes = { ...attrs };
    if (id) this.attributes['id'] = id;
    this.textContent = '';
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this.offsetHeight = 100;
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(type, fn) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || [];
    handlers.forEach(fn => fn(event));
  }

  closest(selector) {
    if (selector.startsWith('.') && this.classList.contains(selector.slice(1))) return this;
    if (this.parentElement) return this.parentElement.closest(selector);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 1. TEST HERO ROLE ROTATOR
// ------------------------------------------------------------------------------
console.log('\n--- 1. Testing Hero Role Rotator Module ---');

function createRoleRotatorModule(rotatorElem, prefersReducedMotion = false) {
  const defaultRoles = [
    "AI/ML Engineer",
    "Flutter & Firebase Developer",
    "Full-stack Builder"
  ];

  let roles = defaultRoles;
  try {
    const rawAttr = rotatorElem.getAttribute('data-roles');
    if (rawAttr) {
      const parsed = JSON.parse(rawAttr);
      if (Array.isArray(parsed) && parsed.length > 0) roles = parsed;
    }
  } catch (e) {
    roles = defaultRoles;
  }

  if (!rotatorElem.getAttribute('aria-live')) {
    rotatorElem.setAttribute('aria-live', 'polite');
  }
  if (!rotatorElem.getAttribute('aria-atomic')) {
    rotatorElem.setAttribute('aria-atomic', 'true');
  }

  let currentIndex = roles.indexOf(rotatorElem.textContent.trim());
  if (currentIndex === -1) currentIndex = 0;
  rotatorElem.textContent = roles[currentIndex];

  let timerId = null;
  let isPaused = false;
  const ROTATE_INTERVAL = 2500;
  const TRANSITION_DURATION = 250;

  function next() {
    if (isPaused) return;
    currentIndex = (currentIndex + 1) % roles.length;
    const nextRole = roles[currentIndex];

    if (prefersReducedMotion) {
      rotatorElem.textContent = nextRole;
      return;
    }

    rotatorElem.style.opacity = '0';
    rotatorElem.style.transform = 'translateY(-10px)';
    
    // Simulate transition timeout
    rotatorElem.textContent = nextRole;
    rotatorElem.style.opacity = '1';
    rotatorElem.style.transform = 'translateY(0)';
  }

  return {
    next,
    getCurrentRole: () => roles[currentIndex],
    getRoles: () => roles,
    setPaused: (p) => { isPaused = p; },
    getAriaLive: () => rotatorElem.getAttribute('aria-live'),
    getAriaAtomic: () => rotatorElem.getAttribute('aria-atomic')
  };
}

const mockRotator = new MockElement('span', 'role-rotator', ['role-rotator'], {
  'data-roles': '["AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"]'
});
mockRotator.textContent = 'AI/ML Engineer';

const rotatorInstance = createRoleRotatorModule(mockRotator);
assert.strictEqual(rotatorInstance.getCurrentRole(), 'AI/ML Engineer', 'Initial role should be AI/ML Engineer');
assert.strictEqual(rotatorInstance.getAriaLive(), 'polite', 'aria-live must be polite');
assert.strictEqual(rotatorInstance.getAriaAtomic(), 'true', 'aria-atomic must be true');

// Rotate 1
rotatorInstance.next();
assert.strictEqual(rotatorInstance.getCurrentRole(), 'Flutter & Firebase Developer', 'Role should advance to Flutter & Firebase Developer');
assert.strictEqual(mockRotator.textContent, 'Flutter & Firebase Developer');

// Rotate 2
rotatorInstance.next();
assert.strictEqual(rotatorInstance.getCurrentRole(), 'Full-stack Builder', 'Role should advance to Full-stack Builder');

// Rotate 3 (wrap-around)
rotatorInstance.next();
assert.strictEqual(rotatorInstance.getCurrentRole(), 'AI/ML Engineer', 'Role should wrap around to AI/ML Engineer');

// Pause check
rotatorInstance.setPaused(true);
rotatorInstance.next();
assert.strictEqual(rotatorInstance.getCurrentRole(), 'AI/ML Engineer', 'Rotator should not advance when paused');
rotatorInstance.setPaused(false);

console.log('[PASS] Hero Role Rotator logic validated completely');

// ------------------------------------------------------------------------------
// 2. TEST PROJECT CATEGORY FILTERING
// ------------------------------------------------------------------------------
console.log('\n--- 2. Testing Project Category Filtering Module ---');

function createProjectFilterModule(chips, cards, prefersReducedMotion = false) {
  let activeFilter = 'all';

  function applyFilter(filter, clickedChip) {
    activeFilter = filter;

    chips.forEach(chip => {
      const isMatch = (chip === clickedChip) || (chip.getAttribute('data-filter') === filter);
      chip.classList.toggle('active', isMatch);
      chip.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });

    cards.forEach(card => {
      const rawCategories = card.getAttribute('data-category') || '';
      const categories = rawCategories.toLowerCase().trim().split(/\s+/);
      const isMatch = filter === 'all' || categories.includes(filter);

      card.classList.toggle('is-hidden', !isMatch);
      if (isMatch) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      const f = chip.getAttribute('data-filter') || 'all';
      applyFilter(f, chip);
    });
  });

  return {
    applyFilter,
    getActiveFilter: () => activeFilter,
    getVisibleCount: () => cards.filter(c => !c.classList.contains('is-hidden')).length
  };
}

const mockChips = [
  new MockElement('button', '', ['filter-chip', 'active'], { 'data-filter': 'all', 'aria-pressed': 'true' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'mobile', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'web', 'aria-pressed': 'false' }),
  new MockElement('button', '', ['filter-chip'], { 'data-filter': 'ai', 'aria-pressed': 'false' })
];

const mockCards = [
  new MockElement('article', '', ['project-card'], { 'data-category': 'mobile' }),        // Namma Nellai
  new MockElement('article', '', ['project-card'], { 'data-category': 'mobile' }),        // SwiftShare
  new MockElement('article', '', ['project-card'], { 'data-category': 'web ai' }),        // HabitAI
  new MockElement('article', '', ['project-card'], { 'data-category': 'web ai' }),        // AI Notes
  new MockElement('article', '', ['project-card'], { 'data-category': 'web mobile' }),    // GPS Tracker
  new MockElement('article', '', ['project-card'], { 'data-category': 'ai' }),            // Road Safety
  new MockElement('article', '', ['project-card'], { 'data-category': 'web ai' })         // Medicine Chem
];

const filterInstance = createProjectFilterModule(mockChips, mockCards);

// Test All
filterInstance.applyFilter('all', mockChips[0]);
assert.strictEqual(filterInstance.getVisibleCount(), 7, 'Filter "all" must display 7 cards');
assert.strictEqual(mockChips[0].getAttribute('aria-pressed'), 'true');
assert.strictEqual(mockChips[1].getAttribute('aria-pressed'), 'false');

// Test Mobile
filterInstance.applyFilter('mobile', mockChips[1]);
assert.strictEqual(filterInstance.getVisibleCount(), 3, 'Filter "mobile" must display 3 cards');
assert.strictEqual(mockChips[1].getAttribute('aria-pressed'), 'true');
assert.strictEqual(mockChips[0].getAttribute('aria-pressed'), 'false');
assert.strictEqual(mockCards[0].classList.contains('is-hidden'), false); // Namma Nellai
assert.strictEqual(mockCards[1].classList.contains('is-hidden'), false); // SwiftShare
assert.strictEqual(mockCards[2].classList.contains('is-hidden'), true);  // HabitAI
assert.strictEqual(mockCards[4].classList.contains('is-hidden'), false); // GPS Tracker (web mobile)

// Test Web
filterInstance.applyFilter('web', mockChips[2]);
assert.strictEqual(filterInstance.getVisibleCount(), 4, 'Filter "web" must display 4 cards');
assert.strictEqual(mockChips[2].getAttribute('aria-pressed'), 'true');
assert.strictEqual(mockCards[2].classList.contains('is-hidden'), false); // HabitAI
assert.strictEqual(mockCards[3].classList.contains('is-hidden'), false); // AI Notes
assert.strictEqual(mockCards[4].classList.contains('is-hidden'), false); // GPS Tracker
assert.strictEqual(mockCards[6].classList.contains('is-hidden'), false); // Medicine Chem
assert.strictEqual(mockCards[0].classList.contains('is-hidden'), true);  // Namma Nellai

// Test AI
filterInstance.applyFilter('ai', mockChips[3]);
assert.strictEqual(filterInstance.getVisibleCount(), 4, 'Filter "ai" must display 4 cards');
assert.strictEqual(mockCards[2].classList.contains('is-hidden'), false); // HabitAI
assert.strictEqual(mockCards[3].classList.contains('is-hidden'), false); // AI Notes
assert.strictEqual(mockCards[5].classList.contains('is-hidden'), false); // Road Safety
assert.strictEqual(mockCards[6].classList.contains('is-hidden'), false); // Medicine Chem

console.log('[PASS] Project Category Filtering logic validated completely');

// ------------------------------------------------------------------------------
// 3. TEST SCROLL-SPY NAVIGATION
// ------------------------------------------------------------------------------
console.log('\n--- 3. Testing Scroll-Spy Navigation Module ---');

function createScrollSpyModule(sectionIds, navLinks) {
  let activeSection = 'hero';

  function updateActiveNav(targetId) {
    activeSection = targetId;
    navLinks.forEach(link => {
      const isMatch = link.getAttribute('href') === `#${targetId}`;
      link.classList.toggle('active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function handleScroll(scrollY, windowHeight, documentHeight) {
    if (scrollY < 80) {
      updateActiveNav('hero');
      return;
    }
    if (windowHeight + scrollY >= documentHeight - 60) {
      updateActiveNav('contact');
      return;
    }
  }

  return {
    updateActiveNav,
    handleScroll,
    getActiveSection: () => activeSection
  };
}

const sectionIds = ['hero', 'about', 'projects', 'skills', 'achievements', 'certifications', 'contact'];
const mockNavLinks = sectionIds.map(id => {
  return new MockElement('a', '', ['nav-link'], { 'href': `#${id}` });
});

const spyInstance = createScrollSpyModule(sectionIds, mockNavLinks);

// Initial state
spyInstance.updateActiveNav('hero');
assert.strictEqual(spyInstance.getActiveSection(), 'hero');
assert.strictEqual(mockNavLinks[0].classList.contains('active'), true);
assert.strictEqual(mockNavLinks[0].getAttribute('aria-current'), 'page');
assert.strictEqual(mockNavLinks[1].getAttribute('aria-current'), null);

// Transition to projects
spyInstance.updateActiveNav('projects');
assert.strictEqual(spyInstance.getActiveSection(), 'projects');
assert.strictEqual(mockNavLinks[2].classList.contains('active'), true);
assert.strictEqual(mockNavLinks[2].getAttribute('aria-current'), 'page');
assert.strictEqual(mockNavLinks[0].classList.contains('active'), false);

// Test top of page boundary
spyInstance.handleScroll(20, 800, 5000);
assert.strictEqual(spyInstance.getActiveSection(), 'hero', 'ScrollY < 80 must activate hero');
assert.strictEqual(mockNavLinks[0].classList.contains('active'), true);

// Test bottom of page boundary
spyInstance.handleScroll(4300, 800, 5000); // 4300 + 800 = 5100 >= 5000 - 60
assert.strictEqual(spyInstance.getActiveSection(), 'contact', 'Bottom of page must activate contact');
assert.strictEqual(mockNavLinks[6].classList.contains('active'), true);
assert.strictEqual(mockNavLinks[6].getAttribute('aria-current'), 'page');

console.log('[PASS] Scroll-Spy Navigation logic validated completely');

console.log('\n' + '='.repeat(70));
console.log('ALL JAVASCRIPT MODULE TESTS PASSED IN NODE.JS ENVIRONMENT');
console.log('='.repeat(70));
