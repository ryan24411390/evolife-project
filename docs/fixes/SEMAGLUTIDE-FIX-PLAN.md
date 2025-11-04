# Semaglutide Page - Fix Plan

**Date:** November 3, 2025
**Analysis Source:** Playwright automated testing
**Page:** `semaglutide-new.html`
**Issues Found:** 3 (1 High, 2 Medium)

---

## 📊 Analysis Summary

### ✅ What's Working Well:
- Page loads successfully (200 OK)
- Navigation visible and functional
- Hero section displays properly
- Stats bar shows correct information
- Mobile viewport renders without horizontal scroll
- No broken images (1 image loaded properly)
- No accessibility issues detected (proper H1, no contrast problems)
- 15 links present and functional

### ⚠️ Issues to Fix:
1. **HIGH**: Responsive layout - overlapping elements detected
2. **MEDIUM**: Navigation link missing text
3. **MEDIUM**: Design system fonts not loading
4. **MEDIUM**: Excessive inline styles (22 elements)

---

## 🔴 Issue #1: Responsive Layout Problems (HIGH)

### Problem:
Playwright detected potential overlapping elements on ALL viewport sizes:
- iPhone SE (375px): 5 overlapping elements
- iPhone 11 (414px): 5 overlapping elements
- iPad (768px): 5 overlapping elements
- Desktop (1920px): 5 overlapping elements

### Root Cause:
Likely caused by:
1. Fixed positioning without proper z-index management
2. Absolute positioned elements without parent constraints
3. Flexbox/Grid gaps not properly set
4. Padding/margin issues causing overflow

### Fix Plan:

#### Step 1: Identify Overlapping Elements
```javascript
// Run this in browser console to find overlaps
document.querySelectorAll('section, .hero, .stats-bar, .card').forEach(el => {
  const rect = el.getBoundingClientRect();
  console.log(el.className, rect);
});
```

#### Step 2: Fix Common Culprits
- **Navigation overlap with hero**: Add proper margin-top to hero section
- **Floating elements**: Review any `position: absolute` or `position: fixed`
- **Card grids**: Ensure proper grid gaps (should be 24px minimum)
- **Section padding**: Verify consistent padding (mobile: 40px 16px, desktop: 80px 24px)

#### Step 3: Add Proper Spacing Classes
Replace inline spacing with utility classes:
```css
.section--padded {
  padding: 80px 24px;
}

@media (max-width: 768px) {
  .section--padded {
    padding: 40px 16px;
  }
}
```

#### Step 4: Fix Z-Index Layers
Establish proper stacking context:
```css
/* Z-index hierarchy */
.navigation { z-index: 1000; }
.modal, .dropdown { z-index: 2000; }
.hero { z-index: 1; }
.content { z-index: 1; }
```

---

## 🟡 Issue #2: Link with No Text (MEDIUM)

### Problem:
Found 1 link pointing to `index.html` with no visible text.

### Location:
Likely in the navigation or a hidden "Back to Home" link.

### Fix Plan:

#### Step 1: Locate the Link
Search in `semaglutide-new.html` for:
```html
<a href="index.html"></a>
<!-- or -->
<a href="index.html"><!-- empty --></a>
```

#### Step 2: Add Proper Link Text
Two options:

**Option A - Logo Link (if it's the Evolife logo):**
```html
<a href="index.html" class="logo" aria-label="EvoLife Home">
  <img src="/images/logo.svg" alt="EvoLife">
</a>
```

**Option B - Text Link:**
```html
<a href="index.html" class="nav__link">Home</a>
```

#### Step 3: Verify Accessibility
- Ensure all links have visible text OR aria-label
- Test with screen reader to confirm link purpose is clear

---

## 🟡 Issue #3: Fonts Not Loading (MEDIUM)

### Problem:
Design system fonts (Inter & DM Serif Display) not detected by Playwright.

### Expected Fonts:
- **Body text**: Inter (sans-serif)
- **Headlines**: DM Serif Display (serif)

### Root Cause:
1. Font link may be incorrect or missing
2. Font loading might be timing out
3. Font family names might be misspelled in CSS

### Fix Plan:

#### Step 1: Verify Google Fonts Link
Current link should be:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Check:**
- ✅ Correct URL format
- ✅ Both fonts included
- ✅ Proper weights specified
- ✅ `display=swap` for performance

#### Step 2: Fix CSS Variable References
In `01-variables.css`, ensure:
```css
:root {
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**Common mistakes to avoid:**
- ❌ `font-family: Inter;` (missing quotes)
- ❌ `font-family: "Inter";` (wrong quote style)
- ✅ `font-family: 'Inter', sans-serif;` (correct)

#### Step 3: Add Font Loading CSS
Add to `<head>` for better performance:
```css
<style>
  /* Prevent FOUT (Flash of Unstyled Text) */
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  h1, h2, h3, .display-md, .display-lg {
    font-family: 'DM Serif Display', Georgia, serif;
  }
</style>
```

#### Step 4: Test Font Loading
```javascript
// Run in console after page load
document.fonts.forEach(font => {
  console.log(font.family, font.loaded);
});
```

---

## 🟡 Issue #4: Excessive Inline Styles (MEDIUM)

### Problem:
22 elements have inline `style=""` attributes instead of using CSS classes.

### Why This Matters:
- ❌ Harder to maintain
- ❌ Can't be cached
- ❌ Increases HTML file size
- ❌ Breaks design system consistency
- ❌ Poor performance on mobile

### Fix Plan:

#### Step 1: Identify Inline Styles
Search for `style="` in `semaglutide-new.html` and list all occurrences.

#### Step 2: Convert to Utility Classes
Common inline styles to replace:

**Color overrides:**
```html
<!-- Before -->
<a style="border-color: white; color: white;" class="btn">

<!-- After -->
<a class="btn btn-outline btn-light">
```

**Width/sizing:**
```html
<!-- Before -->
<div style="width: 75%;" class="progress__bar">

<!-- After -->
<div class="progress__bar progress__bar--75">
```

```css
/* Add to 05-components.css */
.progress__bar--75 { width: 75%; }
```

**Text colors:**
```html
<!-- Before -->
<p style="color: rgba(255,255,255,0.8);">

<!-- After -->
<p class="text-white-soft">
```

```css
/* Add to 01-variables.css */
.text-white-soft { color: rgba(255, 255, 255, 0.8); }
```

**Margins/spacing:**
```html
<!-- Before -->
<div style="margin-bottom: 24px;">

<!-- After -->
<div class="mb-6">
```

#### Step 3: Create New Utility Classes
Add these to `04-layout.css`:

```css
/* Opacity utilities */
.opacity-80 { opacity: 0.8; }
.opacity-90 { opacity: 0.9; }

/* Text color utilities */
.text-white-soft { color: rgba(255, 255, 255, 0.8); }
.text-white-muted { color: rgba(255, 255, 255, 0.6); }

/* Border utilities */
.border-white { border-color: white; }
.border-primary { border-color: var(--color-primary); }

/* Width utilities */
.w-50 { width: 50%; }
.w-75 { width: 75%; }
.w-100 { width: 100%; }
```

#### Step 4: Update Component Classes
For progress bars specifically:
```css
/* 05-components.css */
.progress__bar {
  background: var(--color-primary);
  height: 8px;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Width variants */
.progress__bar[data-width="50"] { width: 50%; }
.progress__bar[data-width="75"] { width: 75%; }
.progress__bar[data-width="100"] { width: 100%; }
```

```html
<!-- Usage -->
<div class="progress__bar" data-width="75"></div>
```

---

## 🔄 Testing Plan

### After implementing all fixes:

#### 1. Visual Regression Testing
```bash
# Re-run Playwright analysis
node scripts/analyze-local-page.js
```

**Expected result:**
- ✅ 0 High priority issues
- ✅ 0 Medium priority issues
- ✅ Fonts detected (Inter, DM Serif Display)
- ✅ Inline styles < 5 elements
- ✅ All links have text
- ✅ No overlapping elements

#### 2. Manual Cross-Browser Testing
Test on:
- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)

#### 3. Mobile Device Testing
Test on real devices:
- ✅ iPhone 13/14 (iOS Safari)
- ✅ Samsung Galaxy (Chrome)
- ✅ iPad (Safari)

#### 4. Performance Testing
```bash
# Use Lighthouse
npm install -g lighthouse
lighthouse http://localhost:8080/semaglutide-new.html --view
```

**Target scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## 📋 Implementation Checklist

### Phase 1: Font Fixes (Quick Win)
- [ ] Verify Google Fonts link in `<head>`
- [ ] Check CSS variable declarations
- [ ] Add font-display: swap
- [ ] Test font loading in browser

### Phase 2: Link Fix (Quick Win)
- [ ] Find empty link to index.html
- [ ] Add proper text or aria-label
- [ ] Test with screen reader

### Phase 3: Inline Styles Cleanup
- [ ] Search for all `style="` in HTML
- [ ] Create utility classes as needed
- [ ] Replace inline styles with classes
- [ ] Test visual consistency

### Phase 4: Responsive Layout Fixes
- [ ] Audit section spacing
- [ ] Fix navigation overlap
- [ ] Verify grid gaps
- [ ] Test on all viewport sizes
- [ ] Fix any z-index issues

### Phase 5: Validation
- [ ] Re-run Playwright analysis (0 issues expected)
- [ ] Manual browser testing
- [ ] Mobile device testing
- [ ] Performance testing (Lighthouse)
- [ ] Accessibility audit

### Phase 6: Documentation
- [ ] Update design system docs with new utilities
- [ ] Document any custom solutions
- [ ] Create testing checklist for future pages

---

## 🎯 Success Criteria

Page is ready for approval when:

1. ✅ **Playwright Analysis**: 0 high/medium issues
2. ✅ **Visual Quality**: Matches design system 100%
3. ✅ **Performance**: Lighthouse score > 90
4. ✅ **Accessibility**: WCAG 2.1 AA compliant
5. ✅ **Cross-Browser**: Works on Chrome, Safari, Firefox, Edge
6. ✅ **Mobile**: No horizontal scroll, readable text, tappable buttons
7. ✅ **Code Quality**: Minimal inline styles, proper semantic HTML
8. ✅ **Design System**: All components use design tokens

---

## 📦 Deliverables

1. **Updated HTML**: `semaglutide-new.html` with all fixes applied
2. **Updated CSS**: New utility classes added to design system
3. **Test Report**: Playwright analysis showing 0 issues
4. **Screenshots**: Before/after comparison
5. **Documentation**: Updated design system docs if new patterns added

---

## ⏱️ Estimated Timeline

- **Phase 1 (Fonts)**: 15 minutes
- **Phase 2 (Link)**: 10 minutes
- **Phase 3 (Inline Styles)**: 45 minutes
- **Phase 4 (Responsive)**: 60 minutes
- **Phase 5 (Testing)**: 30 minutes
- **Phase 6 (Docs)**: 20 minutes

**Total**: ~3 hours

---

## 🚀 Next Steps

1. **Get user approval on this fix plan**
2. **Implement fixes in order (Phase 1 → 6)**
3. **Re-test after each phase**
4. **Get final user approval**
5. **Roll out to remaining 25 pages**

---

**Ready to proceed?** I can start implementing these fixes immediately, or we can discuss any adjustments to the plan first.
