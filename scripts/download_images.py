import os
import re
import sys
import urllib.request
import urllib.error
import time

# Define paths
ROOT_DIR = "/Users/yivchenko/Downloads/catania"
GUIDE_FILE = os.path.join(ROOT_DIR, "src/data/cataniaGuide.ts")
IMAGES_DIR = os.path.join(ROOT_DIR, "public/images/places")

# Ensure output directory exists
os.makedirs(IMAGES_DIR, exist_ok=True)

# User-Agent to satisfy Wikimedia CDN's rules (needs to look like a standard browser)
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def download_image(url, dest_path):
    print(f"Downloading {url} -> {dest_path}")
    req = urllib.request.Request(
        url, 
        headers={"User-Agent": USER_AGENT}
    )
    
    # Try downloading with retries
    retries = 3
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    with open(dest_path, 'wb') as f:
                        f.write(response.read())
                    print("  Success!")
                    return True
                else:
                    print(f"  Unexpected status: {response.status}")
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"  HTTP 429 Too Many Requests. Attempt {attempt+1}/{retries}. Sleeping...")
                time.sleep(3 * (attempt + 1))
            else:
                print(f"  HTTP Error {e.code}: {e.reason}")
                break
        except Exception as e:
            print(f"  Error: {e}")
            time.sleep(1)
            
    return False

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
    
    # Find all place keys and their first GuideImage URL
    # Format: "key": [{ url: "URL", ... }]
    pattern = r'"([^"]+)":\s*\[\s*\{\s*url:\s*"([^"]+)"'
    matches = re.findall(pattern, real_photos_block)
    
    print(f"Found {len(matches)} images to download.")
    
    success_count = 0
    skipped_count = 0
    failed_count = 0
    
    updated_content = content
    
    for key, url in matches:
        # Resolve Roman Theatre key typo if found
        clean_key = "roman-theatre-odeon" if key == "roman-theatre-odean" else key
        dest_filename = f"{clean_key}.jpg"
        dest_path = os.path.join(IMAGES_DIR, dest_filename)
        
        # Check if we should download
        # If it's already downloaded and file size is > 5KB, skip it
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 5000:
            print(f"Image {dest_filename} already exists and is valid size. Skipping.")
            skipped_count += 1
            success = True
        else:
            success = download_image(url, dest_path)
            if success:
                success_count += 1
                # Small polite delay between requests to avoid rate limits
                time.sleep(0.5)
            else:
                failed_count += 1
                
        if success:
            # Replace the URL in the file content with the local path
            # We want it to be /catania/images/places/<clean_key>.jpg
            local_url = f"/catania/images/places/{dest_filename}"
            escaped_url = re.escape(url)
            # Find the specific line for this key
            key_pattern = '"' + key + r'":\s*\[\s*\{\s*url:\s*"' + escaped_url + '"'
            replacement = f'"{clean_key}": [{{ url: "{local_url}"'
            updated_content = re.sub(key_pattern, replacement, updated_content)

    # Write the updated content back to the file
    with open(GUIDE_FILE, 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    print("\n--- Download Summary ---")
    print(f"Successful downloads: {success_count}")
    print(f"Skipped (already exists): {skipped_count}")
    print(f"Failed: {failed_count}")
    print(f"Total: {len(matches)}")
    print("------------------------")

if __name__ == "__main__":
    main()
