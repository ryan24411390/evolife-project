#!/usr/bin/env python3
"""
Add comprehensive SEO tags to all treatment pages
Handles minified HTML on single lines
"""

import re
from pathlib import Path
from datetime import datetime

# SEO Tag Definitions
SEO_TAGS = {
    'mens-health.html': {
        'title': 'Men\'s Health Treatments | PT-141, ED Medications | Evolife Wellness',
        'description': 'Specialized men\'s health solutions including PT-141, Tadalafil, Vardenafil, and hair loss treatments. Licensed providers, discreet delivery. Get started today.',
        'og_title': 'Men\'s Health Treatments | Evolife Wellness',
        'og_description': 'Specialized men\'s health solutions including PT-141, ED medications, and hair loss treatments. Expert care from licensed providers.',
        'og_image': 'https://www.evolifewellness.com/assets/images/mens-health-og.jpg',
        'canonical': 'https://www.evolifewellness.com/mens-health.html',
        'keywords': 'PT-141, Bremelanotide, ED medications, Tadalafil, Vardenafil, hair loss treatment, men\'s sexual health'
    },
    'recovery.html': {
        'title': 'Energy & Recovery IV Therapy | NAD+, Glutathione | Evolife Wellness',
        'description': 'Cellular recovery and energy optimization with NAD+, Glutathione, B-12, and Methylene Blue. Licensed medical providers. Boost energy and vitality.',
        'og_title': 'Energy & Recovery IV Therapy | Evolife Wellness',
        'og_description': 'Cellular recovery and energy optimization with NAD+, Glutathione, B-12, and Methylene Blue peptides.',
        'og_image': 'https://www.evolifewellness.com/assets/images/recovery-og.jpg',
        'canonical': 'https://www.evolifewellness.com/recovery.html',
        'keywords': 'NAD+, Glutathione, B-12 injections, Methylene Blue, IV therapy, cellular recovery, energy optimization'
    },
    'weight-management.html': {
        'title': 'Weight Management | Semaglutide & Tirzepatide | Evolife Wellness',
        'description': 'Medical weight management with Semaglutide and Tirzepatide GLP-1 medications. Licensed providers, customized dosing, proven results. Start your transformation.',
        'og_title': 'Weight Management | Semaglutide & Tirzepatide | Evolife',
        'og_description': 'Medical weight management with Semaglutide and Tirzepatide GLP-1 receptor agonists. Physician-prescribed, evidence-based solutions.',
        'og_image': 'https://www.evolifewellness.com/assets/images/weight-management-og.jpg',
        'canonical': 'https://www.evolifewellness.com/weight-management.html',
        'keywords': 'Semaglutide, Tirzepatide, GLP-1 medications, weight loss, medical weight management, metabolic health'
    }
}

def create_seo_block(page_config):
    """Generate complete SEO meta tags block"""
    return f'''<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Primary Meta Tags -->
<title>{page_config['title']}</title>
<meta name="title" content="{page_config['title']}">
<meta name="description" content="{page_config['description']}">
<meta name="keywords" content="{page_config['keywords']}">
<link rel="canonical" href="{page_config['canonical']}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="{page_config['canonical']}">
<meta property="og:title" content="{page_config['og_title']}">
<meta property="og:description" content="{page_config['og_description']}">
<meta property="og:image" content="{page_config['og_image']}">
<meta property="og:site_name" content="Evolife Wellness">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="{page_config['canonical']}">
<meta property="twitter:title" content="{page_config['og_title']}">
<meta property="twitter:description" content="{page_config['og_description']}">
<meta property="twitter:image" content="{page_config['og_image']}">

<!-- Additional SEO -->
<meta name="robots" content="index, follow">
<meta name="language" content="English">
<meta name="revisit-after" content="7 days">
<meta name="author" content="Evolife Wellness">

'''

def add_seo_to_file(file_path, page_name):
    """Add SEO tags to a single HTML file"""
    print(f"\n{'='*60}")
    print(f"Processing: {page_name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Check if SEO tags already exist
    if '<title>' in content:
        print(f"⚠ Warning: Page already has a <title> tag. Skipping to avoid duplicates.")
        return False

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.seo_backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Get SEO config
    seo_config = SEO_TAGS[file_path.name]
    seo_block = create_seo_block(seo_config)

    # Find insertion point (right after <head>)
    # The pattern looks for <head> followed by optional attributes and >
    pattern = r'(<head[^>]*>)'

    if not re.search(pattern, content):
        print(f"✗ Error: Could not find <head> tag")
        return False

    # Insert SEO block right after <head>
    new_content = re.sub(
        pattern,
        r'\1' + seo_block,
        content,
        count=1
    )

    # Verify insertion
    if '<title>' not in new_content:
        print(f"✗ Error: SEO tags were not inserted properly")
        return False

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"✓ Added SEO tags:")
    print(f"  - Title: {seo_config['title'][:60]}...")
    print(f"  - Meta Description: {len(seo_config['description'])} chars")
    print(f"  - Open Graph tags: 5 tags")
    print(f"  - Twitter Card tags: 5 tags")
    print(f"  - Additional meta tags: 5 tags")
    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE PAGES - SEO TAG INJECTION")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    files_to_process = [
        'mens-health.html',
        'recovery.html',
        'weight-management.html'
    ]

    success_count = 0

    for filename in files_to_process:
        file_path = base_path / filename
        if file_path.exists():
            if add_seo_to_file(file_path, filename):
                success_count += 1
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"SEO INJECTION COMPLETE: {success_count}/{len(files_to_process)} files updated")
    print("="*60)

    if success_count == len(files_to_process):
        print("\n✅ All pages now have complete SEO tags!")
        print("\nAdded to each page:")
        print("  ✓ <title> tag")
        print("  ✓ Meta charset & viewport")
        print("  ✓ Meta description")
        print("  ✓ Meta keywords")
        print("  ✓ Canonical URL")
        print("  ✓ 5 Open Graph tags")
        print("  ✓ 5 Twitter Card tags")
        print("  ✓ 5 Additional SEO tags")
        print("\nTotal: 18 SEO tags per page")

if __name__ == "__main__":
    main()
