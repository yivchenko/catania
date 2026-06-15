import re

GUIDE_FILE = "/Users/yivchenko/Downloads/catania/src/data/cataniaGuide.ts"

with open(GUIDE_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract places IDs
places_block_match = re.search(r'export const places: Place\[\] = \[(.*?)\];', content, re.DOTALL)
if not places_block_match:
    print("Could not find places block")
    exit(1)

places_block = places_block_match.group(1)
place_ids = re.findall(r'id:\s*"([^"]+)"', places_block)

# Extract realPhotos keys
real_photos_match = re.search(r'export const realPhotos: Record<string, GuideImage\[\]> = \{(.*?)\};', content, re.DOTALL)
if not real_photos_match:
    print("Could not find realPhotos block")
    exit(1)

real_photos_block = real_photos_match.group(1)
real_photo_keys = re.findall(r'"([^"]+)"\s*:', real_photos_block)

print("Place IDs count:", len(place_ids))
print("RealPhoto keys count:", len(real_photo_keys))

missing_in_photos = [pid for pid in place_ids if pid not in real_photo_keys]
print("Missing in realPhotos:", missing_in_photos)

superfluous_in_photos = [rpk for rpk in real_photo_keys if rpk not in place_ids]
print("Superfluous in realPhotos:", superfluous_in_photos)
