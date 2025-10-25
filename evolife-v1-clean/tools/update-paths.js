#!/usr/bin/env node

/**
 * Update external CDN paths to local asset paths
 */

const fs = require('fs');
const path = require('path');

const CLEAN_DIR = path.join(__dirname, '..', 'clean');

function updatePaths() {
  console.log('🔧 Updating asset paths to local files...\n');

  const files = fs.readdirSync(CLEAN_DIR);
  let updated = 0;

  files.forEach(file => {
    const filePath = path.join(CLEAN_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        // Update main CSS path
        const oldCssPath = 'https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/css/fridays-2024-da06be12dacaba199501f0724d.shared.8aab12a69.css';
        const newCssPath = 'assets/css/66c8a0fb54f84ec4a09643c7_css_fridays-2024-da06be12dacaba199501f0724d.shared.8aab12a69.css';

        if (content.includes(oldCssPath)) {
          content = content.replace(new RegExp(oldCssPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newCssPath);
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`✓ Updated: ${file}`);
          updated++;
        }
      } catch (error) {
        // Skip binary files
      }
    }
  });

  console.log(`\n✅ Updated ${updated} files\n`);
}

updatePaths();
