#!/usr/bin/env node

/**
 * Phase 3: Remove ALL Trackers from Treatment Pages
 *
 * Removes analytics, tracking pixels, and third-party scripts
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'raw');
const CLEANED_DIR = path.join(__dirname, '..', 'cleaned');

const PAGES = ['longevity', 'microdosing', 'testosterone'];

// Comprehensive list of tracking domains and scripts to remove
const TRACKER_PATTERNS = [
  // Google Analytics & Tag Manager
  /<!-- Google tag.*?-->.*?<script.*?gtag.*?<\/script>/gis,
  /<!-- End Google tag.*?-->/gi,
  /<script.*?googletagmanager\.com.*?<\/script>/gi,
  /<script.*?google-analytics\.com.*?<\/script>/gi,
  /<noscript>.*?googletagmanager.*?<\/noscript>/gi,
  /window\.dataLayer\s*=\s*window\.dataLayer.*?;/gi,
  /function\s+gtag\s*\(.*?\)\s*\{.*?\}/gis,
  /gtag\(['"].*?['"]\)/gi,
  /<script.*?gtm\.js.*?<\/script>/gi,

  // Facebook Pixel
  /<!-- Facebook Pixel.*?-->.*?<script>.*?fbq.*?<\/script>/gis,
  /<!-- End Facebook Pixel.*?-->/gi,
  /<script.*?connect\.facebook\.net.*?<\/script>/gi,
  /<noscript>.*?facebook\.com\/tr.*?<\/noscript>/gi,
  /!function\(f,b,e,v,n,t,s\).*?fbq.*?;/gis,
  /fbq\(['"].*?['"].*?\);?/gi,
  /<img.*?facebook\.com\/tr.*?>/gi,

  // Microsoft Clarity
  /<script.*?clarity\.ms.*?<\/script>/gi,
  /\(function\(c,l,a,r,i,t,y\).*?clarity.*?\}\)/gis,
  /clarity\(['"].*?['"]\)/gi,

  // Segment
  /<script.*?segment.*?<\/script>/gi,
  /<script.*?cdn\.segment\.com.*?<\/script>/gi,
  /analytics\.load\(['"].*?['"]\)/gi,

  // Quora Pixel
  /<!-- Quora Pixel.*?-->.*?<script>.*?qp.*?<\/script>/gis,
  /<!-- End of Quora Pixel.*?-->/gi,
  /<noscript>.*?qpixel\.quora\.com.*?<\/noscript>/gi,
  /!function\(q,e,v,n,t,s\).*?qp.*?\}/gis,
  /qp\(['"].*?['"].*?\);?/gi,

  // Tatari
  /<!-- Start Tatari.*?-->.*?<script>.*?tatari.*?<\/script>/gis,
  /<!-- End Tatari.*?-->/gi,
  /<script.*?tatari.*?<\/script>/gi,
  /tatari\.init\(['"].*?['"]\)/gi,

  // Northbeam
  /<!-- Begin: Northbeam pixel.*?-->.*?<script>.*?Northbeam.*?<\/script>/gis,
  /<!-- End: Northbeam pixel.*?-->/gi,
  /window\.Northbeam.*?;/gis,

  // Everflow
  /<!-- Begin Everflow.*?-->.*?<script.*?EF\..*?<\/script>/gis,
  /<script.*?everflow.*?<\/script>/gi,
  /EF\.configure\(.*?\)/gis,
  /EF\.click\(.*?\)/gis,
  /EF\.conversion\(.*?\)/gis,

  // Hotjar
  /<script.*?hotjar.*?<\/script>/gi,
  /\(function\(h,o,t,j,a,r\).*?hotjar.*?\)\)/gis,

  // Mixpanel
  /<script.*?mixpanel.*?<\/script>/gi,

  // Intercom
  /<script.*?intercom.*?<\/script>/gi,
  /window\.Intercom\s*=.*?;/gi,

  // Heap Analytics
  /<script.*?heap.*?<\/script>/gi,

  // VWO (Visual Website Optimizer)
  /<!-- Start VWO.*?-->.*?<script.*?_vwo.*?<\/script>/gis,
  /<!-- End VWO.*?-->/gi,
  /window\._vwo_code.*?;/gis,

  // Generic tracking pixels
  /<img.*?height=["']1["'].*?width=["']1["'].*?>/gi,
  /<img.*?width=["']1["'].*?height=["']1["'].*?>/gi,
  /<noscript>.*?<img.*?pixel.*?<\/noscript>/gi,

  // Tracking script domains
  /<script.*?segment\.com.*?<\/script>/gi,
  /<script.*?fullstory\.com.*?<\/script>/gi,
  /<script.*?amplitude\.com.*?<\/script>/gi,
  /<script.*?optimizely\.com.*?<\/script>/gi,
  /<script.*?mouseflow\.com.*?<\/script>/gi,
  /<script.*?crazyegg\.com.*?<\/script>/gi,
  /<script.*?lucky orange.*?<\/script>/gi,
  /<script.*?inspectlet.*?<\/script>/gi,

  // Maximize/USBrowserSpeed
  /<script.*?maximiz.*?<\/script>/gi,
  /<script.*?usbrowserspeed.*?<\/script>/gi,
  /script\s*\(function\(s,p,i,c,e\).*?pixelClientId.*?\)/gis,

  // Bidr/Tatari segments
  /<img.*?segment\.prod\.bidr\.io.*?>/gi,
  /<img.*?action\.media6degrees\.com.*?>/gi,
  /<img.*?trkn\.us\/pixel.*?>/gi,

  // Rewardful
  /<!-- START - Rewardful.*?-->.*?<script>.*?rewardful.*?<\/script>/gis,
  /<!-- END - Rewardful.*?-->/gi,
  /<script.*?r\.wdfl\.co\/rw\.js.*?<\/script>/gi,
  /window\._rwq.*?;/gi,
  /window\.rewardful.*?;/gi,

  // Tracking-specific script tags (by src patterns)
  /<script[^>]*src=["'][^"']*(?:analytics|tracking|pixel|tag|segment|gtm|fbevents|clarity|tatari|northbeam|everflow|quora|qevents|maximize|bidr)[^"']*["'][^>]*>.*?<\/script>/gis,
];

// Additional inline tracking code patterns
const INLINE_TRACKER_PATTERNS = [
  // Generic tracking functions
  /\b(?:ga|gtag|fbq|analytics|track|trackEvent|logEvent|pixel|_satellite|dataLayer\.push)\s*\(/gi,

  // Tracking pixel URLs in JS
  /https?:\/\/[^"'\s]*(?:analytics|pixel|track|tag|segment|gtm|fbevents)[^"'\s]*/gi,
];

// List of tracking-related script file names to remove
const TRACKER_SCRIPT_NAMES = [
  'gtm.js',
  'fbevents.js',
  'clarity.js',
  'qevents.js',
  'nb-sp.min.js',
  'pixie.js',
  'destination',
  'scevent.min.js',
  'allsource_pixel.js',
  'ping.min.js',
  'tag.js',
  'tracker-latest.min.js',
  'pixel.js',
  '53184a70-8754-4d12-9d68-1d5372e3f90b', // Tatari scripts
  'KA-N1WZ278TP4.js',
  'mgsensor.js',
  's4ncp4qtxi',
  'main.817db39b.js', // May contain tracking
  'E3D8FD13820E0D.js', // MPIO tracking
  'up_loader.1.1.0.js',
  'spx',
  'ratag',
  'gs',
  'st',
];

function cleanHTML(html, pageName) {
  console.log(`\n   🧹 Cleaning ${pageName} HTML...`);

  let cleanedHTML = html;
  let removedCount = 0;

  // Remove tracker patterns
  TRACKER_PATTERNS.forEach((pattern, index) => {
    const matches = cleanedHTML.match(pattern);
    if (matches) {
      cleanedHTML = cleanedHTML.replace(pattern, '<!-- Tracker removed -->');
      removedCount += matches.length;
      console.log(`      ✓ Removed pattern ${index + 1}: ${matches.length} instance(s)`);
    }
  });

  // Remove script tags that reference tracking files
  TRACKER_SCRIPT_NAMES.forEach(scriptName => {
    const pattern = new RegExp(`<script[^>]*src=["'][^"']*${scriptName.replace(/\./g, '\\.')}[^"']*["'][^>]*>.*?<\/script>`, 'gis');
    const matches = cleanedHTML.match(pattern);
    if (matches) {
      cleanedHTML = cleanedHTML.replace(pattern, '<!-- Tracking script removed -->');
      removedCount += matches.length;
      console.log(`      ✓ Removed tracking script: ${scriptName} (${matches.length} instance(s))`);
    }
  });

  // Clean inline tracking code (be more conservative to avoid breaking functionality)
  // Only remove obvious tracking calls
  cleanedHTML = cleanedHTML.replace(/console\.log\(['"].*?facebook.*?['"]\)/gi, '');
  cleanedHTML = cleanedHTML.replace(/console\.log\(['"].*?track.*?['"]\)/gi, '');

  console.log(`      📊 Total tracking elements removed: ${removedCount}`);

  return cleanedHTML;
}

function processPage(pageName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧼 CLEANING: ${pageName.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);

  // Read original HTML
  const inputPath = path.join(RAW_DIR, pageName, 'index.html');
  const outputPath = path.join(CLEANED_DIR, pageName, 'index.html');

  console.log(`   📖 Reading: ${inputPath}`);
  const html = fs.readFileSync(inputPath, 'utf-8');
  console.log(`   📊 Original size: ${(html.length / 1024).toFixed(2)} KB`);

  // Clean HTML
  const cleanedHTML = cleanHTML(html, pageName);

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Write cleaned HTML
  fs.writeFileSync(outputPath, cleanedHTML, 'utf-8');
  console.log(`   💾 Saved: ${outputPath}`);
  console.log(`   📊 Cleaned size: ${(cleanedHTML.length / 1024).toFixed(2)} KB`);
  console.log(`   💰 Size reduction: ${((html.length - cleanedHTML.length) / 1024).toFixed(2)} KB`);

  // Copy manifest
  const manifestInput = path.join(RAW_DIR, pageName, 'manifest.json');
  const manifestOutput = path.join(CLEANED_DIR, pageName, 'manifest.json');
  fs.copyFileSync(manifestInput, manifestOutput);
  console.log(`   📋 Manifest copied`);

  console.log(`   ✅ CLEANING COMPLETE: ${pageName.toUpperCase()}`);

  return {
    pageName,
    originalSize: html.length,
    cleanedSize: cleanedHTML.length,
    reduction: html.length - cleanedHTML.length
  };
}

// Main execution
(async () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       PHASE 3: REMOVE ALL TRACKERS FROM PAGES             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = [];

  for (const page of PAGES) {
    try {
      const result = processPage(page);
      results.push(result);
    } catch (err) {
      console.error(`\n   ❌ ERROR cleaning ${page}: ${err.message}`);
      results.push({ pageName: page, error: err.message });
    }
  }

  // Final summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                  TRACKER REMOVAL COMPLETE                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('📊 FINAL SUMMARY:\n');

  let totalReduction = 0;
  results.forEach(result => {
    if (result.error) {
      console.log(`   ❌ ${result.pageName.toUpperCase()}: FAILED (${result.error})`);
    } else {
      console.log(`   ✅ ${result.pageName.toUpperCase()}: ${(result.reduction / 1024).toFixed(2)} KB removed`);
      totalReduction += result.reduction;
    }
  });

  console.log(`\n   💾 Total size reduction: ${(totalReduction / 1024).toFixed(2)} KB`);
  console.log('\n');
  console.log('📁 Cleaned files saved to:');
  console.log(`   treatment-pages/cleaned/[page]/index.html`);
  console.log('\n');
  console.log('✅ Phase 3 Complete! All trackers removed. Ready for Phase 4!\n');
})();
