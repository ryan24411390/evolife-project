#!/usr/bin/env python3
"""
Add micro-interactions and enhanced hover states for polish
Phase 4.3: Smooth animations, transitions, and interactive feedback
"""

import re
from pathlib import Path
from datetime import datetime

# Micro-interactions CSS
MICRO_INTERACTIONS_CSS = '''
<!-- Micro-interactions & Polish -->
<style>
/* Smooth transitions for all interactive elements */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button hover states with elevation */
.button-18,
.button-13,
.button-21,
.button-22,
.w-button {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-18:hover,
.button-13:hover,
.button-21:hover,
.button-22:hover,
.w-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button-18:active,
.button-13:active,
.button-21:active,
.button-22:active,
.w-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Card hover effects */
.card,
.slider-card,
.testimonials__card-copy,
.results__card,
.make-it-easy__card-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover,
.slider-card:hover,
.testimonials__card-copy:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Smooth accordion animations */
.accordion-item {
  transition: background-color 0.2s ease;
}

.accordion-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.accordion-trigger-2 {
  transition: transform 0.3s ease;
}

/* Link hover effects */
a {
  transition: color 0.2s ease, opacity 0.2s ease;
}

a:hover {
  opacity: 0.8;
}

.navbar_link-2:hover {
  transform: translateY(-1px);
}

/* Social icon hover effects */
.social-link_item {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.social-link_item:hover {
  transform: scale(1.15);
  opacity: 0.85;
}

/* Slider navigation hover */
.card-slider_nav-btn {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.card-slider_nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.08);
  transform: scale(1.1);
}

/* Input focus animations */
input:focus,
select:focus,
textarea:focus {
  transform: scale(1.01);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
}

/* Image hover effects */
.hero-content__img,
.make-easy__img,
.edge__card-img {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.edge__card-img:hover {
  transform: scale(1.05);
}

/* Loading state animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Entrance animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Progress indicator for scrolling */
.scroll-indicator {
  transition: width 0.1s ease;
}

/* Chip/badge hover effects */
.chip-item {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.chip-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateX(2px);
}

/* Feature list item hover */
.lowdown-list__item {
  transition: background-color 0.2s ease, padding-left 0.2s ease;
}

.lowdown-list__item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  padding-left: 0.5rem;
}

/* FAQ hover effect */
.accordion-item-trigger:hover {
  background-color: rgba(0, 0, 0, 0.03);
  padding-left: 1.5rem;
}

/* Logo animation on hover */
.navbar_logo-link img {
  transition: transform 0.3s ease;
}

.navbar_logo-link:hover img {
  transform: scale(1.05);
}

/* Menu button interaction */
.navbar_menu-button:hover .menu-icon1_line-top-6,
.navbar_menu-button:hover .menu-icon1_line-bottom-2 {
  width: 100%;
}

/* Footer link hover */
.footer_link-3 {
  transition: color 0.2s ease, transform 0.2s ease;
  display: inline-block;
}

.footer_link-3:hover {
  transform: translateX(2px);
}

/* Testimonial card entrance delay */
.testimonials__card-copy:nth-child(1) { animation-delay: 0s; }
.testimonials__card-copy:nth-child(2) { animation-delay: 0.1s; }
.testimonials__card-copy:nth-child(3) { animation-delay: 0.2s; }

/* Results card progressive reveal */
.results__card {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.results__card:hover {
  opacity: 1;
  transform: translateX(4px);
}

/* Trust badge hover effect */
.trust-badge {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.trust-badge:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus-visible for keyboard navigation */
*:focus-visible {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
  transition: outline 0.1s ease;
}

/* Skeleton loading for images */
img:not([src]) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Button ripple effect */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.button-18::after,
.button-22::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.button-18:active::after,
.button-22:active::after {
  width: 300px;
  height: 300px;
  animation: ripple 0.6s ease-out;
}
</style>
'''

def add_micro_interactions(content):
    """Add micro-interactions CSS"""
    changes = []

    # Check if already added
    if 'Micro-interactions & Polish' in content:
        changes.append("  - Micro-interactions already present")
        return content, changes

    # Add before </head>
    if '</head>' in content:
        content = content.replace('</head>', MICRO_INTERACTIONS_CSS + '</head>')
        changes.append("  - Added comprehensive micro-interactions")
        changes.append("    • Button hover elevations (2px lift)")
        changes.append("    • Card hover effects (4px lift + scale)")
        changes.append("    • Smooth transitions (0.3s cubic-bezier)")
        changes.append("    • Social icon scale effects")
        changes.append("    • Input focus animations")
        changes.append("    • Link hover states")
        changes.append("    • Loading state animations")
        changes.append("    • Entrance animations (fadeInUp)")
        changes.append("    • Reduced motion support")
        changes.append("    • Button ripple effects")
        changes.append("    • Skeleton loading for images")
    else:
        changes.append("  - Warning: Could not find </head> tag")

    return content, changes

def process_file(file_path):
    """Process a single file with micro-interactions"""
    print(f"\n{'='*60}")
    print(f"Processing: {file_path.name}")
    print(f"{'='*60}")

    # Read file
    content = file_path.read_text(encoding='utf-8')

    # Create backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = file_path.with_suffix(f'.interactions_{timestamp}{file_path.suffix}')
    backup_path.write_text(content, encoding='utf-8')
    print(f"✓ Backup created: {backup_path.name}")

    # Add micro-interactions
    new_content, changes = add_micro_interactions(content)

    if not changes or changes == ["  - Micro-interactions already present"]:
        print("✓ Micro-interactions already present")
        return True

    # Write back
    file_path.write_text(new_content, encoding='utf-8')

    print(f"\n✓ Micro-interactions added:")
    for change in changes:
        print(change)

    print(f"✓ File updated: {file_path.name}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("EVOLIFE - ADD MICRO-INTERACTIONS & POLISH")
    print("="*60)
    print("\nPhase 4.3: Smooth animations and interactive feedback")

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
    print(f"MICRO-INTERACTIONS COMPLETE: {success_count}/3 pages")
    print("="*60)

    if success_count == 3:
        print("\n✅ Award-winning micro-interactions added!")
        print("\n🎨 Interactive Enhancements:")
        print("  ✓ Button hover: 2px elevation + shadow")
        print("  ✓ Card hover: 4px lift + 2% scale")
        print("  ✓ Smooth transitions: cubic-bezier easing")
        print("  ✓ Social icons: 15% scale on hover")
        print("  ✓ Input focus: Scale + blue glow")
        print("  ✓ Link effects: Opacity + transforms")
        print("  ✓ Loading animations: Pulse + skeleton")
        print("  ✓ Entrance animations: Fade in up")
        print("  ✓ Button ripple: Click feedback")
        print("  ✓ Reduced motion: Accessibility support")
        print("\n🏆 Award-Winning Polish:")
        print("  - Professional hover feedback")
        print("  - Smooth, responsive interactions")
        print("  - Accessible for all users")
        print("  - Modern, polished feel")
        print("  - Enhanced user engagement")

if __name__ == "__main__":
    main()
