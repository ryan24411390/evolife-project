const { test, expect } = require('@playwright/test');

/**
 * Comprehensive UX/UI Testing Suite
 * Evolife Wellness Website
 *
 * Tests for:
 * - Responsive design issues
 * - Navigation problems
 * - Form functionality
 * - Accessibility violations
 * - Broken links/images
 * - Layout issues
 */

const PAGES = [
  { url: '/', name: 'Homepage' },
  { url: '/peptides.html', name: 'Peptides' },
  { url: '/mens-health.html', name: 'Mens Health' },
  { url: '/recovery.html', name: 'Recovery' },
  { url: '/weight-management.html', name: 'Weight Management' },
  { url: '/pricing.html', name: 'Pricing' },
  { url: '/contact-us.html', name: 'Contact Us' },
  { url: '/get-started.html', name: 'Get Started' },
  // Product pages
  { url: '/sermorelin.html', name: 'Sermorelin' },
  { url: '/mots-c.html', name: 'MOTS-C' },
  { url: '/tesamorelin.html', name: 'Tesamorelin' },
  { url: '/epithalon.html', name: 'Epithalon' },
  { url: '/ghk-cu.html', name: 'GHK-Cu' },
  { url: '/cjc-1295-ipamorelin.html', name: 'CJC-1295 / Ipamorelin' },
  { url: '/epithalon-ghk-cu.html', name: 'Epithalon / GHK-Cu' },
  { url: '/tesamorelin-ipamorelin.html', name: 'Tesamorelin / Ipamorelin' },
  { url: '/aod-9604-mots-c.html', name: 'AOD-9604 / MOTS-C' },
  { url: '/aod-9604-mots-c-tesamorelin.html', name: 'AOD-9604 / MOTS-C / Tesamorelin' },
  { url: '/semax-selank.html', name: 'Semax / Selank' },
  { url: '/aod-9604.html', name: 'AOD-9604' },
];

// UX/UI Issue Detection Tests
test.describe('UX/UI Issue Detection', () => {

  for (const page of PAGES) {
    test.describe(`${page.name} Page`, () => {

      test('should load without errors', async ({ page: p }) => {
        const response = await p.goto(page.url);
        expect(response.status()).toBe(200);

        // Check for console errors
        const errors = [];
        p.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await p.waitForLoadState('networkidle');

        if (errors.length > 0) {
          console.log(`⚠️  Console errors on ${page.name}:`, errors);
        }
      });

      test('should not have horizontal scroll', async ({ page: p }) => {
        await p.goto(page.url);
        await p.waitForLoadState('networkidle');

        const hasHorizontalScroll = await p.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
          const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth);
          const clientWidth = await p.evaluate(() => document.documentElement.clientWidth);
          console.log(`❌ ISSUE: Horizontal scroll detected on ${page.name}`);
          console.log(`   Scroll width: ${scrollWidth}px, Viewport width: ${clientWidth}px`);
          console.log(`   Excess: ${scrollWidth - clientWidth}px`);
        }

        expect(hasHorizontalScroll).toBe(false);
      });

      test('should have visible navigation', async ({ page: p }) => {
        await p.goto(page.url);

        const nav = p.locator('nav, [role="navigation"]').first();
        await expect(nav).toBeVisible();

        // Check for logo
        const logo = p.locator('nav img, nav [class*="logo"]').first();
        const logoVisible = await logo.isVisible().catch(() => false);

        if (!logoVisible) {
          console.log(`⚠️  Logo not visible on ${page.name}`);
        }
      });

      test('should have working CTA buttons', async ({ page: p }) => {
        await p.goto(page.url);

        const ctaButtons = p.locator('a:has-text("Get Started"), a:has-text("Learn More"), button:has-text("Get Started"), button:has-text("Learn More")');
        const count = await ctaButtons.count();

        if (count === 0) {
          console.log(`⚠️  No CTA buttons found on ${page.name}`);
        }

        for (let i = 0; i < Math.min(count, 5); i++) {
          const button = ctaButtons.nth(i);
          const isVisible = await button.isVisible().catch(() => false);
          const isEnabled = await button.isEnabled().catch(() => true);

          if (!isVisible) {
            console.log(`❌ ISSUE: CTA button ${i+1} not visible on ${page.name}`);
          }
          if (!isEnabled) {
            console.log(`❌ ISSUE: CTA button ${i+1} disabled on ${page.name}`);
          }
        }
      });

      test('should not have broken images', async ({ page: p }) => {
        await p.goto(page.url);
        await p.waitForLoadState('networkidle');

        const brokenImages = await p.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.filter(img => !img.complete || img.naturalWidth === 0)
            .map(img => ({ src: img.src, alt: img.alt }));
        });

        if (brokenImages.length > 0) {
          console.log(`❌ ISSUE: ${brokenImages.length} broken images on ${page.name}:`);
          brokenImages.forEach((img, i) => {
            console.log(`   ${i+1}. ${img.src} (alt: "${img.alt}")`);
          });
        }

        expect(brokenImages.length).toBe(0);
      });

      test('should have readable font sizes (mobile)', async ({ page: p }) => {
        await p.setViewportSize({ width: 375, height: 667 });
        await p.goto(page.url);

        const smallText = await p.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('p, span, a, li, div'));
          const tooSmall = [];

          elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const fontSize = parseFloat(styles.fontSize);
            const text = el.textContent.trim();

            // Skip if element has no text or is hidden
            if (!text || fontSize === 0 || styles.display === 'none') return;

            if (fontSize < 14) {
              tooSmall.push({
                tag: el.tagName,
                fontSize: fontSize,
                text: text.substring(0, 50)
              });
            }
          });

          return tooSmall.slice(0, 10); // Limit to first 10
        });

        if (smallText.length > 0) {
          console.log(`⚠️  Small font sizes (<14px) on ${page.name} (mobile):`);
          smallText.forEach(item => {
            console.log(`   ${item.tag}: ${item.fontSize}px - "${item.text}"`);
          });
        }
      });

      test('should have mobile menu functionality', async ({ page: p }) => {
        await p.setViewportSize({ width: 375, height: 667 });
        await p.goto(page.url);

        // Look for mobile menu button
        const menuButton = p.locator('[aria-label*="menu" i], [class*="menu-button"], [class*="hamburger"], .mobile-menu-toggle').first();
        const hasMenuButton = await menuButton.isVisible().catch(() => false);

        if (!hasMenuButton) {
          console.log(`⚠️  No mobile menu button found on ${page.name}`);
          return;
        }

        // Try to click it
        try {
          await menuButton.click();
          await p.waitForTimeout(500);

          // Check if menu appeared
          const menuVisible = await p.locator('[class*="mobile-menu"], [class*="drawer"]').isVisible().catch(() => false);

          if (!menuVisible) {
            console.log(`❌ ISSUE: Mobile menu doesn't appear after click on ${page.name}`);
          }
        } catch (error) {
          console.log(`❌ ISSUE: Error clicking mobile menu on ${page.name}:`, error.message);
        }
      });

      test('should have accessible links', async ({ page: p }) => {
        await p.goto(page.url);

        const emptyLinks = await p.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          return links.filter(link => {
            const text = link.textContent.trim();
            const ariaLabel = link.getAttribute('aria-label');
            const title = link.getAttribute('title');

            return !text && !ariaLabel && !title && !link.querySelector('img[alt]');
          }).map((link, i) => ({
            href: link.href,
            index: i
          }));
        });

        if (emptyLinks.length > 0) {
          console.log(`❌ ISSUE: ${emptyLinks.length} empty/unlabeled links on ${page.name}`);
        }
      });

      test('should have proper heading hierarchy', async ({ page: p }) => {
        await p.goto(page.url);

        const headings = await p.evaluate(() => {
          const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          return h.map(el => ({
            level: parseInt(el.tagName[1]),
            text: el.textContent.trim().substring(0, 50)
          }));
        });

        // Check for multiple H1s
        const h1Count = headings.filter(h => h.level === 1).length;
        if (h1Count === 0) {
          console.log(`⚠️  No H1 found on ${page.name}`);
        } else if (h1Count > 1) {
          console.log(`⚠️  Multiple H1s found on ${page.name} (${h1Count})`);
        }

        // Check for skipped levels
        for (let i = 1; i < headings.length; i++) {
          if (headings[i].level > headings[i-1].level + 1) {
            console.log(`⚠️  Heading level skipped on ${page.name}: H${headings[i-1].level} → H${headings[i].level}`);
          }
        }
      });

      test('should have visible footer', async ({ page: p }) => {
        await p.goto(page.url);

        const footer = p.locator('footer, [role="contentinfo"]').first();
        const footerVisible = await footer.isVisible().catch(() => false);

        if (!footerVisible) {
          console.log(`❌ ISSUE: Footer not visible on ${page.name}`);
        }

        expect(footerVisible).toBe(true);
      });
    });
  }
});

// Form-specific tests
test.describe('Form Functionality', () => {

  test('Contact form should be functional', async ({ page }) => {
    await page.goto('/contact-us.html');

    const form = page.locator('form').first();
    const formExists = await form.isVisible().catch(() => false);

    if (!formExists) {
      console.log('❌ ISSUE: No form found on contact-us.html');
      return;
    }

    // Check for required form fields
    const nameField = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    const emailField = page.locator('input[type="email"], input[name*="email" i]').first();
    const messageField = page.locator('textarea, input[name*="message" i]').first();

    const hasName = await nameField.isVisible().catch(() => false);
    const hasEmail = await emailField.isVisible().catch(() => false);
    const hasMessage = await messageField.isVisible().catch(() => false);

    if (!hasName) console.log('⚠️  Name field not found in contact form');
    if (!hasEmail) console.log('⚠️  Email field not found in contact form');
    if (!hasMessage) console.log('⚠️  Message field not found in contact form');
  });

  test('Get started form should load', async ({ page }) => {
    await page.goto('/get-started.html');

    const form = page.locator('form, [class*="form"]').first();
    const formExists = await form.isVisible().catch(() => false);

    if (!formExists) {
      console.log('❌ ISSUE: No form visible on get-started.html');
    }
  });
});

// Layout & Visual Tests
test.describe('Layout & Visual Issues', () => {

  test('Product cards should not overlap (peptides page)', async ({ page }) => {
    await page.goto('/peptides.html');
    await page.waitForLoadState('networkidle');

    const overlaps = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="product-card"]'));
      const issues = [];

      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const rect1 = cards[i].getBoundingClientRect();
          const rect2 = cards[j].getBoundingClientRect();

          const overlap = !(rect1.right < rect2.left ||
                          rect1.left > rect2.right ||
                          rect1.bottom < rect2.top ||
                          rect1.top > rect2.bottom);

          if (overlap) {
            issues.push(`Card ${i+1} overlaps with card ${j+1}`);
          }
        }
      }

      return issues;
    });

    if (overlaps.length > 0) {
      console.log('❌ ISSUE: Product cards overlapping on peptides.html:');
      overlaps.forEach(issue => console.log(`   ${issue}`));
    }
  });

  test('Navigation should not cover content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navOverlap = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return false;

      const navRect = nav.getBoundingClientRect();
      const navStyles = window.getComputedStyle(nav);
      const isFixed = navStyles.position === 'fixed' || navStyles.position === 'sticky';

      if (!isFixed) return false;

      // Check if there's content under the nav
      const contentStart = document.querySelector('main, section, article');
      if (!contentStart) return false;

      const contentRect = contentStart.getBoundingClientRect();
      return contentRect.top < navRect.bottom;
    });

    if (navOverlap) {
      console.log('⚠️  Fixed navigation may be covering content on homepage');
    }
  });
});

// Performance checks
test.describe('Performance Issues', () => {

  test('Page should load in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('load');
    const loadTime = Date.now() - startTime;

    if (loadTime > 3000) {
      console.log(`⚠️  Homepage load time: ${loadTime}ms (>3 seconds)`);
    } else {
      console.log(`✓ Homepage load time: ${loadTime}ms`);
    }
  });
});
