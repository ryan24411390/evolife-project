#!/usr/bin/env python3
"""Remove treatment buttons and testosterone page references from HTML files."""

import re
from pathlib import Path

# Main files to process (excluding backups)
MAIN_FILES = [
    'index.html',
    'pricing.html',
    'contact-us.html',
    'get-started.html',
    'compounded-medications.html',
    'peptides.html',
    'mens-health.html',
    'recovery.html',
    'weight-management.html'
]

def remove_treatment_elements(html_content):
    """Remove treatment buttons and testosterone references using regex."""
    modified_content = html_content
    changes_made = False

    # Pattern to match <a> tags with href containing testosterone
    # Matches: <a href="testosterone.html"...>...</a> or <a href="...testosterone..."...>...</a>
    testosterone_link_pattern = r'<a[^>]*href=["\'][^"\']*testosterone[^"\']*["\'][^>]*>.*?</a>'
    matches = re.findall(testosterone_link_pattern, modified_content, re.IGNORECASE | re.DOTALL)
    if matches:
        for match in matches:
            print(f"  - Removing testosterone link")
            changes_made = True
        modified_content = re.sub(testosterone_link_pattern, '', modified_content, flags=re.IGNORECASE | re.DOTALL)

    # Pattern to match buttons/links with "treatment" in the text
    # This is more conservative - only removes if it's clearly a button
    treatment_button_pattern = r'<(?:a|button)[^>]*(?:class=["\'][^"\']*button[^"\']*["\']|href=["\'][^"\']*treatment[^"\']*["\'])[^>]*>[^<]*treatment[^<]*</(?:a|button)>'
    matches = re.findall(treatment_button_pattern, modified_content, re.IGNORECASE | re.DOTALL)
    if matches:
        for match in matches:
            print(f"  - Removing treatment button")
            changes_made = True
        modified_content = re.sub(treatment_button_pattern, '', modified_content, flags=re.IGNORECASE | re.DOTALL)

    # Remove dropdown items specifically for testosterone
    dropdown_pattern = r'<a[^>]*class=["\'][^"\']*w-dropdown-link[^"\']*["\'][^>]*href=["\'][^"\']*testosterone[^"\']*["\'][^>]*>.*?</a>'
    matches = re.findall(dropdown_pattern, modified_content, re.IGNORECASE | re.DOTALL)
    if matches:
        for match in matches:
            print(f"  - Removing testosterone dropdown item")
            changes_made = True
        modified_content = re.sub(dropdown_pattern, '', modified_content, flags=re.IGNORECASE | re.DOTALL)

    return modified_content, changes_made

def process_file(file_path):
    """Process a single HTML file."""
    print(f"\nProcessing {file_path.name}...")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        modified_content, changes_made = remove_treatment_elements(original_content)

        if changes_made:
            # Create backup
            backup_path = file_path.with_suffix('.pre_treatment_removal.html')
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
            print(f"  ✓ Backup saved to {backup_path.name}")

            # Write modified content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(modified_content)
            print(f"  ✓ Updated {file_path.name}")
        else:
            print(f"  - No changes needed")

    except Exception as e:
        print(f"  ✗ Error processing {file_path.name}: {e}")

def main():
    """Main execution."""
    base_dir = Path(__file__).parent

    print("=" * 60)
    print("Removing Treatment Buttons and Testosterone References")
    print("=" * 60)

    for filename in MAIN_FILES:
        file_path = base_dir / filename
        if file_path.exists():
            process_file(file_path)
        else:
            print(f"\n⚠ File not found: {filename}")

    print("\n" + "=" * 60)
    print("Processing complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()
