#!/usr/bin/env python3
"""
Process Moat UI tasks for Evolife website rebranding
"""

import os
import re
import json
from pathlib import Path

# Base directory
BASE_DIR = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last/evolife-v1-clean/evolife")

def remove_promo_banner(content):
    """Remove the promo banner with id='default_floating_banner'"""
    # Remove the entire <a> tag with id="default_floating_banner"
    pattern = r'<a\s+id="default_floating_banner"[^>]*>.*?</a>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content

def remove_merch_nav_links(content):
    """Remove merch links from navigation"""
    # Remove the merch link from navbar
    pattern = r'<a\s+href="https://joinevolife\.myshopify\.com/"[^>]*>.*?</a>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content

def remove_footer_badges(content):
    """Remove footer app badges section"""
    # Pattern to match the footer badges wrapper with app download links
    pattern = r'<div\s+class="w-layout-hflex footer_badges-wrapper[^"]*">.*?</div>\s*</div>\s*</div>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content

def remove_footer_nav_merch_meals(content):
    """Remove Merch and Evolife Meals from footer navigation"""
    # Remove Merch footer link
    pattern1 = r'<a[^>]*id="w-node-_3f706e72-acb3-1119-b4f4-161346770ee0-46770ec0"[^>]*>.*?</a>.*?<div\s+class="lottie-animation"[^>]*></div>'
    content = re.sub(pattern1, '', content, flags=re.DOTALL)

    # Remove Evolife Meals footer link
    pattern2 = r'<a[^>]*href="http://evolifemealprep\.com/"[^>]*>.*?</a>.*?<div\s+class="lottie-animation"[^>]*></div>'
    content = re.sub(pattern2, '', content, flags=re.DOTALL)

    return content

def update_email_addresses(content):
    """Update email from ayuda@ to info@evolifewellness.com"""
    content = content.replace('ayuda@joinevolife.com', 'info@evolifewellness.com')
    return content

def remove_ayuda_mail_section(content):
    """Remove the ayuda@ mail section from footer"""
    # Remove the entire mail wrapper for ayuda
    pattern = r'<div\s+class="footer_mails-wraper[^"]*">.*?ayuda@[^<]*</div>.*?</a>\s*</div>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    return content

def update_copyright_text(content):
    """Update copyright text"""
    # Pattern to match copyright text and replace it
    pattern = r'©\s*<span[^>]*>\d{4}</span>\s*Thrive Health, Inc\.\s*All rights reserved\.[^<]*'
    replacement = r'© <span class="copyright-year">2025</span> Evolife Wellness. All rights reserved by Evolife Wellness.'
    content = re.sub(pattern, replacement, content)

    # Also handle the footer link part
    content = content.replace(
        'Thrive Health, Inc. All rights reserved. Thrive Health, Inc. is the legal entity operating Evolife',
        'Evolife Wellness. All rights reserved by Evolife Wellness'
    )
    return content

def process_html_file(filepath):
    """Process a single HTML file with all transformations"""
    print(f"Processing: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Apply all transformations
    content = remove_promo_banner(content)
    content = remove_merch_nav_links(content)
    content = remove_footer_nav_merch_meals(content)
    content = update_email_addresses(content)
    content = remove_ayuda_mail_section(content)
    content = update_copyright_text(content)
    content = remove_footer_badges(content)

    # Only write if content changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath.name}")
        return True
    else:
        print(f"  - No changes needed for {filepath.name}")
        return False

def main():
    """Main function to process all HTML files"""
    print("=" * 60)
    print("Processing Moat Tasks - Evolife Rebranding")
    print("=" * 60)

    html_files = list(BASE_DIR.glob("*.html"))
    print(f"\nFound {len(html_files)} HTML files to process\n")

    updated_count = 0
    for html_file in html_files:
        if process_html_file(html_file):
            updated_count += 1

    print("\n" + "=" * 60)
    print(f"Completed! Updated {updated_count} of {len(html_files)} files")
    print("=" * 60)

if __name__ == "__main__":
    main()
