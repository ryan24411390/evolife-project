const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class LocalPageAnalyzer {
  constructor(url, name) {
    this.url = url;
    this.name = name;
    this.screenshotDir = path.join(__dirname, 'page-analysis', 'screenshots');
    this.reportPath = path.join(__dirname, 'page-analysis', `${this.name}-analysis.md`);
    this.issues = [];
  }

  async analyze() {
    console.log(`\n🔍 Analyzing: ${this.url}\n`);

    // Create directories
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    try {
      // Navigate to page
      await page.goto(this.url, { waitUntil: 'networkidle', timeout: 30000 });

      console.log('✅ Page loaded successfully\n');

      // 1. Capture Full Page Screenshots
      console.log('📸 Capturing screenshots...');
      await this.captureScreenshots(page);

      // 2. Check for broken images
      console.log('🖼️  Checking images...');
      await this.checkImages(page);

      // 3. Check for broken links
      console.log('🔗 Checking links...');
      await this.checkLinks(page);

      // 4. Check layout/responsive issues
      console.log('📱 Checking responsive design...');
      await this.checkResponsive(page, context);

      // 5. Check accessibility
      console.log('♿ Checking accessibility...');
      await this.checkAccessibility(page);

      // 6. Check typography and design system
      console.log('🎨 Checking design system...');
      await this.checkDesignSystem(page);

      // 7. Check for console errors
      if (consoleErrors.length > 0) {
        this.addIssue('Console Errors', `Found ${consoleErrors.length} console errors`, 'high', consoleErrors);
      }

      if (pageErrors.length > 0) {
        this.addIssue('Page Errors', `Found ${pageErrors.length} JavaScript errors`, 'high', pageErrors);
      }

      // 8. Generate Report
      console.log('📝 Generating report...');
      await this.generateReport();

      console.log(`\n✅ Analysis complete! Report saved to: ${this.reportPath}\n`);

    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
      this.addIssue('Critical Error', 'Page failed to load or analyze', 'critical', [error.message]);
      await this.generateReport();
    } finally {
      await browser.close();
    }
  }

  async captureScreenshots(page) {
    // Full page desktop
    await page.screenshot({
      path: path.join(this.screenshotDir, `${this.name}-desktop-full.png`),
      fullPage: true
    });

    // Hero section
    const hero = await page.$('section.hero, .hero');
    if (hero) {
      await hero.screenshot({
        path: path.join(this.screenshotDir, `${this.name}-hero.png`)
      });
    }

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(this.screenshotDir, `${this.name}-mobile-full.png`),
      fullPage: true
    });

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  }

  async checkImages(page) {
    const images = await page.$$('img');
    const brokenImages = [];
    const missingAlt = [];

    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);

      // Check if image loaded
      if (naturalWidth === 0) {
        brokenImages.push(src || 'unknown src');
      }

      // Check for alt text
      if (!alt || alt.trim() === '') {
        missingAlt.push(src || 'unknown src');
      }
    }

    if (brokenImages.length > 0) {
      this.addIssue('Broken Images', `${brokenImages.length} images failed to load`, 'high', brokenImages);
    }

    if (missingAlt.length > 0) {
      this.addIssue('Missing Alt Text', `${missingAlt.length} images missing alt text`, 'medium', missingAlt);
    }

    console.log(`   Found ${images.length} images, ${brokenImages.length} broken, ${missingAlt.length} missing alt`);
  }

  async checkLinks(page) {
    const links = await page.$$('a[href]');
    const issues = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();

      // Check for empty links
      if (!href || href === '#' || href === '') {
        issues.push(`Empty/placeholder link: "${text.trim()}"`);
      }

      // Check for proper link text
      if (!text || text.trim() === '') {
        issues.push(`Link with no text: ${href}`);
      }
    }

    if (issues.length > 0) {
      this.addIssue('Link Issues', `Found ${issues.length} link problems`, 'medium', issues);
    }

    console.log(`   Found ${links.length} links, ${issues.length} with issues`);
  }

  async checkResponsive(page, context) {
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    const issues = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Wait for reflow

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        issues.push(`Horizontal scroll detected on ${viewport.name} (${viewport.width}px)`);
      }

      // Check for overlapping elements
      const overlaps = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('section, div, p, h1, h2, h3'));
        const overlapping = [];

        for (let i = 0; i < elements.length; i++) {
          const rect1 = elements[i].getBoundingClientRect();
          for (let j = i + 1; j < elements.length; j++) {
            const rect2 = elements[j].getBoundingClientRect();
            // Simple overlap check
            if (rect1.left < rect2.right &&
                rect1.right > rect2.left &&
                rect1.top < rect2.bottom &&
                rect1.bottom > rect2.top) {
              // Check if one contains the other (not an issue)
              const contains = elements[i].contains(elements[j]) || elements[j].contains(elements[i]);
              if (!contains && rect1.width > 0 && rect2.width > 0) {
                overlapping.push({
                  element1: elements[i].tagName,
                  element2: elements[j].tagName
                });
              }
            }
          }
        }
        return overlapping.slice(0, 5); // Limit to first 5
      });

      if (overlaps.length > 0) {
        issues.push(`Potential overlapping elements on ${viewport.name}: ${overlaps.length} found`);
      }
    }

    if (issues.length > 0) {
      this.addIssue('Responsive Issues', 'Layout problems at different viewport sizes', 'high', issues);
    }

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log(`   Tested ${viewports.length} viewports, ${issues.length} issues found`);
  }

  async checkAccessibility(page) {
    const a11yIssues = [];

    // Check heading hierarchy
    const headings = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return h.map(el => ({ tag: el.tagName, text: el.textContent.trim().substring(0, 50) }));
    });

    const h1Count = headings.filter(h => h.tag === 'H1').length;
    if (h1Count === 0) {
      a11yIssues.push('Missing H1 heading');
    } else if (h1Count > 1) {
      a11yIssues.push(`Multiple H1 headings found (${h1Count})`);
    }

    // Check for color contrast (simplified)
    const contrastIssues = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button'));
      const issues = [];

      for (const el of elements.slice(0, 50)) { // Check first 50
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bg = styles.backgroundColor;

        // Simple check for very light text on light bg
        if (color.includes('rgba(255, 255, 255, 0.') && bg.includes('rgb(255, 255, 255)')) {
          issues.push(`Potential contrast issue: ${el.tagName}`);
        }
      }
      return issues.slice(0, 5);
    });

    if (contrastIssues.length > 0) {
      a11yIssues.push(...contrastIssues);
    }

    // Check form labels
    const formIssues = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      const unlabeled = [];

      for (const input of inputs) {
        const id = input.id;
        const ariaLabel = input.getAttribute('aria-label');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);

        if (!hasLabel && !ariaLabel && input.type !== 'hidden') {
          unlabeled.push(`${input.type || input.tagName} without label`);
        }
      }
      return unlabeled;
    });

    if (formIssues.length > 0) {
      a11yIssues.push(...formIssues);
    }

    // Check button accessibility
    const buttonIssues = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn'));
      const issues = [];

      for (const btn of buttons) {
        const text = btn.textContent.trim();
        const ariaLabel = btn.getAttribute('aria-label');

        if (!text && !ariaLabel) {
          issues.push('Button with no text or aria-label');
        }
      }
      return issues;
    });

    if (buttonIssues.length > 0) {
      a11yIssues.push(...buttonIssues);
    }

    if (a11yIssues.length > 0) {
      this.addIssue('Accessibility Issues', `Found ${a11yIssues.length} accessibility concerns`, 'high', a11yIssues);
    }

    console.log(`   Found ${a11yIssues.length} accessibility issues`);
  }

  async checkDesignSystem(page) {
    const designIssues = [];

    // Check if design system CSS is loaded
    const cssLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const designSystemCSS = links.find(link => link.href.includes('design-system'));
      return !!designSystemCSS;
    });

    if (!cssLoaded) {
      designIssues.push('Design system CSS not found in <link> tags');
    }

    // Check for inline styles (should be minimal)
    const inlineStyles = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[style]'));
      return elements.length;
    });

    if (inlineStyles > 20) {
      designIssues.push(`Excessive inline styles: ${inlineStyles} elements (should use CSS classes)`);
    }

    // Check font loading
    const fontsLoaded = await page.evaluate(() => {
      const computed = window.getComputedStyle(document.body);
      const fontFamily = computed.fontFamily;
      return {
        bodyFont: fontFamily,
        hasInter: fontFamily.includes('Inter'),
        hasDMSerif: fontFamily.includes('DM Serif')
      };
    });

    if (!fontsLoaded.hasInter && !fontsLoaded.hasDMSerif) {
      designIssues.push('Design system fonts (Inter, DM Serif Display) not detected');
    }

    // Check for common component classes
    const componentsUsed = await page.evaluate(() => {
      const classes = ['btn', 'card', 'hero', 'stats-bar', 'accordion', 'testimonial'];
      const found = {};

      for (const cls of classes) {
        found[cls] = document.querySelector(`.${cls}`) !== null;
      }
      return found;
    });

    const missingComponents = Object.entries(componentsUsed)
      .filter(([name, found]) => !found)
      .map(([name]) => name);

    if (missingComponents.length > 0) {
      designIssues.push(`Components not detected: ${missingComponents.join(', ')}`);
    }

    if (designIssues.length > 0) {
      this.addIssue('Design System Issues', 'Problems with design system implementation', 'medium', designIssues);
    }

    console.log(`   Design system check: ${designIssues.length} issues found`);
  }

  addIssue(title, description, severity, details = []) {
    this.issues.push({
      title,
      description,
      severity,
      details
    });
  }

  async generateReport() {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedIssues = this.issues.sort((a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity]
    );

    let report = `# Page Analysis Report: ${this.name}\n\n`;
    report += `**URL:** ${this.url}\n`;
    report += `**Analysis Date:** ${new Date().toISOString()}\n`;
    report += `**Total Issues Found:** ${this.issues.length}\n\n`;

    if (this.issues.length === 0) {
      report += `## ✅ No Issues Found!\n\nThe page appears to be working correctly with no major issues detected.\n`;
    } else {
      report += `## Issues Summary\n\n`;

      const severityCounts = {
        critical: sortedIssues.filter(i => i.severity === 'critical').length,
        high: sortedIssues.filter(i => i.severity === 'high').length,
        medium: sortedIssues.filter(i => i.severity === 'medium').length,
        low: sortedIssues.filter(i => i.severity === 'low').length
      };

      report += `- 🔴 Critical: ${severityCounts.critical}\n`;
      report += `- 🟠 High: ${severityCounts.high}\n`;
      report += `- 🟡 Medium: ${severityCounts.medium}\n`;
      report += `- 🟢 Low: ${severityCounts.low}\n\n`;

      report += `---\n\n`;

      for (const issue of sortedIssues) {
        const icon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[issue.severity];

        report += `## ${icon} ${issue.title}\n\n`;
        report += `**Severity:** ${issue.severity.toUpperCase()}\n`;
        report += `**Description:** ${issue.description}\n\n`;

        if (issue.details.length > 0) {
          report += `**Details:**\n`;
          for (const detail of issue.details) {
            report += `- ${detail}\n`;
          }
          report += `\n`;
        }

        report += `---\n\n`;
      }
    }

    report += `## Screenshots\n\n`;
    report += `Screenshots saved to: \`${this.screenshotDir}\`\n\n`;
    report += `- Desktop full page: \`${this.name}-desktop-full.png\`\n`;
    report += `- Mobile full page: \`${this.name}-mobile-full.png\`\n`;
    report += `- Hero section: \`${this.name}-hero.png\`\n`;

    fs.writeFileSync(this.reportPath, report);
  }
}

// Run analysis
const analyzer = new LocalPageAnalyzer(
  'http://localhost:8080/semaglutide-new.html',
  'semaglutide-new'
);

analyzer.analyze().catch(console.error);
