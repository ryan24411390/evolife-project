const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Find all HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

const cleanupPatterns = [
  {
    description: 'Tracking script removed comments',
    pattern: /<!--\s*Tracking script removed\s*-->/gi
  },
  {
    description: 'Generic removed comments',
    pattern: /<!--\s*\[?\s*removed\s*\]?\s*-->/gi
  },
  {
    description: 'Empty script tags',
    pattern: /<script[^>]*>\s*<\/script>/g
  },
  {
    description: 'Empty style tags',
    pattern: /<style[^>]*>\s*<\/style>/g
  },
  {
    description: 'Empty div placeholders',
    pattern: /<div[^>]*data-placeholder[^>]*>\s*<\/div>/g
  }
];

let totalRemoved = 0;
let filesChanged = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  cleanupPatterns.forEach(({ description, pattern }) => {
    const matches = content.match(pattern);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(pattern, '');
    }
  });

  // Clean up multiple consecutive blank lines (more than 2)
  content = content.replace(/\n{4,}/g, '\n\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned up ${fileChanges} placeholders in ${file}`);
    totalRemoved += fileChanges;
    filesChanged++;
  }
});

console.log(`\n✨ Total: Removed ${totalRemoved} placeholders from ${filesChanged} files`);
