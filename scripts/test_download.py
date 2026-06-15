import urllib.request
import urllib.error

url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Catania%2C_piazza_del_Duomo.jpg/1280px-Catania%2C_piazza_del_Duomo.jpg"

uas = [
    ("Default urllib", None),
    ("Browser UA", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
    ("Custom UA", "CataniaTravelGuide/1.0 (contact: yivchenko@example.com; offline-assets-download)")
]

for name, ua in uas:
    print(f"Testing {name}...")
    headers = {}
    if ua:
        headers["User-Agent"] = ua
        
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  Success! Status code: {response.status}, length: {len(response.read())}")
    except urllib.error.HTTPError as e:
        print(f"  Failed! HTTP Error {e.code}: {e.reason}")
    except Exception as e:
        print(f"  Failed! Error: {e}")
