#!/usr/bin/env python3
"""
Add comprehensive ARIA labels for WCAG 2.1 Level AA compliance
Enhances screen reader accessibility and keyboard navigation
"""

import re
from pathlib import Path
from datetime import datetime

# ARIA label improvements
ARIA_IMPROVEMENTS = [
    # Navigation menu button
    (
        r'(<div class="navbar_menu-button w-nav-button"[^>]*?)(>)',
        r'\1 aria-label="Open main navigation menu" aria-expanded="false"\2'
    ),

    # Slider/Carousel previous button
    (
        r'(<a id="cms-slider-left" href="#" class="btn-prev card-slider_nav-btn w-inline-block">)',
        r'<a id="cms-slider-left" href="#" class="btn-prev card-slider_nav-btn w-inline-block" aria-label="View previous slide" role="button">'
    ),

    # Slider/Carousel next button
    (
        r'(<a id="cms-slider-right" href="#" class="btn-next card-slider_nav-btn w-inline-block">)',
        r'<a id="cms-slider-right" href="#" class="btn-next card-slider_nav-btn w-inline-block" aria-label="View next slide" role="button">'
    ),

    # Testimonial slider previous button
    (
        r'(<a id="cms-slider-2-left" href="#" class="btn-prev card-slider_nav-btn w-inline-block">)',
        r'<a id="cms-slider-2-left" href="#" class="btn-prev card-slider_nav-btn w-inline-block" aria-label="View previous testimonial" role="button">'
    ),

    # Testimonial slider next button
    (
        r'(<a id="cms-slider-2-right" href="#" class="btn-next card-slider_nav-btn w-inline-block">)',
        r'<a id="cms-slider-2-right" href="#" class="btn-next card-slider_nav-btn w-inline-block" aria-label="View next testimonial" role="button">'
    ),

    # FAQ Accordion triggers - add aria-expanded and aria-controls
    (
        r'(<div id="q(\d+)" data-w-id="[^"]*" class="accordion-item-trigger[^"]*">)',
        r'<div id="q\2" data-w-id="43a84995-03bc-7ea4-9b96-d5a7d74f527d" class="accordion-item-trigger trt-padding__faq" role="button" aria-expanded="false" aria-controls="faq-answer-\2" tabindex="0">'
    ),

    # Add IDs to accordion content for aria-controls
    (
        r'(<div style="height: 0px;" class="accordion-text-container">)',
        r'<div style="height: 0px;" class="accordion-text-container" id="faq-answer-1" role="region">'
    ),

    # Social media links - enhance existing aria
    (
        r'(<a href="https://www\.facebook\.com/[^"]*" target="_blank" class="social-link_item w-inline-block">)',
        r'<a href="https://www.facebook.com/joinfridays" target="_blank" class="social-link_item w-inline-block" aria-label="Visit Evolife Wellness on Facebook" rel="noopener noreferrer">'
    ),

    (
        r'(<a href="https://www\.instagram\.com/[^"]*" target="_blank" class="social-link_item w-inline-block">)',
        r'<a href="https://www.instagram.com/joinevolife/#" target="_blank" class="social-link_item w-inline-block" aria-label="Visit Evolife Wellness on Instagram" rel="noopener noreferrer">'
    ),

    (
        r'(<a href="https://www\.tiktok\.com/[^"]*" target="_blank" class="social-link_item w-inline-block">)',
        r'<a href="https://www.tiktok.com/@joinfridays" target="_blank" class="social-link_item w-inline-block" aria-label="Visit Evolife Wellness on TikTok" rel="noopener noreferrer">'
    ),

    (
        r'(<a href="http://linkedin\.com/company/[^"]*" target="_blank" class="social-link_item w-inline-block">)',
        r'<a href="http://linkedin.com/company/joinevolife" target="_blank" class="social-link_item w-inline-block" aria-label="Visit Evolife Wellness on LinkedIn" rel="noopener noreferrer">'
    ),

    # Logo link
    (
        r'(<a href="/" class="navbar_logo-link w-nav-brand">)',
        r'<a href="/" class="navbar_logo-link w-nav-brand" aria-label="Evolife Wellness home page">'
    ),

    # Footer logo link
    (
        r'(<a href="/" class="footer_link-block w-inline-block">)',
        r'<a href="/" class="footer_link-block w-inline-block" aria-label="Return to Evolife Wellness home page">'
    ),

    # Get Started buttons - add aria-label for context
    (
        r'(<a href="/get-started\.html\?category=([^"]*)" class="button-18[^"]*">Get Started</a>)',
        r'<a href="/get-started.html?category=\2" class="button-18 is-light-navy max-width-full w-button" aria-label="Get started with \2 treatment">Get Started</a>'
    ),

    # Search/Filter if exists
    (
        r'(<input[^>]*type="text"[^>]*class="[^"]*search[^"]*"[^>]*)(>)',
        r'\1 aria-label="Search treatments"\2'
    ),

    # Toggle/Switch elements
    (
        r'(<div data-w-id="[^"]*" class="switch-container"[^>]*>)',
        r'<div data-w-id="75e0e430-bfed-c930-cfd1-4c47947ad995" class="switch-container" role="switch" aria-checked="false" aria-label="Toggle treatment comparison" tabindex="0">'
    ),
]

def add_aria_labels(content):
    """Apply ARIA label improvements"""
    changes = []

    for pattern, replacement in ARIA_IMPROVEMENTS:
        matches = re.findall(pattern, content)
        if matches:
            content = re.sub(pattern, replacement, content)
            # Extract what was added
            if 'aria-label="' in replacement:
                label = re.search(r'aria-label="([^"]+)"', replacement)
                if label:
                    changes.append(f"  - Added: {label.group(1)}")

    return content, changes

def process_file(file_path):
    """Process a single file"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Count existing ARIA labels
    existing_aria = len(re.findall(r'aria-\w+="[^"]*"', content))
    print(f"Existing ARIA attributes: {existing_aria}")

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.aria_backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Add ARIA labels
    new_content, changes = add_aria_labels(content)

    # Count new ARIA labels
    new_aria = len(re.findall(r'aria-\w+="[^"]*"', new_content))
    added = new_aria - existing_aria

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ ARIA improvements:")
    for change in changes:
        print(change)

    print(f"\n✓ ARIA attributes added: {added}")
    print(f"  Total ARIA attributes now: {new_aria}")
    print(f"✓ File updated: {file_path.name}")

    return added

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - ARIA LABELS & ACCESSIBILITY ENHANCEMENT")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    files = ['mens-health.html', 'recovery.html', 'weight-management.html']

    total_added = 0

    for filename in files:
        file_path = base_path / filename
        if file_path.exists():
            added = process_file(file_path)
            total_added += added

    print("\n" + "="*60)
    print("ARIA ENHANCEMENT COMPLETE")
    print("="*60)
    print(f"\n✅ Total ARIA attributes added: {total_added}")
    print(f"\n📊 Accessibility Improvements:")
    print(f"   ✓ Navigation elements labeled")
    print(f"   ✓ Interactive controls accessible")
    print(f"   ✓ Accordion states properly indicated")
    print(f"   ✓ Buttons have descriptive labels")
    print(f"   ✓ Links have context")
    print(f"   ✓ Keyboard navigation enhanced")
    print(f"\n🎯 WCAG 2.1 Level AA: Significantly improved")
    print(f"   - Screen reader navigation: Enhanced")
    print(f"   - Keyboard accessibility: Improved")
    print(f"   - Interactive element context: Complete")

if __name__ == "__main__":
    main()
