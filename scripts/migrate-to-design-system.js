/**
 * Page Migration Script: Webflow → New Design System
 * Systematically migrates pages from old Webflow system to new design system
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const BASE_DIR = path.join(__dirname, '..');

// New head template (without tracking scripts)
const NEW_HEAD_TEMPLATE = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- META_DESCRIPTION -->
<!-- META_TITLE -->

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">

<!-- Design System CSS -->
<link rel="stylesheet" href="design-system/css/master.css">

<!-- Favicon -->
<link rel="icon" type="image/png" href="assets/images/favicon.png">

<!-- Font Loading CSS - Prevent FOUT -->
<style>
  body {
    font-family: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  h1, h2, h3, .display-md, .display-lg, .display-sm, .hero__title {
    font-family: 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ===== RESPONSIVE DESIGN - MOBILE OPTIMIZATIONS ===== */

  /* Tablet Breakpoint */
  @media (max-width: 1024px) {
    .hero__content {
      max-width: 100%;
    }

    .stats__grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    .benefits__grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  /* Mobile Breakpoint */
  @media (max-width: 768px) {
    /* Typography Scaling */
    .display-lg, .hero__title {
      font-size: 2.5rem !important;
      line-height: 1.2 !important;
    }

    .display-md, h2 {
      font-size: 2rem !important;
      line-height: 1.3 !important;
    }

    h3 {
      font-size: 1.5rem !important;
    }

    .hero__subtitle {
      font-size: 1.125rem !important;
      line-height: 1.6 !important;
    }

    /* Section Spacing */
    .section--padded {
      padding: 3rem 0 !important;
    }

    .container {
      padding-left: 1.5rem !important;
      padding-right: 1.5rem !important;
    }

    /* Hero Section */
    .hero {
      padding: 6rem 0 3rem !important;
      text-align: center;
    }

    .hero__badge {
      font-size: 0.875rem !important;
    }

    .hero__price {
      font-size: 2.5rem !important;
    }

    .hero__cta-group {
      flex-direction: column;
      gap: 1rem;
    }

    .hero__cta-group .btn {
      width: 100%;
      text-align: center;
    }

    /* Stats Grid */
    .stats__grid {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }

    .stat {
      text-align: center;
    }

    /* Benefits Grid */
    .benefits__grid {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }

    .benefit-card {
      text-align: center;
    }

    /* Info Box */
    .info-box {
      padding: 1.5rem !important;
    }

    .info-box__mechanisms {
      padding-left: 1.25rem !important;
    }

    /* How It Works Steps */
    .steps__grid {
      grid-template-columns: 1fr !important;
    }

    .step {
      text-align: center;
    }

    .step__number {
      margin: 0 auto 1rem !important;
    }

    /* CTA Sections */
    .cta__content {
      text-align: center;
    }

    .cta__buttons {
      flex-direction: column;
      align-items: stretch;
    }

    .cta__buttons .btn {
      width: 100%;
    }

    /* Reduce large gaps */
    .mb-12 {
      margin-bottom: 2rem !important;
    }

    .mb-10 {
      margin-bottom: 1.5rem !important;
    }

    .mb-8 {
      margin-bottom: 1rem !important;
    }
  }

  /* Small Mobile Breakpoint */
  @media (max-width: 480px) {
    .display-lg, .hero__title {
      font-size: 2rem !important;
    }

    .display-md, h2 {
      font-size: 1.75rem !important;
    }

    .hero__price {
      font-size: 2rem !important;
    }

    .container {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }

    .section--padded {
      padding: 2rem 0 !important;
    }

    .btn {
      padding: 14px 24px !important;
      font-size: 0.9375rem !important;
    }
  }
</style>

<!-- TRACKING_SCRIPTS -->`;

// New navigation component (extracted from semaglutide-new.html)
const NEW_NAV = `<nav class="nav" id="main-nav" role="navigation" aria-label="Main navigation">
  <div class="nav__container">
    <!-- Logo -->
    <a href="index.html" class="nav__logo" aria-label="Evolife Wellness Home">
      <img src="assets/images/evolife-logo-new.png" alt="Evolife Wellness" width="180" height="48">
    </a>

    <!-- Desktop Navigation Menu -->
    <ul class="nav__menu" id="nav-menu">
      <li>
        <a href="index.html">Home</a>
      </li>

      <li>
        <a href="pricing.html">GLP-1 Pricing</a>
      </li>

      <li>
        <a href="contact-us.html">Contact Us</a>
      </li>

      <!-- Mobile CTA (shown only in mobile menu) -->
      <li class="nav__mobile-cta" style="display: none;">
        <a href="get-started.html" class="btn btn-primary" style="width: 100%; text-align: center; margin-top: 1rem;">Get Started</a>
      </li>
    </ul>

    <!-- Desktop CTA Button -->
    <a href="get-started.html" class="nav__cta btn btn-primary">Get Started</a>

    <!-- Mobile Menu Toggle -->
    <button
      class="nav__toggle"
      id="nav-toggle"
      type="button"
      aria-label="Toggle navigation menu"
      aria-expanded="false"
      aria-controls="nav-menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>
</nav>

<!-- Mobile Menu Overlay -->
<div class="nav__overlay" id="nav-overlay" aria-hidden="true"></div>`;

// New footer component (extracted from semaglutide-new.html)
const NEW_FOOTER = `<footer class="footer" role="contentinfo">
  <div class="footer__container">

    <!-- Top Section: Brand + Grid -->
    <div class="footer__top">

      <!-- Brand Section -->
      <div class="footer__brand">
        <a href="index.html" aria-label="Evolife Wellness Home">
          <img src="assets/images/evolife-footer-logo.png" alt="Evolife Wellness" width="200" height="56">
        </a>
        <p class="footer__tagline">
          Personalized wellness solutions for optimal health and longevity
        </p>
      </div>

      <!-- Three-Column Grid -->
      <div class="footer__grid">

        <!-- Column 1: Quick Links -->
        <div class="footer__col">
          <h3 class="footer__heading">Quick Links</h3>
          <ul class="footer__links">
            <li><a href="index.html">Home</a></li>
            <li><a href="pricing.html">GLP-1 Pricing</a></li>
            <li><a href="peptides.html">Advanced Peptides</a></li>
            <li><a href="mens-health.html">Men's Health</a></li>
            <li><a href="recovery.html">Energy & Recovery</a></li>
            <li><a href="weight-management.html">Weight Management</a></li>
            <li><a href="contact-us.html">Contact Us</a></li>
          </ul>
        </div>

        <!-- Column 2: Legal -->
        <div class="footer__col">
          <h3 class="footer__heading">Legal</h3>
          <ul class="footer__links">
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-conditions">Terms of Service</a></li>
            <li><a href="/medications-safety-information">Medications Safety</a></li>
          </ul>
        </div>

        <!-- Column 3: Contact -->
        <div class="footer__col">
          <h3 class="footer__heading">Contact</h3>
          <address class="footer__contact">
            <a
              href="https://www.google.com/maps/search/?api=1&query=7777+Glades+Rd+STE+100+Boca+Raton+FL+33434"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View location on Google Maps"
            >
              7777 Glades Rd STE 100<br>
              Boca Raton, FL 33434<br>
              United States
            </a>
            <a href="tel:+15618954000" aria-label="Call us">(+1) 561 895 4000</a>
            <a href="mailto:info@evolifewellness.com" aria-label="Email us">info@evolifewellness.com</a>
          </address>
        </div>

      </div>
    </div>

    <!-- Collapsible Legal Disclaimer -->
    <details class="footer__disclaimer">
      <summary>Medical Disclaimer & Important Information</summary>
      <p>
        The information provided on this website is for educational purposes only and is not intended
        as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice
        of your physician or other qualified health provider with any questions you may have regarding
        a medical condition. Never disregard professional medical advice or delay in seeking it because
        of something you have read on this website.
      </p>
      <p>
        The products and services offered by Evolife Wellness, including compounded medications, are not
        FDA approved and their efficacy and safety have not been established by the FDA. Compounded
        medications are custom-made for individual patients based on a licensed healthcare provider's
        prescription. Results may vary and are not guaranteed. Consult with your healthcare provider to
        determine if these treatments are appropriate for you.
      </p>
      <p>
        By using this website and our services, you acknowledge that you have read and understood this
        disclaimer and agree to its terms. If you do not agree with this disclaimer, please discontinue
        use of this website immediately.
      </p>
    </details>

    <!-- Bottom Section: Copyright -->
    <div class="footer__bottom">
      <div class="footer__copyright">
        &copy; <span id="copyright-year">2025</span> Evolife Wellness. All rights reserved.
      </div>
    </div>

  </div>

  <!-- Back to Top Button -->
  <button
    class="footer__back-to-top"
    id="back-to-top"
    type="button"
    aria-label="Back to top"
    title="Back to top"
  >
    ↑
  </button>
</footer>

<!-- Navigation JavaScript -->
<script src="scripts/navigation.js"></script>`;

/**
 * Extract tracking scripts from old page to preserve them
 */
function extractTrackingScripts(html) {
  const trackingScripts = [];

  // Extract Google Analytics
  const gaMatch = html.match(/<script[^>]*>[\s\S]*?google[^<]*<\/script>/gi);
  if (gaMatch) trackingScripts.push(...gaMatch);

  // Extract VWO
  const vwoMatch = html.match(/<!-- Start VWO.*?<!-- End VWO.*?-->/gs);
  if (vwoMatch) trackingScripts.push(...vwoMatch);

  // Extract Northbeam
  const nbMatch = html.match(/<!-- Begin: Northbeam.*?<!-- End: Northbeam.*?-->/gs);
  if (nbMatch) trackingScripts.push(...nbMatch);

  // Extract Tatari
  const tatariMatch = html.match(/<!-- Start Tatari.*?<!-- End Tatari.*?-->/gs);
  if (tatariMatch) trackingScripts.push(...tatariMatch);

  // Extract Savvy
  const savvyMatch = html.match(/<!-- Start Embeddables.*?<!-- Finish Embeddables.*?-->/gs);
  if (savvyMatch) trackingScripts.push(...savvyMatch);

  return trackingScripts.join('\n\n');
}

/**
 * Migrate a single page
 */
function migratePage(filePath) {
  console.log(`\n📄 Migrating: ${path.basename(filePath)}`);

  try {
    // Read original file
    const originalHtml = fs.readFileSync(filePath, 'utf-8');

    // Check if already migrated
    if (originalHtml.includes('design-system/css/master.css')) {
      console.log('  ✅ Already using new design system - skipping');
      return { success: true, alreadyMigrated: true };
    }

    // Create backup
    const backupPath = filePath.replace('.html', '.backup.html');
    fs.writeFileSync(backupPath, originalHtml);
    console.log(`  💾 Backup created: ${path.basename(backupPath)}`);

    // Parse HTML
    const dom = new JSDOM(originalHtml);
    const doc = dom.window.document;

    // Extract meta information
    const titleTag = doc.querySelector('title');
    const descTag = doc.querySelector('meta[name="description"]');

    const title = titleTag ? titleTag.textContent : 'Evolife Wellness';
    const description = descTag ? descTag.getAttribute('content') : '';

    // Extract tracking scripts
    const trackingScripts = extractTrackingScripts(originalHtml);

    // Build new head
    let newHead = NEW_HEAD_TEMPLATE;
    newHead = newHead.replace('<!-- META_TITLE -->', `<title>${title}</title>`);
    newHead = newHead.replace('<!-- META_DESCRIPTION -->',
      description ? `<meta content="${description}" name="description"/>` : '');
    newHead = newHead.replace('<!-- TRACKING_SCRIPTS -->', trackingScripts);

    // Get body content (between <body> and </body>)
    const bodyMatch = originalHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';

    // Remove old navigation (multiple patterns)
    bodyContent = bodyContent.replace(/<nav[\s\S]*?<\/nav>/gi, '');
    bodyContent = bodyContent.replace(/<div[^>]*class="[^"]*navbar[^"]*"[\s\S]*?<\/div>/gi, '');

    // Remove old footer
    bodyContent = bodyContent.replace(/<footer[\s\S]*?<\/footer>/gi, '');
    bodyContent = bodyContent.replace(/<div[^>]*class="[^"]*footer[^"]*"[\s\S]*?<\/div>/gi, '');

    // Remove Webflow scripts
    bodyContent = bodyContent.replace(/<script[^>]*webflow[^>]*><\/script>/gi, '');

    // Build new HTML
    const newHtml = `<!DOCTYPE html>
<html lang="en">
<head>
${newHead}
</head>

<body>

${NEW_NAV}

${bodyContent.trim()}

${NEW_FOOTER}

</body>
</html>`;

    // Write migrated file
    fs.writeFileSync(filePath, newHtml);
    console.log('  ✅ Migration complete');

    return { success: true };

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main migration function
 */
function main() {
  // Get pages to migrate from command line or use defaults
  const pagesToMigrate = process.argv.slice(2);

  if (pagesToMigrate.length === 0) {
    console.log('Usage: node migrate-to-design-system.js <page1.html> <page2.html> ...');
    console.log('\nExample: node migrate-to-design-system.js index.html pricing.html');
    console.log('\nOr for batch migration:');
    console.log('  Batch 1 (Critical): node migrate-to-design-system.js index.html pricing.html semaglutide.html testosterone.html peptides.html');
    process.exit(1);
  }

  console.log('🚀 Starting Page Migration');
  console.log('==========================\n');

  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const page of pagesToMigrate) {
    const filePath = path.join(BASE_DIR, page);

    if (!fs.existsSync(filePath)) {
      console.log(`\n❌ File not found: ${page}`);
      results.failed++;
      continue;
    }

    const result = migratePage(filePath);

    if (result.success) {
      if (result.alreadyMigrated) {
        results.skipped++;
      } else {
        results.success++;
      }
    } else {
      results.failed++;
    }
  }

  console.log('\n==========================');
  console.log('📊 Migration Summary');
  console.log('==========================');
  console.log(`✅ Successfully migrated: ${results.success}`);
  console.log(`⏭️  Skipped (already migrated): ${results.skipped}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📁 Total processed: ${pagesToMigrate.length}`);
  console.log('\n✨ Migration complete!\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { migratePage };
