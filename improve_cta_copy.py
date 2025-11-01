#!/usr/bin/env python3
"""
Improve CTA copy variety with context-specific messaging
Phase 4.2: Replace repetitive "Get Started" with varied, contextual CTAs
"""

import re
from pathlib import Path
from datetime import datetime

# CTA improvements - pattern and replacement pairs
# Each tuple: (pattern_to_match, new_button_text, context_description)

def get_cta_improvements(category):
    """Get category-specific CTA improvements"""

    # Common patterns across all pages
    improvements = [
        # Hero section - make it action-oriented
        (
            r'(<div class="testosterone-content">.*?<a href="/get-started\.html\?category=[^"]*" class="button-18[^"]*">)[^<]*(</a>)',
            r'\1Start Your Assessment\2',
            "Hero CTA"
        ),

        # After "We make it easy" section - focus on beginning
        (
            r'(<div class="section__make-it-easy.*?</div></div><a href="/get-started\.html\?category=[^"]*" class="button-18[^"]*" aria-label="[^"]*">)[^<]*(</a></div></div></div>)',
            r'\1Begin My Treatment Plan\2',
            "Process section CTA"
        ),

        # After "Expert care" section - emphasize consultation
        (
            r'(<div class="section__expert-care.*?<div class="text-md mb-2">.*?</div><a href="/get-started\.html\?category=[^"]*" class="button-18[^"]*" aria-label="[^"]*">)[^<]*(</a>)',
            r'\1Schedule Free Consultation\2',
            "Expert care CTA"
        ),

        # After results timeline - qualification focus
        (
            r'(<div class="section__results.*?<div class="w-layout-vflex results__card-stack mb-2">.*?</div></div><a href="/get-started\.html\?category=[^"]*" class="button-18[^"]*" aria-label="[^"]*">)[^<]*(</a>)',
            r'\1See If I Qualify\2',
            "Results section CTA"
        ),

        # After edge/benefits cards - exploration focus
        (
            r'(<div class="card-slider__actions"><a href="/get-started\.html\?category=[^"]*" class="button-22[^"]*">)[^<]*(</a>)',
            r'\1Explore My Options\2',
            "Benefits cards CTA"
        ),

        # After testimonials - community/action focus
        (
            r'(<div class="section__testimonials.*?</div></div></div></div><a href="/get-started\.html\?category=[^"]*" class="button-21[^"]*">)[^<]*(</a>)',
            r'\1Get Started Today\2',
            "Testimonials CTA"
        ),

        # Final "Friday feeling" section - strong closing CTA
        (
            r'(<div class="section_fridays-feeling.*?<p class="text-size-medium-4 text-color-white mb-2">.*?</p><a href="/get-started\.html\?category=[^"]*" class="button-18[^"]*" aria-label="[^"]*">)[^<]*(</a>)',
            r'\1Start My Journey\2',
            "Final section CTA"
        ),
    ]

    return improvements

def apply_cta_improvements(content, improvements):
    """Apply CTA copy improvements"""
    changes = []

    for pattern, replacement, context in improvements:
        matches = re.findall(pattern, content, re.DOTALL)
        if matches:
            old_content = content
            content = re.sub(pattern, replacement, content, flags=re.DOTALL)
            if old_content != content:
                # Extract the new button text
                button_text = re.search(r'\\1([^\\]+)\\2', replacement)
                if button_text:
                    changes.append(f"  - {context}: '{button_text.group(1)}'")
                else:
                    changes.append(f"  - {context}: Updated")

    return content, changes

def process_file(file_path, category):
    """Process a single file with CTA improvements"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name} - {category}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.cta_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Get CTA improvements
    improvements = get_cta_improvements(category)

    # Apply improvements
    new_content, changes = apply_cta_improvements(content, improvements)

    if not changes:
        print("✓ No CTAs to update or already updated")
        return True

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ CTA copy improved ({len(changes)} buttons updated):")
    for change in changes:
        print(change)

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - IMPROVE CTA COPY VARIETY")
    print("="*60)
    print("\nPhase 4.2: Context-specific call-to-action messaging")

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    pages = [
        ('mens-health.html', "Men's Health"),
        ('recovery.html', 'Recovery'),
        ('weight-management.html', 'Weight Management')
    ]

    success_count = 0

    for filename, category in pages:
        file_path = base_path / filename
        if file_path.exists():
            if process_file(file_path, category):
                success_count += 1
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"CTA COPY IMPROVEMENT COMPLETE: {success_count}/3 pages")
    print("="*60)

    if success_count == 3:
        print("\n✅ All CTAs updated with varied, contextual copy!")
        print("\n🎯 CTA Strategy:")
        print("  ✓ Hero: 'Start Your Assessment' - immediate action")
        print("  ✓ Process: 'Begin My Treatment Plan' - ownership")
        print("  ✓ Expert Care: 'Schedule Free Consultation' - low barrier")
        print("  ✓ Results: 'See If I Qualify' - qualification focus")
        print("  ✓ Benefits: 'Explore My Options' - exploration")
        print("  ✓ Testimonials: 'Get Started Today' - urgency")
        print("  ✓ Final: 'Start My Journey' - aspirational")
        print("\n📊 Benefits:")
        print("  - Reduced repetition (no more 8x 'Get Started')")
        print("  - Context-appropriate messaging")
        print("  - Better conversion through varied psychology")
        print("  - More engaging user experience")
        print("  - Progressive commitment ladder")

if __name__ == "__main__":
    main()
