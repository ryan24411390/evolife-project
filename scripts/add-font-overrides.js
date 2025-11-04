const fs = require('fs');
const path = require('path');

// List of all HTML files to update (excluding backups)
const htmlFiles = [
  'index.html',
  'pricing.html',
  'blog.html',
  'blog_can-glp-1s-help-treat-pcos-symptoms.html',
  'blog_difference-between-glp-1-and-compounded-glp-1.html',
  'blog_fridays-weight-loss-program-real-results-personalized-plans.html',
  'blog_glp-1s-and-menopause.html',
  'blog_glp-1s-to-your-vacation-weight-loss-plan.html',
  'blog_how-glp-1-weight-loss-medications-work.html',
  'contact-us.html',
  'get-started.html',
  'medications-safety-information.html',
  'privacy-policy.html',
  'terms-conditions.html',
  'peptides.html',
  'peptides-luxury.html',
  'peptides-luxury-v2.html',
  'peptides-luxury-v3.html',
  'peptides_products.html',
  'mens-health.html',
  'mens-health-premium.html',
  'mens-health-luxury.html',
  'recovery.html',
  'recovery-premium.html',
  'recovery-luxury.html',
  'weight-management.html',
  'weight-management-premium.html',
  'weight-management-luxury.html',
  'weight-management-custom.html',
  'compounded-medications.html',
  'custom-peptides.html',
  'semaglutide.html',
  'semaglutide-b12.html',
  'semaglutide-new.html',
  'testosterone.html',
  'tadalafil.html',
  'vardenafil.html',
  'nad-therapy.html',
  'glutathione.html',
  'vitamin-b12.html',
  'hair-restoration.html',
  'methylene-blue.html',
  'aod-9604.html',
  'bpc-157.html',
  'tb-500.html',
  'pt-141.html',
  'aod-9604-mots-c.html',
  'aod-9604-mots-c-tesamorelin.html',
  'cjc-1295-ipamorelin.html',
  'epithalon.html',
  'epithalon-ghk-cu.html',
  'ghk-cu.html',
  'mots-c.html',
  'semax-selank.html',
  'sermorelin.html',
  'tesamorelin.html',
  'tesamorelin-ipamorelin.html',
  'tirzepatide.html'
];

// The CSS link to add
const cssLink = '  <link href="assets/css/font-overrides.css" rel="stylesheet" type="text/css"/>\n';

let successCount = 0;
let skippedCount = 0;
let errorCount = 0;

console.log('Starting to add font-overrides.css to HTML files...\n');

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ SKIP: ${file} (file not found)`);
    skippedCount++;
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if font-overrides.css is already linked
    if (content.includes('font-overrides.css')) {
      console.log(`⏭️  SKIP: ${file} (already has font-overrides.css)`);
      skippedCount++;
      return;
    }

    // Add the CSS link before </head>
    if (content.includes('</head>')) {
      content = content.replace('</head>', cssLink + '</head>');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ SUCCESS: ${file}`);
      successCount++;
    } else {
      console.log(`❌ ERROR: ${file} (no </head> tag found)`);
      errorCount++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${file} - ${error.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log('SUMMARY:');
console.log(`✅ Successfully updated: ${successCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(`❌ Errors: ${errorCount} files`);
console.log('='.repeat(50));
