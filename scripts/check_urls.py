import re

GUIDE_FILE = "/Users/yivchenko/Downloads/catania/src/data/cataniaGuide.ts"

with open(GUIDE_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract realPhotos keys and URLs
real_photos_match = re.search(r'export const realPhotos: Record<string, GuideImage\[\]> = \{(.*?)\};', content, re.DOTALL)
if not real_photos_match:
    print("Could not find realPhotos block")
    exit(1)

real_photos_block = real_photos_match.group(1)
pattern = r'"([^"]+)":\s*\[\s*\{\s*url:\s*"([^"]+)"'
matches = re.findall(pattern, real_photos_block)

print(f"Total entries in realPhotos: {len(matches)}")
urls_seen = {}
for key, url in matches:
    if url in urls_seen:
        urls_seen[url].append(key)
    else:
        urls_seen[url] = [key]

duplicate_urls = {u: keys for u, keys in urls_seen.items() if len(keys) > 1}
if duplicate_urls:
    print("\nDuplicate URLs found:")
    for url, keys in duplicate_urls.items():
        print(f"URL: {url}")
        print(f"  Used by keys: {keys}\n")
else:
    print("\nAll URLs are unique!")

print("\nList of all places and their URLs:")
for i, (key, url) in enumerate(matches):
    print(f"{i+1}. {key} -> {url}")
