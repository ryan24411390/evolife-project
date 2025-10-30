#!/usr/bin/env python3
"""
Update navigation and footer links across all HTML pages
"""
import re

# Define the correct navbar structure
NAVBAR_LINKS = '''<a href="index.html" class="navbar_link-2 w-nav-link">Home</a><a href="pricing.html" class="navbar_link-2 w-nav-link">GLP-1 Pricing</a><a href="microdosing.html" class="navbar_link-2 w-nav-link">Microdosing</a><a href="longevity.html" class="navbar_link-2 w-nav-link">Longevity</a><a href="testosterone.html" class="navbar_link-2 w-nav-link">Testosterone</a><a href="contact-us.html" class="navbar_link-2 w-nav-link">Contact Us</a><div class="navbar_menu-buttons"><a href="get-started.html" class="button-2 is-small w-button">Get Started!</a></div>'''

# Define the correct footer nav structure
FOOTER_NAV = '''<a scrollin-animation="" href="index.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">Home</div></a><div class="lottie-animation" data-w-id="c5746eb1-2ada-996a-5825-0ea414c4e26b" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/66c8a0fb54f84ec4a096448a_Animation%201724168241796%20(1).json" data-loop="1" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="2.3" data-duration="0"></div><a scrollin-animation="" href="pricing.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">GLP-1 Pricing</div></a><div class="lottie-animation" data-w-id="c0f2a76f-91f4-834d-c13d-41e65c3f5700" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/66c8a0fb54f84ec4a096448a_Animation%201724168241796%20(1).json" data-loop="1" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="2.3" data-duration="0"></div><a scrollin-animation="" href="longevity.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">Longevity</div></a><div class="lottie-animation" data-w-id="c0f2a76f-91f4-834d-c13d-41e65c3f5700" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/66c8a0fb54f84ec4a096448a_Animation%201724168241796%20(1).json" data-loop="1" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="2.3" data-duration="0"></div><a scrollin-animation="" href="microdosing.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">Microdosing</div></a><div class="lottie-animation" data-w-id="c0f2a76f-91f4-834d-c13d-41e65c3f5700" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/66c8a0fb54f84ec4a096448a_Animation%201724168241796%20(1).json" data-loop="1" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="2.3" data-duration="0"></div><a scrollin-animation="" href="testosterone.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">Testosterone</div></a><div class="lottie-animation" data-w-id="c0f2a76f-91f4-834d-c13d-41e65c3f5700" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/66c8a0fb54f84ec4a096448a_Animation%201724168241796%20(1).json" data-loop="1" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="2.3" data-duration="0"></div><a scrollin-animation="" href="contact-us.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">Contact Us</div></a><div class="lottie-animation" data-w-id="c0f2a76f-91f4-834d-c13d-41e65c3f5700" data-animation-type="lottie" data-src="https://cdn.prod.website-files.com/66c8a0fb54f84ec4a09643c7/66c8a0fb54f84ec4a096448a_Animation%201724168241796%20(1).json" data-loop="1" data-direction="1" data-autoplay="1" data-is-ix2-target="0" data-renderer="svg" data-default-duration="2.3" data-duration="0"></div><a scrollin-animation="" href="get-started.html" class="footer_nav-link w-inline-block"><div class="footer_nav-label">Get Started</div></a>'''

pages = ['index.html', 'longevity.html', 'testosterone.html', 'microdosing.html', 'pricing.html', 'contact-us.html', 'get-started.html']

for page in pages:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update navbar links - find the nav menu section and replace the links
        # Pattern to match navbar menu content between <nav> tags
        navbar_pattern = r'(<nav role="navigation" class="navbar_menu-2 is-page-height-tablet w-nav-menu">)(.*?)(</nav>)'
        content = re.sub(navbar_pattern, r'\1' + NAVBAR_LINKS + r'\3', content, flags=re.DOTALL)

        # Update footer nav - find footer_nav div and replace its content
        footer_pattern = r'(<div class="footer_nav">)(.*?)(</div>\s*<div class="footer_legal-disclaimer-wrapper">)'
        content = re.sub(footer_pattern, r'\1' + FOOTER_NAV + r'\3', content, flags=re.DOTALL)

        # Fix menu button link
        content = re.sub(r'<a href="/get-started\.html"', '<a href="get-started.html"', content)

        # Standardize other links to use relative paths with .html
        content = re.sub(r'href="/pricing"', 'href="pricing.html"', content)
        content = re.sub(r'href="/microdosing"', 'href="microdosing.html"', content)
        content = re.sub(r'href="/longevity"', 'href="longevity.html"', content)
        content = re.sub(r'href="/testosterone"', 'href="testosterone.html"', content)
        content = re.sub(r'href="/contact-us"', 'href="contact-us.html"', content)

        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✓ Updated {page}")
    except FileNotFoundError:
        print(f"✗ File not found: {page}")
    except Exception as e:
        print(f"✗ Error updating {page}: {e}")

print("\nNavigation update complete!")
