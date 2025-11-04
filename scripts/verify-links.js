const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Find all HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

let stats = {
  totalLinks: 0,
  internalLinks: 0,
  externalLinks: 0,
  anchorLinks: 0,
  brokenInternal: [],
  emptyHrefs: [],
  javascriptLinks: []
};

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Find all href attributes
  const hrefPattern = /<a[^>]+href=["']([^"']*)["'][^>]*>/gi;
  let match;

  while ((match = hrefPattern.exec(content)) !== null) {
    const href = match[1];
    stats.totalLinks++;

    // Empty or just hash
    if (!href || href === '#') {
      stats.emptyHrefs.push({ file, href: href || '(empty)' });
      continue;
    }

    // JavaScript links
    if (href.startsWith('javascript:')) {
      stats.javascriptLinks.push({ file, href });
      continue;
    }

    // Anchor links
    if (href.startsWith('#')) {
      stats.anchorLinks++;
      continue;
    }

    // External links
    if (href.startsWith('http://') || href.startsWith('https://') ||
        href.startsWith('mailto:') || href.startsWith('tel:')) {
      stats.externalLinks++;
      continue;
    }

    // Internal links
    stats.internalLinks++;
    const targetPath = path.join(rootDir, href);
    if (!fs.existsSync(targetPath)) {
      stats.brokenInternal.push({ file, href });
    }
  }
});

// Report
console.log('📊 Link Verification Report\n');
console.log(`Total Links: ${stats.totalLinks}`);
console.log(`  Internal: ${stats.internalLinks}`);
console.log(`  External: ${stats.externalLinks}`);
console.log(`  Anchors: ${stats.anchorLinks}`);
console.log(`  Empty/Hash: ${stats.emptyHrefs.length}`);
console.log(`  JavaScript: ${stats.javascriptLinks.length}\n`);

if (stats.brokenInternal.length > 0) {
  console.log('⚠️  Broken Internal Links:');
  stats.brokenInternal.forEach(({ file, href }) => {
    console.log(`  ${file}: ${href}`);
  });
  console.log();
}

if (stats.emptyHrefs.length > 0) {
  console.log('ℹ️  Empty/Hash Links (first 10):');
  stats.emptyHrefs.slice(0, 10).forEach(({ file, href }) => {
    console.log(`  ${file}: ${href}`);
  });
  if (stats.emptyHrefs.length > 10) {
    console.log(`  ... and ${stats.emptyHrefs.length - 10} more`);
  }
  console.log();
}

if (stats.javascriptLinks.length > 0) {
  console.log('ℹ️  JavaScript Links (first 10):');
  stats.javascriptLinks.slice(0, 10).forEach(({ file, href }) => {
    console.log(`  ${file}: ${href}`);
  });
  if (stats.javascriptLinks.length > 10) {
    console.log(`  ... and ${stats.javascriptLinks.length - 10} more`);
  }
  console.log();
}

if (stats.brokenInternal.length === 0) {
  console.log('✅ All internal links are valid!');
} else {
  console.log(`❌ Found ${stats.brokenInternal.length} broken internal links`);
}
