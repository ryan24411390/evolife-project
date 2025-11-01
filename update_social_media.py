#!/usr/bin/env python3
"""
Script to update social media links across all HTML pages
"""
import os
import glob
import re

# Old and New social media links
OLD_INSTAGRAM_1 = 'https://www.instagram.com/joinevolife/'
OLD_INSTAGRAM_2 = 'https://www.instagram.com/joinevolife'
NEW_INSTAGRAM = 'https://www.instagram.com/thewarriorweightloss'

OLD_FACEBOOK_1 = 'https://www.facebook.com/joinevolife/'
OLD_FACEBOOK_2 = 'https://www.facebook.com/joinevolife'
NEW_FACEBOOK = 'https://www.facebook.com/profile.php?id=61575535337510'

OLD_YOUTUBE = 'https://www.youtube.com/@joinevolife'
NEW_YOUTUBE = 'https://www.youtube.com/@EvoLifeWellness'

# Get all main HTML files (excluding backups, node_modules, and treatment-pages)
html_files = []
for file in glob.glob('*.html'):
    # Skip backup files and temporary files
    if any(x in file for x in ['backup', 'pre_treatment', '_P2', 'testimonial_img',
                                 '.alt_', '.seo_', '.perf_', '.aria_', '.schema_',
                                '.content_fix_', '.interactions_', '.contrast_',
                                '.mobile_', '.brand_', '.trust_', '.alt_enhanced_',
                                '.testimonials_', '.cta_', '.faq_', 'temp_']):
        continue
    html_files.append(file)

# Also check treatment pages
treatment_pages = glob.glob('mens-health.html') + glob.glob('recovery.html') + \
                  glob.glob('weight-management.html') + glob.glob('peptides.html') + \
                  glob.glob('testosterone.html')
html_files.extend(treatment_pages)

# Remove duplicates
html_files = list(set(html_files))

print(f"Found {len(html_files)} HTML files to update:")
for f in sorted(html_files):
    print(f"  - {f}")

updated_count = 0
instagram_count = 0
facebook_count = 0
youtube_count = 0

for html_file in html_files:
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        file_updated = False

        # Update Instagram - replace all occurrences (with and without trailing slash)
        instagram_updates = content.count(OLD_INSTAGRAM_1) + content.count(OLD_INSTAGRAM_2)
        if instagram_updates > 0:
            content = content.replace(OLD_INSTAGRAM_1, NEW_INSTAGRAM)
            content = content.replace(OLD_INSTAGRAM_2, NEW_INSTAGRAM)
            # Clean up any double slashes or hash symbols
            content = content.replace(NEW_INSTAGRAM + '/#', NEW_INSTAGRAM)
            content = content.replace(NEW_INSTAGRAM + '#', NEW_INSTAGRAM)
            instagram_count += 1
            file_updated = True

        # Update Facebook - replace all occurrences (with and without trailing slash)
        facebook_updates = content.count(OLD_FACEBOOK_1) + content.count(OLD_FACEBOOK_2)
        if facebook_updates > 0:
            content = content.replace(OLD_FACEBOOK_1, NEW_FACEBOOK)
            content = content.replace(OLD_FACEBOOK_2, NEW_FACEBOOK)
            facebook_count += 1
            file_updated = True

        # Update YouTube - replace all occurrences (handle both with and without trailing space)
        youtube_updates = content.count(OLD_YOUTUBE)
        if youtube_updates > 0:
            # Replace all variations
            content = content.replace(OLD_YOUTUBE + ' ', NEW_YOUTUBE)
            content = content.replace(OLD_YOUTUBE + '"', NEW_YOUTUBE + '"')
            content = content.replace(OLD_YOUTUBE, NEW_YOUTUBE)
            youtube_count += 1
            file_updated = True

        # Only write if changes were made
        if file_updated:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Updated: {html_file}")
            updated_count += 1
        else:
            print(f"  No changes needed: {html_file}")

    except Exception as e:
        print(f"✗ Error updating {html_file}: {e}")

print(f"\n{'='*50}")
print(f"Update complete!")
print(f"Files updated: {updated_count} of {len(html_files)}")
print(f"Instagram links updated: {instagram_count}")
print(f"Facebook links updated: {facebook_count}")
print(f"YouTube links updated: {youtube_count}")
