#!/usr/bin/env python3
"""
Add JSON-LD Structured Data / Schema.org markup
Enables rich snippets in Google search results
"""

import re
import json
from pathlib import Path
from datetime import datetime

# Organization schema (same for all pages)
ORGANIZATION_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Evolife Wellness",
    "url": "https://www.evolifewellness.com",
    "logo": "https://www.evolifewellness.com/assets/images/evolife-footer-logo.png",
    "description": "Licensed telemedicine provider specializing in hormone optimization, weight management, men's health, and recovery therapies.",
    "telephone": "+1-XXX-XXX-XXXX",
    "email": "support@evolifewellness.com",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Boca Raton",
        "addressRegion": "FL",
        "addressCountry": "US"
    },
    "sameAs": [
        "https://www.facebook.com/joinfridays",
        "https://www.instagram.com/joinevolife",
        "https://www.tiktok.com/@joinfridays",
        "http://linkedin.com/company/joinevolife"
    ]
}

# Page-specific schemas
MENS_HEALTH_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Men's Health Treatments",
    "description": "Specialized men's health solutions including PT-141, ED medications, and hair loss treatments from licensed providers.",
    "medicalSpecialty": "Urology",
    "about": {
        "@type": "MedicalCondition",
        "name": "Erectile Dysfunction and Sexual Health",
        "alternateName": "ED"
    },
    "mainEntity": {
        "@type": "MedicalTherapy",
        "name": "Men's Sexual Health Treatment",
        "description": "Comprehensive men's sexual health solutions including PT-141, Tadalafil, and Vardenafil",
        "availableService": [
            {
                "@type": "MedicalTherapy",
                "name": "PT-141 (Bremelanotide) Treatment",
                "description": "Peptide therapy for enhanced libido and sexual function"
            },
            {
                "@type": "MedicalTherapy",
                "name": "Tadalafil (Generic Cialis)",
                "description": "PDE5 inhibitor for erectile dysfunction, effects last up to 36 hours"
            },
            {
                "@type": "MedicalTherapy",
                "name": "Vardenafil (Generic Levitra)",
                "description": "PDE5 inhibitor for erectile dysfunction, effects last 4-6 hours"
            }
        ]
    }
}

RECOVERY_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Energy & Recovery IV Therapy",
    "description": "Cellular recovery and energy optimization with NAD+, Glutathione, B-12, and Methylene Blue from licensed providers.",
    "medicalSpecialty": "Integrative Medicine",
    "about": {
        "@type": "MedicalCondition",
        "name": "Fatigue and Energy Optimization"
    },
    "mainEntity": {
        "@type": "MedicalTherapy",
        "name": "Cellular Recovery and Energy Therapy",
        "description": "IV therapy and peptides for energy, detoxification, and cellular health",
        "availableService": [
            {
                "@type": "MedicalTherapy",
                "name": "NAD+ Infusion Therapy",
                "description": "Coenzyme therapy for cellular energy and DNA repair"
            },
            {
                "@type": "MedicalTherapy",
                "name": "Glutathione IV Therapy",
                "description": "Master antioxidant for detoxification and immune support"
            },
            {
                "@type": "MedicalTherapy",
                "name": "Vitamin B-12 Injections",
                "description": "High-dose B-12 for energy, focus, and nervous system support"
            }
        ]
    }
}

WEIGHT_MANAGEMENT_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": "Weight Management with GLP-1 Medications",
    "description": "Medical weight management with Semaglutide and Tirzepatide GLP-1 medications from licensed providers.",
    "medicalSpecialty": "Endocrinology",
    "about": {
        "@type": "MedicalCondition",
        "name": "Obesity and Weight Management",
        "alternateName": "Overweight"
    },
    "mainEntity": {
        "@type": "MedicalTherapy",
        "name": "GLP-1 Receptor Agonist Therapy",
        "description": "Prescription weight management with Semaglutide and Tirzepatide",
        "availableService": [
            {
                "@type": "MedicalTherapy",
                "name": "Semaglutide (GLP-1)",
                "description": "Weekly injection for weight management, average 12-15% body weight loss",
                "dosageForm": "Injection"
            },
            {
                "@type": "MedicalTherapy",
                "name": "Tirzepatide (GIP/GLP-1)",
                "description": "Dual-action weekly injection for weight management, average 15-22% body weight loss",
                "dosageForm": "Injection"
            }
        ]
    }
}

# Breadcrumb schema
def create_breadcrumb_schema(page_name):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.evolifewellness.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": page_name,
                "item": f"https://www.evolifewellness.com/{page_name.lower().replace(' ', '-')}.html"
            }
        ]
    }

def create_schema_script_tags(schemas):
    """Convert schema objects to JSON-LD script tags"""
    tags = []
    for schema in schemas:
        json_ld = json.dumps(schema, indent=2)
        tag = f'<script type="application/ld+json">\n{json_ld}\n</script>\n'
        tags.append(tag)
    return ''.join(tags)

def add_schema_to_file(file_path, schemas):
    """Add schema markup to HTML file"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Check if schema already exists
    if 'application/ld+json' in content:
        print(f"⚠ Warning: Schema markup already exists. Skipping to avoid duplicates.")
        return False

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.schema_backup_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Create schema script tags
    schema_html = create_schema_script_tags(schemas)

    # Insert before closing </head> tag
    if '</head>' not in content:
        print(f"✗ Error: Could not find </head> tag")
        return False

    # Insert schema markup
    new_content = content.replace('</head>', f'\n<!-- Structured Data / Schema.org Markup -->\n{schema_html}</head>')

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"✓ Added {len(schemas)} schema objects:")
    for schema in schemas:
        schema_type = schema.get('@type', 'Unknown')
        schema_name = schema.get('name', schema_type)
        print(f"  - {schema_type}: {schema_name}")

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - STRUCTURED DATA / SCHEMA MARKUP")
    print("="*60)

    base_path = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last")

    pages = [
        ('mens-health.html', [
            ORGANIZATION_SCHEMA,
            MENS_HEALTH_SCHEMA,
            create_breadcrumb_schema("Men's Health")
        ]),
        ('recovery.html', [
            ORGANIZATION_SCHEMA,
            RECOVERY_SCHEMA,
            create_breadcrumb_schema("Recovery")
        ]),
        ('weight-management.html', [
            ORGANIZATION_SCHEMA,
            WEIGHT_MANAGEMENT_SCHEMA,
            create_breadcrumb_schema("Weight Management")
        ])
    ]

    success_count = 0
    total_schemas = 0

    for filename, schemas in pages:
        file_path = base_path / filename
        if file_path.exists():
            if add_schema_to_file(file_path, schemas):
                success_count += 1
                total_schemas += len(schemas)
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "="*60)
    print(f"SCHEMA MARKUP COMPLETE: {success_count}/3 pages updated")
    print("="*60)

    if success_count == 3:
        print(f"\n✅ Structured data added to all pages!")
        print(f"\nTotal schemas added: {total_schemas}")
        print(f"\n📊 SEO Impact:")
        print(f"   ✓ Rich snippets enabled in Google search")
        print(f"   ✓ Organization information structured")
        print(f"   ✓ Medical service details indexed")
        print(f"   ✓ Breadcrumb navigation in search results")
        print(f"   ✓ Better search result display")
        print(f"\n🎯 Schema Types Implemented:")
        print(f"   - Organization/MedicalBusiness")
        print(f"   - MedicalWebPage")
        print(f"   - MedicalTherapy")
        print(f"   - BreadcrumbList")

if __name__ == "__main__":
    main()
