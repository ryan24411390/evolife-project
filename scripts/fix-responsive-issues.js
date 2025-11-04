/**
 * Fix Responsive Issues Script
 * Analyzes and reports responsive design issues across all HTML pages
 */

const fs = require('fs');
const path = require('path');

const PAGES_TO_CHECK = [
  'index.html',
  'peptides.html',
  'mens-health.html',
  'recovery.html',
  'weight-management.html',
  'pricing.html',
  'contact-us.html',
  // Product pages
  'sermorelin.html',
  'mots-c.html',
  'tesamorelin.html',
  'epithalon.html',
  'ghk-cu.html',
  'cjc-1295-ipamorelin.html',
  'epithalon-ghk-cu.html',
  'tesamorelin-ipamorelin.html',
  'aod-9604-mots-c.html',
  'aod-9604-mots-c-tesamorelin.html',
  'semax-selank.html',
  'aod-9604.html'
];

const issues = [];

function analyzeFile(filename) {
  const filepath = path.join(__dirname, '..', filename);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Skipping ${filename} (not found)`);
    return;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const fileIssues = [];

  // Check 1: Viewport meta tag
  if (!content.includes('name="viewport"')) {
    fileIssues.push({
      type: 'CRITICAL',
      issue: 'Missing viewport meta tag',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    });
  }

  // Check 2: Fixed widths without max-width
  const fixedWidthRegex = /width:\s*\d{4,}px(?!\s*;?\s*max-width)/gi;
  const fixedWidthMatches = content.match(fixedWidthRegex);
  if (fixedWidthMatches) {
    fileIssues.push({
      type: 'HIGH',
      issue: `Found ${fixedWidthMatches.length} large fixed widths without max-width`,
      examples: fixedWidthMatches.slice(0, 3)
    });
  }

  // Check 3: Images without max-width
  const imgNoMaxWidth = /<img[^>]*(?!max-width)style="[^"]*width:\s*\d{3,}px/gi;
  const imgMatches = content.match(imgNoMaxWidth);
  if (imgMatches) {
    fileIssues.push({
      type: 'MEDIUM',
      issue: `Found ${imgMatches.length} images with fixed width but no max-width`,
      fix: 'Add max-width: 100%; height: auto; to images'
    });
  }

  // Check 4: Tables without responsive wrapper
  const tables = content.match(/<table(?![^>]*class="[^"]*table-responsive)/gi);
  if (tables && tables.length > 0) {
    fileIssues.push({
      type: 'MEDIUM',
      issue: `Found ${tables.length} tables without responsive wrapper`,
      fix: 'Wrap tables in div with overflow-x: auto'
    });
  }

  // Check 5: Large horizontal padding on mobile (common issue)
  const largePaddingMobile = /padding(?:-left|-right)?:\s*(?:[5-9]\d|[1-9]\d{2,})px(?![^@]*@media.*max-width)/gi;
  const paddingMatches = content.match(largePaddingMobile);
  if (paddingMatches && paddingMatches.length > 5) {
    fileIssues.push({
      type: 'LOW',
      issue: `Found ${paddingMatches.length} instances of large padding without mobile media query`,
      fix: 'Add mobile breakpoint to reduce padding on small screens'
    });
  }

  // Check 6: Missing mobile media queries
  const mediaQueries = content.match(/@media[^{]*max-width:\s*(?:767|768)px/gi);
  if (!mediaQueries || mediaQueries.length === 0) {
    fileIssues.push({
      type: 'HIGH',
      issue: 'No mobile media queries found',
      fix: 'Add responsive breakpoints for mobile devices'
    });
  }

  // Check 7: Container without max-width
  const containerNoMax = /\.container\s*{[^}]*(?!max-width)/gi;
  if (containerNoMax.test(content)) {
    fileIssues.push({
      type: 'LOW',
      issue: 'Container might not have max-width constraint',
      fix: 'Ensure containers have max-width for large screens'
    });
  }

  if (fileIssues.length > 0) {
    issues.push({
      file: filename,
      issues: fileIssues
    });
  }

  return fileIssues.length === 0;
}

console.log('🔍 Analyzing responsive design across all pages...\n');

let allGood = true;
PAGES_TO_CHECK.forEach(file => {
  const isGood = analyzeFile(file);
  if (isGood) {
    console.log(`✅ ${file} - No responsive issues detected`);
  } else {
    console.log(`❌ ${file} - Issues found`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(60));
console.log('RESPONSIVE DESIGN AUDIT REPORT');
console.log('='.repeat(60) + '\n');

if (allGood) {
  console.log('✨ All pages passed responsive design checks!\n');
} else {
  console.log(`Found issues in ${issues.length} pages:\n`);

  issues.forEach(({ file, issues: fileIssues }) => {
    console.log(`\n📄 ${file}`);
    console.log('-'.repeat(60));

    fileIssues.forEach((issue, idx) => {
      console.log(`\n  ${idx + 1}. [${issue.type}] ${issue.issue}`);
      if (issue.examples) {
        console.log(`     Examples: ${issue.examples.join(', ')}`);
      }
      if (issue.fix) {
        console.log(`     Fix: ${issue.fix}`);
      }
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log('PRIORITY FIXES:');
  console.log('='.repeat(60) + '\n');

  const criticalIssues = issues.flatMap(f => f.issues.filter(i => i.type === 'CRITICAL'));
  const highIssues = issues.flatMap(f => f.issues.filter(i => i.type === 'HIGH'));

  if (criticalIssues.length > 0) {
    console.log(`🔴 CRITICAL: ${criticalIssues.length} issues requiring immediate attention`);
  }
  if (highIssues.length > 0) {
    console.log(`🟡 HIGH: ${highIssues.length} issues that should be fixed soon`);
  }
}

console.log('\n');
