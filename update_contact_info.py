#!/usr/bin/env python3
"""
Script to update contact information across all HTML pages
"""
import os
import glob
import re

# New contact information
OLD_ADDRESS = '500 E Palmetto Park Rd, Boca Raton, FL 33432'
NEW_ADDRESS = '7777 Glades Rd STE 100, Boca Raton, FL 33434, United States'
OLD_PHONE_DISPLAY = '(561) 555-0100'
NEW_PHONE_DISPLAY = '(+1) 561 895 4000'
OLD_PHONE_TEL = 'tel:(561)5550100'
NEW_PHONE_TEL = 'tel:+15618954000'
EMAIL = 'info@evolifewellness.com'

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

print(f"Found {len(html_files)} HTML files to update:")
for f in sorted(html_files):
    print(f"  - {f}")

updated_count = 0

for html_file in html_files:
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Update address
        content = content.replace(OLD_ADDRESS, NEW_ADDRESS)

        # Update phone display
        content = content.replace(OLD_PHONE_DISPLAY, NEW_PHONE_DISPLAY)

        # Update phone tel link
        content = content.replace(OLD_PHONE_TEL, NEW_PHONE_TEL)

        # Add email if footer links exist but no email (check if address exists but email doesn't)
        if NEW_ADDRESS in content and EMAIL not in content:
            # Pattern to find the phone link and add email after it
            pattern = r'(<a href="tel:\+15618954000" class="footer_link">\(\+1\) 561 895 4000</a>)'
            replacement = r'\1<a href="mailto:info@evolifewellness.com" class="footer_link">info@evolifewellness.com</a>'
            content = re.sub(pattern, replacement, content)

        # Only write if changes were made
        if content != original_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Updated: {html_file}")
            updated_count += 1
        else:
            print(f"  No changes needed: {html_file}")

    except Exception as e:
        print(f"✗ Error updating {html_file}: {e}")

print(f"\n{'='*50}")
print(f"Update complete! Updated {updated_count} of {len(html_files)} files.")
