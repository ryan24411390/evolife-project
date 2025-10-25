#!/usr/bin/env node

/**
 * EVOLIFE V1 - Website Cloner
 * Clones joinfridays.com completely with all assets
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const TARGET_URL = 'https://www.joinfridays.com/';
const BASE_DIR = path.join(__dirname, '..');
const ORIGINAL_DIR = path.join(BASE_DIR, 'original');
const ASSETS_DIR = path.join(BASE_DIR, 'assets');

// Statistics
const stats = {
  pagesDownloaded: 0,
  cssFiles: 0,
  jsFiles: 0,
  images: 0,
  fonts: 0,
  otherFiles: 0,
  totalSize: 0,
  startTime: Date.now()
};

// Track downloaded resources
const downloadedResources = new Map();
const visitedUrls = new Set();
const urlQueue = [];

// Asset manifest
const manifest = {
  pages: [],
  assets: {
    css: [],
    js: [],
    images: [],
    fonts: [],
    other: []
  }
};

/**
 * Download a file from URL
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    protocol.get(url, options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirects
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        stats.totalSize += buffer.length;
        resolve({
          buffer,
          contentType: res.headers['content-type'] || ''
        });
      });
    }).on('error', reject);
  });
}

/**
 * Extract all links from HTML
 */
function extractLinks(html, baseUrl) {
  const links = [];
  const base = new URL(baseUrl);

  // Match href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);

      // Only include same-domain links
      if (url.hostname === base.hostname && !url.pathname.match(/\.(pdf|zip|jpg|jpeg|png|gif|svg|webp|css|js)$/i)) {
        links.push(url.href);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  }

  return [...new Set(links)]; // Remove duplicates
}

/**
 * Extract all assets from HTML
 */
function extractAssets(html, baseUrl) {
  const assets = {
    css: [],
    js: [],
    images: [],
    fonts: [],
    other: []
  };

  // CSS files
  const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
  let match;
  while ((match = cssRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      assets.css.push(url.href);
    } catch (e) {}
  }

  // JavaScript files
  const jsRegex = /<script[^>]+src=["']([^"']+\.js[^"']*)["'][^>]*>/gi;
  while ((match = jsRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      assets.js.push(url.href);
    } catch (e) {}
  }

  // Images
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      assets.images.push(url.href);
    } catch (e) {}
  }

  // Favicon and meta images
  const faviconRegex = /<link[^>]+(?:rel=["'](?:icon|apple-touch-icon|shortcut icon)["'])[^>]+href=["']([^"']+)["'][^>]*>/gi;
  while ((match = faviconRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      assets.other.push(url.href);
    } catch (e) {}
  }

  // Meta images (og:image, twitter:image)
  const metaImgRegex = /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  while ((match = metaImgRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      assets.images.push(url.href);
    } catch (e) {}
  }

  return assets;
}

/**
 * Extract assets from CSS
 */
function extractCssAssets(css, baseUrl) {
  const assets = {
    images: [],
    fonts: []
  };

  // URL references in CSS
  const urlRegex = /url\(['"]?([^'"()]+)['"]?\)/gi;
  let match;

  while ((match = urlRegex.exec(css)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);

      if (url.href.match(/\.(woff2?|ttf|eot|otf)(\?.*)?$/i)) {
        assets.fonts.push(url.href);
      } else if (url.href.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i)) {
        assets.images.push(url.href);
      }
    } catch (e) {}
  }

  // @font-face declarations
  const fontFaceRegex = /@font-face\s*{[^}]*src:\s*url\(['"]?([^'"()]+)['"]?\)[^}]*}/gi;
  while ((match = fontFaceRegex.exec(css)) !== null) {
    try {
      const url = new URL(match[1], baseUrl);
      assets.fonts.push(url.href);
    } catch (e) {}
  }

  return assets;
}

/**
 * Generate safe filename from URL
 */
function getSafeFilename(url) {
  const urlObj = new URL(url);
  let pathname = urlObj.pathname;

  // Remove leading slash
  pathname = pathname.replace(/^\/+/, '');

  // Replace slashes with underscores
  pathname = pathname.replace(/\//g, '_');

  // If empty, use index.html
  if (!pathname || pathname === '') {
    pathname = 'index.html';
  }

  // Add query hash if present
  if (urlObj.search) {
    const hash = Buffer.from(urlObj.search).toString('base64').substring(0, 8);
    const ext = path.extname(pathname);
    const base = pathname.substring(0, pathname.length - ext.length);
    pathname = `${base}_${hash}${ext}`;
  }

  return pathname;
}

/**
 * Save downloaded resource
 */
function saveResource(url, buffer, type) {
  const safeFilename = getSafeFilename(url);
  let targetDir, targetPath;

  switch (type) {
    case 'html':
      targetDir = ORIGINAL_DIR;
      targetPath = path.join(targetDir, safeFilename);
      break;
    case 'css':
      targetDir = path.join(ASSETS_DIR, 'css');
      targetPath = path.join(targetDir, safeFilename);
      stats.cssFiles++;
      break;
    case 'js':
      targetDir = path.join(ASSETS_DIR, 'js');
      targetPath = path.join(targetDir, safeFilename);
      stats.jsFiles++;
      break;
    case 'image':
      targetDir = path.join(ASSETS_DIR, 'images');
      targetPath = path.join(targetDir, safeFilename);
      stats.images++;
      break;
    case 'font':
      targetDir = path.join(ASSETS_DIR, 'fonts');
      targetPath = path.join(targetDir, safeFilename);
      stats.fonts++;
      break;
    default:
      targetDir = path.join(ASSETS_DIR, 'other');
      targetPath = path.join(targetDir, safeFilename);
      stats.otherFiles++;
  }

  fs.writeFileSync(targetPath, buffer);

  // Track in manifest
  const relativePath = path.relative(BASE_DIR, targetPath);
  downloadedResources.set(url, relativePath);

  if (type === 'html') {
    manifest.pages.push({ url, localPath: relativePath });
  } else {
    manifest.assets[type === 'image' ? 'images' : type === 'font' ? 'fonts' : type].push({
      url,
      localPath: relativePath
    });
  }

  return relativePath;
}

/**
 * Download and process a page
 */
async function downloadPage(url) {
  if (visitedUrls.has(url)) {
    return;
  }

  visitedUrls.add(url);
  console.log(`📄 Downloading page: ${url}`);

  try {
    const { buffer } = await downloadFile(url);
    const html = buffer.toString('utf-8');

    // Save HTML
    saveResource(url, buffer, 'html');
    stats.pagesDownloaded++;

    // Extract and queue links
    const links = extractLinks(html, url);
    for (const link of links) {
      if (!visitedUrls.has(link)) {
        urlQueue.push(link);
      }
    }

    // Extract and download assets
    const assets = extractAssets(html, url);

    // Download CSS files
    for (const cssUrl of assets.css) {
      await downloadAsset(cssUrl, 'css');
    }

    // Download JS files
    for (const jsUrl of assets.js) {
      await downloadAsset(jsUrl, 'js');
    }

    // Download images
    for (const imgUrl of assets.images) {
      await downloadAsset(imgUrl, 'image');
    }

    // Download other assets
    for (const otherUrl of assets.other) {
      await downloadAsset(otherUrl, 'other');
    }

  } catch (error) {
    console.error(`❌ Failed to download page ${url}:`, error.message);
  }
}

/**
 * Download an asset
 */
async function downloadAsset(url, type) {
  if (downloadedResources.has(url)) {
    return downloadedResources.get(url);
  }

  try {
    console.log(`  📦 Downloading ${type}: ${url}`);
    const { buffer, contentType } = await downloadFile(url);

    // If CSS, extract nested assets
    if (type === 'css') {
      const css = buffer.toString('utf-8');
      const cssAssets = extractCssAssets(css, url);

      // Download fonts and images from CSS
      for (const fontUrl of cssAssets.fonts) {
        await downloadAsset(fontUrl, 'font');
      }

      for (const imgUrl of cssAssets.images) {
        await downloadAsset(imgUrl, 'image');
      }
    }

    const localPath = saveResource(url, buffer, type);
    return localPath;

  } catch (error) {
    console.error(`  ⚠️  Failed to download ${type} ${url}:`, error.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 EVOLIFE V1 - Website Cloner');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Target: ${TARGET_URL}`);
  console.log(`Output: ${BASE_DIR}`);
  console.log('');

  // Start with homepage
  urlQueue.push(TARGET_URL);

  // Process all pages
  while (urlQueue.length > 0) {
    const url = urlQueue.shift();
    await downloadPage(url);
  }

  // Save manifest
  const manifestPath = path.join(BASE_DIR, 'tools', 'asset-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Calculate execution time
  const executionTime = ((Date.now() - stats.startTime) / 1000).toFixed(2);
  const totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);

  // Print summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ CLONING COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 Statistics:`);
  console.log(`   Pages: ${stats.pagesDownloaded}`);
  console.log(`   CSS files: ${stats.cssFiles}`);
  console.log(`   JS files: ${stats.jsFiles}`);
  console.log(`   Images: ${stats.images}`);
  console.log(`   Fonts: ${stats.fonts}`);
  console.log(`   Other files: ${stats.otherFiles}`);
  console.log(`   Total size: ${totalSizeMB} MB`);
  console.log(`   Execution time: ${executionTime}s`);
  console.log('');
  console.log(`📁 Files saved to: ${ORIGINAL_DIR}`);
  console.log(`📋 Manifest saved to: ${manifestPath}`);
  console.log('═══════════════════════════════════════════════════════════');
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
