const fs = require('fs');
const path = require('path');

console.log('🔄 Applying navbar and footer from index.html to semaglutide-new.html...\n');

// Read the extracted components
const navbarHTML = fs.readFileSync(path.join(__dirname, 'navbar-extracted.html'), 'utf-8');
const footerHTML = fs.readFileSync(path.join(__dirname, 'footer-extracted.html'), 'utf-8');

// Read semaglutide-new.html
const semaglutidePath = path.join(__dirname, '..', 'semaglutide-new.html');
let semaglutideHTML = fs.readFileSync(semaglutidePath, 'utf-8');

// Backup the current file
const backupPath = semaglutidePath + '.backup-' + Date.now();
fs.writeFileSync(backupPath, semaglutideHTML);
console.log('✅ Backup created:', path.basename(backupPath));

// Find where to replace
const bodyStart = semaglutideHTML.indexOf('<body>');
const navEnd = semaglutideHTML.indexOf('<!-- SECTION 1: HERO -->');

const footerStart = semaglutideHTML.indexOf('<!-- FOOTER (Use existing footer) -->');
const bodyEnd = semaglutideHTML.indexOf('</body>');

// Replace navbar (from <body> to hero section)
const beforeBody = semaglutideHTML.substring(0, bodyStart);
const heroToFooter = semaglutideHTML.substring(navEnd, footerStart);
const afterBody = semaglutideHTML.substring(bodyEnd);

// Build new HTML
const newHTML = beforeBody +
                navbarHTML +
                '\n\n' + heroToFooter +
                '\n' + footerHTML +
                '\n' + afterBody;

// Write the new file
fs.writeFileSync(semaglutidePath, newHTML);

console.log('✅ Navbar replaced (', navbarHTML.length, 'chars)');
console.log('✅ Footer replaced (', footerHTML.length, 'chars)');
console.log('\n✅ Done! semaglutide-new.html updated with index.html navbar and footer');
console.log('\n🎨 Color scheme also changed to GREEN (already applied in design-system/css/01-variables.css)');
