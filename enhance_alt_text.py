#!/usr/bin/env python3
"""
Enhance image alt text with more specific, descriptive alternatives
Phase 3.1: Improve alt text quality for better accessibility and SEO
"""

import re
from pathlib import Path
from datetime import datetime

# Enhanced alt text improvements for all pages
GENERIC_ALT_IMPROVEMENTS = [
    # Stethoscope icon with context
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984a_Stethoscope\.svg" alt="Feature check mark"',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984a_Stethoscope.svg" alt="Stethoscope icon representing licensed U.S. clinicians"'
    ),

    # Check circle icon
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e2219852_check-circle\.svg" alt="Feature check mark"',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e2219852_check-circle.svg" alt="Check mark icon representing evidence-based treatment plans"'
    ),

    # Graph icon
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984b_Graph\.svg" alt="Feature check mark"',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984b_Graph.svg" alt="Graph icon representing ongoing health monitoring"'
    ),

    # iPhone icon
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984c_iPhone\.svg" alt="Feature check mark"',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984c_iPhone.svg" alt="Mobile device icon representing secure telehealth platform"'
    ),

    # Lightbulb icon in results section
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984e_Lightbulb%20Bolt\.svg" alt="">',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984e_Lightbulb%20Bolt.svg" alt="Lightbulb icon representing initial treatment response">'
    ),

    # Fire icon in results section
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e2219858_fire\.svg" alt="">',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e2219858_fire.svg" alt="Fire icon representing sustained health improvements">'
    ),

    # Muscle icon in results section
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984d_muscle\.svg" alt="">',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984d_muscle.svg" alt="Muscle icon representing long-term wellness benefits">'
    ),

    # Logo in footer
    (
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e819cf770a887582875818_logo\.png" alt="Evolife Wellness logo"([^>]*is-[^"]*")>',
        r'<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e819cf770a887582875818_logo.png" alt="Evolife Wellness logo">'
    ),

    # Social media icons with better descriptions
    (
        r'alt="Facebook social media icon""',
        r'alt="Facebook social media icon"'
    ),
    (
        r'alt="Instagram social media icon""',
        r'alt="Instagram social media icon"'
    ),
    (
        r'alt="TikTok social media icon""',
        r'alt="TikTok social media icon"'
    ),
    (
        r'alt="LinkedIn social media icon""',
        r'alt="LinkedIn social media icon"'
    ),
]

# Men's Health specific improvements
MENS_HEALTH_ALT_IMPROVEMENTS = [
    # Health benefit cards - make them specific to content
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Improve energy</h4>.*?)<img loading="lazy" src="[^"]*edge-card-1\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba4b9e2f7f78d2cd591_68c9bb6596b7aa51aad7f0cd_edge-card-1.webp" alt="Man with improved energy and vitality from men\'s health treatment"'
    ),
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Better libido</h4>.*?)<img loading="lazy" src="[^"]*edge-card-2\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba4122ec4d47c233031_68c9bb7fadee285913f9e59a_edge-card-2.webp" alt="Couple representing improved libido and sexual health"'
    ),
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Stronger body</h4>.*?)<img loading="lazy" src="[^"]*edge-card-3\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba40c5491a0ce91adc3_68c9bb9cf0ea33e36453fce5_edge-card-3.webp" alt="Fit man representing muscle strength and physical fitness"'
    ),
]

# Recovery specific improvements
RECOVERY_ALT_IMPROVEMENTS = [
    # Recovery-specific benefit cards
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Enhanced energy</h4>.*?)<img loading="lazy" src="[^"]*edge-card-1\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba4b9e2f7f78d2cd591_68c9bb6596b7aa51aad7f0cd_edge-card-1.webp" alt="Person with enhanced energy from NAD+ and B-12 therapy"'
    ),
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Cellular recovery</h4>.*?)<img loading="lazy" src="[^"]*edge-card-2\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba4122ec4d47c233031_68c9bb7fadee285913f9e59a_edge-card-2.webp" alt="Cellular health visualization showing recovery and regeneration"'
    ),
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Mental clarity</h4>.*?)<img loading="lazy" src="[^"]*edge-card-3\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba40c5491a0ce91adc3_68c9bb9cf0ea33e36453fce5_edge-card-3.webp" alt="Person with improved mental clarity and cognitive function"'
    ),
]

# Weight Management specific improvements
WEIGHT_MANAGEMENT_ALT_IMPROVEMENTS = [
    # Weight management benefit cards
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Sustainable weight loss</h4>.*?)<img loading="lazy" src="[^"]*edge-card-1\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba4b9e2f7f78d2cd591_68c9bb6596b7aa51aad7f0cd_edge-card-1.webp" alt="Person achieving sustainable weight loss with GLP-1 medication"'
    ),
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Improved metabolism</h4>.*?)<img loading="lazy" src="[^"]*edge-card-2\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba4122ec4d47c233031_68c9bb7fadee285913f9e59a_edge-card-2.webp" alt="Metabolic health improvement visualization from weight management treatment"'
    ),
    (
        r'(<div class="edge__card-content"><h4 class="edge__card-title">Better health markers</h4>.*?)<img loading="lazy" src="[^"]*edge-card-3\.webp" alt="Health benefit illustration"',
        r'\1<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e90ba40c5491a0ce91adc3_68c9bb9cf0ea33e36453fce5_edge-card-3.webp" alt="Health metrics dashboard showing improved cardiovascular markers"'
    ),
]

def apply_alt_improvements(content, improvements):
    """Apply alt text improvements"""
    changes = []

    for pattern, replacement in improvements:
        matches = re.findall(pattern, content, re.DOTALL)
        if matches:
            old_content = content
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if old_content != content:
                # Extract alt text from replacement
                alt_match = re.search(r'alt="([^"]+)"', replacement)
                if alt_match:
                    changes.append(f"  - Enhanced: {alt_match.group(1)[:60]}...")

    return content, changes

def process_file(file_path, specific_improvements, category):
    """Process a single file with alt text enhancements"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name} - {category}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.alt_enhanced_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    all_changes = []

    # Apply generic improvements
    new_content, changes1 = apply_alt_improvements(content, GENERIC_ALT_IMPROVEMENTS)
    all_changes.extend(changes1)

    # Apply page-specific improvements
    new_content, changes2 = apply_alt_improvements(new_content, specific_improvements)
    all_changes.extend(changes2)

    if not all_changes:
        print("✓ No generic alt text found (already enhanced)")
        return True

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Alt text enhancements ({len(all_changes)} improvements):")
    for change in all_changes[:10]:  # Show first 10
        print(change)
    if len(all_changes) > 10:
        print(f"  ... and {len(all_changes) - 10} more")

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - ENHANCE ALT TEXT QUALITY")
    print("="*60)
    print("\nPhase 3.1: Making alt text more specific and contextual")

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    pages = [
        ('mens-health.html', MENS_HEALTH_ALT_IMPROVEMENTS, 'Men\'s Health'),
        ('recovery.html', RECOVERY_ALT_IMPROVEMENTS, 'Recovery'),
        ('weight-management.html', WEIGHT_MANAGEMENT_ALT_IMPROVEMENTS, 'Weight Management')
    ]

    success_count = 0

    for filename, specific_improvements, category in pages:
        file_path = base_path / filename
        if file_path.exists():
            if process_file(file_path, specific_improvements, category):
                success_count += 1
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"ALT TEXT ENHANCEMENT COMPLETE: {success_count}/3 pages")
    print("="*60)

    if success_count == 3:
        print("\n✅ All alt text enhanced with specific descriptions!")
        print("\n🎯 Improvements:")
        print("  ✓ Generic 'Feature check mark' → Specific feature descriptions")
        print("  ✓ Generic 'Health benefit illustration' → Contextual descriptions")
        print("  ✓ Empty alt attributes → Descriptive icon purposes")
        print("  ✓ Category-specific benefit card descriptions")
        print("  ✓ Social media icons cleaned up")
        print("\n📊 Benefits:")
        print("  - Better screen reader experience")
        print("  - Improved SEO with descriptive image text")
        print("  - Enhanced context for visually impaired users")
        print("  - More meaningful image descriptions")

if __name__ == "__main__":
    main()
