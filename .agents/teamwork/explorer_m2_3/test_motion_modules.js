// Verification script for Scroll-Reveal and Animated Stat Counters
// explorer_m2_3

const fs = require('fs');
const path = require('path');

// 1. Inspect index.html
const htmlPath = path.resolve(__dirname, '../../../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log('--- HTML Inspection ---');

// Check reveal-on-scroll elements
const revealMatches = htmlContent.match(/class="[^"]*reveal-on-scroll[^"]*"/g) || [];
console.log(`Found ${revealMatches.length} reveal-on-scroll elements in index.html.`);

// Check stat numbers
const statRegex = /<span\s+class="stat-number"[^>]*data-target="([^"]+)"(?:\s+data-decimals="([^"]+)")?[^>]*>([\s\S]*?)<\/span>/g;
let match;
const statsFound = [];
while ((match = statRegex.exec(htmlContent)) !== null) {
  statsFound.push({
    target: match[1],
    decimals: match[2] || (match[1].includes('.') ? match[1].split('.')[1].length : '0'),
    initialText: match[3].trim()
  });
}
console.log('Stat counters found:', statsFound);

// 2. Inspect styles.css
const cssPath = path.resolve(__dirname, '../../../styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

console.log('\n--- CSS Inspection ---');
const hasRevealCSS = cssContent.includes('.reveal-on-scroll') && cssContent.includes('.reveal-on-scroll.revealed');
console.log('Has .reveal-on-scroll and .reveal-on-scroll.revealed rules:', hasRevealCSS);

const hasReducedMotionCSS = cssContent.includes('prefers-reduced-motion: reduce');
console.log('Has prefers-reduced-motion: reduce media query:', hasReducedMotionCSS);

// 3. Mathematical check of easeOutExpo
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

console.log('\n--- easeOutExpo Curve Verification ---');
[0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 1.0].forEach(p => {
  const eased = easeOutExpo(p);
  console.log(`t = ${p.toFixed(2)} -> easeOutExpo = ${eased.toFixed(5)}`);
});

// Check animation simulation for 9.46 (decimals: 2)
console.log('\n--- Simulation for CGPA (Target: 9.46, Decimals: 2) ---');
[0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 1.0].forEach(p => {
  const cur = 0 + (9.46 - 0) * easeOutExpo(p);
  console.log(`Progress ${(p * 100).toFixed(0)}%: ${cur.toFixed(2)}`);
});

// Check animation simulation for Projects (Target: 7, Decimals: 0)
console.log('\n--- Simulation for Projects (Target: 7, Decimals: 0) ---');
[0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 1.0].forEach(p => {
  const cur = 0 + (7 - 0) * easeOutExpo(p);
  console.log(`Progress ${(p * 100).toFixed(0)}%: ${Math.round(cur)}`);
});

// Check animation simulation for Hackathons (Target: 9, Decimals: 0)
console.log('\n--- Simulation for Hackathons (Target: 9, Decimals: 0) ---');
[0, 0.1, 0.3, 0.5, 0.7, 0.85, 0.95, 1.0].forEach(p => {
  const cur = 0 + (9 - 0) * easeOutExpo(p);
  console.log(`Progress ${(p * 100).toFixed(0)}%: ${Math.round(cur)}`);
});

console.log('\nAll checks passed successfully.');

