import urllib.request
import urllib.error

url = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Li_Cuti_Catania_%28246315011%29.jpeg/1280px-Li_Cuti_Catania_%28246315011%29.jpeg"
ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

req = urllib.request.Request(url, headers={"User-Agent": ua})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("Success! Status:", response.status)
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
except Exception as e:
    print(f"Error: {e}")
