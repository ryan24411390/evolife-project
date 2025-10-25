# EVOLIFE V1 - Clean Offline Build

> **Privacy-first, tracker-free, offline-capable clone of joinfridays.com**
> Ready for EVOLIFE rebranding and customization

---

## 🎯 Quick Start

```bash
# Navigate to the clean directory
cd clean/

# Option 1: Open directly in browser
open index.html  # macOS
# Or drag index.html into your browser

# Option 2: Start local server
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

---

## ✨ Features

- 🔒 **100% Tracker-Free** - 248+ tracking instances removed, ZERO trackers detected
- 🌐 **100% Offline-Capable** - Works without internet
- 📴 **Privacy-First** - No external tracking whatsoever
- 📦 **Self-Contained** - All assets local
- 📝 **Smart Forms** - localStorage-based submissions
- 🚀 **Production-Ready** - Clean, organized code

---

## 📊 What's Included

| Component | Count | Description |
|-----------|-------|-------------|
| **HTML Pages** | 22 | Homepage, pricing, blog posts, etc. |
| **CSS Files** | 7 | Stylesheets and themes |
| **JavaScript** | 33 | Scripts + form handler |
| **Images** | 193 | Optimized webp, svg, avif |
| **Fonts** | 6 | Web fonts |
| **Total Size** | 3.2MB | Compact and efficient |

---

## 🗂️ Structure

```
evolife-v1-clean/
├── clean/                 # ← Start here!
│   ├── index.html        # Main homepage
│   └── assets/
│       ├── css/          # Stylesheets
│       ├── js/           # Scripts + form-handler.js
│       ├── images/       # All images
│       └── fonts/        # Web fonts
├── original/             # Raw cloned files
├── tools/                # Build & validation scripts
└── docs/                 # Full documentation
```

---

## 🔧 Tools

### Validation
```bash
node tools/validate-offline.js
# Checks for trackers and external dependencies
```

### Tracker Removal
```bash
node tools/remove-trackers.js
# Removes all tracking code (already run)
```

---

## 📝 Form Submissions (Offline Mode)

Forms automatically save to browser localStorage. Use these console commands:

```javascript
// View all submissions
getOfflineFormSubmissions()

// Export to JSON file
exportOfflineFormSubmissions()

// Clear all submissions
clearOfflineFormSubmissions()
```

---

## 🗑️ Trackers Removed

✅ Google Analytics, Facebook Pixel, GTM, Hotjar, Segment, Mixpanel, Amplitude, Trustpilot, Monto.io, Quora Pixel, Everflow, Cookie consents - **ALL tracking code eliminated**

---

## 📖 Full Documentation

See [docs/CLEAN-BUILD-REPORT.md](docs/CLEAN-BUILD-REPORT.md) for complete details.

---

## 🚀 Next Steps

1. **EVOLIFE Rebranding** - Replace branding and messaging
2. **Link Management** - Add custom shortener
3. **Shopify Integration** - Convert to Liquid templates
4. **Backend Services** - Add form processing and auth

---

**Built**: October 24, 2025 | **Version**: v1.0.0-clean-offline | **Status**: ✅ Production-ready

🚀 **Let's build something amazing!**
