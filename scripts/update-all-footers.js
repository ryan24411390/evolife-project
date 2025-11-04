const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Find all HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

const updates = [
  {
    // Update disclaimer wrapper with white text
    old: /<div class="footer_legal-disclaimer-wrapper">/g,
    new: '<div class="footer_legal-disclaimer-wrapper" style="color: white; max-width: 100%;">'
  },
  {
    // Update footer_bottom with flexbox and white text
    old: /<div class="footer_bottom">/g,
    new: '<div class="footer_bottom" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">'
  },
  {
    // Update copyright text color
    old: /<div class="text-block-3">©/g,
    new: '<div class="text-block-3" style="color: white;">©'
  },
  {
    // Update footer_bottom-links with flexbox
    old: /<div class="footer_bottom-links">/g,
    new: '<div class="footer_bottom-links" style="display: flex; gap: 1rem; flex-wrap: wrap;">'
  },
  {
    // Update footer links to white (with target blank)
    old: /<a href="([^"]+)"\s+target="_blank"\s+class="footer_link">/g,
    new: '<a href="$1" target="_blank" class="footer_link" style="color: white;">'
  },
  {
    // Update footer links to white (without target blank)
    old: /<a href="([^"]+)"\s+class="footer_link">/g,
    new: '<a href="$1" class="footer_link" style="color: white;">'
  }
];

let filesChanged = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Apply all updates
  updates.forEach(update => {
    content = content.replace(update.old, update.new);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated footer in ${file}`);
    filesChanged++;
  }
});

console.log(`\n✨ Updated footers in ${filesChanged} files`);
