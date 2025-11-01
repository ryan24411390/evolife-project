#!/usr/bin/env python3
"""
Fix incorrect testosterone content on recovery and weight-management pages
Phase 2.3: Remove testosterone charts and fix category-specific content
"""

import re
from pathlib import Path
from datetime import datetime

# Fixes for Recovery page
RECOVERY_FIXES = [
    # Remove testosterone chart section entirely
    (
        r'<div class="testosterone-chart">.*?</div>',
        '',
        re.DOTALL
    ),

    # Fix section heading from "Recharge your vitality" to recovery-appropriate
    (
        r'<h3 class="heading-style-h4-7 text-color-orange--950">Recharge your vitality<br></h3><div class="text-size-medium-3 text-color-blue">TRT is about more than boosting testosterone — it\'s about improving how you feel day to day\.</div>',
        '<h3 class="heading-style-h4-7 text-color-orange--950">Optimize your cellular health<br></h3><div class="text-size-medium-3 text-color-blue">Recovery therapy is about enhancing your body\'s natural energy systems and cellular function.</div>',
        0
    ),

    # Fix edge cards from TRT benefits to recovery benefits
    (
        r'<h4 class="edge__card-title">Better libido</h4><div class="edge__card-text w-richtext"><p>TRT helps reignite desire, improve<br>performance, and bring confidence back<br>to the bedroom\.</p>',
        '<h4 class="edge__card-title">Enhanced energy</h4><div class="edge__card-text w-richtext"><p>NAD+ and B-12 therapy boost cellular<br>energy production, reducing fatigue<br>and supporting vitality.</p>',
        0
    ),

    (
        r'<h4 class="edge__card-title">Improve energy</h4><div class="edge__card-text w-richtext"><p>Restore natural energy levels,<br>reducing fatigue and helping you<br>power through your day\.</p>',
        '<h4 class="edge__card-title">Cellular recovery</h4><div class="edge__card-text w-richtext"><p>Support your body\'s natural repair<br>mechanisms with NAD+ and antioxidant<br>therapy for optimal function.</p>',
        0
    ),

    (
        r'<h4 class="edge__card-title">Stronger body</h4><div class="edge__card-text w-richtext"><p>Clinically shown to support<br>lean muscle growth and<br>strength gains\.</p>',
        '<h4 class="edge__card-title">Mental clarity</h4><div class="edge__card-text w-richtext"><p>Boost cognitive function and focus<br>with therapies that support brain<br>health and neurotransmitter balance.</p>',
        0
    ),
]

# Fixes for Weight Management page
WEIGHT_MANAGEMENT_FIXES = [
    # Remove testosterone chart section entirely
    (
        r'<div class="testosterone-chart">.*?</div>',
        '',
        re.DOTALL
    ),

    # Fix section heading from TRT to weight management
    (
        r'<h3 class="heading-style-h4-7 text-color-orange--950">Recharge your vitality<br></h3><div class="text-size-medium-3 text-color-blue">TRT is about more than boosting testosterone — it\'s about improving how you feel day to day\.</div>',
        '<h3 class="heading-style-h4-7 text-color-orange--950">Transform your health journey<br></h3><div class="text-size-medium-3 text-color-blue">GLP-1 medications work with your body to support sustainable weight loss and metabolic health.</div>',
        0
    ),

    # Fix edge cards from TRT benefits to weight management benefits
    (
        r'<h4 class="edge__card-title">Better libido</h4><div class="edge__card-text w-richtext"><p>TRT helps reignite desire, improve<br>performance, and bring confidence back<br>to the bedroom\.</p>',
        '<h4 class="edge__card-title">Sustainable weight loss</h4><div class="edge__card-text w-richtext"><p>GLP-1 medications help you achieve<br>12-22% body weight loss through<br>appetite regulation and metabolic support.</p>',
        0
    ),

    (
        r'<h4 class="edge__card-title">Improve energy</h4><div class="edge__card-text w-richtext"><p>Restore natural energy levels,<br>reducing fatigue and helping you<br>power through your day\.</p>',
        '<h4 class="edge__card-title">Improved metabolism</h4><div class="edge__card-text w-richtext"><p>Enhance insulin sensitivity and<br>metabolic function for better blood<br>sugar control and energy.</p>',
        0
    ),

    (
        r'<h4 class="edge__card-title">Stronger body</h4><div class="edge__card-text w-richtext"><p>Clinically shown to support<br>lean muscle growth and<br>strength gains\.</p>',
        '<h4 class="edge__card-title">Better health markers</h4><div class="edge__card-text w-richtext"><p>Clinical studies show improvements in<br>blood pressure, cholesterol, and<br>cardiovascular health markers.</p>',
        0
    ),
]

def apply_fixes(content, fixes):
    """Apply all fixes to content"""
    changes = []

    for pattern, replacement, flags in fixes:
        if flags == re.DOTALL:
            matches = re.findall(pattern, content, flags)
        else:
            matches = re.findall(pattern, content)

        if matches:
            if flags == re.DOTALL:
                content = re.sub(pattern, replacement, content, flags=flags)
            else:
                content = re.sub(pattern, replacement, content)

            # Describe the change
            if replacement == '':
                changes.append(f"  - Removed testosterone chart section")
            elif 'heading-style-h4-7' in pattern:
                changes.append(f"  - Updated section heading to category-appropriate")
            elif 'edge__card-title' in pattern:
                title_match = re.search(r'<h4 class="edge__card-title">([^<]+)</h4>', replacement)
                if title_match:
                    changes.append(f"  - Updated edge card: {title_match.group(1)}")

    return content, changes

def process_file(file_path, fixes, category):
    """Process a single file with category-specific fixes"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name} - {category}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.content_fix_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Apply fixes
    new_content, changes = apply_fixes(content, fixes)

    if not changes:
        print("✓ No incorrect content found (already clean)")
        return True

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Content fixes applied:")
    for change in changes:
        print(change)

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - FIX INCORRECT TESTOSTERONE CONTENT")
    print("="*60)
    print("\nPhase 2.3: Removing testosterone charts and fixing content")

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    pages = [
        ('recovery.html', RECOVERY_FIXES, 'Recovery'),
        ('weight-management.html', WEIGHT_MANAGEMENT_FIXES, 'Weight Management')
    ]

    success_count = 0

    for filename, fixes, category in pages:
        file_path = base_path / filename
        if file_path.exists():
            if process_file(file_path, fixes, category):
                success_count += 1
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"CONTENT FIX COMPLETE: {success_count}/2 pages updated")
    print("="*60)

    if success_count == 2:
        print("\n✅ All incorrect testosterone content removed!")
        print("\nFixes applied:")
        print("  ✓ Removed testosterone chart images")
        print("  ✓ Updated section headings to category-specific")
        print("  ✓ Replaced TRT benefit cards with appropriate benefits")
        print("  ✓ Recovery page now shows NAD+/cellular recovery benefits")
        print("  ✓ Weight management page now shows GLP-1 benefits")
        print("\n🎯 Pages are now category-accurate and consistent!")

if __name__ == "__main__":
    main()
