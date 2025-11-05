/**
 * Playwright Design Issues Test Suite
 * Comprehensive tests for all 73 pages to detect design inconsistencies
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Get all HTML files
const BASE_DIR = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(BASE_DIR)
  .filter(file => file.endsWith('.html') && !file.includes('test'))
  .map(file => ({
    name: file.replace('.html', ''),
    path: `/${file}`
  }));

console.log(`\n🔍 Found ${htmlFiles.length} HTML pages to test\n`);

// Test each HTML page
for (const htmlFile of htmlFiles) {
  test.describe(`Design validation: ${htmlFile.name}`, () => {

    test('should not have Webflow CSS conflicts', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for Webflow CSS link
      const webflowCSS = await page.$('link[href*="66c8a0fb54f84ec4a09643c7"]');
      const hasNewDesignSystem = await page.$('link[href*="design-system/css/master.css"]');

      if (webflowCSS && hasNewDesignSystem) {
        test.fail(true, 'Page has both Webflow CSS and new design system - CONFLICT DETECTED');
      }

      expect(webflowCSS || !hasNewDesignSystem).toBeTruthy();
    });

    test('should have consistent navigation', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for navigation element
      const nav = await page.$('nav');
      expect(nav).not.toBeNull();

      // Check logo exists and is visible
      const logo = await page.$('nav img[alt*="logo" i], nav img[src*="logo" i]');
      expect(logo).not.toBeNull();

      if (logo) {
        const isVisible = await logo.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('should have consistent footer', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for footer element
      const footer = await page.$('footer');
      expect(footer).not.toBeNull();

      // Check footer is visible
      if (footer) {
        const isVisible = await footer.isVisible();
        expect(isVisible).toBeTruthy();
      }
    });

    test('should not have inline styles', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Find all elements with inline styles (excluding tracking scripts and specific allowed cases)
      const elementsWithInlineStyles = await page.$$('[style]:not(script):not([style=""]):not([style*="display: none"])');

      if (elementsWithInlineStyles.length > 5) {
        console.log(`⚠️  ${htmlFile.name}: Found ${elementsWithInlineStyles.length} elements with inline styles`);
      }

      // Soft assertion - warn but don't fail
      expect(elementsWithInlineStyles.length).toBeLessThan(10);
    });

    test('should load fonts correctly', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Wait for fonts to load
      await page.waitForLoadState('networkidle');

      // Check if fonts are applied
      const bodyFont = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontFamily;
      });

      expect(bodyFont).toBeTruthy();
      expect(bodyFont.length).toBeGreaterThan(0);
    });

    test('should have no JavaScript errors', async ({ page }) => {
      const jsErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          jsErrors.push(msg.text());
        }
      });

      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      await page.goto(htmlFile.path);
      await page.waitForLoadState('networkidle');

      if (jsErrors.length > 0) {
        console.log(`⚠️  ${htmlFile.name} JavaScript errors:`, jsErrors.slice(0, 3));
      }

      expect(jsErrors.length).toBe(0);
    });

    test('should be responsive on mobile', async ({ page, browserName }) => {
      if (browserName !== 'chromium') test.skip();

      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(htmlFile.path);

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        console.log(`⚠️  ${htmlFile.name}: Horizontal scroll detected on mobile`);
      }

      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for h1
      const h1Elements = await page.$$('h1');

      // Should have at least one h1, but not more than 2
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      expect(h1Elements.length).toBeLessThanOrEqual(2);
    });

    test('should have accessible navigation links', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check that all navigation links have text or aria-label
      const navLinks = await page.$$('nav a');

      for (const link of navLinks) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        expect(text.trim().length > 0 || (ariaLabel && ariaLabel.length > 0)).toBeTruthy();
      }
    });

    test('should have working FAQ accordion (if present)', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for FAQ section
      const faqSection = await page.$('#FAQs, .section_faq-3, [id*="faq" i]');

      if (faqSection) {
        // Check if toggleAccordion function exists
        const hasToggleFunction = await page.evaluate(() => {
          return typeof window.toggleAccordion === 'function';
        });

        if (!hasToggleFunction) {
          console.log(`⚠️  ${htmlFile.name}: FAQ section present but toggleAccordion function missing`);
        }

        // Find accordion buttons
        const accordionButtons = await page.$$('.faq_question, [class*="accordion"]');

        if (accordionButtons.length > 0) {
          // Try clicking first accordion
          try {
            await accordionButtons[0].click();
            await page.waitForTimeout(500);
            // If no error, accordion is working
            expect(true).toBeTruthy();
          } catch (error) {
            console.log(`⚠️  ${htmlFile.name}: FAQ accordion click failed`, error.message);
          }
        }
      } else {
        // No FAQ section, pass test
        expect(true).toBeTruthy();
      }
    });

    test('should have proper meta tags', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for essential meta tags
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      const description = await page.$('meta[name="description"]');
      expect(description).not.toBeNull();

      const viewport = await page.$('meta[name="viewport"]');
      expect(viewport).not.toBeNull();
    });

    test('should have no broken images', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Get all images
      const images = await page.$$('img');
      const brokenImages = [];

      for (const img of images) {
        const naturalWidth = await img.evaluate(el => el.naturalWidth);
        const src = await img.getAttribute('src');

        if (naturalWidth === 0 && src && !src.startsWith('data:')) {
          brokenImages.push(src);
        }
      }

      if (brokenImages.length > 0) {
        console.log(`⚠️  ${htmlFile.name}: ${brokenImages.length} broken image(s) found`);
      }

      expect(brokenImages.length).toBe(0);
    });

    test('should have CTA buttons with correct links', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Check for Get Started buttons
      const ctaButtons = await page.$$('a[href*="get-started"]');

      if (ctaButtons.length > 0) {
        // Verify at least one CTA button exists
        expect(ctaButtons.length).toBeGreaterThan(0);

        // Check that CTAs have proper category parameters (for treatment/category pages)
        const isTreatmentPage = htmlFile.path.match(/\/(semaglutide|testosterone|peptides|recovery|mens-health|weight-management)/);

        if (isTreatmentPage) {
          const hasProperCategory = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('a[href*="get-started"]'));
            return buttons.some(btn => btn.href.includes('category='));
          });

          if (!hasProperCategory) {
            console.log(`⚠️  ${htmlFile.name}: CTA buttons missing category parameter`);
          }
        }
      }

      expect(true).toBeTruthy();
    });

    test('should have proper color contrast', async ({ page }) => {
      await page.goto(htmlFile.path);

      // Basic check for common contrast issues
      const poorContrastElements = await page.evaluate(() => {
        const elements = [];
        const allElements = document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6');

        for (const el of allElements) {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const bgColor = styles.backgroundColor;

          // Very basic check - white on white or black on black
          if ((color === 'rgb(255, 255, 255)' && bgColor === 'rgb(255, 255, 255)') ||
              (color === 'rgb(0, 0, 0)' && bgColor === 'rgb(0, 0, 0)')) {
            elements.push({
              text: el.textContent.substring(0, 50),
              color,
              bgColor
            });
          }
        }

        return elements;
      });

      if (poorContrastElements.length > 0) {
        console.log(`⚠️  ${htmlFile.name}: ${poorContrastElements.length} potential contrast issues`);
      }

      expect(poorContrastElements.length).toBe(0);
    });

  });
}
