const fs = require('fs');
const path = require('path');

// Pages that need noindex removed
const pages = [
  'index.html',
  'pricing.html',
  'contact-us.html',
  'blog.html',
  'privacy-policy.html',
  'terms-conditions.html',
  'medications-safety-information.html',
  'blog_can-glp-1s-help-treat-pcos-symptoms.html',
  'blog_difference-between-glp-1-and-compounded-glp-1.html',
  'blog_how-glp-1-weight-loss-medications-work.html',
  'blog_glp-1s-to-your-vacation-weight-loss-plan.html',
  'blog_glp-1s-and-menopause.html',
  'blog_fridays-weight-loss-program-real-results-personalized-plans.html'
];

const rootDir = path.join(__dirname, '..');

let count = 0;
pages.forEach(page => {
  const filePath = path.join(rootDir, page);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${page} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Remove noindex/nofollow meta tag
  content = content.replace(/<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?>/gi, '');
  content = content.replace(/<meta\s+name="robots"\s+content="noindex"\s*\/?>/gi, '');
  content = content.replace(/<meta\s+content="noindex,\s*nofollow"\s+name="robots"\s*\/?>/gi, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Removed noindex from ${page}`);
    count++;
  } else {
    console.log(`ℹ️  No noindex found in ${page}`);
  }
});

console.log(`\n✨ Removed noindex tags from ${count} pages`);
