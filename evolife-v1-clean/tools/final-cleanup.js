#!/usr/bin/env node

/**
 * Final cleanup - Remove remaining trackers from regenerated files
 */

const fs = require('fs');
const path = require('path');

const CLEAN_DIR = path.join(__dirname, '..', 'clean');

// Remove trackers from index.html files
function cleanIndexFiles() {
  const files = ['index.html', 'index_P2M1Nzgz.html'];

  files.forEach(filename => {
    const filePath = path.join(CLEAN_DIR, filename);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Remove Facebook Pixel script
    content = content.replace(
      /<script type="text\/javascript">!function\(f,b,e,v,n,t,s\)\{if\(f\.fbq\)return;n=f\.fbq=function\(\)\{n\.callMethod\?n\.callMethod\.apply\(n,arguments\):n\.queue\.push\(arguments\)\};if\(!f\._fbq\)f\._fbq=n;n\.push=n;n\.loaded=!0;n\.version='2\.0';n\.agent='plwebflow';n\.queue=\[\];t=b\.createElement\(e\);t\.async=!0;t\.src=v;s=b\.getElementsByTagName\(e\)\[0\];s\.parentNode\.insertBefore\(t,s\)\}\(window,document,'script','https:\/\/connect\.facebook\.net\/en_US\/fbevents\.js'\);\/\* tracking call removed \*\/;\/\* tracking call removed \*\/;\/\* tracking call removed \*\/;<\/script>/g,
      '<!-- Facebook Pixel removed -->'
    );

    // Remove Google Tag Manager
    content = content.replace(
      /<script>\(function\(w,d,s,l,i\)\{w\[l\]=w\[l\]\|\|\[\];w\[l\]\.push\(\{'gtm\.start'[\s\S]*?'https:\/\/www\.googletagmanager\.com\/gtm\.js\?id='\+i\+dl;f\.parentNode\.insertBefore\(j,f\);[\s\S]*?\}\)\(window,document,'script','dataLayer','GTM-[\w]+'\);<\/script>/g,
      '<!-- Google Tag Manager removed -->'
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Cleaned: ${filename}`);
  });
}

// Clean JS file with GTM reference
function cleanJSFiles() {
  const jsFile = path.join(CLEAN_DIR, 'assets/js/66c8a0fb54f84ec4a09643c7%2F68259d2d72419a1d76296be1%2F68b1b9148cba5066fa6a7bd9%2Fboilerplate_script_1756477715772-1.0.0.js');

  if (fs.existsSync(jsFile)) {
    let content = fs.readFileSync(jsFile, 'utf-8');
    content = content.replace(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"'\s]+/g, '/* GTM URL removed */');
    fs.writeFileSync(jsFile, content, 'utf-8');
    console.log(`✓ Cleaned: boilerplate JS file`);
  }
}

console.log('🧹 Final cleanup - removing remaining trackers...\n');
cleanIndexFiles();
cleanJSFiles();
console.log('\n✅ Cleanup complete!');
