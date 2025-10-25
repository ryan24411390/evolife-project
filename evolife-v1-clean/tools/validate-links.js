const fs = require('fs');
const path = require('path');

const cleanDir = path.join(__dirname, '..', 'clean');
const htmlFiles = fs.readdirSync(cleanDir).filter(file => file.endsWith('.html'));

console.log(`🔍 Validating links in ${htmlFiles.length} HTML files...\n`);

let totalLinks = 0;
let internalLinks = 0;
let externalLinks = 0;
let anchorLinks = 0;
let brokenLinks = 0;

const existingFiles = new Set(htmlFiles);

htmlFiles.forEach(file => {
  const filePath = path.join(cleanDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Find all href attributes
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;

  while ((match = hrefRegex.exec(content)) !== null) {
    const link = match[1];
    totalLinks++;

    // Skip external links
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('//')) {
      externalLinks++;
      continue;
    }

    // Skip anchor links
    if (link.startsWith('#')) {
      anchorLinks++;
      continue;
    }

    // Skip mailto and tel links
    if (link.startsWith('mailto:') || link.startsWith('tel:')) {
      continue;
    }

    // Skip query parameter links (pagination, etc.)
    if (link.startsWith('?')) {
      continue;
    }

    // Skip asset links (CSS, JS, images, fonts)
    if (link.startsWith('assets/')) {
      continue;
    }

    // Check if it's an internal link
    internalLinks++;

    // Check if file exists
    const linkedFile = link.split('#')[0].split('?')[0]; // Remove anchor and query params
    if (linkedFile && !existingFiles.has(linkedFile)) {
      console.log(`⚠️  ${file}: Broken link to "${linkedFile}"`);
      brokenLinks++;
    }
  }
});

console.log('\n📊 Validation Results:');
console.log('═'.repeat(50));
console.log(`Total links found:     ${totalLinks}`);
console.log(`Internal links:        ${internalLinks} ✓`);
console.log(`External links:        ${externalLinks} (skipped)`);
console.log(`Anchor links:          ${anchorLinks} (skipped)`);
console.log(`Broken internal links: ${brokenLinks}`);
console.log('═'.repeat(50));

if (brokenLinks === 0) {
  console.log('\n✅ All internal links are valid!');
  console.log('🌐 Website is ready for offline use!');
} else {
  console.log(`\n⚠️  Found ${brokenLinks} broken link(s) that need attention.`);
}

// List all HTML files
console.log('\n📁 Available HTML files:');
htmlFiles.sort().forEach(file => {
  console.log(`   • ${file}`);
});
