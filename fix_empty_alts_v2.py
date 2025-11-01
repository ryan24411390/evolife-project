#!/usr/bin/env python3
"""
Fix empty alt tags - v2
Handles minified HTML format where alt="" comes before class
"""

import re
from pathlib import Path
from datetime import datetime

# Direct replacements for empty alt tags based on class names
ALT_FIXES = [
    # Chip/toggle icons
    (r'alt="" class="chip-item__img"', 'alt="Status indicator icon" class="chip-item__img"'),

    # List icons
    (r'alt="" class="lockdown-list__icon"', 'alt="Feature check mark" class="lockdown-list__icon"'),

    # Product images
    (r'alt="" class="lowdown-card__img"', 'alt="Treatment product image" class="lowdown-card__img"'),

    # Edge/benefit cards
    (r'alt="" class="edge__card-img"', 'alt="Health benefit illustration" class="edge__card-img"'),

    # Results timeline icons
    (r'alt="" class="mb-2 expect-results__img"', 'alt="Results timeline visualization" class="mb-2 expect-results__img"'),

    # Navigation icons
    (r'alt="" class="card-slider_nav-icon w-embed"', 'alt="Slider navigation" class="card-slider_nav-icon w-embed"'),

    # Various other empty alts based on common patterns
    (r'alt=""([^>]*?)src="[^"]*check-circle', 'alt="Check mark icon"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*Stethoscope', 'alt="Medical care icon"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*Graph', 'alt="Analytics icon"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*iPhone', 'alt="Mobile app icon"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*down-arrow', 'alt="Decrease indicator"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*up-arrow', 'alt="Increase indicator"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*Lightbulb', 'alt="Energy icon"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*fire', 'alt="Performance icon"\\1src="'),
    (r'alt=""([^>]*?)src="[^"]*muscle', 'alt="Strength icon"\\1src="'),
]

def fix_empty_alts(content):
    """Fix empty alt attributes"""
    changes = []

    for pattern, replacement in ALT_FIXES:
        count_before = len(re.findall(pattern, content))
        if count_before > 0:
            content = re.sub(pattern, replacement, content)
            # Extract alt text for reporting
            alt_text = re.search(r'alt="([^"]+)"', replacement)
            if alt_text:
                changes.append(f"  - '{alt_text.group(1)}' ({count_before} images)")

    return content, changes

def process_file(file_path):
    """Process a single file"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Count empty alts
    empty_before = len(re.findall(r'alt=""', content))
    print(f"Empty alt tags before: {empty_before}")

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.alt_v2_backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Fix empty alts
    new_content, changes = fix_empty_alts(content)

    # Count after
    empty_after = len(re.findall(r'alt=""', new_content))
    fixed = empty_before - empty_after

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Alt text added:")
    for change in changes:
        print(change)

    print(f"\n✓ Fixed: {fixed} empty alt attributes")
    print(f"  Empty alts remaining: {empty_after}")

    if empty_after > 0:
        print(f"\n💡 Remaining empty alts are likely decorative images")
        print(f"   Consider adding role='presentation' to these")

    return fixed

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - ALT TAG FIX V2")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    files = ['mens-health.html', 'recovery.html', 'weight-management.html']

    total_fixed = 0

    for filename in files:
        file_path = base_path / filename
        if file_path.exists():
            fixed = process_file(file_path)
            total_fixed += fixed

    print("\n" + "="*60)
    print("COMPLETE")
    print("="*60)
    print(f"\n✅ Total alt tags fixed: {total_fixed}")
    print(f"\n📊 Accessibility Impact:")
    print(f"   - WCAG 2.1 Level A: Improved")
    print(f"   - Screen reader support: Enhanced")
    print(f"   - SEO: Image indexing improved")

if __name__ == "__main__":
    main()
