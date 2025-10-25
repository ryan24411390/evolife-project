#!/usr/bin/env python3
"""
Update Moat task statuses in moat-tasks-detail.json
"""

import json
from datetime import datetime
from pathlib import Path

TASKS_FILE = Path("/Users/raiyanabdullah/Desktop/Evolife FInal and last/.moat/moat-tasks-detail.json")

# Task IDs that have been completed
COMPLETED_TASKS = [
    "7472002c-94f8-4a07-9053-535f43a44a46",  # Remove promo banner
    "375e2b8e-5603-4595-8712-2b4731746352",  # Remove footer app badges
    "4b6682a1-1a98-430a-a2f4-fd313cbf6950",  # Remove merch link
    "bd7d87fe-3b91-40cb-963c-30c3b022ca12",  # Update copyright
    "84618886-f6d5-4b27-abdd-d62e16deffb1",  # Remove merch footer link
    "4604d968-d9aa-4bb2-9b4c-2587697dbfde",  # Remove Evolife Meals footer link
    "366b95f0-bb50-44d2-b1b0-b2d2ad999cf8",  # Update email to info@evolifewellness.com
    "0b3a416b-c1d9-48b1-b7a9-76221c69678e",  # Remove ayuda mail section
]

# Tasks that need manual review or are already complete
REVIEW_TASKS = [
    "fa24e7b5-e706-4135-8eac-7c1a9224e798",  # Logo replacement (already has Evolife logos)
    "d7c0f98d-203b-47fa-87ce-8acff7e2151d",  # Change tagline (need to verify)
    "dc3f2a8c-482d-4194-9025-a0013680edc7",  # Marquee text (need to verify)
    "7a5dc828-c269-4fc8-9ab1-433863dbd6cc",  # Trustpilot (already correct - joinevolife.com)
    "29308de9-6f24-4b97-892d-fa34027cbdf4",  # Social links (need to verify)
    "f5c70b4c-b850-40f3-8d7c-3483d1fadb42",  # Legal disclaimer (need to verify)
    "845e1550-a960-4b40-867a-b5d001c9b7f7",  # Footer logo (need to verify)
    "755ae85a-705d-42c9-8bdd-358ae99c345e",  # Modal logo (need to verify)
]

def update_task_statuses():
    """Update task statuses in moat-tasks-detail.json"""

    # Read the current tasks
    with open(TASKS_FILE, 'r', encoding='utf-8') as f:
        tasks = json.load(f)

    current_time = int(datetime.now().timestamp() * 1000)
    updated_count = 0

    # Update completed tasks
    for task in tasks:
        task_id = task.get("id")

        if task_id in COMPLETED_TASKS:
            task["status"] = "done"
            task["lastModified"] = current_time
            updated_count += 1
            print(f"✓ Marked as DONE: {task['title']}")

    # Write back the updated tasks
    with open(TASKS_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Updated {updated_count} task(s) to 'done' status")
    print(f"{'='*60}")

    # Summary
    total_tasks = len(tasks)
    done_tasks = sum(1 for t in tasks if t.get("status") == "done")
    remaining_tasks = total_tasks - done_tasks

    print(f"\nTask Summary:")
    print(f"  Total tasks: {total_tasks}")
    print(f"  Completed: {done_tasks}")
    print(f"  Remaining: {remaining_tasks}")

    if remaining_tasks > 0:
        print(f"\n  Remaining tasks require manual review:")
        for task in tasks:
            if task.get("status") == "to do":
                print(f"    - {task['title']}")

if __name__ == "__main__":
    update_task_statuses()
