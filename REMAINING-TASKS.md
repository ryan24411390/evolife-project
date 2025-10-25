# Remaining Manual Tasks

These tasks from the Moat annotation system require manual image editing or external resources that are not currently available in the project.

## Status Legend
- ✅ **Completed**: Task is done
- 🔄 **In Progress**: Currently being worked on
- ⏸️ **Pending**: Requires manual work or external resources
- ⚠️ **Blocked**: Cannot proceed due to missing resources

---

## Image Replacement Tasks

### ⚠️ Task 1: Compounded GLP-1-GIP Image (Duplicate Task)
**Status**: Blocked
**File**: `index.html`, `index_P2M1Nzgz.html`
**Task ID**: `f8c1f6b8-c07f-4f53-9c35-84c45632baa8`

**Required Action**:
- Change image to: `/Users/raiyanabdullah/Downloads/ChatGPT Image Oct 25, 2025, 08_34_53 AM.png`
- **Note**: This appears to be a duplicate of an already completed task (ID: `09a025f7`)

**Location**: `.home-hero_module-2.is-1 > img.home-hero_module-img-2`

**Manual Steps**:
1. Locate or recreate the image file
2. Copy to `evolife-v1-clean/evolife/assets/images/`
3. Update image src in both index files
4. Test display on page

---

### ⏸️ Task 2: Remove Background from Process Timeline Image
**Status**: Pending
**File**: `index.html`, `index_P2M1Nzgz.html`
**Task ID**: `396af80e-0d78-4aa9-81d1-3006a18c2c6f`

**Required Action**:
- Remove background from the process timeline image
- Current image: `assets/images/process-timeline.png`

**Location**: `.process_image` (line ~1241 in index.html)

**Manual Steps**:
1. Open `assets/images/process-timeline.png` in image editor (Photoshop, GIMP, Photopea)
2. Remove background (make transparent)
3. Export as PNG with transparency
4. Replace original file OR update src reference
5. Test display on page

**Tools Recommended**:
- Adobe Photoshop
- GIMP (free)
- Photopea (free, online)
- Remove.bg (automated background removal)

---

### ⏸️ Task 3: Remove Background from CTA Banner Image
**Status**: Pending
**File**: `index.html`, `index_P2M1Nzgz.html`
**Task ID**: `a41ddb73-0f1b-49ba-8d52-7f0ee234086e`

**Required Action**:
- Remove background from the CTA banner image
- Current source: CDN URL (`cdn.prod.website-files.com/...`)

**Location**: `.cta-b_card > .cta-b_image-wrapper > img.cta-b_image`

**Manual Steps**:
1. Download current image from CDN
2. Open in image editor
3. Remove background (make transparent)
4. Save to `assets/images/` with descriptive name
5. Update img src in HTML files
6. Test display on page

---

## Content Update Tasks

### ⏸️ Task 4: Update Testimonial Section
**Status**: Pending
**File**: `index.html`, `index_P2M1Nzgz.html`
**Task ID**: `839d8b18-2b5c-4778-8d7e-fc920435d783`

**Required Action**:
- Change names of people in testimonials
- Remove all pictures from every testimonial card
- Don't include placeholders

**Location**: Container `#w-node-_01ff003b-e959-c349-3128-9582c89b9824-a09643c9`

**Manual Steps**:
1. Locate testimonial section in HTML
2. Update names with actual Evolife customer names (or generic names)
3. Remove `<img>` tags for profile pictures
4. Update CSS if needed to handle missing images
5. Test layout without images

**Suggested Names** (if real testimonials not available):
- Sarah M.
- Michael R.
- Jennifer K.
- David L.
- Amanda P.

---

## ✅ Completed Tasks

### Task 5: Warrior's Protocol Text Update
**Status**: ✅ Completed
**Task IDs**: `efa1e246-fe40-497d-b9cf-9dab030a7786`, `88c7b271-be0b-40f5-ad80-fcb6f891f921`

**Completed Actions**:
- Changed "Download our Protein Cheat Sheet" to "Download our Warrior's Protocol"
- Updated description to: "Your comprehensive guide to maximizing health and wellness through strategic nutrition, lifestyle optimization, and sustainable wellness practices tailored for your journey."

**Files Updated**:
- `evolife-v1-clean/evolife/index.html`
- `evolife-v1-clean/evolife/index_P2M1Nzgz.html`

---

## Priority Recommendations

### High Priority
1. **Update Testimonial Section** - Most visible to users, affects credibility
2. **Remove CTA Banner Background** - Improves visual quality

### Medium Priority
3. **Remove Process Timeline Background** - Enhances visual appeal
4. **Resolve Duplicate Image Task** - May already be complete

### Notes
- All image editing tasks can be done by a designer with access to:
  - Adobe Photoshop, GIMP, or Photopea
  - Original source files from Downloads folder
  - Access to this project directory

---

## How to Complete These Tasks

### For Image Editing:
```bash
# 1. Edit images using your preferred tool
# 2. Save to assets folder
cp edited-image.png evolife-v1-clean/evolife/assets/images/

# 3. Update HTML references
# Edit the relevant HTML files to point to new image paths

# 4. Test locally
cd evolife-v1-clean/evolife
python3 -m http.server 8000
# Visit http://localhost:8000

# 5. Commit changes
git add .
git commit -m "Update images: [description]"
```

### For Content Updates:
```bash
# 1. Open HTML file in editor
# 2. Make changes to content
# 3. Test locally
# 4. Commit changes
```

---

## Contact
For questions about these tasks:
- Review the `.moat/moat-tasks-detail.json` file for original task details
- Check screenshot files in `.moat/screenshots/` for visual reference

**Last Updated**: October 25, 2025
