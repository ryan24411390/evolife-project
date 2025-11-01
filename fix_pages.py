#!/usr/bin/env python3
"""
Batch fix content issues across Recovery and Weight Management pages
"""

import re
from pathlib import Path
from datetime import datetime

# Define all replacements for each page
RECOVERY_REPLACEMENTS = [
    # Hero section
    ('Is low T holding<br>you back?', 'Recharge Your Body,<br>Reclaim Your Energy'),
    ('text-color-red--200', 'text-color-orange--200'),
    ('text-color-light-red', 'text-color-light-orange'),

    # Intro paragraph
    (
        'Low testosterone can affect more than just your workouts. You might notice changes in how you feel, look, and perform — in every part of life.',
        'Fatigue, brain fog, and depleted energy can impact every aspect of your life. From recovery after workouts to mental clarity and overall vitality, your body needs the right support to perform at its best.'
    ),

    # The lowdown section
    ('tex-color-red--800', 'tex-color-orange--800'),
    (
        'When testosterone levels drop, you may notice less energy, reduced muscle, lower libido, and changes in mood or focus. Low T isn\'t always just age-related — lifestyle, stress, and other factors play a role. Evolife offers medically guided Testosterone Replacement Therapy (TRT) to help you restore balance, support healthy performance, and feel like yourself again.',
        'Recovery isn\'t just about rest — it\'s about giving your body the cellular support it needs to repair, rebuild, and recharge. Whether you\'re dealing with chronic fatigue, oxidative stress, or simply want to optimize performance, Evolife offers IV therapies and peptides including NAD+, Glutathione, B-12, and Methylene Blue — all prescribed by licensed providers and delivered to support your wellness goals.'
    ),

    # Expert care section
    ('Our TRT programs', 'Our recovery programs'),
    ('men\'s health', 'recovery and energy optimization'),

    # Make it easy section - Custom plan
    (
        'From TRT to other proven therapies, we\'ll help you choose the right path based on your labs and goals — and get you started.',
        'From NAD+ infusions to peptide therapy and vitamin support, we\'ll help you choose the right path based on your assessment and goals — and get you started.'
    ),

    # Results section
    ('TRT is a process — but the changes can be life-changing.', 'Recovery therapy is a journey — but the improvements can be transformative.'),
    (
        '<div class="results__card-pretitle">Weeks 2-4</div><h2 class="results__card-title">Improved energy, better mood, clearer focus</h2>',
        '<div class="results__card-pretitle">Hours-Days 1-3</div><h2 class="results__card-title">Initial energy boost, improved mental clarity</h2>'
    ),
    (
        '<div class="results__card-pretitle">Months 2–3</div><h2 class="results__card-title">Increased libido, better sexual performance, more stamina</h2>',
        '<div class="results__card-pretitle">Weeks 1-4</div><h2 class="results__card-title">Enhanced recovery, sustained energy, better sleep quality</h2>'
    ),
    (
        '<div class="results__card-pretitle">Months 3–6</div><h2 class="results__card-title">Noticeable muscle gains, reduced fat, sustained energy and drive</h2>',
        '<div class="results__card-pretitle">Months 2-3+</div><h2 class="results__card-title">Optimal cellular function, peak vitality, lasting wellness</h2>'
    ),

    # Fix CTA links
    ('category=trt', 'category=recovery'),

    # Fix button colors
    ('is-light-red', 'is-light-orange'),
    ('is-red', 'is-orange'),

    # Regain your edge section
    ('Regain your edge', 'Recharge your vitality'),
    ('TRT is about more than boosting testosterone — it\'s about improving how you feel day to day.', 'Recovery treatments are about more than feeling rested — they\'re about optimizing your body at the cellular level.'),

    # Theme classes
    ('is-mens-health', 'is-recovery'),
    ('text-color-red--950', 'text-color-orange--950'),
]

WEIGHT_MANAGEMENT_REPLACEMENTS = [
    # Hero section
    ('Is low T holding<br>you back?', 'Transform Your Body,<br>Transform Your Life'),
    ('text-color-red--200', 'text-color-green--200'),
    ('text-color-light-red', 'text-color-light-green'),

    # Intro paragraph
    (
        'Low testosterone can affect more than just your workouts. You might notice changes in how you feel, look, and perform — in every part of life.',
        'Weight management is about more than willpower. Appetite, metabolism, and hormonal factors all play a role. Medical-grade solutions like Semaglutide and Tirzepatide can help you achieve sustainable weight loss with proven results.'
    ),

    # The lowdown section
    ('tex-color-red--800', 'tex-color-green--800'),
    (
        'When testosterone levels drop, you may notice less energy, reduced muscle, lower libido, and changes in mood or focus. Low T isn\'t always just age-related — lifestyle, stress, and other factors play a role. Evolife offers medically guided Testosterone Replacement Therapy (TRT) to help you restore balance, support healthy performance, and feel like yourself again.',
        'Sustainable weight loss requires the right support. GLP-1 receptor agonists like Semaglutide and Tirzepatide work by regulating appetite, improving insulin sensitivity, and supporting metabolic health. Evolife offers physician-prescribed, evidence-based weight management medications delivered discreetly to your door — with ongoing clinical support every step of the way.'
    ),

    # Expert care section
    ('Our TRT programs', 'Our weight management programs'),
    ('men\'s health', 'metabolic health and weight management'),

    # Make it easy section - Custom plan
    (
        'From TRT to other proven therapies, we\'ll help you choose the right path based on your labs and goals — and get you started.',
        'From Semaglutide to Tirzepatide and customized dosing, we\'ll help you choose the right path based on your assessment and goals — and get you started.'
    ),

    # Results section
    ('TRT is a process — but the changes can be life-changing.', 'Weight loss is a journey — but the results can be life-changing.'),
    (
        '<div class="results__card-pretitle">Weeks 2-4</div><h2 class="results__card-title">Improved energy, better mood, clearer focus</h2>',
        '<div class="results__card-pretitle">Weeks 1-4</div><h2 class="results__card-title">Reduced appetite, initial weight loss, improved energy</h2>'
    ),
    (
        '<div class="results__card-pretitle">Months 2–3</div><h2 class="results__card-title">Increased libido, better sexual performance, more stamina</h2>',
        '<div class="results__card-pretitle">Months 2-4</div><h2 class="results__card-title">Steady weight loss (1-2 lbs/week), improved metabolic markers</h2>'
    ),
    (
        '<div class="results__card-pretitle">Months 3–6</div><h2 class="results__card-title">Noticeable muscle gains, reduced fat, sustained energy and drive</h2>',
        '<div class="results__card-pretitle">Months 4-6+</div><h2 class="results__card-title">Significant weight loss, better health markers, sustained lifestyle changes</h2>'
    ),

    # Fix CTA links
    ('category=trt', 'category=weight-management'),

    # Fix button colors
    ('is-light-red', 'is-light-green'),
    ('is-red', 'is-green'),

    # Regain your edge section
    ('Regain your edge', 'Transform your health'),
    ('TRT is about more than boosting testosterone — it\'s about improving how you feel day to day.', 'Weight management is about more than the number on the scale — it\'s about improving your overall health and quality of life.'),

    # Theme classes
    ('is-mens-health', 'is-weight-management'),
    ('text-color-red--950', 'text-color-green--950'),
]

def create_backup(file_path):
    """Create a timestamped backup of the file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(file_path.read_text(encoding='utf-8'), encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")
    return backup_path

def apply_replacements(content, replacements):
    """Apply all replacements to content"""
    changes_made = []
    for old, new in replacements:
        if old in content:
            count = content.count(old)
            content = content.replace(old, new)
            changes_made.append(f"  - Replaced '{old[:50]}...' ({count} occurrence(s))")
    return content, changes_made

def fix_file(file_path, replacements, page_name):
    """Fix a single HTML file with given replacements"""
    print(f"\n{'='*60}")
    print(f"Processing: {page_name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')
    original_length = len(content)

    # Create backup
    create_backup(file_path)

    # Apply replacements
    new_content, changes = apply_replacements(content, replacements)

    # Show changes
    if changes:
        print(f"\n✓ Changes applied:")
        for change in changes:
            print(change)
    else:
        print("\n⚠ No changes made (patterns not found)")

    # Write back
    file_path.write_text(new_content, encoding='utf-8')
    new_length = len(new_content)

    print(f"\n✓ File updated: {file_path.name}")
    print(f"  Size change: {original_length} → {new_length} bytes")

    return len(changes)

def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("EVOLIFE PAGES BATCH FIX SCRIPT")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    # Fix Recovery page
    recovery_path = base_path / "recovery.html"
    if recovery_path.exists():
        changes = fix_file(recovery_path, RECOVERY_REPLACEMENTS, "Recovery Page")
        print(f"\n✓ Recovery page: {changes} replacements applied")
    else:
        print(f"\n✗ Recovery page not found: {recovery_path}")

    # Fix Weight Management page
    weight_path = base_path / "weight-management.html"
    if weight_path.exists():
        changes = fix_file(weight_path, WEIGHT_MANAGEMENT_REPLACEMENTS, "Weight Management Page")
        print(f"\n✓ Weight Management page: {changes} replacements applied")
    else:
        print(f"\n✗ Weight Management page not found: {weight_path}")

    print("\n" + "="*60)
    print("BATCH FIX COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("1. Review the changes in each file")
    print("2. Test pages in browser")
    print("3. Delete fragment files if satisfied")
    print("4. Run Playwright tests")

if __name__ == "__main__":
    main()
