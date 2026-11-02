// Unit test suite for proposed_motion.js
const assert = require('assert');
const MotionSubsystem = require('./proposed_motion.js');

console.log('Running unit tests for proposed_motion.js...');

// Test 1: easeOutExpo bounds and curve
assert.strictEqual(MotionSubsystem.easeOutExpo(0), 0, 'easeOutExpo(0) must be exactly 0');
assert.strictEqual(MotionSubsystem.easeOutExpo(1), 1, 'easeOutExpo(1) must be exactly 1');
const mid = MotionSubsystem.easeOutExpo(0.5);
assert.ok(mid > 0.95 && mid < 1.0, `easeOutExpo(0.5) must be > 0.95 (actual: ${mid})`);

// Test 2: formatNumber precision
assert.strictEqual(MotionSubsystem.formatNumber(9.46, 2), '9.46');
assert.strictEqual(MotionSubsystem.formatNumber(9.458, 2), '9.46');
assert.strictEqual(MotionSubsystem.formatNumber(7, 0), '7');
assert.strictEqual(MotionSubsystem.formatNumber(7.2, 0), '7');
assert.strictEqual(MotionSubsystem.formatNumber(8.8, 0), '9');
assert.strictEqual(MotionSubsystem.formatNumber(9, 0), '9');

// Test 3: Simulated DOM with mocked elements
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(cls) {
    this.classes.add(cls);
  }
  contains(cls) {
    return this.classes.has(cls);
  }
}

class MockElement {
  constructor(attrs = {}, text = '') {
    this.attrs = attrs;
    this.textContent = text;
    this.classList = new MockClassList();
    this.dataset = {};
  }
  getAttribute(name) {
    return this.attrs[name] !== undefined ? this.attrs[name] : null;
  }
  setAttribute(name, val) {
    this.attrs[name] = val;
  }
}

// Mock global document
const mockRevealEls = [new MockElement(), new MockElement(), new MockElement()];
const mockStatEls = [
  new MockElement({ 'data-target': '9.46', 'data-decimals': '2' }, '0.00'),
  new MockElement({ 'data-target': '7' }, '0'),
  new MockElement({ 'data-target': '9' }, '0')
];

global.document = {
  querySelectorAll: function(selector) {
    if (selector === '.reveal-on-scroll') return mockRevealEls;
    if (selector === '.stat-number[data-target]') return mockStatEls;
    return [];
  }
};

// Test forceRevealAll
MotionSubsystem.forceRevealAll();
mockRevealEls.forEach((el, idx) => {
  assert.ok(el.classList.contains('revealed'), `Mock reveal element ${idx} must have 'revealed' class`);
});

// Test forceFinalStatValues
MotionSubsystem.forceFinalStatValues();
assert.strictEqual(mockStatEls[0].textContent, '9.46', 'Stat 0 must be 9.46');
assert.strictEqual(mockStatEls[1].textContent, '7', 'Stat 1 must be 7');
assert.strictEqual(mockStatEls[2].textContent, '9', 'Stat 2 must be 9');
assert.strictEqual(mockStatEls[0].dataset.animated, 'true');
assert.strictEqual(mockStatEls[1].dataset.animated, 'true');
assert.strictEqual(mockStatEls[2].dataset.animated, 'true');

console.log('All unit tests passed successfully!');

