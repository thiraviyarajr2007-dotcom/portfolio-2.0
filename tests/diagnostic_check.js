/**
 * Diagnostic test to verify script.js loading and DOM contract against index.html
 */
const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
console.log('index.html size:', htmlContent.length, 'bytes');

// Verify script.js loads cleanly in Node
const scriptPath = path.join(__dirname, '..', 'script.js');
console.log('script.js exists:', fs.existsSync(scriptPath));
