#!/usr/bin/env python3
"""
Remove all images from the testimonial section in index.html
"""

import re
from datetime import datetime

def remove_testimonial_images(file_path):
    """Remove testimonial profile images and before/after images"""

    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Create backup
    backup_path = file_path.replace('.html', f'.testimonial_img_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.html')
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Backup created: {backup_path}")

    # Remove testimonial_client-image-wrapper divs and their contents
    # This pattern matches the entire div including the img tag inside
    content = re.sub(
        r'<div class="testimonial_client-image-wrapper">.*?</div>',
        '',
        content,
        flags=re.DOTALL
    )

    # Remove testimonial_before-after divs and their contents
    # This includes both before and after images
    content = re.sub(
        r'<div class="testimonial_before-after">.*?</div>',
        '',
        content,
        flags=re.DOTALL
    )

    # Write the updated content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Removed all testimonial images from {file_path}")
    print(f"  - Removed customer profile images")
    print(f"  - Removed before/after transformation images")

if __name__ == '__main__':
    file_path = '/Users/raiyanabdullah/Desktop/Evolife FInal and last/index.html'
    remove_testimonial_images(file_path)
    print("\nDone! The testimonial section now displays without images.")
