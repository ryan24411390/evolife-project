# Phase 0: Setup & Preparation - Complete ✅

**Date**: October 28, 2025
**Status**: Setup Complete

---

## Environment Verified

### System Information
- **Node.js**: v24.3.0 ✅
- **npm**: Working ✅
- **Playwright**: Installed with Chromium browser ✅
- **Git**: Initialized and active ✅
- **Operating System**: macOS Darwin 25.0.0

### Dependencies Installed
```json
{
  "playwright": "^1.40.0"
}
```

---

## Current Dev Server Structure

### Root Level Files
```
/Evolife FInal and last/
├── index.html                          # Homepage
├── pricing.html                        # Pricing page
├── blog.html                           # Blog listing
├── compounded-medications.html         # Medications info
├── contact-us.html                     # Contact page
├── privacy-policy.html                 # Privacy policy
├── terms-conditions.html               # Terms
├── medications-safety-information.html # Safety info
├── blog_*.html                         # Individual blog posts
├── package.json                        # NEW - Project config
└── treatment-pages/                    # NEW - Isolated workspace
    ├── raw/                            # Raw cloned pages
    ├── cleaned/                        # After tracker removal
    ├── assets/                         # Downloaded assets
    ├── integrated/                     # Final integrated versions
    ├── docs/                           # Documentation
    └── scripts/                        # Automation scripts
```

### Assets Structure
```
assets/
├── css/
│   ├── 66c8a0fb54f84ec4a09643c7_css_evolife-2024-da06be12dacaba199501f0724d.shared.8aab12a69.css (main CSS)
│   ├── local-fonts.css
│   └── slick carousel CSS files
├── js/
│   └── [33 JavaScript files]
├── images/
│   └── [179 image files including logos]
└── fonts/
    └── [Slick carousel fonts]
```

---

## Existing Branding - Evolife

### Brand Identity
- **Primary Brand**: Evolife Wellness
- **Previous Brand**: Fridays (already replaced in 2,623+ instances)
- **Domain**: joinevolife.com / evolifewellness.com

### Color Palette
```css
/* Primary Colors */
#A3B19E  /* Light Green - Primary accent */
#606D5B  /* Dark Green - Secondary accent */
#BAC7B6  /* Pale Green - Tertiary accent */

/* Neutral Colors */
#FFFFFF  /* White - Backgrounds */
#F6F7F6  /* Off-white - Light backgrounds */
#333333  /* Dark Gray - Text */
#999999  /* Medium Gray - Secondary text */
#EEEEEE  /* Light Gray - Borders */
```

### Typography
```css
/* Font Families (via Google Fonts) */
- Headings: "DM Serif Display" (regular, italic)
- Body: "DM Sans" (300, 400, 500, 600, 700, 800, 900)
- Alternative: "Lato" (100-900, all weights)
- Fallback: "Droid Sans" (400, 700)
```

### Logo Files
- **Header Logo**: `assets/images/evolife-logo-new.png`
- **Footer Logo**: `assets/images/evolife-footer-logo.png`
- **Favicon**: `assets/images/favicon.png`

---

## Integration Points Identified

### Header Structure
- **Location**: Line 423 in index.html
- **Component**: `.navbar_component` with `.w-nav` class
- **Elements**:
  - Logo link: `<a href="index.html">` with logo image
  - Navigation menu: `.navbar_menu-2`
  - Links: GLP-1 Pricing, Contact Us
  - CTA buttons: "Get Started!", "Login"
  - Mobile menu button: `.navbar_menu-button`

### Footer Structure
- **Location**: Line 1257 in index.html
- **Component**: `.footer_component`
- **Elements**:
  - Footer logo
  - Contact information (info@evolifewellness.com)
  - Live Chat link
  - Navigation links (Blog, GLP-1, Contact Us)
  - Social media links (Facebook, TikTok, Instagram, LinkedIn)
  - Copyright and legal links

### Main CSS File
- **File**: `assets/css/66c8a0fb54f84ec4a09643c7_css_evolife-2024-da06be12dacaba199501f0724d.shared.8aab12a69.css`
- **Size**: 469KB
- **Contains**: All site styles including responsive breakpoints

### External Dependencies (Currently Used)
```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>

<!-- JavaScript Libraries -->
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script src="https://unpkg.com/split-type"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/@studio-freight/lenis@1.0.34/dist/lenis.min.js"></script>
```

---

## Isolation Strategy

### Namespace Convention
All new treatment page assets will be prefixed to avoid conflicts:
- **CSS Classes**: `.tp-` prefix (e.g., `.tp-hero`, `.tp-section`)
- **JavaScript Functions**: `TP_` prefix (e.g., `TP_initSlider()`)
- **Asset Files**: `tp-` prefix (e.g., `tp-longevity-hero.jpg`)

### Directory Isolation
```
treatment-pages/
├── raw/                      # Cloned HTML + assets (untouched)
│   ├── longevity/
│   ├── microdosing/
│   └── testosterone/
├── cleaned/                  # After tracker removal
│   ├── longevity/
│   ├── microdosing/
│   └── testosterone/
├── assets/                   # Organized assets
│   ├── css/
│   │   ├── shared/          # Used by multiple pages
│   │   ├── longevity/
│   │   ├── microdosing/
│   │   └── testosterone/
│   ├── js/
│   ├── images/
│   ├── fonts/
│   └── shared/              # Cross-page shared assets
└── integrated/              # Final rebranded pages
    ├── longevity.html
    ├── microdosing.html
    └── testosterone.html
```

### No Modifications to Existing Files
- ✅ All existing pages remain untouched
- ✅ Existing assets remain unchanged
- ✅ Integration only adds new files
- ✅ Existing navigation will be updated only in Phase 6

---

## Git Branch Strategy

### Branch Structure
```
main (current)
  └── treatment-pages-integration (new)
       └── [All Phase 1-7 commits will go here]
```

### Commit Plan
- Phase 0: "Setup treatment pages workspace and documentation"
- Phase 1: "Clone 3 treatment pages with all assets"
- Phase 2: "Analyze page structures and dependencies"
- Phase 3: "Remove all trackers from treatment pages"
- Phase 4: "Make treatment pages fully offline-capable"
- Phase 5: "Rebrand treatment pages to Evolife"
- Phase 6: "Integrate treatment pages with dev server"
- Phase 7: "Final testing and deployment of treatment pages"

---

## Target Pages to Clone

### 1. Longevity Treatment
- **URL**: https://www.joinfridays.com/longevity
- **Purpose**: Anti-aging and longevity treatments
- **Expected Assets**: Hero images, treatment info, CTA forms

### 2. Microdosing Treatment
- **URL**: https://www.joinfridays.com/microdosing
- **Purpose**: Microdosing therapy information
- **Expected Assets**: Educational content, treatment details

### 3. Testosterone Treatment
- **URL**: https://www.joinfridays.com/testosterone
- **Purpose**: Testosterone replacement therapy
- **Expected Assets**: Medical information, patient resources

---

## Scripts to Be Created

### Phase 1: Cloning
- `treatment-pages/scripts/clone-pages.js` - Playwright automation

### Phase 3: Tracker Removal
- `treatment-pages/scripts/remove-trackers.js` - Strip analytics/tracking

### Phase 4: Offline Conversion
- `treatment-pages/scripts/make-offline.js` - Localize all external assets

### Phase 5: Rebranding
- `treatment-pages/scripts/rebrand.js` - Replace Fridays → Evolife

---

## Success Metrics for Phase 0

✅ **Environment Setup**
- Node.js v24.3.0 installed and verified
- Playwright v1.40.0 installed with Chromium
- Git repository active

✅ **Workspace Created**
- `treatment-pages/` directory structure created
- All subdirectories for phases prepared
- Documentation directory ready

✅ **Current State Documented**
- Existing site structure mapped
- Branding guidelines extracted
- Integration points identified
- Header/footer locations documented

✅ **Strategy Defined**
- Namespace convention established (`.tp-` prefix)
- Git branching strategy planned
- Isolation approach documented
- No conflicts with existing site guaranteed

---

## Ready for Phase 1: Clone Pages ✅

**Next Steps**:
1. Create git branch: `treatment-pages-integration`
2. Create Playwright cloning script
3. Clone all 3 target pages
4. Download all page assets
5. Create asset manifests

---

**Phase 0 Completion Time**: ~15 minutes
**Phase 0 Status**: ✅ COMPLETE
