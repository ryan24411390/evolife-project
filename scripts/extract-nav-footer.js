const fs = require('fs');
const path = require('path');

// Read index.html
const indexPath = path.join(__dirname, '..', 'index.html');
const indexHTML = fs.readFileSync(indexPath, 'utf-8');

// Extract navbar (from <body> to first <section>)
const navbarStart = indexHTML.indexOf('<body>');
const firstSection = indexHTML.indexOf('<section');
const navbarHTML = indexHTML.substring(navbarStart, firstSection);

// Extract footer (from footer_component to end of footer div)
const footerStart = indexHTML.indexOf('<div class="footer_component">');
const footerSearchStart = footerStart + 100;
const footerEnd = indexHTML.indexOf('</div></div></div>', footerSearchStart) + 18; // Include closing tags
const footerHTML = indexHTML.substring(footerStart, footerEnd);

// Save to temporary files
fs.writeFileSync(path.join(__dirname, 'navbar-extracted.html'), navbarHTML);
fs.writeFileSync(path.join(__dirname, 'footer-extracted.html'), footerHTML);

console.log('✅ Navbar extracted to: scripts/navbar-extracted.html');
console.log('✅ Footer extracted to: scripts/footer-extracted.html');
console.log('\nNavbar length:', navbarHTML.length, 'characters');
console.log('Footer length:', footerHTML.length, 'characters');
