/**
 * Competitor Website Analysis Script
 * Uses Playwright to analyze competitor websites and extract design patterns
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class CompetitorAnalyzer {
  constructor(url, name) {
    this.url = url;
    this.name = name;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.screenshotDir = path.join(__dirname, 'screenshots', this.name);
    this.reportDir = path.join(__dirname, 'reports');
  }

  async init() {
    // Create directories
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async analyze() {
    console.log(`\n🔍 Analyzing: ${this.name} (${this.url})\n`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    const page = await context.newPage();

    try {
      // Navigate to page
      console.log('📄 Loading page...');
      await page.goto(this.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000); // Wait for animations

      // Capture full page screenshot (desktop)
      console.log('📸 Capturing desktop screenshot...');
      await page.screenshot({
        path: path.join(this.screenshotDir, 'full-page-desktop.png'),
        fullPage: true
      });

      // Capture above-the-fold
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.screenshot({
        path: path.join(this.screenshotDir, 'hero-desktop.png'),
        fullPage: false
      });

      // Capture mobile view
      console.log('📱 Capturing mobile screenshot...');
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(this.screenshotDir, 'full-page-mobile.png'),
        fullPage: true
      });

      // Reset to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Extract page structure and design elements
      console.log('🔬 Analyzing page structure...');
      const analysis = await page.evaluate(() => {
        const results = {
          title: document.title,
          url: window.location.href,

          // Hero section analysis
          hero: {
            exists: false,
            headline: null,
            subheadline: null,
            cta: [],
            backgroundType: null
          },

          // Color analysis
          colors: {
            backgrounds: [],
            texts: [],
            buttons: []
          },

          // Typography
          typography: {
            headings: [],
            bodyFonts: []
          },

          // Layout structure
          sections: [],

          // CTAs found
          ctas: [],

          // Forms
          forms: [],

          // Images
          images: {
            total: 0,
            types: {}
          },

          // Trust signals
          trustSignals: {
            testimonials: 0,
            doctorImages: 0,
            certifications: 0,
            stats: []
          }
        };

        // Analyze hero section (usually first section or header area)
        const heroSelectors = ['section:first-of-type', 'header + section', '[class*="hero"]', '[class*="banner"]'];
        for (const selector of heroSelectors) {
          const heroEl = document.querySelector(selector);
          if (heroEl) {
            results.hero.exists = true;

            // Find headline
            const h1 = heroEl.querySelector('h1');
            if (h1) results.hero.headline = h1.textContent.trim();

            // Find subheadline
            const h2 = heroEl.querySelector('h2, p');
            if (h2) results.hero.subheadline = h2.textContent.trim().substring(0, 200);

            // Find CTAs
            const buttons = heroEl.querySelectorAll('a[class*="button"], button, a[class*="cta"]');
            buttons.forEach(btn => {
              results.hero.cta.push({
                text: btn.textContent.trim(),
                href: btn.href || null
              });
            });

            // Background type
            const bgImage = window.getComputedStyle(heroEl).backgroundImage;
            results.hero.backgroundType = bgImage !== 'none' ? 'image' : 'color';

            break;
          }
        }

        // Extract colors from buttons
        document.querySelectorAll('button, a[class*="button"], a[class*="cta"]').forEach(btn => {
          const styles = window.getComputedStyle(btn);
          const bgColor = styles.backgroundColor;
          const textColor = styles.color;

          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            results.colors.buttons.push(bgColor);
          }
        });

        // Extract typography
        ['h1', 'h2', 'h3'].forEach(tag => {
          const el = document.querySelector(tag);
          if (el) {
            const styles = window.getComputedStyle(el);
            results.typography.headings.push({
              tag,
              fontFamily: styles.fontFamily,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              lineHeight: styles.lineHeight
            });
          }
        });

        const bodyEl = document.querySelector('p, body');
        if (bodyEl) {
          const styles = window.getComputedStyle(bodyEl);
          results.typography.bodyFonts.push({
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight
          });
        }

        // Count sections
        document.querySelectorAll('section').forEach((section, idx) => {
          const heading = section.querySelector('h1, h2, h3');
          results.sections.push({
            index: idx,
            heading: heading ? heading.textContent.trim().substring(0, 100) : 'No heading',
            classes: section.className
          });
        });

        // Find all CTAs
        document.querySelectorAll('a[class*="button"], button, a[class*="cta"]').forEach(btn => {
          results.ctas.push({
            text: btn.textContent.trim(),
            href: btn.href || null,
            position: btn.getBoundingClientRect().top
          });
        });

        // Analyze forms
        document.querySelectorAll('form').forEach(form => {
          const inputs = form.querySelectorAll('input, select, textarea');
          results.forms.push({
            action: form.action || null,
            fields: inputs.length
          });
        });

        // Count images
        const images = document.querySelectorAll('img');
        results.images.total = images.length;
        images.forEach(img => {
          const src = img.src.toLowerCase();
          if (src.includes('doctor') || src.includes('physician') || src.includes('md')) {
            results.trustSignals.doctorImages++;
          }
        });

        // Look for testimonials
        const testimonialSelectors = ['[class*="testimonial"]', '[class*="review"]', '[class*="quote"]'];
        testimonialSelectors.forEach(selector => {
          results.trustSignals.testimonials += document.querySelectorAll(selector).length;
        });

        // Look for stats/numbers
        document.querySelectorAll('[class*="stat"], [class*="number"], [class*="metric"]').forEach(el => {
          const text = el.textContent.trim();
          if (/\d/.test(text)) {
            results.trustSignals.stats.push(text.substring(0, 50));
          }
        });

        return results;
      });

      // Generate report
      console.log('📝 Generating report...');
      const report = this.generateReport(analysis);

      // Save JSON data
      fs.writeFileSync(
        path.join(this.reportDir, `${this.name}-data.json`),
        JSON.stringify(analysis, null, 2)
      );

      // Save markdown report
      fs.writeFileSync(
        path.join(this.reportDir, `${this.name}-report.md`),
        report
      );

      console.log(`✅ Analysis complete for ${this.name}!`);
      console.log(`📂 Screenshots saved to: ${this.screenshotDir}`);
      console.log(`📄 Report saved to: ${this.reportDir}/${this.name}-report.md\n`);

      return analysis;

    } catch (error) {
      console.error(`❌ Error analyzing ${this.name}:`, error.message);
      throw error;
    } finally {
      await browser.close();
    }
  }

  generateReport(data) {
    return `# Competitor Analysis: ${this.name}

**URL:** ${data.url}
**Analyzed:** ${new Date().toLocaleDateString()}
**Page Title:** ${data.title}

---

## 🎯 Hero Section

${data.hero.exists ? `
**Headline:** ${data.hero.headline || 'N/A'}

**Subheadline:** ${data.hero.subheadline || 'N/A'}

**CTAs in Hero:**
${data.hero.cta.map(cta => `- "${cta.text}" → ${cta.href || 'No link'}`).join('\n') || '- None found'}

**Background Type:** ${data.hero.backgroundType}
` : 'No hero section detected'}

---

## 🎨 Design System

### Colors
**Button Colors Found:**
${data.colors.buttons.slice(0, 10).map(c => `- ${c}`).join('\n') || '- None extracted'}

### Typography
**Headings:**
${data.typography.headings.map(h => `
- **${h.tag}**: ${h.fontFamily} | ${h.fontSize} | Weight: ${h.fontWeight}
`).join('') || '- No heading data'}

**Body Text:**
${data.typography.bodyFonts.map(f => `
- Font: ${f.fontFamily} | Size: ${f.fontSize} | Line Height: ${f.lineHeight}
`).join('') || '- No body text data'}

---

## 📐 Page Structure

**Total Sections:** ${data.sections.length}

${data.sections.slice(0, 10).map(s => `
${s.index + 1}. **${s.heading}**
   - Classes: \`${s.classes || 'none'}\`
`).join('') || '- No sections found'}

---

## 🔘 Call-to-Actions

**Total CTAs Found:** ${data.ctas.length}

**Top CTAs by position:**
${data.ctas.slice(0, 10).map((cta, idx) => `
${idx + 1}. "${cta.text}" (${Math.round(cta.position)}px from top)
`).join('') || '- None found'}

---

## 📝 Forms

**Total Forms:** ${data.forms.length}

${data.forms.map((form, idx) => `
**Form ${idx + 1}:**
- Fields: ${form.fields}
- Action: ${form.action || 'None'}
`).join('\n') || '- No forms found'}

---

## 🛡️ Trust Signals

- **Testimonials/Reviews:** ${data.trustSignals.testimonials} elements found
- **Doctor/Physician Images:** ${data.trustSignals.doctorImages} found
- **Stats/Metrics Displayed:**
${data.trustSignals.stats.slice(0, 5).map(s => `  - ${s}`).join('\n') || '  - None found'}

---

## 🖼️ Images

**Total Images:** ${data.images.total}

---

## 📸 Screenshots

- Desktop full page: \`screenshots/${this.name}/full-page-desktop.png\`
- Desktop hero: \`screenshots/${this.name}/hero-desktop.png\`
- Mobile full page: \`screenshots/${this.name}/full-page-mobile.png\`

---

## 💡 Key Takeaways

### Strengths
- [To be filled in manually after review]

### Conversion Elements
- [To be filled in manually after review]

### Design Patterns to Consider
- [To be filled in manually after review]

---

*Analysis generated by Competitor Analyzer v1.0*
`;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node analyze-competitor.js <name> <url>

Example:
  node analyze-competitor.js hims https://forhims.com/testosterone-replacement-therapy

Arguments:
  name - Short name for the competitor (e.g., "hims", "ro", "maximus")
  url  - Full URL to analyze
    `);
    process.exit(1);
  }

  const [name, url] = args;

  const analyzer = new CompetitorAnalyzer(url, name);
  analyzer.init().then(() => analyzer.analyze());
}

module.exports = CompetitorAnalyzer;
