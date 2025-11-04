# Competitor Analysis Tool

Automated competitor website analysis using Playwright. Captures screenshots, analyzes design patterns, and generates detailed reports.

## Features

- 📸 Full-page screenshots (desktop + mobile)
- 🎨 Automatic color extraction
- 📝 Typography analysis
- 🔍 Page structure mapping
- 🛡️ Trust signal detection
- 📊 CTA and form analysis
- 📄 Markdown reports + JSON data

## Setup

Playwright should already be installed. If not:

```bash
npm install
npx playwright install chromium
```

## Usage

### Analyze a Single Competitor

```bash
node analyze-competitor.js <name> <url>
```

**Example:**
```bash
node analyze-competitor.js hims "https://www.forhims.com/testosterone-replacement-therapy"
```

### Analyze All Competitors (Batch Mode)

1. **Update `competitors-config.json`** with your competitor URLs:

```json
{
  "competitors": [
    {
      "name": "hims-trt",
      "url": "https://www.forhims.com/testosterone-replacement-therapy",
      "description": "Hims TRT page",
      "category": "mens-health"
    }
  ]
}
```

2. **Run batch analysis:**

```bash
node analyze-all.js
```

Or using npm:

```bash
npm run analyze-competitors
```

## Output

### Screenshots
Saved to `screenshots/<competitor-name>/`:
- `full-page-desktop.png` - Full desktop page
- `hero-desktop.png` - Above-the-fold desktop
- `full-page-mobile.png` - Full mobile page

### Reports
Saved to `reports/`:
- `<competitor-name>-report.md` - Human-readable analysis
- `<competitor-name>-data.json` - Raw structured data
- `analysis-summary.json` - Batch analysis results

## What Gets Analyzed

### Hero Section
- Headline and subheadline
- CTA buttons (text and links)
- Background type (image/color)

### Design System
- Button colors
- Typography (fonts, sizes, weights)
- Heading styles (h1, h2, h3)
- Body text styles

### Page Structure
- Section count and order
- Section headings
- Content hierarchy

### Conversion Elements
- All CTAs on page
- Form locations and field counts
- CTA positioning

### Trust Signals
- Testimonials/reviews count
- Doctor/physician images
- Stats and metrics displayed

## Recommended Competitors to Analyze

### Direct Telehealth Competitors
- **Hims & Hers**: forhims.com, forhers.com
- **Ro**: ro.co
- **Maximus**: maximustribe.com
- **Fridays**: getfridays.com

### Specific Treatment Pages
- TRT/Testosterone pages
- Weight loss/GLP-1 pages
- Peptide therapy pages
- Hair restoration pages

## Tips

1. **Analyze multiple pages per competitor**: Homepage, category pages, product pages
2. **Compare similar pages**: All TRT pages together, all weight loss pages together
3. **Look for patterns**: What do ALL top competitors do consistently?
4. **Note the differences**: What makes each unique?

## Troubleshooting

**Issue:** Page won't load
- Check the URL is correct and publicly accessible
- Increase timeout in code if site is slow
- Check your internet connection

**Issue:** Screenshots are blank
- Site might block headless browsers
- Try adding `headless: false` in the code temporarily

**Issue:** Missing data in report
- Site might use unusual HTML structure
- Manually review screenshots and note findings

## Next Steps

After running analysis:
1. Review all reports and screenshots
2. Identify common design patterns
3. Note conversion best practices
4. Document competitive advantages
5. Create master design system based on findings
