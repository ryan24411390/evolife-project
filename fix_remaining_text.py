#!/usr/bin/env python3
"""
Fix remaining text content in HTML files
"""

import os
import re
from pathlib import Path

BASE_DIR = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last/evolife-v1-clean/evolife")

def fix_tagline(content):
    """Fix the tagline 'Don't wait until Friday to feel good' to 'Don't wait to feel good'"""
    # Replace the specific tagline
    content = content.replace(
        "Don&#x27;t wait until Friday to feel good",
        "Don&#x27;t wait to feel good"
    )
    # Also handle non-escaped version
    content = content.replace(
        "Don't wait until Friday to feel good",
        "Don't wait to feel good"
    )
    return content

def process_html_file(filepath):
    """Process a single HTML file"""
    print(f"Processing: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Apply fixes
    content = fix_tagline(content)

    # Check if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated {filepath.name}")
        return True
    else:
        print(f"  - No changes needed for {filepath.name}")
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("Fixing Remaining Text Content")
    print("=" * 60)

    html_files = list(BASE_DIR.glob("*.html"))
    print(f"\nFound {len(html_files)} HTML files\n")

    updated_count = 0
    for html_file in html_files:
        if process_html_file(html_file):
            updated_count += 1

    print("\n" + "=" * 60)
    print(f"Completed! Updated {updated_count} file(s)")
    print("=" * 60)

if __name__ == "__main__":
    main()
