/**
 * Playwright Test Suite for Evolife Treatment Pages
 * Tests: mens-health.html, recovery.html, weight-management.html
 */

const { chromium } = require('playwright');
const path = require('path');

// Test configuration
const BASE_PATH = __dirname;
const PAGES_TO_TEST = [
  { name: 'Men\'s Health', file: 'mens-health.html', expectedCategory: 'mens-health-treatments', color: 'navy' },
  { name: 'Recovery', file: 'recovery.html', expectedCategory: 'recovery', color: 'orange' },
  { name: 'Weight Management', file: 'weight-management.html', expectedCategory: 'weight-management', color: 'green' }
];

// Utility function for consistent logging
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',      // Cyan
    success: '\x1b[32m',   // Green
    warning: '\x1b[33m',   // Yellow
    error: '\x1b[31m',     // Red
    reset: '\x1b[0m'
  };

  const prefix = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗'
  };

  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

// Test individual page
async function testPage(browser, pageConfig) {
  const results = {
    page: pageConfig.name,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
  };

  log(`\nTesting: ${pageConfig.name}`, 'info');
  log('='.repeat(60), 'info');

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to page
    const filePath = `file://${path.join(BASE_PATH, pageConfig.file)}`;
    log(`Loading: ${pageConfig.file}...`);
    await page.goto(filePath, { waitUntil: 'networkidle', timeout: 30000 });
    results.passed++;
    log('Page loaded successfully', 'success');

    // Test 1: Check page title exists
    const title = await page.title();
    if (title) {
      results.passed++;
      log(`Page title found: "${title}"`, 'success');
    } else {
      results.failed++;
      results.errors.push('No page title found');
      log('No page title found', 'error');
    }

    // Test 2: Check for main heading
    const mainHeading = await page.$('h1, h2.heading-style-h4-7');
    if (mainHeading) {
      const headingText = await mainHeading.textContent();
      results.passed++;
      log(`Main heading found: "${headingText.trim()}"`, 'success');
    } else {
      results.failed++;
      results.errors.push('No main heading found');
      log('No main heading found', 'error');
    }

    // Test 3: Check for Get Started buttons with correct category
    const buttons = await page.$$('a[href*="get-started.html"]');
    if (buttons.length > 0) {
      log(`Found ${buttons.length} "Get Started" button(s)`, 'success');
      results.passed++;

      // Check if at least one button has the correct category
      let correctCategoryFound = false;
      for (const button of buttons) {
        const href = await button.getAttribute('href');
        if (href && href.includes(`category=${pageConfig.expectedCategory}`)) {
          correctCategoryFound = true;
          break;
        }
      }

      if (correctCategoryFound) {
        log(`Correct category parameter found: ${pageConfig.expectedCategory}`, 'success');
        results.passed++;
      } else {
        log(`Expected category "${pageConfig.expectedCategory}" not found in CTA links`, 'warning');
        results.warnings++;
      }
    } else {
      results.failed++;
      results.errors.push('No "Get Started" buttons found');
      log('No "Get Started" buttons found', 'error');
    }

    // Test 4: Check for inappropriate testosterone content (should not exist on recovery/weight pages)
    if (pageConfig.name !== 'Men\'s Health') {
      const bodyText = await page.textContent('body');
      const inappropriateTerms = [
        'testosterone replacement therapy',
        'TRT programs',
        'low testosterone',
        'low T holding you back'
      ];

      let foundInappropriate = false;
      for (const term of inappropriateTerms) {
        if (bodyText.toLowerCase().includes(term.toLowerCase())) {
          foundInappropriate = true;
          results.warnings++;
          log(`Found inappropriate content: "${term}"`, 'warning');
        }
      }

      if (!foundInappropriate) {
        results.passed++;
        log('No inappropriate testosterone content found', 'success');
      }
    }

    // Test 5: Check for product/dosage sections
    const productCards = await page.$$('.lowdown-card, .dosage-table');
    if (productCards.length > 0) {
      results.passed++;
      log(`Found ${productCards.length} product/dosage section(s)`, 'success');
    } else {
      results.warnings++;
      log('No product cards or dosage tables found', 'warning');
    }

    // Test 6: Check for FAQ section
    const faqSection = await page.$('#FAQs, .section_faq-3');
    if (faqSection) {
      results.passed++;
      log('FAQ section found', 'success');
    } else {
      results.warnings++;
      log('FAQ section not found', 'warning');
    }

    // Test 7: Check for footer
    const footer = await page.$('footer');
    if (footer) {
      results.passed++;
      log('Footer found', 'success');
    } else {
      results.warnings++;
      log('Footer not found', 'warning');
    }

    // Test 8: Check for navigation
    const nav = await page.$('nav, .navbar_component');
    if (nav) {
      results.passed++;
      log('Navigation found', 'success');
    } else {
      results.failed++;
      results.errors.push('Navigation not found');
      log('Navigation not found', 'error');
    }

    // Test 9: Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    if (consoleErrors.length === 0) {
      results.passed++;
      log('No console errors detected', 'success');
    } else {
      results.warnings++;
      log(`${consoleErrors.length} console error(s) detected`, 'warning');
      consoleErrors.slice(0, 3).forEach(err => {
        log(`  - ${err.substring(0, 100)}...`, 'warning');
      });
    }

    // Test 10: Take screenshot
    const screenshotPath = path.join(BASE_PATH, `screenshot-${pageConfig.file.replace('.html', '')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    log(`Screenshot saved: ${screenshotPath}`, 'success');
    results.passed++;

  } catch (error) {
    results.failed++;
    results.errors.push(error.message);
    log(`Error testing page: ${error.message}`, 'error');
  } finally {
    await context.close();
  }

  return results;
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('EVOLIFE TREATMENT PAGES - PLAYWRIGHT TEST SUITE', 'info');
  console.log('='.repeat(60) + '\n');

  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  try {
    for (const pageConfig of PAGES_TO_TEST) {
      const results = await testPage(browser, pageConfig);
      allResults.push(results);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    log('TEST SUMMARY', 'info');
    console.log('='.repeat(60) + '\n');

    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    allResults.forEach(result => {
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalWarnings += result.warnings;

      log(`${result.page}:`, 'info');
      log(`  ✓ Passed: ${result.passed}`, 'success');
      if (result.warnings > 0) {
        log(`  ⚠ Warnings: ${result.warnings}`, 'warning');
      }
      if (result.failed > 0) {
        log(`  ✗ Failed: ${result.failed}`, 'error');
        result.errors.forEach(err => {
          log(`    - ${err}`, 'error');
        });
      }
      console.log('');
    });

    console.log('='.repeat(60));
    log(`TOTAL: ${totalPassed} passed, ${totalWarnings} warnings, ${totalFailed} failed`,
        totalFailed === 0 ? 'success' : 'warning');
    console.log('='.repeat(60) + '\n');

    if (totalFailed === 0 && totalWarnings === 0) {
      log('All tests passed! 🎉', 'success');
    } else if (totalFailed === 0) {
      log('All critical tests passed with some warnings', 'warning');
    } else {
      log('Some tests failed. Please review the errors above.', 'error');
    }

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'error');
    console.error(error);
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
