#!/usr/bin/env python3
"""
Fix empty alt tags for WCAG 2.1 AA compliance
Adds descriptive alt text based on image context
"""

import re
from pathlib import Path
from datetime import datetime

# Alt text mapping based on image purpose and context
ALT_TEXT_RULES = [
    # Icons and UI elements
    (r'alt=""\s+class="[^"]*chip-item__img[^"]*"[^>]*src="[^"]*down-arrow', 'alt="Downward trend indicator"'),
    (r'alt=""\s+class="[^"]*chip-item__img[^"]*"[^>]*src="[^"]*up-arrow', 'alt="Upward trend indicator"'),
    (r'alt=""\s+class="[^"]*lockdown-list__icon[^"]*"[^>]*src="[^"]*check-circle', 'alt="Check mark icon"'),
    (r'alt=""\s+class="[^"]*lockdown-list__icon[^"]*"[^>]*src="[^"]*Stethoscope', 'alt="Medical stethoscope icon"'),
    (r'alt=""\s+class="[^"]*lockdown-list__icon[^"]*"[^>]*src="[^"]*Graph', 'alt="Analytics graph icon"'),
    (r'alt=""\s+class="[^"]*lockdown-list__icon[^"]*"[^>]*src="[^"]*iPhone', 'alt="Mobile device icon"'),

    # Product/treatment images
    (r'alt=""\s+class="[^"]*lowdown-card__img[^"]*"[^>]*src="[^"]*pill', 'alt="Medication capsule illustration"'),
    (r'alt=""\s+class="[^"]*edge__card-img[^"]*"[^>]*src="[^"]*edge-card-1', 'alt="Person with increased energy and vitality"'),
    (r'alt=""\s+class="[^"]*edge__card-img[^"]*"[^>]*src="[^"]*edge-card-2', 'alt="Individual experiencing improved health"'),
    (r'alt=""\s+class="[^"]*edge__card-img[^"]*"[^>]*src="[^"]*edge-card-3', 'alt="Active lifestyle and fitness imagery"'),

    # Results/timeline icons
    (r'alt=""\s+([^>]*src="[^"]*Lightbulb)', 'alt="Energy boost icon" \\1'),
    (r'alt=""\s+([^>]*src="[^"]*fire\.svg)', 'alt="Performance enhancement icon" \\1'),
    (r'alt=""\s+([^>]*src="[^"]*muscle\.svg)', 'alt="Physical improvement icon" \\1'),

    # Navigation/UI arrows
    (r'alt=""\s+class="[^"]*levels-link__img[^"]*"[^>]*src="[^"]*arrow-right', 'alt="Navigate forward"'),
    (r'alt="Right arrow"', 'alt="Navigate forward arrow"'),  # Enhance existing

    # Social media icons
    (r'alt="Follow Evolife on Facebook"\s+class="[^"]*is-trt__icon', 'alt="Facebook social media icon"'),
    (r'alt="Follow Evolife on Instagram"\s+class="[^"]*is-trt__icon', 'alt="Instagram social media icon"'),
    (r'alt="Follow Evolife on Tik-Tok"\s+class="[^"]*is-trt__icon', 'alt="TikTok social media icon"'),
    (r'alt="Follow Evolife on Linkedin"\s+class="[^"]*is-trt__icon', 'alt="LinkedIn social media icon"'),

    # Hero and main images
    (r'alt="Friday testosterone pills"', 'alt="Evolife prescription medication packaging"'),
    (r'alt="Evolife - Build the stronger sharper you"', 'alt="Evolife Wellness treatment solutions"'),

    # Logo
    (r'alt="Evolife"\s+class="[^"]*footer_logo', 'alt="Evolife Wellness logo"'),
    (r'alt="Evolife logo"\s+class="[^"]*logo\.is-', 'alt="Evolife Wellness company logo"'),

    # Chart/data visualization
    (r'alt="Testosterone vs Placebo chart"', 'alt="Clinical study results chart"'),

    # Generic decorative images that should stay empty but need role
    # These are handled separately
]

# Images that should remain decorative (alt="") but need role="presentation"
DECORATIVE_PATTERNS = [
    r'class="[^"]*card-gradient[^"]*"',
    r'class="[^"]*background[^"]*"',
    r'class="[^"]*decoration[^"]*"',
]

def fix_alt_tags_in_content(content):
    """Apply all alt text rules to content"""
    changes_made = []

    for pattern, replacement in ALT_TEXT_RULES:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
            # Count how many times this pattern was replaced
            count = len(re.findall(re.escape(replacement.split('alt="')[1].split('"')[0]), content))
            changes_made.append(f"  - Added '{replacement.split('alt=\"')[1].split('\"')[0]}' ({len(matches)} images)")

    # Fix remaining generic empty alts in specific contexts
    # For images in product cards without alt text
    content = re.sub(
        r'(<img[^>]+class="[^"]*lowdown-card__img[^"]*"[^>]+)alt=""',
        r'\\1alt="Product illustration"',
        content
    )

    # For images in testimonials
    content = re.sub(
        r'(<img[^>]+class="[^"]*testimonial[^"]*"[^>]+)alt=""',
        r'\\1alt="Customer testimonial"',
        content
    )

    return content, changes_made

def fix_alt_tags_in_file(file_path):
    """Fix alt tags in a single HTML file"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Count empty alt tags before
    empty_alts_before = len(re.findall(r'alt=""', content))
    print(f"Empty alt tags found: {empty_alts_before}")

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.alt_backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Apply fixes
    new_content, changes = fix_alt_tags_in_content(content)

    # Count empty alt tags after
    empty_alts_after = len(re.findall(r'alt=""', content))
    fixed_count = empty_alts_before - empty_alts_after

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Changes applied:")
    if changes:
        for change in changes:
            print(change)
    else:
        print("  - No specific pattern matches (may need manual review)")

    print(f"\n✓ Fixed {fixed_count} empty alt attributes")
    print(f"  Remaining empty alts: {empty_alts_after}")

    if empty_alts_after > 0:
        print(f"\n⚠ Note: {empty_alts_after} images still have empty alt text.")
        print("  These may be decorative and should have role='presentation'")

    print(f"✓ File updated: {file_path.name}")

    return fixed_count

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE PAGES - ALT TAG ACCESSIBILITY FIX")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    files_to_process = [
        'mens-health.html',
        'recovery.html',
        'weight-management.html'
    ]

    total_fixed = 0

    for filename in files_to_process:
        file_path = base_path / filename
        if file_path.exists():
            fixed = fix_alt_tags_in_file(file_path)
            total_fixed += fixed
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"ALT TAG FIX COMPLETE")
    print("="*60)
    print(f"\n✅ Total alt attributes fixed: {total_fixed}")
    print("\nAccessibility improvements:")
    print("  ✓ Descriptive alt text for informational images")
    print("  ✓ Context-appropriate descriptions")
    print("  ✓ Icon descriptions for UI elements")
    print("  ✓ Product image descriptions")
    print("\nWCAG 2.1 Level A compliance: Significantly improved")
    print("\n⚠ Recommendation: Review remaining empty alts manually")
    print("  Decorative images should have: alt='' role='presentation'")

if __name__ == "__main__":
    main()
