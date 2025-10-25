#!/usr/bin/env node

/**
 * EVOLIFE V1 - Offline Validation Tool
 * Validates that the website is fully offline-capable and tracker-free
 */

const fs = require('fs');
const path = require('path');

const CLEAN_DIR = path.join(__dirname, '..', 'clean');

// Validation results
const results = {
  externalUrls: [],
  trackersFound: [],
  localResourceIssues: [],
  passed: true
};

// Patterns to check
const TRACKER_PATTERNS = [
  'google-analytics.com',
  'googletagmanager.com',
  'gtag(',
  'fbq(',
  'ga(',
  '_gaq',
  'facebook.net',
  'hotjar.com',
  'segment.com',
  'mixpanel.com',
  'amplitude.com',
  'pixel.allsourcedata.io',
  'trkn.us',
  'cookie-consent-cdn'
];

/**
 * Scan file for external URLs
 */
function scanForExternalUrls(content, filename) {
  // Match http/https URLs but exclude localhost
  const urlPattern = /https?:\/\/(?!localhost)([^\s"'<>]+)/gi;
  const matches = content.match(urlPattern) || [];

  // Filter out relative URLs and data URIs
  const externalUrls = matches.filter(url => {
    return !url.startsWith('data:') &&
           !url.includes('localhost') &&
           !url.includes('127.0.0.1');
  });

  if (externalUrls.length > 0) {
    results.externalUrls.push({
      file: filename,
      urls: [...new Set(externalUrls)] // Remove duplicates
    });
  }
}

/**
 * Scan file for tracking code
 */
function scanForTrackers(content, filename) {
  const found = [];

  TRACKER_PATTERNS.forEach(pattern => {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      found.push(pattern);
    }
  });

  if (found.length > 0) {
    results.trackersFound.push({
      file: filename,
      trackers: [...new Set(found)]
    });
  }
}

/**
 * Process directory recursively
 */
function processDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath, baseDir);
    } else if (file.match(/\.(html|js|css)$/i)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(baseDir, filePath);

      scanForExternalUrls(content, relativePath);
      scanForTrackers(content, relativePath);
    }
  });
}

/**
 * Check if main files exist
 */
function checkMainFiles() {
  const requiredFiles = [
    'index.html',
    'assets/js/form-handler.js',
    'assets/css',
    'assets/images'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(CLEAN_DIR, file);
    if (!fs.existsSync(filePath)) {
      results.localResourceIssues.push(`Missing required file/directory: ${file}`);
      results.passed = false;
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 EVOLIFE V1 - OFFLINE VALIDATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (!fs.existsSync(CLEAN_DIR)) {
    console.log('❌ ERROR: Clean directory not found!');
    console.log(`   Expected: ${CLEAN_DIR}`);
    process.exit(1);
  }

  console.log('📂 Scanning clean directory...');
  console.log(`   Path: ${CLEAN_DIR}`);
  console.log('');

  // Check main files
  console.log('1️⃣  Checking required files...');
  checkMainFiles();

  // Scan all files
  console.log('2️⃣  Scanning for external URLs...');
  console.log('3️⃣  Scanning for tracking code...');
  processDirectory(CLEAN_DIR);

  // Display results
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 VALIDATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════');

  // External URLs
  console.log('');
  console.log(`🌐 External URLs: ${results.externalUrls.length > 0 ? results.externalUrls.reduce((sum, item) => sum + item.urls.length, 0) : 0}`);
  if (results.externalUrls.length > 0) {
    results.externalUrls.slice(0, 3).forEach(item => {
      console.log(`   📄 ${item.file}:`);
      item.urls.slice(0, 3).forEach(url => {
        console.log(`      - ${url}`);
      });
      if (item.urls.length > 3) {
        console.log(`      ... and ${item.urls.length - 3} more`);
      }
    });
    if (results.externalUrls.length > 3) {
      console.log(`   ... and ${results.externalUrls.length - 3} more files`);
    }
  } else {
    console.log('   ✓ No external URLs found');
  }

  // Trackers
  console.log('');
  console.log(`🔒 Trackers Found: ${results.trackersFound.length}`);
  if (results.trackersFound.length > 0) {
    results.trackersFound.slice(0, 5).forEach(item => {
      console.log(`   📄 ${item.file}:`);
      item.trackers.forEach(tracker => {
        console.log(`      - ${tracker}`);
      });
    });
    if (results.trackersFound.length > 5) {
      console.log(`   ... and ${results.trackersFound.length - 5} more files`);
    }
    results.passed = false;
  } else {
    console.log('   ✓ No tracking code detected');
  }

  // Local resource issues
  console.log('');
  console.log(`📁 Local Resource Issues: ${results.localResourceIssues.length}`);
  if (results.localResourceIssues.length > 0) {
    results.localResourceIssues.forEach(issue => {
      console.log(`   ⚠️  ${issue}`);
    });
    results.passed = false;
  } else {
    console.log('   ✓ All required files present');
  }

  // Final verdict
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  if (results.passed && results.externalUrls.length === 0 && results.trackersFound.length === 0) {
    console.log('✅ VALIDATION PASSED');
    console.log('');
    console.log('   ✓ 100% Offline-capable');
    console.log('   ✓ 100% Tracker-free');
    console.log('   ✓ Privacy-first');
    console.log('   ✓ Self-contained');
  } else {
    console.log('⚠️  VALIDATION COMPLETED WITH WARNINGS');
    console.log('');
    if (results.externalUrls.length > 0) {
      console.log('   ⚠️  External URLs detected (site may work offline with cached resources)');
    }
    if (results.trackersFound.length > 0) {
      console.log('   ❌ Tracking code detected');
    }
    if (results.localResourceIssues.length > 0) {
      console.log('   ⚠️  Missing required files');
    }
  }
  console.log('═══════════════════════════════════════════════════════════');

  // Save detailed report
  const reportPath = path.join(__dirname, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('');
  console.log(`📄 Detailed report saved: ${reportPath}`);

  process.exit(results.passed ? 0 : 1);
}

// Run
main();
