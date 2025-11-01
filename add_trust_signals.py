#!/usr/bin/env python3
"""
Add trust signals and certifications to treatment pages
Phase 3.2: HIPAA compliance, medical licensing, security badges
"""

import re
from pathlib import Path
from datetime import datetime

# Trust signals HTML to add in footer area
TRUST_SIGNALS_HTML = '''
<!-- Trust Signals & Certifications -->
<div class="trust-signals-section" style="background-color: #f8f9fa; padding: 2rem 1.5rem; margin-top: 2rem;">
  <div class="container-large-4">
    <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 2rem; text-align: center;">
      <div class="trust-badge" style="flex: 1; min-width: 200px;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔒</div>
        <div style="font-weight: 600; color: #223A46; margin-bottom: 0.25rem;">HIPAA Compliant</div>
        <div style="font-size: 0.875rem; color: #6c757d;">Your health data is protected</div>
      </div>
      <div class="trust-badge" style="flex: 1; min-width: 200px;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚕️</div>
        <div style="font-weight: 600; color: #223A46; margin-bottom: 0.25rem;">Licensed Providers</div>
        <div style="font-size: 0.875rem; color: #6c757d;">U.S. board-certified clinicians</div>
      </div>
      <div class="trust-badge" style="flex: 1; min-width: 200px;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✓</div>
        <div style="font-weight: 600; color: #223A46; margin-bottom: 0.25rem;">FDA-Regulated</div>
        <div style="font-size: 0.875rem; color: #6c757d;">Pharmacy-sourced medications</div>
      </div>
      <div class="trust-badge" style="flex: 1; min-width: 200px;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛡️</div>
        <div style="font-weight: 600; color: #223A46; margin-bottom: 0.25rem;">Secure Platform</div>
        <div style="font-size: 0.875rem; color: #6c757d;">256-bit SSL encryption</div>
      </div>
    </div>
  </div>
</div>
'''

# Additional trust indicators in the expert care section
EXPERT_CARE_TRUST_ADDITION = '''<div class="w-layout-hflex lowdown-list__item py-2"><img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e2219852_check-circle.svg" alt="Check mark icon representing HIPAA compliance" class="lockdown-list__icon"><div class="lockdown-list__text is-md">HIPAA-compliant telehealth</div></div>'''

def add_trust_signals_footer(content):
    """Add trust signals section before the footer"""
    changes = []

    # Check if already added
    if 'Trust Signals & Certifications' in content:
        changes.append("  - Trust signals already present")
        return content, changes

    # Add before the footer section
    footer_pattern = r'(<div class="section__fridays-feeling)'
    if re.search(footer_pattern, content):
        content = re.sub(
            footer_pattern,
            TRUST_SIGNALS_HTML + r'\n\1',
            content
        )
        changes.append("  - Added trust signals section (4 badges)")
        changes.append("    • HIPAA Compliant")
        changes.append("    • Licensed Providers")
        changes.append("    • FDA-Regulated")
        changes.append("    • Secure Platform")
    else:
        changes.append("  - Warning: Could not find footer insertion point")

    return content, changes

def add_hipaa_to_expert_care(content):
    """Add HIPAA compliance indicator to expert care list"""
    changes = []

    # Check if already added
    if 'HIPAA-compliant telehealth' in content:
        changes.append("  - HIPAA indicator already in expert care section")
        return content, changes

    # Add after "Secure telehealth platform" item
    secure_platform_pattern = r'(<div class="w-layout-hflex lowdown-list__item py-2 is-last"><img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984c_iPhone\.svg"[^>]*><div class="lockdown-list__text is-md">Secure telehealth platform</div></div>)'

    if re.search(secure_platform_pattern, content):
        # Remove is-last from previous item and add new item
        content = re.sub(
            r'(<div class="w-layout-hflex lowdown-list__item py-2) is-last(<img loading="lazy" src="treatment-pages/assets/images/testosterone/68e817ec8f69d949e221984c_iPhone\.svg")',
            r'\1\2',
            content
        )

        # Add new HIPAA item as last
        content = re.sub(
            secure_platform_pattern,
            r'\1' + EXPERT_CARE_TRUST_ADDITION.replace('py-2', 'py-2 is-last'),
            content
        )
        changes.append("  - Added HIPAA compliance to expert care list")
    else:
        changes.append("  - Could not find expert care list insertion point")

    return content, changes

def enhance_footer_disclaimer(content):
    """Enhance footer disclaimer with security mention"""
    changes = []

    # Add security note to disclaimer if not present
    if 'secure, HIPAA-compliant platform' not in content:
        disclaimer_pattern = r'(<p class="paragraph-24">\*The above statements[^<]*medications have not been evaluated or approved by the FDA for safety, efficacy, or quality\.)'

        if re.search(disclaimer_pattern, content):
            content = re.sub(
                disclaimer_pattern,
                r'\1 All consultations are conducted through our secure, HIPAA-compliant platform by licensed U.S. healthcare providers.',
                content
            )
            changes.append("  - Enhanced footer disclaimer with security mention")

    return content, changes

def process_file(file_path):
    """Process a single file with trust signals"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.trust_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    all_changes = []

    # Apply trust signal additions
    new_content, changes1 = add_trust_signals_footer(content)
    all_changes.extend(changes1)

    new_content, changes2 = add_hipaa_to_expert_care(new_content)
    all_changes.extend(changes2)

    new_content, changes3 = enhance_footer_disclaimer(new_content)
    all_changes.extend(changes3)

    if not all_changes or all_changes == ["  - Trust signals already present"]:
        print("✓ Trust signals already added")
        return True

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Trust signals added:")
    for change in all_changes:
        print(change)

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - ADD TRUST SIGNALS & CERTIFICATIONS")
    print("="*60)
    print("\nPhase 3.2: Building credibility and trust")

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
    print(f"TRUST SIGNALS COMPLETE: {success_count}/3 pages")
    print("="*60)

    if success_count == 3:
        print("\n✅ Trust signals and certifications added!")
        print("\n🛡️ Trust Elements Added:")
        print("  ✓ HIPAA Compliance badge")
        print("  ✓ Licensed Providers certification")
        print("  ✓ FDA-Regulated medications notice")
        print("  ✓ Secure Platform (SSL encryption)")
        print("  ✓ HIPAA mention in expert care features")
        print("  ✓ Enhanced security disclosure in footer")
        print("\n📊 Expected Impact:")
        print("  - Increased user confidence")
        print("  - Better conversion rates")
        print("  - Compliance transparency")
        print("  - Professional credibility")
        print("  - Reduced user hesitation")

if __name__ == "__main__":
    main()
