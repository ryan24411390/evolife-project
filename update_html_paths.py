#!/usr/bin/env python3
"""
Script to update all image paths in HTML files to point to the new consolidated location.
Handles different directory depths automatically.
"""

import os
import re
from pathlib import Path

# Base paths
base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")
evolife_clean_path = base_path / "evolife-v1-clean"

# HTML directories to process
html_dirs = [
    evolife_clean_path / "clean",
    evolife_clean_path / "evolife",
    evolife_clean_path / "evolife-text-only",
    evolife_clean_path / "archived-pages",
    evolife_clean_path / "original",
]

def calculate_relative_path(html_file, target_images_dir):
    """Calculate the relative path from HTML file to images directory."""
    html_dir = html_file.parent
    rel_path = os.path.relpath(target_images_dir, html_dir)
    return rel_path

def update_html_file(html_file, target_images_dir):
    """Update image paths in a single HTML file."""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Calculate relative path from this HTML file to the consolidated images
        rel_path = calculate_relative_path(html_file, target_images_dir)

        # Pattern to match local image references (not CDN URLs)
        # Matches: src="assets/images/..." or src="../assets/images/..." or src="../../assets/images/..."
        patterns = [
            (r'src="(?:\.\./)*assets/images/([^"]+)"', f'src="{rel_path}/\\1"'),
            (r"src='(?:\.\./)*assets/images/([^']+)'", f"src='{rel_path}/\\1'"),
            # Also match in CSS url() if any
            (r'url\((?:\.\./)*assets/images/([^)]+)\)', f'url({rel_path}/\\1)'),
        ]

        changes_made = 0
        for pattern, replacement in patterns:
            new_content, count = re.subn(pattern, replacement, content)
            if count > 0:
                content = new_content
                changes_made += count

        # Only write if changes were made
        if content != original_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            return changes_made

        return 0

    except Exception as e:
        print(f"  ERROR processing {html_file}: {e}")
        return 0

def update_all_html_files():
    """Update all HTML files across all directories."""
    target_images_dir = base_path / "assets" / "images"

    stats = {
        'files_processed': 0,
        'files_updated': 0,
        'total_changes': 0,
        'errors': []
    }

    print(f"Updating HTML files to use: {target_images_dir}\n")

    for html_dir in html_dirs:
        if not html_dir.exists():
            print(f"Skipping non-existent directory: {html_dir}")
            continue

        print(f"Processing: {html_dir.name}/")

        # Find all HTML files in this directory
        html_files = list(html_dir.glob("*.html"))

        for html_file in sorted(html_files):
            stats['files_processed'] += 1
            changes = update_html_file(html_file, target_images_dir)

            if changes > 0:
                stats['files_updated'] += 1
                stats['total_changes'] += changes
                print(f"  ✓ {html_file.name}: {changes} changes")
            else:
                print(f"  - {html_file.name}: no changes needed")

        print()

    return stats

if __name__ == '__main__':
    print("=" * 70)
    print("HTML Image Path Update Script")
    print("=" * 70 + "\n")

    stats = update_all_html_files()

    print("=" * 70)
    print("Summary:")
    print(f"  Files processed: {stats['files_processed']}")
    print(f"  Files updated: {stats['files_updated']}")
    print(f"  Total changes made: {stats['total_changes']}")
    print("=" * 70)
