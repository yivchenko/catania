#!/usr/bin/env python3
import json, urllib.parse, urllib.request, time, sys
UA = "CataniaPersonalGuide/1.0 (travel app image lookup)"
API = "https://commons.wikimedia.org/w/api.php"
QUERIES = {
    "savia": "Arancino Sicilia",
    "chiosco-giammona": "Chiosco bibite Catania",
    "piazza-mazzini": "Piazza Mazzini Catania",
    "randazzo-circumetnea": "Randazzo Sicilia town",
}
for key, q in QUERIES.items():
    params = {"action":"query","format":"json","generator":"search","gsrsearch":q,
              "gsrnamespace":"6","gsrlimit":"10","prop":"imageinfo","iiprop":"url","iiurlwidth":"1200"}
    url = API + "?" + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.load(r)
        pages = list((data.get("query",{}) or {}).get("pages",{}).values())
        pages.sort(key=lambda p: p.get("index",999))
        print(f"\n=== {key}  (query: {q}) ===")
        for p in pages[:8]:
            t = p.get("title","")
            ii = p.get("imageinfo",[{}])[0]
            print(f"  {t}  ||  {ii.get('thumburl','')}")
    except Exception as e:
        print(f"# ERR {key}: {e}", file=sys.stderr)
    time.sleep(2.0)
