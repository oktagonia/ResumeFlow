import os
import time
from pdf_utils import cleanup_temp_dir


def cleanup_old_temp_files(max_age_minutes=30):
    """Clean up temporary files older than the specified time."""
    temp_dir = "./temp"
    if not os.path.exists(temp_dir):
        return

    current_time = time.time()
    max_age_seconds = max_age_minutes * 60

    for item in os.listdir(temp_dir):
        item_path = os.path.join(temp_dir, item)
        if os.path.isdir(item_path):
            try:
                # Check directory age
                mtime = os.path.getmtime(item_path)
                if current_time - mtime > max_age_seconds:
                    cleanup_temp_dir(item_path)
                    print(f"Cleaned up old directory: {item_path}")
            except Exception as e:
                print(f"Error checking/cleaning {item_path}: {e}")
