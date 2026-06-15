import os
import re
import sys

ROOT_DIR = "/Users/yivchenko/Downloads/catania"
GUIDE_FILE = os.path.join(ROOT_DIR, "src/data/cataniaGuide.ts")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")

def check_image_header(filepath):
    try:
        with open(filepath, 'rb') as f:
            header = f.read(4)
        # Check JPEG magic bytes
        if header.startswith(b'\xff\xd8\xff'):
            return "JPEG"
        # Check PNG magic bytes
        elif header.startswith(b'\x89PNG'):
            return "PNG"
        # Check WebP magic bytes
        elif header.startswith(b'RIFF') and b'WEBP' in header:
            return "WEBP"
        else:
            return f"UNKNOWN_HEADER ({header.hex()})"
    except Exception as e:
        return f"ERROR_READING ({e})"

def main():
    if not os.path.exists(GUIDE_FILE):
        print(f"Error: Guide file not found at {GUIDE_FILE}")
        sys.exit(1)
        
    with open(GUIDE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the realPhotos declaration block
    real_photos_match = re.search(r'export const realPhotos: Record<string, GuideImage\[\]> = \{(.*?)\};', content, re.DOTALL)
    if not real_photos_match:
        print("Error: Could not find realPhotos object in guide file.")
        sys.exit(1)
        
    real_photos_block = real_photos_match.group(1)
    
    # Find all place keys and their GuideImage URLs
    pattern = r'"([^"]+)":\s*\[\s*\{\s*url:\s*"([^"]+)"'
    matches = re.findall(pattern, real_photos_block)
    
    print(f"Verifying {len(matches)} places image paths...")
    
    errors = []
    for key, url in matches:
        # Resolve url base /catania/ -> public/
        if not url.startswith("/catania/"):
            errors.append(f"Place '{key}': URL '{url}' does not start with '/catania/'")
            continue
            
        relative_path = url.replace("/catania/", "")
        disk_path = os.path.join(PUBLIC_DIR, relative_path)
        
        if not os.path.exists(disk_path):
            errors.append(f"Place '{key}': File does not exist at '{disk_path}'")
            continue
            
        size = os.path.getsize(disk_path)
        if size < 5000:
            errors.append(f"Place '{key}': File size {size} bytes is too small (<5KB)")
            continue
            
        header_type = check_image_header(disk_path)
        if not header_type.startswith(("JPEG", "PNG", "WEBP")):
            errors.append(f"Place '{key}': File at '{disk_path}' is not a valid image format ({header_type})")
            continue
            
        print(f"  OK: {key:26} -> {relative_path:35} ({header_type}, {size/1024:.1f} KB)")
        
    print("\n--- Image Verification Summary ---")
    if errors:
        print(f"Found {len(errors)} issues:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("All images are present, valid, and size-checked successfully!")
        sys.exit(0)

if __name__ == "__main__":
    main()
