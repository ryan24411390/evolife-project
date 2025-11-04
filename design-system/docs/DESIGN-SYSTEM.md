# EvoLife Medicine Pages Design System
## Version 2.0 - Redesign 2025

**Purpose:** Comprehensive design system for all EvoLife medicine and category pages
**Based on:** Competitive analysis of Eden Health, Hims, and industry best practices
**Scope:** 26+ treatment and category pages

---

## 1. Design Principles

### Core Principles:
1. **Medical Credibility** - Professional, trustworthy, authoritative
2. **Accessibility First** - WCAG 2.1 AA compliant
3. **Conversion Focused** - Clear CTAs, progressive trust building
4. **Mobile First** - Responsive, fast, touch-friendly
5. **Consistency** - Unified components across all pages

### Brand Personality:
- **Professional** but approachable
- **Scientific** but understandable
- **Premium** but accessible
- **Trustworthy** but warm

---

## 2. Color System

### Primary Palette

```css
/* Primary Colors - Medical Authority */
--color-primary-dark: #2C3E50;      /* Slate Blue - main brand */
--color-primary: #34495E;            /* Medium Slate - interactive */
--color-primary-light: #7F8C8D;     /* Light Slate - subtle */

/* Secondary Colors - Wellness & Trust */
--color-secondary: #A3B19E;          /* Sage Green - wellness (keeping current accent) */
--color-secondary-light: #C8D5C2;   /* Light Sage - backgrounds */
--color-secondary-dark: #7A8975;    /* Dark Sage - emphasis */

/* Neutral Colors - Foundation */
--color-neutral-50: #FAFAFA;        /* Almost white - backgrounds */
--color-neutral-100: #F5F5F5;       /* Light grey - sections */
--color-neutral-200: #EEEEEE;       /* Border grey */
--color-neutral-300: #E0E0E0;       /* Dividers */
--color-neutral-400: #BDBDBD;       /* Disabled states */
--color-neutral-500: #9E9E9E;       /* Subtle text */
--color-neutral-600: #757575;       /* Secondary text */
--color-neutral-700: #616161;       /* Body text */
--color-neutral-800: #424242;       /* Headings */
--color-neutral-900: #212121;       /* Dark text */

/* Semantic Colors - Actions & Feedback */
--color-success: #4CAF50;           /* Success messages, positive */
--color-success-light: #C8E6C9;     /* Success background */
--color-warning: #FF9800;           /* Warnings, caution */
--color-warning-light: #FFE0B2;     /* Warning background */
--color-error: #E53935;             /* Errors, danger */
--color-error-light: #FFCDD2;       /* Error background */
--color-info: #2196F3;              /* Information */
--color-info-light: #BBDEFB;        /* Info background */
```

### Usage Guidelines

**Backgrounds:**
- White (#FFFFFF) - Main content areas
- Neutral 50 (#FAFAFA) - Page background
- Neutral 100 (#F5F5F5) - Alternate sections
- Secondary Light (#C8D5C2) - Highlighted sections

**Text:**
- Neutral 900 (#212121) - Headlines
- Neutral 800 (#424242) - Subheadings
- Neutral 700 (#616161) - Body text
- Neutral 600 (#757575) - Secondary text
- Primary Dark (#2C3E50) - Links, branded text

**Interactive:**
- Primary Dark (#2C3E50) - Primary buttons
- Secondary (#A3B19E) - Secondary buttons
- Primary (#34495E) - Hover states
- Success (#4CAF50) - Positive CTAs

---

## 3. Typography System

### Font Stack

```css
/* Primary Font - Headings & Display */
--font-display: 'DM Serif Display', Georgia, serif;

/* Secondary Font - UI & Body */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             system-ui, sans-serif;

/* Monospace - Code & Technical */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
```

**Rationale:** Keep current font choice (Inter + DM Serif Display) - modern, professional, excellent readability

### Type Scale

Based on 16px base (1rem = 16px)

```css
/* Display - Large Hero Text */
--text-display-xl: 3.75rem;    /* 60px - Hero headlines */
--text-display-lg: 3rem;       /* 48px - Page titles */
--text-display-md: 2.5rem;     /* 40px - Section titles */

/* Headings */
--text-h1: 2.25rem;            /* 36px */
--text-h2: 1.875rem;           /* 30px */
--text-h3: 1.5rem;             /* 24px */
--text-h4: 1.25rem;            /* 20px */
--text-h5: 1.125rem;           /* 18px */
--text-h6: 1rem;               /* 16px */

/* Body */
--text-body-xl: 1.25rem;       /* 20px - Large body, intro */
--text-body-lg: 1.125rem;      /* 18px - Emphasized body */
--text-body: 1rem;             /* 16px - Standard body */
--text-body-sm: 0.875rem;      /* 14px - Small text */
--text-body-xs: 0.75rem;       /* 12px - Captions, labels */
```

### Font Weights

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights

```css
--line-height-tight: 1.1;      /* Large headlines */
--line-height-snug: 1.25;      /* Headings */
--line-height-normal: 1.5;     /* Body text */
--line-height-relaxed: 1.75;   /* Long-form content */
--line-height-loose: 2;        /* Spacious */
```

### Typography Classes

```css
.display-xl {
  font-family: var(--font-display);
  font-size: var(--text-display-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
}

.h1 {
  font-family: var(--font-display);
  font-size: var(--text-h1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-snug);
}

.body-text {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}
```

---

## 4. Spacing System

### Base Unit: 4px (0.25rem)

**Scale (4px increments):**

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Usage Guidelines

**Component Spacing:**
- Tight: 8px (buttons, form fields)
- Normal: 16px (card padding)
- Comfortable: 24px (section padding)
- Spacious: 48px (between sections)

**Section Padding:**
- Mobile: 40px top/bottom, 20px left/right
- Tablet: 60px top/bottom, 40px left/right
- Desktop: 80px top/bottom, 60px left/right

---

## 5. Layout System

### Container Widths

```css
--container-sm: 640px;    /* Small - forms, narrow content */
--container-md: 768px;    /* Medium - articles, single column */
--container-lg: 1024px;   /* Large - two column layouts */
--container-xl: 1280px;   /* Extra large - full width content */
--container-2xl: 1536px;  /* Maximum - hero sections */
```

### Grid System

**12-column grid with gap:**

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6); /* 24px */
}

/* Responsive columns */
.col-span-6 { grid-column: span 6; }  /* Half width */
.col-span-4 { grid-column: span 4; }  /* Third width */
.col-span-3 { grid-column: span 3; }  /* Quarter width */
```

**Common Layouts:**
- 2-column: `.col-span-6` + `.col-span-6`
- 3-column: `.col-span-4` × 3
- 4-column: `.col-span-3` × 4
- Sidebar: `.col-span-8` + `.col-span-4`

---

## 6. Components

### Button System

**Sizes:**
- Small: 36px height, 14px text
- Medium: 44px height, 16px text (default)
- Large: 52px height, 18px text

**Variants:**

```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary-dark);
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.2);
}

/* Secondary Button */
.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-neutral-900);
}

/* Outline Button */
.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary-dark);
  color: var(--color-primary-dark);
}

/* Text Button */
.btn-text {
  background: transparent;
  color: var(--color-primary-dark);
  text-decoration: underline;
}
```

### Card System

```css
.card {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

/* Benefit Card */
.card-benefit {
  text-align: center;
  padding: var(--space-8);
}

.card-benefit-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  background: var(--color-secondary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Form Elements

```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-neutral-300);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-dark);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--color-neutral-800);
}
```

---

## 7. Component Library

### Core Components:

1. **Hero Section**
   - Treatment Hero (medicine pages)
   - Category Hero (category pages)

2. **Stats Bar**
   - 3-4 metric display
   - Icons or numbers

3. **Benefit Cards**
   - Icon + Title + Description
   - 3 or 6 grid layout

4. **Process Timeline**
   - Step-by-step numbered flow
   - Icons for each step

5. **Results Timeline**
   - Week/month progression
   - Visual graph/chart

6. **Info Box**
   - Highlighted content
   - Bordered or background

7. **Testimonial Card**
   - Quote + Name + Photo
   - Star rating

8. **Doctor Profile**
   - Photo + Credentials + Quote
   - Trust signal

9. **FAQ Accordion**
   - Expandable Q&A
   - Smooth animation

10. **CTA Section**
    - Large section with button
    - Final conversion

---

## 8. Iconography

### Icon System:

**Style:** Outline icons (not filled)
**Size:** 24px standard, 32px large, 16px small
**Stroke:** 2px weight
**Source:** Heroicons, Lucide, or custom SVG

**Common Icons Needed:**
- ✓ Checkmark (benefits, lists)
- → Arrow (CTAs, navigation)
- 👤 User (testimonials, profiles)
- 📊 Chart (results, data)
- 🔬 Science (research, studies)
- 💉 Medical (treatments, injections)
- ⏱️ Time (timeline, duration)
- 🛡️ Shield (safety, trust)
- ⭐ Star (ratings, quality)
- 📦 Package (delivery, product)

---

## 9. Shadows & Depth

```css
/* Elevation System */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.12);
--shadow-2xl: 0 24px 48px rgba(0, 0, 0, 0.15);

/* Focus Shadow */
--shadow-focus: 0 0 0 3px rgba(44, 62, 80, 0.2);
```

**Usage:**
- Cards: `shadow-md`
- Buttons (hover): `shadow-lg`
- Dropdowns: `shadow-xl`
- Modals: `shadow-2xl`
- Focus states: `shadow-focus`

---

## 10. Border Radius

```css
--radius-sm: 4px;    /* Small elements */
--radius-md: 8px;    /* Default - buttons, inputs */
--radius-lg: 12px;   /* Cards */
--radius-xl: 16px;   /* Large cards */
--radius-2xl: 24px;  /* Hero sections */
--radius-full: 9999px; /* Circular - pills, badges */
```

---

## 11. Animations & Transitions

```css
/* Timing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Duration */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;

/* Common Transitions */
.transition-all {
  transition: all var(--duration-normal) var(--ease-in-out);
}

.transition-colors {
  transition: background-color var(--duration-normal) var(--ease-in-out),
              color var(--duration-normal) var(--ease-in-out);
}
```

**Animation Principles:**
- Subtle & purposeful
- Fast interactions (150-250ms)
- Smooth easing
- No animations on mobile (performance)

---

## 12. Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

**Media Query Usage:**

```css
/* Mobile (default) */
.element { font-size: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .element { font-size: 18px; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element { font-size: 20px; }
}
```

---

## 13. Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

**Focus States:**
- All interactive elements have visible focus
- Focus outline: 2px solid with offset
- Keyboard navigable

**Screen Readers:**
- Semantic HTML (header, nav, main, section, footer)
- ARIA labels where needed
- Alt text for all images
- Form labels properly associated

**Motion:**
- Respect `prefers-reduced-motion`
- Disable animations for users who prefer

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Performance Guidelines

**Images:**
- Use WebP format with JPG fallback
- Lazy load images below fold
- Responsive images (srcset)
- Max file size: 200KB per image

**CSS:**
- Minimize custom CSS
- Utility-first approach
- Critical CSS inline
- Defer non-critical CSS

**JavaScript:**
- Minimal JS (accordion, form validation only)
- Vanilla JS preferred (no heavy frameworks)
- Async/defer script loading

**Fonts:**
- Subset fonts (latin only)
- Use system fonts as fallback
- Font-display: swap

---

## 15. Code Standards

### CSS Naming Convention (BEM)

```css
/* Block */
.card { }

/* Element */
.card__title { }
.card__content { }

/* Modifier */
.card--featured { }
.card--large { }
```

### HTML Structure

```html
<section class="section section--padded">
  <div class="container container--lg">
    <h2 class="section__title">Section Title</h2>
    <p class="section__description">Description text</p>
    <div class="section__content">
      <!-- Content -->
    </div>
  </div>
</section>
```

---

## 16. File Organization

```
design-system/
├── css/
│   ├── 01-variables.css      (colors, spacing, etc.)
│   ├── 02-reset.css          (normalize)
│   ├── 03-typography.css     (font styles)
│   ├── 04-layout.css         (containers, grid)
│   ├── 05-components.css     (buttons, cards, etc.)
│   └── master.css            (imports all)
├── components/
│   ├── hero.html
│   ├── stats-bar.html
│   ├── benefit-cards.html
│   ├── testimonial.html
│   └── ...
└── docs/
    ├── DESIGN-SYSTEM.md      (this file)
    └── COMPONENT-GUIDE.md
```

---

## 17. Usage Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Treatment Page - EvoLife</title>

  <!-- Design System CSS -->
  <link rel="stylesheet" href="/design-system/css/master.css">
</head>
<body>

  <!-- Hero Section -->
  <section class="hero hero--treatment">
    <div class="container container--xl">
      <div class="hero__content">
        <span class="badge badge--category">Weight Management</span>
        <h1 class="display-lg">Semaglutide</h1>
        <p class="hero__subtitle">Achieve sustainable weight loss with clinically-proven GLP-1 therapy</p>
        <button class="btn btn-primary btn-lg">See if you qualify</button>
      </div>
      <div class="hero__image">
        <img src="semaglutide-hero.jpg" alt="Semaglutide treatment">
      </div>
    </div>
  </section>

  <!-- Stats Bar -->
  <section class="stats-bar">
    <div class="container container--xl">
      <div class="stats-bar__grid">
        <div class="stat">
          <div class="stat__number">10,000+</div>
          <div class="stat__label">Patients treated</div>
        </div>
        <!-- More stats -->
      </div>
    </div>
  </section>

  <!-- Continue with other sections -->

</body>
</html>
```

---

**End of Design System Documentation**

*Next: Build CSS Framework & Component Templates*
