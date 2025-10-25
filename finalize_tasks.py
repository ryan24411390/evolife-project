#!/usr/bin/env python3
"""
Finalize Moat tasks and create summary report
"""

import json
from datetime import datetime
from pathlib import Path

TASKS_FILE = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last/.moat/moat-tasks-detail.json")
REPORT_FILE = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last/.moat/completion-report.md")

# Additional task to mark as done
ADDITIONAL_COMPLETED = [
    "d7c0f98d-203b-47fa-87ce-8acff7e2151d",  # Tagline change - DONE
]

# Tasks that are already complete (verified)
ALREADY_COMPLETE = [
    "fa24e7b5-e706-4135-8eac-7c1a9224e798",  # Logo - already Evolife
    "7a5dc828-c269-4fc8-9ab1-433863dbd6cc",  # Trustpilot - already correct
    "29308de9-6f24-4b97-892d-fa34027cbdf4",  # Social links - already correct
]

# Tasks requiring manual review/content creation
MANUAL_REVIEW = [
    "dc3f2a8c-482d-4194-9025-a0013680edc7",  # Marquee "Highest Quality" - element may not exist
    "f5c70b4c-b850-40f3-8d7c-3483d1fadb42",  # Legal disclaimer rewrite - requires content
    "845e1550-a960-4b40-867a-b5d001c9b7f7",  # Footer logo - may already be correct
    "755ae85a-705d-42c9-8bdd-358ae99c345e",  # Modal logo - may already be correct
]

def update_and_report():
    """Update task statuses and generate report"""

    # Read tasks
    with open(TASKS_FILE, 'r', encoding='utf-8') as f:
        tasks = json.load(f)

    current_time = int(datetime.now().timestamp() * 1000)

    # Update additional completed tasks
    for task in tasks:
        task_id = task.get("id")
        if task_id in ADDITIONAL_COMPLETED:
            task["status"] = "done"
            task["lastModified"] = current_time
        elif task_id in ALREADY_COMPLETE:
            task["status"] = "done"
            task["lastModified"] = current_time

    # Write back
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2)

    # Generate report
    completed_tasks = [t for t in tasks if t.get("status") == "done"]
    remaining_tasks = [t for t in tasks if t.get("status") == "to do"]

    report = f"""# Moat Tasks Completion Report

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary

- **Total Tasks:** {len(tasks)}
- **Completed:** {len(completed_tasks)} ({len(completed_tasks)/len(tasks)*100:.1f}%)
- **Remaining:** {len(remaining_tasks)} ({len(remaining_tasks)/len(tasks)*100:.1f}%)

## Completed Tasks ✅

"""

    for task in completed_tasks:
        report += f"### {task['title']}\n"
        report += f"- **Comment:** {task['comment']}\n"
        report += f"- **Selector:** `{task['selector']}`\n\n"

    report += "## Remaining Tasks 🔍\n\n"

    if remaining_tasks:
        report += "*These tasks require manual review or content creation:*\n\n"
        for task in remaining_tasks:
            report += f"### {task['title']}\n"
            report += f"- **Comment:** {task['comment']}\n"
            report += f"- **Selector:** `{task['selector']}`\n"
            task_id = task.get("id")
            if task_id in MANUAL_REVIEW:
                if task_id == "dc3f2a8c-482d-4194-9025-a0013680edc7":
                    report += "- **Note:** This marquee element may not exist or may have already been updated.\n"
                elif task_id == "f5c70b4c-b850-40f3-8d7c-3483d1fadb42":
                    report += "- **Note:** Requires custom legal disclaimer content for Evolife Wellness.\n"
                else:
                    report += "- **Note:** May already be complete, requires visual verification.\n"
            report += "\n"
    else:
        report += "*All tasks completed!*\n\n"

    report += """## Changes Made

### Automated Changes ✅

1. **Removed promo banner** - All `#default_floating_banner` elements removed across 21 files
2. **Removed merch links** - Navigation links to shopify store removed
3. **Removed footer elements:**
   - App download badges section
   - "Merch" footer navigation link
   - "Evolife Meals" footer navigation link
   - Secondary email section (ayuda@)
4. **Updated copyright** - Changed to "All rights reserved by Evolife Wellness"
5. **Updated email** - Changed from `ayuda@joinevolife.com` to `info@evolifewellness.com`
6. **Updated tagline** - Changed "Don't wait until Friday to feel good" to "Don't wait to feel good"

### Files Modified

- 21 HTML files in `/evolife-v1-clean/evolife/` directory
- All changes applied consistently across:
  - Main pages (index, pricing, etc.)
  - Blog posts
  - Legal pages
  - Contact pages

## Technical Details

- **Tool:** Python scripts for batch processing
- **Method:** Regex-based search and replace
- **Validation:** Content verification via grep
- **Status tracking:** Automated updates to `moat-tasks-detail.json`

---

**Next Steps:**

1. Review remaining tasks visually in browser
2. Create custom content for legal disclaimer if needed
3. Verify logo replacements are correct
4. Test all pages to ensure functionality
"""

    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)

    print("=" * 70)
    print("FINAL SUMMARY")
    print("=" * 70)
    print(f"\nTotal Tasks: {len(tasks)}")
    print(f"Completed: {len(completed_tasks)} ({len(completed_tasks)/len(tasks)*100:.1f}%)")
    print(f"Remaining: {len(remaining_tasks)} ({len(remaining_tasks)/len(tasks)*100:.1f}%)")
    print(f"\nReport saved to: {REPORT_FILE}")
    print("=" * 70)

if __name__ == "__main__":
    update_and_report()
