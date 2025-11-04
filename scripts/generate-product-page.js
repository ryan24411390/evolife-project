#!/usr/bin/env node

/**
 * ===================================================================
 * PRODUCT PAGE GENERATOR
 * Evolife Wellness - Automated Page Creation
 * ===================================================================
 *
 * Generates product pages using semaglutide-new.html as a template.
 *
 * Usage:
 *   node scripts/generate-product-page.js <product-slug>
 *   node scripts/generate-product-page.js --all
 *
 * Example:
 *   node scripts/generate-product-page.js sermorelin
 *
 * Requires: product-content.json with product data
 * Output: New HTML file in root directory
 * ===================================================================
 */

const fs = require('fs');
const path = require('path');

// ===================================================================
// CONFIGURATION
// ===================================================================

const TEMPLATE_PATH = path.join(__dirname, '..', 'semaglutide-new.html');
const PRODUCTS_DATA_PATH = path.join(__dirname, '..', 'product-content.json');
const OUTPUT_DIR = path.join(__dirname, '..');

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Read and parse product data JSON
 */
function loadProductsData() {
  try {
    const data = fs.readFileSync(PRODUCTS_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error loading product data:', error.message);
    console.log('💡 Make sure product-content.json exists in the root directory.');
    process.exit(1);
  }
}

/**
 * Read template HTML file
 */
function loadTemplate() {
  try {
    return fs.readFileSync(TEMPLATE_PATH, 'utf8');
  } catch (error) {
    console.error('❌ Error loading template:', error.message);
    process.exit(1);
  }
}

/**
 * Replace placeholders in template with product data
 */
function generatePage(template, product) {
  let html = template;

  // ===== META & TITLE =====
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${product.meta.description}">`
  );
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${product.meta.title}</title>`
  );

  // ===== HERO SECTION =====
  html = html.replace(
    /<span class="badge badge--category">[^<]*<\/span>/,
    `<span class="badge badge--category">${product.hero.category}</span>`
  );
  html = html.replace(
    /<h1 class="hero__title">[^<]*<\/h1>/,
    `<h1 class="hero__title">${product.hero.title}</h1>`
  );
  html = html.replace(
    /<p class="hero__subtitle">\s*[\s\S]*?<\/p>/,
    `<p class="hero__subtitle">\n        ${product.hero.subtitle}\n      </p>`
  );
  html = html.replace(
    /<span class="display-md text-white">\$\d+<span class="price-suffix">\/month<\/span><\/span>/,
    `<span class="display-md text-white">$${product.hero.price}<span class="price-suffix">/month</span></span>`
  );
  html = html.replace(
    /<p class="body-sm text-white-soft">\s*[\s\S]*?<\/p>/,
    `<p class="body-sm text-white-soft">\n          ${product.hero.priceNote}\n        </p>`
  );

  // Update CTA links with product slug
  html = html.replace(
    /href="get-started\.html\?category=semaglutide"/g,
    `href="get-started.html?category=${product.slug}"`
  );

  // ===== STATS BAR =====
  const statsRegex = /<section class="stats-bar">[\s\S]*?<\/section>/;
  const statsMatch = html.match(statsRegex);
  if (statsMatch && product.stats) {
    const statsHTML = `<section class="stats-bar">
  <div class="container container--xl">
    <div class="stats-bar__grid">
      <div class="stat">
        <div class="stat__number">${product.stats[0].number}</div>
        <div class="stat__label">${product.stats[0].label}</div>
      </div>
      <div class="stat">
        <div class="stat__number">${product.stats[1].number}</div>
        <div class="stat__label">${product.stats[1].label}</div>
      </div>
      <div class="stat">
        <div class="stat__number">${product.stats[2].number}</div>
        <div class="stat__label">${product.stats[2].label}</div>
      </div>
      <div class="stat">
        <div class="stat__number">${product.stats[3].number}</div>
        <div class="stat__label">${product.stats[3].label}</div>
      </div>
    </div>
  </div>
</section>`;
    html = html.replace(statsRegex, statsHTML);
  }

  // ===== WHAT IS [PRODUCT]? SECTION =====
  html = html.replace(
    /<h2 class="display-md mb-6">What is Semaglutide\?<\/h2>/,
    `<h2 class="display-md mb-6">${product.whatIs.heading}</h2>`
  );
  html = html.replace(
    /<p class="body-xl text-center mb-8">\s*[\s\S]*?<\/p>/,
    `<p class="body-xl text-center mb-8">\n        ${product.whatIs.description}\n      </p>`
  );

  // Replace info box content
  const infoBoxRegex = /<div class="info-box">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
  const infoBoxMatch = html.match(infoBoxRegex);
  if (infoBoxMatch && product.whatIs.infoBox) {
    const mechanismItems = product.whatIs.infoBox.mechanisms.map(item =>
      `        <li>${item}</li>`
    ).join('\n');

    const infoBoxHTML = `<div class="info-box">
      <div class="info-box__title">${product.whatIs.infoBox.title}</div>
      <p class="mb-4">
        ${product.whatIs.infoBox.intro}
      </p>
      <ul class="checklist">
${mechanismItems}
      </ul>
      <p class="mt-4">
        ${product.whatIs.infoBox.conclusion}
      </p>
    </div>
  </div>
</section>`;
    html = html.replace(infoBoxRegex, infoBoxHTML);
  }

  // ===== KEY BENEFITS =====
  if (product.benefits && product.benefits.length >= 6) {
    const benefitsRegex = /<section class="section section--padded section--bg-light">[\s\S]*?<h2 class="display-md">Key Benefits<\/h2>[\s\S]*?<div class="grid grid--3">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;

    const benefitsHTML = `<section class="section section--padded section--bg-light">
  <div class="container container--xl">
    <div class="text-center mb-12">
      <h2 class="display-md">Key Benefits</h2>
      <p class="body-lg text-muted">
        ${product.benefits.subtitle || `Why thousands choose ${product.hero.title} for optimal results`}
      </p>
    </div>

    <div class="grid grid--3">
${product.benefits.slice(0, 6).map(benefit => `      <!-- Benefit: ${benefit.title} -->
      <div class="card card--benefit">
        <div class="icon-circle">
          <span class="icon-lg">${benefit.icon}</span>
        </div>
        <h3 class="h4">${benefit.title}</h3>
        <p class="body-text">
          ${benefit.description}
        </p>
      </div>
`).join('\n')}
    </div>
  </div>
</section>`;

    html = html.replace(benefitsRegex, benefitsHTML);
  }

  // ===== REPLACE REMAINING SEMAGLUTIDE REFERENCES =====

  // Replace HTML comment
  html = html.replace(
    /<!-- SECTION 3: WHAT IS SEMAGLUTIDE\? -->/g,
    `<!-- SECTION 3: WHAT IS ${product.hero.title.toUpperCase()}? -->`
  );

  // Replace benefits section subtitle (before benefits cards)
  html = html.replace(
    /Why thousands choose Semaglutide for sustainable weight loss/g,
    product.benefits.subtitle || `Why thousands choose ${product.hero.title} for optimal results`
  );

  // Replace "semaglutide" with product name in How It Works section
  html = html.replace(
    /Your semaglutide prescription is filled/g,
    `Your ${product.hero.title} prescription is filled`
  );
  html = html.replace(
    /if semaglutide is right for you/g,
    `if ${product.hero.title} is right for you`
  );

  // Replace doctor quote about Semaglutide
  html = html.replace(
    /"Semaglutide represents a breakthrough in weight management medicine[^"]*"/,
    `"${product.hero.title} represents a significant advancement in peptide therapy. As a physician specializing in wellness optimization, I've witnessed firsthand how this treatment helps patients achieve their health goals when combined with proper medical supervision and lifestyle support. The clinical evidence is compelling, and real-world outcomes demonstrate consistent results."`
  );

  // Replace quality assurance text
  html = html.replace(
    /Every batch of semaglutide is independently tested/g,
    `Every batch of ${product.hero.title} is independently tested`
  );

  // Replace final CTA section
  html = html.replace(
    /Ready to transform your health with Semaglutide\?/g,
    `Ready to optimize your health with ${product.hero.title}?`
  );
  html = html.replace(
    /Join thousands who have achieved sustainable weight loss with physician-supervised Semaglutide therapy/g,
    `Join thousands who have achieved optimal results with physician-supervised ${product.hero.title} therapy`
  );

  // ===== REMOVE SEMAGLUTIDE-SPECIFIC SECTIONS =====

  // Remove "What the research shows about Semaglutide" section
  const researchRegex = /<!-- SECTION 6: SCIENTIFIC BACKING -->[\s\S]*?<\/section>/;
  html = html.replace(researchRegex, '<!-- Research section removed - product-specific data to be added -->');

  // Remove "When to Expect Results" section
  const timelineRegex = /<!-- SECTION 7: EXPECTED RESULTS TIMELINE -->[\s\S]*?<section class="section section--padded section--bg-white">[\s\S]*?<h2 class="display-md">When to Expect Results<\/h2>[\s\S]*?<\/section>/;
  html = html.replace(timelineRegex, '<!-- Timeline section removed - product-specific data to be added -->');

  // Remove testimonials section (semaglutide-specific)
  const testimonialsRegex = /<!-- SECTION 9: TESTIMONIALS -->[\s\S]*?<section class="section section--padded section--bg-white">[\s\S]*?<h2 class="display-md">What Our Patients Say<\/h2>[\s\S]*?<\/section>/;
  html = html.replace(testimonialsRegex, '<!-- Testimonials section removed - product-specific data to be added -->');

  // Remove safety information section (semaglutide-specific)
  const safetyRegex = /<!-- SECTION 10: SAFETY INFORMATION -->[\s\S]*?<section class="section section--padded section--bg-light">[\s\S]*?<h2 class="display-md mb-8 text-center">Important Safety Information<\/h2>[\s\S]*?<\/section>/;
  html = html.replace(safetyRegex, '<!-- Safety information section removed - product-specific data to be added -->');

  // Remove FAQ section (semaglutide-specific)
  const faqRegex = /<!-- SECTION 11: FAQ -->[\s\S]*?<section class="section section--padded section--bg-white">[\s\S]*?<h2 class="display-md">Frequently Asked Questions<\/h2>[\s\S]*?<\/section>/;
  html = html.replace(faqRegex, '<!-- FAQ section removed - product-specific data to be added -->');

  return html;
}

/**
 * Write generated HTML to file
 */
function writeOutputFile(filename, content) {
  const outputPath = path.join(OUTPUT_DIR, filename);
  try {
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ Generated: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${filename}:`, error.message);
    return false;
  }
}

/**
 * Generate a single product page
 */
function generateSinglePage(productSlug, productsData) {
  const product = productsData.products.find(p => p.slug === productSlug);

  if (!product) {
    console.error(`❌ Product "${productSlug}" not found in product-content.json`);
    console.log('\nAvailable products:');
    productsData.products.forEach(p => console.log(`  - ${p.slug}`));
    return false;
  }

  console.log(`\n🔨 Generating page for: ${product.hero.title}`);

  const template = loadTemplate();
  const html = generatePage(template, product);
  const filename = `${productSlug}.html`;

  return writeOutputFile(filename, html);
}

/**
 * Generate all product pages
 */
function generateAllPages(productsData) {
  console.log('\n🚀 Generating all product pages...\n');

  let successCount = 0;
  let failCount = 0;

  productsData.products.forEach(product => {
    console.log(`Processing: ${product.hero.title}`);
    const template = loadTemplate();
    const html = generatePage(template, product);
    const filename = `${product.slug}.html`;

    if (writeOutputFile(filename, html)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\n✅ Successfully generated: ${successCount} pages`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} pages`);
  }

  return failCount === 0;
}

// ===================================================================
// MAIN EXECUTION
// ===================================================================

function main() {
  const args = process.argv.slice(2);

  // Show usage if no arguments
  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    PRODUCT PAGE GENERATOR                         ║
║                    Evolife Wellness                               ║
╚═══════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/generate-product-page.js <product-slug>
  node scripts/generate-product-page.js --all
  node scripts/generate-product-page.js --list

Examples:
  node scripts/generate-product-page.js sermorelin
  node scripts/generate-product-page.js mots-c
  node scripts/generate-product-page.js --all

Options:
  --all    Generate all product pages
  --list   List available products
  --help   Show this help message
`);
    process.exit(0);
  }

  // Load product data
  const productsData = loadProductsData();

  // Handle --list flag
  if (args[0] === '--list') {
    console.log('\n📋 Available products:\n');
    productsData.products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.slug.padEnd(35)} - ${product.hero.title}`);
    });
    console.log(`\nTotal: ${productsData.products.length} products\n`);
    process.exit(0);
  }

  // Handle --all flag
  if (args[0] === '--all') {
    const success = generateAllPages(productsData);
    process.exit(success ? 0 : 1);
  }

  // Generate single product page
  const productSlug = args[0];
  const success = generateSinglePage(productSlug, productsData);
  process.exit(success ? 0 : 1);
}

// Run the script
main();
