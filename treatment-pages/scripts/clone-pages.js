#!/usr/bin/env node

/**
 * Phase 1: Clone Treatment Pages from joinfridays.com
 *
 * This script uses Playwright to:
 * 1. Clone 3 specific pages (longevity, microdosing, testosterone)
 * 2. Download all assets (CSS, JS, images, fonts)
 * 3. Create asset manifests
 * 4. Save everything organized
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const TARGET_PAGES = [
  {
    name: 'longevity',
    url: 'https://www.joinfridays.com/longevity',
  },
  {
    name: 'microdosing',
    url: 'https://www.joinfridays.com/microdosing',
  },
  {
    name: 'testosterone',
    url: 'https://www.joinfridays.com/testosterone',
  },
];

const BASE_DIR = path.join(__dirname, '..');
const RAW_DIR = path.join(BASE_DIR, 'raw');
const ASSETS_DIR = path.join(BASE_DIR, 'assets');

// Utility: Download file from URL
async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${url} (Status: ${response.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', reject);
  });
}

// Utility: Create manifest
function createManifest(pageName, assets) {
  const manifestPath = path.join(RAW_DIR, pageName, 'manifest.json');
  const manifest = {
    page: pageName,
    clonedAt: new Date().toISOString(),
    assets: assets,
    summary: {
      css: assets.filter(a => a.type === 'css').length,
      js: assets.filter(a => a.type === 'js').length,
      images: assets.filter(a => a.type === 'image').length,
      fonts: assets.filter(a => a.type === 'font').length,
      other: assets.filter(a => a.type === 'other').length,
    }
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`   ✅ Manifest created: ${manifestPath}`);
}

// Main cloning function
async function clonePage(page, pageConfig) {
  const { name, url } = pageConfig;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 CLONING: ${name.toUpperCase()}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`${'='.repeat(60)}`);

  // Navigate and wait for page to load
  console.log(`   🌐 Navigating to page...`);
  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait additional time for dynamic content
  console.log(`   ⏳ Waiting for dynamic content (5 seconds)...`);
  await page.waitForTimeout(5000);

  // Get the complete HTML
  console.log(`   📝 Extracting HTML...`);
  const html = await page.content();

  // Save HTML
  const htmlPath = path.join(RAW_DIR, name, 'index.html');
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html);
  console.log(`   ✅ HTML saved: ${htmlPath}`);
  console.log(`   📊 HTML size: ${(html.length / 1024).toFixed(2)} KB`);

  // Collect all assets
  console.log(`\n   🎯 Collecting assets...`);
  const assets = [];

  // Extract CSS files
  console.log(`   📦 Finding CSS files...`);
  const cssLinks = await page.$$eval('link[rel="stylesheet"]', links =>
    links.map(link => link.href).filter(href => href)
  );

  for (const cssUrl of cssLinks) {
    try {
      const cssFilename = path.basename(new URL(cssUrl).pathname) || 'style.css';
      const cssPath = path.join(ASSETS_DIR, 'css', name, cssFilename);
      await downloadFile(cssUrl, cssPath);
      assets.push({ type: 'css', url: cssUrl, localPath: cssPath });
      console.log(`      ✓ CSS: ${cssFilename}`);
    } catch (err) {
      console.log(`      ✗ Failed CSS: ${cssUrl.substring(0, 50)}... (${err.message})`);
    }
  }

  // Extract JavaScript files
  console.log(`   📦 Finding JS files...`);
  const jsScripts = await page.$$eval('script[src]', scripts =>
    scripts.map(script => script.src).filter(src => src)
  );

  for (const jsUrl of jsScripts) {
    try {
      const jsFilename = path.basename(new URL(jsUrl).pathname) || 'script.js';
      const jsPath = path.join(ASSETS_DIR, 'js', name, jsFilename);
      await downloadFile(jsUrl, jsPath);
      assets.push({ type: 'js', url: jsUrl, localPath: jsPath });
      console.log(`      ✓ JS: ${jsFilename}`);
    } catch (err) {
      console.log(`      ✗ Failed JS: ${jsUrl.substring(0, 50)}... (${err.message})`);
    }
  }

  // Extract images
  console.log(`   📦 Finding images...`);
  const images = await page.$$eval('img[src], img[srcset]', imgs =>
    imgs.map(img => {
      const urls = [];
      if (img.src) urls.push(img.src);
      if (img.srcset) {
        img.srcset.split(',').forEach(srcset => {
          const url = srcset.trim().split(' ')[0];
          if (url) urls.push(url);
        });
      }
      return urls;
    }).flat().filter(url => url && !url.startsWith('data:'))
  );

  const uniqueImages = [...new Set(images)];
  for (const imgUrl of uniqueImages) {
    try {
      const imgFilename = path.basename(new URL(imgUrl).pathname) || 'image.jpg';
      const imgPath = path.join(ASSETS_DIR, 'images', name, imgFilename);
      await downloadFile(imgUrl, imgPath);
      assets.push({ type: 'image', url: imgUrl, localPath: imgPath });
      console.log(`      ✓ Image: ${imgFilename}`);
    } catch (err) {
      console.log(`      ✗ Failed Image: ${imgUrl.substring(0, 50)}... (${err.message})`);
    }
  }

  // Extract background images from CSS
  console.log(`   📦 Finding background images in CSS...`);
  const bgImages = await page.evaluate(() => {
    const urls = new Set();
    const sheets = Array.from(document.styleSheets);

    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.style && rule.style.backgroundImage) {
            const match = rule.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
              urls.add(match[1].startsWith('http') ? match[1] : new URL(match[1], window.location.href).href);
            }
          }
        });
      } catch (e) {
        // Skip cross-origin stylesheets
      }
    });

    return Array.from(urls);
  });

  for (const bgUrl of bgImages) {
    try {
      const bgFilename = path.basename(new URL(bgUrl).pathname) || 'bg-image.jpg';
      const bgPath = path.join(ASSETS_DIR, 'images', name, bgFilename);
      await downloadFile(bgUrl, bgPath);
      assets.push({ type: 'image', url: bgUrl, localPath: bgPath });
      console.log(`      ✓ BG Image: ${bgFilename}`);
    } catch (err) {
      console.log(`      ✗ Failed BG: ${bgUrl.substring(0, 50)}... (${err.message})`);
    }
  }

  // Extract fonts (from CSS @font-face rules)
  console.log(`   📦 Finding fonts...`);
  const fonts = await page.evaluate(() => {
    const urls = new Set();
    const sheets = Array.from(document.styleSheets);

    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.type === 5) { // CSSFontFaceRule
            const src = rule.style.getPropertyValue('src');
            const matches = src.match(/url\(['"]?([^'"]+)['"]?\)/g);
            if (matches) {
              matches.forEach(match => {
                const url = match.match(/url\(['"]?([^'"]+)['"]?\)/)[1];
                urls.add(url.startsWith('http') ? url : new URL(url, window.location.href).href);
              });
            }
          }
        });
      } catch (e) {
        // Skip cross-origin stylesheets
      }
    });

    return Array.from(urls);
  });

  for (const fontUrl of fonts) {
    try {
      const fontFilename = path.basename(new URL(fontUrl).pathname) || 'font.woff2';
      const fontPath = path.join(ASSETS_DIR, 'fonts', name, fontFilename);
      await downloadFile(fontUrl, fontPath);
      assets.push({ type: 'font', url: fontUrl, localPath: fontPath });
      console.log(`      ✓ Font: ${fontFilename}`);
    } catch (err) {
      console.log(`      ✗ Failed Font: ${fontUrl.substring(0, 50)}... (${err.message})`);
    }
  }

  // Create manifest
  console.log(`\n   📋 Creating manifest...`);
  createManifest(name, assets);

  // Summary
  console.log(`\n   ✅ CLONE COMPLETE: ${name.toUpperCase()}`);
  console.log(`   📊 Summary:`);
  console.log(`      - HTML: 1 file (${(html.length / 1024).toFixed(2)} KB)`);
  console.log(`      - CSS: ${assets.filter(a => a.type === 'css').length} files`);
  console.log(`      - JS: ${assets.filter(a => a.type === 'js').length} files`);
  console.log(`      - Images: ${assets.filter(a => a.type === 'image').length} files`);
  console.log(`      - Fonts: ${assets.filter(a => a.type === 'font').length} files`);
  console.log(`      - Total Assets: ${assets.length}`);

  return { name, assets, htmlSize: html.length };
}

// Main execution
(async () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   PHASE 1: CLONE TREATMENT PAGES FROM JOINFRIDAYS.COM     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const results = [];

  // Clone each page
  for (const pageConfig of TARGET_PAGES) {
    try {
      const result = await clonePage(page, pageConfig);
      results.push(result);
    } catch (err) {
      console.error(`\n   ❌ ERROR cloning ${pageConfig.name}: ${err.message}`);
      results.push({ name: pageConfig.name, error: err.message });
    }
  }

  await browser.close();

  // Final summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    CLONING COMPLETE                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('📊 FINAL SUMMARY:\n');

  results.forEach(result => {
    if (result.error) {
      console.log(`   ❌ ${result.name.toUpperCase()}: FAILED (${result.error})`);
    } else {
      console.log(`   ✅ ${result.name.toUpperCase()}: ${result.assets.length} assets downloaded`);
    }
  });

  console.log('\n');
  console.log('📁 Files saved to:');
  console.log(`   - Raw HTML: treatment-pages/raw/[page]/index.html`);
  console.log(`   - Assets: treatment-pages/assets/[type]/[page]/`);
  console.log(`   - Manifests: treatment-pages/raw/[page]/manifest.json`);
  console.log('\n');
  console.log('✅ Phase 1 Complete! Ready for Phase 2: Analysis\n');
})();
