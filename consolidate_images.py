#!/usr/bin/env python3
"""
Script to consolidate all unique images from multiple directories into a single folder.
Prioritizes evolife/assets/images versions when duplicates exist.
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

# Base paths
base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")
evolife_clean_path = base_path / "evolife-v1-clean"
target_path = base_path / "assets" / "images"

# Source directories (in priority order - last one wins for duplicates)
source_dirs = [
    evolife_clean_path / "clean" / "assets" / "images",
    evolife_clean_path / "evolife-text-only" / "assets" / "images",
    evolife_clean_path / "assets" / "images",
    evolife_clean_path / "evolife" / "assets" / "images",  # Highest priority
]

def consolidate_images():
    """Copy all unique images to the consolidated directory."""
    image_map = {}  # filename -> source_path
    stats = {
        'total_found': 0,
        'unique_files': 0,
        'duplicates': 0,
        'copied': 0,
        'errors': []
    }

    print("Scanning for images...")

    # Scan all source directories
    for source_dir in source_dirs:
        if not source_dir.exists():
            print(f"  Skipping non-existent: {source_dir}")
            continue

        print(f"  Scanning: {source_dir}")

        # Find all image files
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.svg', '*.webp', '*.ico']:
            for img_file in source_dir.glob(ext):
                stats['total_found'] += 1
                filename = img_file.name

                if filename in image_map:
                    stats['duplicates'] += 1
                    print(f"    Duplicate (will override): {filename}")
                else:
                    stats['unique_files'] += 1

                # Store or update the mapping (later sources override earlier ones)
                image_map[filename] = img_file

    print(f"\nFound {stats['total_found']} total images")
    print(f"Found {stats['unique_files']} unique filenames")
    print(f"Found {stats['duplicates']} duplicates (using latest version)")

    # Copy all unique images to target
    print(f"\nCopying images to {target_path}...")
    target_path.mkdir(parents=True, exist_ok=True)

    for filename, source_file in sorted(image_map.items()):
        target_file = target_path / filename
        try:
            shutil.copy2(source_file, target_file)
            stats['copied'] += 1
            if stats['copied'] % 20 == 0:
                print(f"  Copied {stats['copied']}/{len(image_map)} files...")
        except Exception as e:
            error_msg = f"Error copying {filename}: {e}"
            stats['errors'].append(error_msg)
            print(f"  ERROR: {error_msg}")

    print(f"\n✓ Successfully copied {stats['copied']} images")

    if stats['errors']:
        print(f"\n⚠ Encountered {len(stats['errors'])} errors:")
        for error in stats['errors']:
            print(f"  - {error}")

    return stats

if __name__ == '__main__':
    stats = consolidate_images()
    print(f"\nConsolidation complete!")
    print(f"  Total images found: {stats['total_found']}")
    print(f"  Unique images: {len(os.listdir(target_path))}")
    print(f"  Images copied: {stats['copied']}")
