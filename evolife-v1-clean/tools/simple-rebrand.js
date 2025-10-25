const fs = require('fs');
const path = require('path');

// Simple find-replace pairs
const replacements = {
  'Fridays': 'Evolife',
  'FRIDAYS': 'EVOLIFE',
  'fridays': 'evolife',
  "Fridays'": "Evolife's",
  'joinfridays.com': 'joinevolife.com',
  'app.joinfridays.com': 'app.joinevolife.com',
  'joinfridays': 'joinevolife'
};

let totalChanges = 0;
let filesChanged = 0;
const changedFiles = [];

function replaceInFile(filePath) {
  const ext = path.extname(filePath);

  // Only process text files
  if (!['.html', '.css', '.js', '.json', '.txt', '.md'].includes(ext)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  let fileChanges = 0;

  // Apply each replacement
  Object.keys(replacements).forEach(find => {
    const replace = replacements[find];
    if (content.includes(find)) {
      const count = (content.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      content = content.split(find).join(replace);
      totalChanges += count;
      fileChanges += count;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    const relativePath = path.relative(process.cwd(), filePath);
    changedFiles.push({ path: relativePath, changes: fileChanges });
    console.log(`✓ ${path.basename(filePath)} (${fileChanges} changes)`);
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  });
}

console.log('🔄 Starting brand replacement: Fridays → Evolife\n');
console.log('Processing files...\n');

const targetDir = path.join(__dirname, '../evolife');
processDirectory(targetDir);

console.log(`\n${'='.repeat(50)}`);
console.log(`✅ Done! ${totalChanges} replacements in ${filesChanged} files`);
console.log(`${'='.repeat(50)}\n`);

if (changedFiles.length > 0) {
  console.log('Files changed:');
  changedFiles.forEach(file => {
    console.log(`  - ${file.path}: ${file.changes} changes`);
  });
}
