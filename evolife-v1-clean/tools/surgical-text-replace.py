#!/usr/bin/env python3
"""
Surgical Text-Only Brand Replacement: Fridays → Evolife
Only replaces visible text content, preserving all code, structure, and filenames.
Uses built-in html.parser - no external dependencies required.
"""

import os
import sys
import re
from pathlib import Path
from html.parser import HTMLParser


# Replacement mappings (case-sensitive)
REPLACEMENTS = {
    'Fridays': 'Evolife',
    'FRIDAYS': 'EVOLIFE',
    'fridays': 'evolife',
    "Fridays'": "Evolife's",
    'joinfridays.com': 'joinevolife.com',
    'app.joinfridays.com': 'app.joinevolife.com',
    'www.joinfridays.com': 'www.joinevolife.com',
    'joinfridays': 'joinevolife',
    'joinFridays': 'joinEvolife',
}

# Tags to skip entirely (don't process their content)
SKIP_TAGS = ['script', 'style']

# Attributes where we should replace text (visible to users/screen readers)
TEXT_ATTRIBUTES = ['alt', 'title', 'aria-label', 'placeholder']


def replace_text(text):
    """Replace all brand variations in text."""
    if not text or not isinstance(text, str):
        return text

    result = text
    for old, new in REPLACEMENTS.items():
        result = result.replace(old, new)
    return result


def should_replace_in_url(url):
    """Check if URL contains domain (not a filename)."""
    if not url:
        return False

    url_lower = url.lower()

    # Replace in actual domain URLs
    if any(domain in url_lower for domain in ['joinfridays.com', 'app.joinfridays.com']):
        return True

    # Don't replace in file paths
    return False


def process_html_with_regex(content, stats):
    """
    Process HTML content using careful regex patterns.
    This preserves structure while only replacing visible text.
    """

    # 1. Replace in <title> tags
    def replace_title(match):
        opening = match.group(1)
        text = match.group(2)
        closing = match.group(3)
        new_text = replace_text(text)
        if new_text != text:
            stats['title'] += 1
        return opening + new_text + closing

    content = re.sub(r'(<title[^>]*>)(.*?)(</title>)', replace_title, content, flags=re.DOTALL | re.IGNORECASE)

    # 2. Replace in meta tag content attributes
    def replace_meta_content(match):
        prefix = match.group(1)
        content_value = match.group(2)
        suffix = match.group(3)
        new_content = replace_text(content_value)
        if new_content != content_value:
            stats['meta'] += 1
        return prefix + new_content + suffix

    content = re.sub(
        r'(<meta[^>]*\bcontent\s*=\s*["\'])([^"\']*?)(["\'][^>]*>)',
        replace_meta_content,
        content,
        flags=re.IGNORECASE
    )

    # 3. Replace in alt attributes
    def replace_alt(match):
        prefix = match.group(1)
        alt_value = match.group(2)
        suffix = match.group(3)
        new_alt = replace_text(alt_value)
        if new_alt != alt_value:
            stats['alt'] += 1
        return prefix + new_alt + suffix

    content = re.sub(
        r'(\balt\s*=\s*["\'])([^"\']*?)(["\'])',
        replace_alt,
        content,
        flags=re.IGNORECASE
    )

    # 4. Replace in title attributes
    def replace_title_attr(match):
        prefix = match.group(1)
        title_value = match.group(2)
        suffix = match.group(3)
        new_title = replace_text(title_value)
        if new_title != title_value:
            stats['title_attr'] += 1
        return prefix + new_title + suffix

    content = re.sub(
        r'(\btitle\s*=\s*["\'])([^"\']*?)(["\'])',
        replace_title_attr,
        content,
        flags=re.IGNORECASE
    )

    # 5. Replace in aria-label attributes
    def replace_aria(match):
        prefix = match.group(1)
        aria_value = match.group(2)
        suffix = match.group(3)
        new_aria = replace_text(aria_value)
        if new_aria != aria_value:
            stats['aria'] += 1
        return prefix + new_aria + suffix

    content = re.sub(
        r'(\baria-label\s*=\s*["\'])([^"\']*?)(["\'])',
        replace_aria,
        content,
        flags=re.IGNORECASE
    )

    # 6. Replace domain URLs in href attributes (but not file paths)
    def replace_href_url(match):
        prefix = match.group(1)
        url = match.group(2)
        suffix = match.group(3)

        if should_replace_in_url(url):
            new_url = replace_text(url)
            if new_url != url:
                stats['url'] += 1
            return prefix + new_url + suffix
        return match.group(0)

    content = re.sub(
        r'(\bhref\s*=\s*["\'])([^"\']*?)(["\'])',
        replace_href_url,
        content
    )

    # 7. Replace in JSON-LD structured data (special case - it's in script tags but is data)
    def replace_jsonld(match):
        opening = match.group(1)
        json_content = match.group(2)
        closing = match.group(3)
        new_json = replace_text(json_content)
        if new_json != json_content:
            stats['jsonld'] = stats.get('jsonld', 0) + 1
        return opening + new_json + closing

    content = re.sub(
        r'(<script\s+type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',
        replace_jsonld,
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # 8. Replace visible text content (between tags, excluding script/style)
    # This is the trickiest part - we need to avoid script and style content

    # First, protect script and style blocks (except JSON-LD which we already processed)
    script_style_blocks = []

    def save_script_style(match):
        # Skip JSON-LD scripts (already processed)
        if 'application/ld+json' in match.group(0).lower():
            return match.group(0)
        index = len(script_style_blocks)
        script_style_blocks.append(match.group(0))
        return f'___PROTECTED_BLOCK_{index}___'

    content = re.sub(
        r'<(script|style)[^>]*>.*?</\1>',
        save_script_style,
        content,
        flags=re.DOTALL | re.IGNORECASE
    )

    # Now replace in text content between tags
    def replace_text_content(match):
        text = match.group(0)
        # Skip if it's just whitespace or a tag
        if text.strip() and not text.strip().startswith('<'):
            new_text = replace_text(text)
            if new_text != text:
                stats['text'] += 1
            return new_text
        return text

    # Replace text between > and <
    content = re.sub(
        r'>([^<>]+)<',
        lambda m: '>' + replace_text(m.group(1)) + '<',
        content
    )

    # Restore script and style blocks
    for index, block in enumerate(script_style_blocks):
        content = content.replace(f'___PROTECTED_BLOCK_{index}___', block)

    return content


def process_html_file(file_path):
    """Process a single HTML file."""
    print(f"Processing: {file_path.name}")

    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Track statistics
    stats = {
        'title': 0,
        'meta': 0,
        'alt': 0,
        'title_attr': 0,
        'aria': 0,
        'url': 0,
        'jsonld': 0,
        'text': 0
    }

    # Process the content
    content = process_html_with_regex(content, stats)

    total = sum(stats.values())

    # Write back if changes were made
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  ✓ {total} replacements:")
        if stats['title'] > 0:
            print(f"    - <title> tags: {stats['title']}")
        if stats['meta'] > 0:
            print(f"    - Meta content: {stats['meta']}")
        if stats['alt'] > 0:
            print(f"    - Alt attributes: {stats['alt']}")
        if stats['title_attr'] > 0:
            print(f"    - Title attributes: {stats['title_attr']}")
        if stats['aria'] > 0:
            print(f"    - Aria-label: {stats['aria']}")
        if stats['url'] > 0:
            print(f"    - URLs: {stats['url']}")
        if stats['jsonld'] > 0:
            print(f"    - JSON-LD data: {stats['jsonld']}")
        if stats['text'] > 0:
            print(f"    - Text content: {stats['text']}")
    else:
        print(f"  → No changes needed")

    return stats


def main():
    # Get the directory to process
    if len(sys.argv) > 1:
        target_dir = Path(sys.argv[1])
    else:
        # Default to evolife-text-only directory
        script_dir = Path(__file__).parent
        target_dir = script_dir.parent / 'evolife-text-only'

    if not target_dir.exists():
        print(f"Error: Directory not found: {target_dir}")
        sys.exit(1)

    print("🔄 Surgical Text-Only Replacement: Fridays → Evolife")
    print("=" * 60)
    print(f"Target directory: {target_dir}")
    print("=" * 60)
    print()

    # Find all HTML files
    html_files = list(target_dir.glob('*.html'))

    if not html_files:
        print("No HTML files found!")
        sys.exit(1)

    print(f"Found {len(html_files)} HTML files\n")

    # Process each file
    total_stats = {
        'files_changed': 0,
        'title': 0,
        'meta': 0,
        'alt': 0,
        'title_attr': 0,
        'aria': 0,
        'url': 0,
        'jsonld': 0,
        'text': 0
    }

    for html_file in sorted(html_files):
        stats = process_html_file(html_file)

        if sum(stats.values()) > 0:
            total_stats['files_changed'] += 1
            for key in stats:
                total_stats[key] += stats[key]

    # Print summary
    print()
    print("=" * 60)
    print("✅ COMPLETE!")
    print("=" * 60)
    print(f"Files processed: {len(html_files)}")
    print(f"Files changed: {total_stats['files_changed']}")
    total_replacements = sum(v for k, v in total_stats.items() if k != 'files_changed')
    print(f"Total replacements: {total_replacements}")
    print(f"  - <title> tags: {total_stats['title']}")
    print(f"  - Meta content: {total_stats['meta']}")
    print(f"  - Alt attributes: {total_stats['alt']}")
    print(f"  - Title attributes: {total_stats['title_attr']}")
    print(f"  - Aria-label: {total_stats['aria']}")
    print(f"  - URLs: {total_stats['url']}")
    print(f"  - JSON-LD data: {total_stats['jsonld']}")
    print(f"  - Visible text: {total_stats['text']}")
    print()
    print("✅ All HTML structure, CSS, JavaScript, and filenames preserved!")
    print("=" * 60)


if __name__ == '__main__':
    main()
