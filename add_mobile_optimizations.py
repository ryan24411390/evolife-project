#!/usr/bin/env python3
"""
Add mobile optimizations for better mobile UX
Phase 3.4: Responsive dosage tables, touch targets, mobile layout
"""

import re
from pathlib import Path
from datetime import datetime

# Mobile optimization CSS to add before </head>
MOBILE_OPTIMIZATION_CSS = '''
<!-- Mobile Optimizations -->
<style>
/* Mobile-friendly dosage tables */
@media (max-width: 767px) {
  .dosage-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -1rem;
    padding: 0 1rem;
  }

  .dosage-table {
    min-width: 500px;
    font-size: 14px;
  }

  .dosage-table th,
  .dosage-table td {
    padding: 0.75rem 0.5rem;
    white-space: nowrap;
  }
}

/* Enhanced touch targets for mobile (44x44px minimum) */
@media (max-width: 991px) {
  .button-18,
  .button-13,
  .button-21,
  .button-22,
  .w-button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 24px;
    touch-action: manipulation;
  }

  .navbar_menu-button {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }

  .card-slider_nav-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 12px;
  }

  .social-link_item {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .accordion-item {
    min-height: 44px;
  }
}

/* Mobile typography improvements */
@media (max-width: 767px) {
  .heading-style-hero {
    font-size: 2rem !important;
    line-height: 1.2 !important;
  }

  .text-size-large-4 {
    font-size: 1rem !important;
  }

  .heading-style-h4-7 {
    font-size: 1.5rem !important;
  }
}

/* Mobile spacing improvements */
@media (max-width: 767px) {
  .padding-section-medium {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }

  .padding-global {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  .mb-2 {
    margin-bottom: 1rem !important;
  }
}

/* Mobile card improvements */
@media (max-width: 767px) {
  .card-slider__item {
    margin: 0 0.5rem;
  }

  .testimonials__card-copy {
    padding: 1.5rem;
    min-height: auto;
  }

  .edge__card-content {
    padding: 1.5rem;
  }
}

/* Mobile table scrolling hint */
@media (max-width: 767px) {
  .dosage-table-wrapper::after {
    content: '← Scroll to see more →';
    display: block;
    text-align: center;
    font-size: 0.75rem;
    color: #6c757d;
    padding: 0.5rem 0;
    font-style: italic;
  }

  .dosage-table-wrapper.scrolled::after {
    content: none;
  }
}

/* Improve form inputs on mobile */
@media (max-width: 767px) {
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="number"],
  select,
  textarea {
    font-size: 16px !important; /* Prevents zoom on iOS */
    min-height: 44px;
  }
}

/* Mobile navigation improvements */
@media (max-width: 991px) {
  .navbar_menu-2 {
    padding: 1rem;
  }

  .navbar_link-2 {
    padding: 12px 0;
    min-height: 44px;
    display: flex;
    align-items: center;
  }
}

/* Accessibility: Focus states for mobile */
@media (max-width: 991px) {
  button:focus,
  a:focus,
  input:focus {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
  }
}
</style>
'''

# JavaScript for dosage table scroll detection
MOBILE_TABLE_SCRIPT = '''
<script>
// Add scroll detection for dosage tables on mobile
document.addEventListener('DOMContentLoaded', function() {
  var tableWrappers = document.querySelectorAll('.dosage-table-wrapper');

  tableWrappers.forEach(function(wrapper) {
    wrapper.addEventListener('scroll', function() {
      if (wrapper.scrollLeft > 10) {
        wrapper.classList.add('scrolled');
      } else {
        wrapper.classList.remove('scrolled');
      }
    });
  });

  // Ensure buttons have proper touch feedback
  var buttons = document.querySelectorAll('.w-button, button');
  buttons.forEach(function(button) {
    button.addEventListener('touchstart', function() {
      this.style.opacity = '0.8';
    });
    button.addEventListener('touchend', function() {
      this.style.opacity = '1';
    });
  });
});
</script>
'''

def add_mobile_css(content):
    """Add mobile optimization CSS before </head>"""
    changes = []

    # Check if already added
    if 'Mobile Optimizations' in content:
        changes.append("  - Mobile CSS already present")
        return content, changes

    # Add before </head>
    if '</head>' in content:
        content = content.replace('</head>', MOBILE_OPTIMIZATION_CSS + '</head>')
        changes.append("  - Added mobile optimization CSS")
        changes.append("    • Responsive dosage tables")
        changes.append("    • 44x44px touch targets")
        changes.append("    • Mobile typography scaling")
        changes.append("    • Enhanced spacing for mobile")
        changes.append("    • Mobile scroll hints")
        changes.append("    • iOS zoom prevention (16px inputs)")
    else:
        changes.append("  - Warning: Could not find </head> tag")

    return content, changes

def add_mobile_script(content):
    """Add mobile interaction script before </body>"""
    changes = []

    # Check if already added
    if 'dosage-table-wrapper' in content and 'scrollLeft' in content:
        changes.append("  - Mobile script already present")
        return content, changes

    # Add before </body>
    if '</body>' in content:
        content = content.replace('</body>', MOBILE_TABLE_SCRIPT + '</body>')
        changes.append("  - Added mobile interaction script")
        changes.append("    • Table scroll detection")
        changes.append("    • Touch feedback for buttons")
    else:
        changes.append("  - Warning: Could not find </body> tag")

    return content, changes

def process_file(file_path):
    """Process a single file with mobile optimizations"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.mobile_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    all_changes = []

    # Apply mobile optimizations
    new_content, changes1 = add_mobile_css(content)
    all_changes.extend(changes1)

    new_content, changes2 = add_mobile_script(new_content)
    all_changes.extend(changes2)

    if not all_changes:
        print("✓ Mobile optimizations already present")
        return True

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Mobile optimizations added:")
    for change in all_changes:
        print(change)

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - MOBILE EXPERIENCE OPTIMIZATIONS")
    print("="*60)
    print("\nPhase 3.4: Enhancing mobile usability")

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
    print(f"MOBILE OPTIMIZATION COMPLETE: {success_count}/3 pages")
    print("="*60)

    if success_count == 3:
        print("\n✅ Mobile experience optimized!")
        print("\n📱 Mobile Improvements:")
        print("  ✓ Responsive dosage tables with horizontal scroll")
        print("  ✓ WCAG-compliant 44x44px touch targets")
        print("  ✓ Optimized typography for small screens")
        print("  ✓ Enhanced spacing and padding for mobile")
        print("  ✓ Scroll hints for tables")
        print("  ✓ iOS zoom prevention (16px font inputs)")
        print("  ✓ Touch feedback for interactive elements")
        print("  ✓ Improved navigation for touch interfaces")
        print("\n🎯 Expected Impact:")
        print("  - Better mobile usability scores")
        print("  - Reduced bounce rate on mobile")
        print("  - Improved mobile conversion rates")
        print("  - Better Google Mobile-Friendly test results")
        print("  - Enhanced accessibility on touch devices")

if __name__ == "__main__":
    main()
