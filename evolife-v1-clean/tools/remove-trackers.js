#!/usr/bin/env node

/**
 * EVOLIFE V1 - Tracker Removal & Cleaning Script
 * Removes all tracking code and privacy-invasive scripts
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const ORIGINAL_DIR = path.join(BASE_DIR, 'original');
const CLEAN_DIR = path.join(BASE_DIR, 'clean');

// Statistics
const stats = {
  filesProcessed: 0,
  trackersRemoved: 0,
  scriptsRemoved: 0,
  attributesRemoved: 0
};

// Tracking patterns to remove
const TRACKING_PATTERNS = {
  // Script sources
  scriptSources: [
    /google-analytics\.com/gi,
    /googletagmanager\.com/gi,
    /gtag\.js/gi,
    /analytics\.js/gi,
    /ga\.js/gi,
    /facebook\.net.*fbevents/gi,
    /connect\.facebook\.net/gi,
    /hotjar\.com/gi,
    /segment\.(com|io)/gi,
    /mixpanel\.com/gi,
    /amplitude\.com/gi,
    /pixel\.allsourcedata\.io/gi,
    /tbbthl8trk\.com/gi,
    /trkn\.us/gi,
    /cookie-consent-cdn-prod\.pages\.dev/gi,
    /trustpilot\.com.*widget/gi,
    /elfsight\.com/gi,
    /monto\.io/gi,
    /quora\.com.*pixel/gi,
    /legitscript\.com.*seals/gi
  ],

  // Inline function calls
  inlineCalls: [
    /gtag\s*\([^)]*\)/gi,
    /fbq\s*\([^)]*\)/gi,
    /ga\s*\([^)]*\)/gi,
    /_gaq\s*\.[^;]+;/gi,
    /dataLayer\.push/gi
  ],

  // Tracking attributes
  attributes: [
    /data-gtm[^=]*="[^"]*"/gi,
    /data-ga[^=]*="[^"]*"/gi,
    /data-fb[^=]*="[^"]*"/gi,
    /data-track[^=]*="[^"]*"/gi,
    /data-analytics[^=]*="[^"]*"/gi
  ],

  // Noscript tracking
  noscriptTracking: [
    /<noscript>[\s\S]*?(google|facebook|gtm|analytics)[\s\S]*?<\/noscript>/gi
  ],

  // Preconnect to tracking domains
  preconnect: [
    /<link[^>]*rel=["'](?:preconnect|dns-prefetch)["'][^>]*(?:google-analytics|googletagmanager|facebook)[\s\S]*?>/gi,
    /<link[^>]*(?:google-analytics|googletagmanager|facebook)[^>]*rel=["'](?:preconnect|dns-prefetch)["'][\s\S]*?>/gi
  ]
};

/**
 * Clean HTML file
 */
function cleanHTML(content) {
  let cleaned = content;
  let removals = 0;

  // Remove tracking script tags
  TRACKING_PATTERNS.scriptSources.forEach(pattern => {
    const matches = cleaned.match(new RegExp(`<script[^>]*${pattern.source}[^>]*>.*?<\/script>`, 'gi'));
    if (matches) {
      matches.forEach(match => {
        cleaned = cleaned.replace(match, '<!-- Tracking script removed -->');
        removals++;
      });
    }
  });

  // Remove external tracking scripts
  cleaned = cleaned.replace(/<script[^>]+src=["'][^"']*(?:gtag|analytics|facebook|pixel|track|hotjar|segment|amplitude|monto|trustpilot|elfsight)[^"']*["'][^>]*><\/script>/gi, (match) => {
    removals++;
    return '<!-- External tracking script removed -->';
  });

  // Remove inline tracking code
  TRACKING_PATTERNS.inlineCalls.forEach(pattern => {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, '/* tracking call removed */');
    if (before !== cleaned) removals++;
  });

  // Remove tracking attributes
  TRACKING_PATTERNS.attributes.forEach(pattern => {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, '');
    if (before !== cleaned) removals++;
  });

  // Remove noscript tracking
  TRACKING_PATTERNS.noscriptTracking.forEach(pattern => {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, '<!-- Noscript tracking removed -->');
    if (before !== cleaned) removals++;
  });

  // Remove preconnect to tracking domains
  TRACKING_PATTERNS.preconnect.forEach(pattern => {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, '<!-- Tracking preconnect removed -->');
    if (before !== cleaned) removals++;
  });

  // Add privacy meta tags if not present
  if (!cleaned.includes('meta name="referrer"')) {
    cleaned = cleaned.replace(/<head[^>]*>/i, (match) => {
      return match + '\n    <meta name="referrer" content="no-referrer">\n    <meta name="robots" content="noindex, nofollow">';
    });
  }

  // Remove tracking img pixels
  cleaned = cleaned.replace(/<img[^>]*(?:trkn\.us|pixel|tracking|analytics)[^>]*>/gi, (match) => {
    removals++;
    return '<!-- Tracking pixel removed -->';
  });

  stats.trackersRemoved += removals;
  return cleaned;
}

/**
 * Clean JavaScript file
 */
function cleanJS(content) {
  let cleaned = content;
  let removals = 0;

  // Remove tracking function calls
  TRACKING_PATTERNS.inlineCalls.forEach(pattern => {
    const before = cleaned;
    cleaned = cleaned.replace(pattern, '/* tracking call removed */');
    if (before !== cleaned) removals++;
  });

  // Create dummy tracking functions to prevent errors
  const dummyFunctions = `
// Dummy tracking functions to prevent errors
if (typeof gtag === 'undefined') { window.gtag = function(){}; }
if (typeof fbq === 'undefined') { window.fbq = function(){}; }
if (typeof ga === 'undefined') { window.ga = function(){}; }
if (typeof dataLayer === 'undefined') { window.dataLayer = []; }
`.trim();

  // Add dummy functions at the beginning if tracking calls were found
  if (removals > 0 && !cleaned.includes('Dummy tracking functions')) {
    cleaned = dummyFunctions + '\n\n' + cleaned;
  }

  stats.trackersRemoved += removals;
  return cleaned;
}

/**
 * Process all files in directory
 */
function processDirectory(dir, processor, extension) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath, processor, extension);
    } else if (file.endsWith(extension)) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        const cleaned = processor(content);

        // Save to clean directory maintaining structure
        const relativePath = path.relative(ORIGINAL_DIR, filePath);
        const cleanPath = path.join(CLEAN_DIR, relativePath);
        const cleanDir = path.dirname(cleanPath);

        if (!fs.existsSync(cleanDir)) {
          fs.mkdirSync(cleanDir, { recursive: true });
        }

        fs.writeFileSync(cleanPath, cleaned, 'utf-8');
        stats.filesProcessed++;
        console.log(`✓ Cleaned: ${relativePath}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧹 EVOLIFE V1 - Tracker Removal & Cleaning');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Create clean directory if it doesn't exist
  if (!fs.existsSync(CLEAN_DIR)) {
    fs.mkdirSync(CLEAN_DIR, { recursive: true });
  }

  // Process HTML files
  console.log('📄 Processing HTML files...');
  processDirectory(ORIGINAL_DIR, cleanHTML, '.html');
  processDirectory(ORIGINAL_DIR, cleanHTML, ''); // Files without extension

  // Process JavaScript files (assets/js)
  console.log('\n📜 Processing JavaScript files...');
  const jsDir = path.join(BASE_DIR, 'assets', 'js');
  if (fs.existsSync(jsDir)) {
    const cleanJsDir = path.join(CLEAN_DIR, 'assets', 'js');
    if (!fs.existsSync(cleanJsDir)) {
      fs.mkdirSync(cleanJsDir, { recursive: true });
    }
    processDirectory(jsDir, cleanJS, '.js');
  }

  // Copy CSS and other assets as-is (they don't usually have tracking)
  console.log('\n📦 Copying CSS files...');
  const cssDir = path.join(BASE_DIR, 'assets', 'css');
  if (fs.existsSync(cssDir)) {
    const cleanCssDir = path.join(CLEAN_DIR, 'assets', 'css');
    if (!fs.existsSync(cleanCssDir)) {
      fs.mkdirSync(cleanCssDir, { recursive: true });
    }
    const cssFiles = fs.readdirSync(cssDir);
    cssFiles.forEach(file => {
      fs.copyFileSync(path.join(cssDir, file), path.join(cleanCssDir, file));
      console.log(`✓ Copied: assets/css/${file}`);
    });
  }

  // Copy images
  console.log('\n🖼️  Copying image files...');
  const imgDir = path.join(BASE_DIR, 'assets', 'images');
  if (fs.existsSync(imgDir)) {
    const cleanImgDir = path.join(CLEAN_DIR, 'assets', 'images');
    if (!fs.existsSync(cleanImgDir)) {
      fs.mkdirSync(cleanImgDir, { recursive: true });
    }
    const imgFiles = fs.readdirSync(imgDir);
    imgFiles.forEach(file => {
      fs.copyFileSync(path.join(imgDir, file), path.join(cleanImgDir, file));
    });
    console.log(`✓ Copied ${imgFiles.length} images`);
  }

  // Copy fonts
  console.log('\n🔤 Copying font files...');
  const fontDir = path.join(BASE_DIR, 'assets', 'fonts');
  if (fs.existsSync(fontDir)) {
    const cleanFontDir = path.join(CLEAN_DIR, 'assets', 'fonts');
    if (!fs.existsSync(cleanFontDir)) {
      fs.mkdirSync(cleanFontDir, { recursive: true });
    }
    const fontFiles = fs.readdirSync(fontDir);
    fontFiles.forEach(file => {
      fs.copyFileSync(path.join(fontDir, file), path.join(cleanFontDir, file));
    });
    console.log(`✓ Copied ${fontFiles.length} fonts`);
  }

  // Copy other assets
  console.log('\n📎 Copying other assets...');
  const otherDir = path.join(BASE_DIR, 'assets', 'other');
  if (fs.existsSync(otherDir)) {
    const cleanOtherDir = path.join(CLEAN_DIR, 'assets', 'other');
    if (!fs.existsSync(cleanOtherDir)) {
      fs.mkdirSync(cleanOtherDir, { recursive: true });
    }
    const otherFiles = fs.readdirSync(otherDir);
    otherFiles.forEach(file => {
      fs.copyFileSync(path.join(otherDir, file), path.join(cleanOtherDir, file));
    });
    console.log(`✓ Copied ${otherFiles.length} other files`);
  }

  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ CLEANING COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 Files processed: ${stats.filesProcessed}`);
  console.log(`🗑️  Trackers removed: ${stats.trackersRemoved}`);
  console.log(`📁 Clean files saved to: ${CLEAN_DIR}`);
  console.log('═══════════════════════════════════════════════════════════');
}

// Run
main();
