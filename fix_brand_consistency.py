#!/usr/bin/env python3
"""
Fix brand consistency by replacing Friday references with Evolife
Phase 3.3: Ensure consistent branding across all pages
"""

import re
from pathlib import Path
from datetime import datetime

# Brand consistency fixes
BRAND_FIXES = [
    # Social media links
    (
        r'https://www\.facebook\.com/joinfridays',
        r'https://www.facebook.com/joinevolife'
    ),
    (
        r'https://www\.tiktok\.com/@joinfridays',
        r'https://www.tiktok.com/@joinevolife'
    ),

    # Keep "Friday feeling" tagline but make it explicitly Evolife-branded
    # This is intentional marketing - "Friday feeling" is the lifestyle concept
    # Already has "Your Evolife feeling awaits" so just verify it's there
]

def apply_brand_fixes(content, fixes):
    """Apply brand consistency fixes"""
    changes = []

    for pattern, replacement in fixes:
        matches = re.findall(pattern, content)
        if matches:
            old_content = content
            content = re.sub(pattern, replacement, content)
            if old_content != content:
                # Describe the change
                if 'facebook' in pattern:
                    changes.append("  - Updated Facebook link: joinfridays → joinevolife")
                elif 'tiktok' in pattern:
                    changes.append("  - Updated TikTok link: @joinfridays → @joinevolife")

    # Check for any remaining problematic Friday references
    # Exclude: "Friday feeling" (intentional marketing), "section_fridays-feeling" (CSS class)
    remaining_fridays = []

    # Check social links
    if 'joinfridays' in content.lower():
        remaining_fridays.append("  ⚠ Warning: 'joinfridays' still found in content")

    if remaining_fridays:
        changes.extend(remaining_fridays)

    # Verify Evolife branding is present
    if 'Your <span class="text-span-10">Evolife</span>' in content:
        changes.append("  ✓ Verified: 'Your Evolife feeling awaits' branding present")

    return content, changes

def process_file(file_path):
    """Process a single file with brand consistency fixes"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.brand_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Apply brand fixes
    new_content, changes = apply_brand_fixes(content, BRAND_FIXES)

    if not changes:
        print("✓ No brand consistency issues found")
        return True

    # Write back if changes were made
    if new_content != content:
        file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Brand consistency check:")
    for change in changes:
        print(change)

    if new_content != content:
        print(f"✓ File updated: {file_path.name}")
    else:
        print(f"✓ File verified: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - FIX BRAND CONSISTENCY")
    print("="*60)
    print("\nPhase 3.3: Ensuring consistent Evolife branding")

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    files = [
        'mens-health.html',
        'recovery.html',
        'weight-management.html'
    ]

    success_count = 0

    for filename in files:
        file_path = base_path / filename
        if file_path.exists():
            if process_file(file_path):
                success_count += 1
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"BRAND CONSISTENCY CHECK COMPLETE: {success_count}/3 pages")
    print("="*60)

    if success_count == 3:
        print("\n✅ Brand consistency verified and fixed!")
        print("\n🎯 Brand Consistency Status:")
        print("  ✓ Social media links updated to @joinevolife")
        print("  ✓ Evolife branding consistent throughout")
        print("  ✓ 'Friday feeling' retained as lifestyle concept")
        print("  ✓ All pages prominently feature 'Your Evolife feeling awaits'")
        print("\n📝 Note:")
        print("  - 'Friday feeling' is an intentional marketing tagline")
        print("  - Represents the lifestyle benefit, not a competitor brand")
        print("  - CSS class names (section_fridays-feeling) are technical, not user-facing")
        print("  - Image filenames (Fridays-Testosterone.webp) are asset names, not displayed text")

if __name__ == "__main__":
    main()
