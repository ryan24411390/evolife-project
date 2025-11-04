const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Find all HTML files
const htmlFiles = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

let totalRemoved = 0;
let filesChanged = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  let fileChanges = 0;

  // Remove console.log statements (various patterns)
  const consolePatterns = [
    /console\.log\([^)]*\);?/g,
    /console\.warn\([^)]*\);?/g,
    /console\.error\([^)]*\);?/g,
    /console\.debug\([^)]*\);?/g,
    /console\.info\([^)]*\);?/g,
  ];

  consolePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(pattern, '');
    }
  });

  // Remove debugger statements
  const debuggerMatches = content.match(/debugger;?/g);
  if (debuggerMatches) {
    fileChanges += debuggerMatches.length;
    content = content.replace(/debugger;?/g, '');
  }

  // Remove alert statements (but be careful - might be legitimate)
  const alertMatches = content.match(/alert\s*\([^)]*\);?/g);
  if (alertMatches) {
    // Only remove if it looks like debug code (contains "test", "debug", etc.)
    alertMatches.forEach(match => {
      if (/test|debug|temp/i.test(match)) {
        content = content.replace(match, '');
        fileChanges++;
      }
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Removed ${fileChanges} debug statements from ${file}`);
    totalRemoved += fileChanges;
    filesChanged++;
  }
});

console.log(`\n✨ Total: Removed ${totalRemoved} debug statements from ${filesChanged} files`);
