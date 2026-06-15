#!/usr/bin/env python3
"""Fetch a real Wikimedia Commons photo URL for each Catania guide place.
Caches successes to /tmp/photos_cache.json so re-runs only fetch what is missing."""
import json, os, sys, time, urllib.parse, urllib.request

UA = "CataniaPersonalGuide/1.0 (https://github.com/catania; travel app image lookup)"
API = "https://commons.wikimedia.org/w/api.php"
CACHE = "/tmp/photos_cache.json"

# (place_id, query, ukrainian alt, must_token_in_title_or_None)
PLACES = [
    ("duomo-pescheria", "Piazza del Duomo Catania", "Соборна площа в Катанії з фонтаном зі слоном", "catania"),
    ("terme-achilliane", "Terme Achilliane Catania", "Ахіллові терми під собором у Катанії", "catania"),
    ("badia-sant-agata", "Badia Sant'Agata Catania", "Абатство Святої Агати в Катанії", "catania"),
    ("museo-diocesano-terraces", "Museo Diocesano Catania", "Діоцезний музей біля собору в Катанії", "catania"),
    ("roman-theatre-odeon", "Teatro romano Catania", "Римський театр у Катанії", "catania"),
    ("terme-rotonda", "Terme della Rotonda Catania", "Терми Ротонда в Катанії", "catania"),
    ("via-crociferi", "Via Crociferi Catania", "Барокова вулиця Крочіфері в Катанії", "catania"),
    ("monastero-benedettini", "Monastero Benedettini Catania", "Монастир бенедиктинців у Катанії", "catania"),
    ("castello-ursino", "Castello Ursino Catania", "Замок Урсіно — фортеця з лавового каменю", "castello"),
    ("giardino-pacini", "Giardino Pacini Catania", "Сад Пачіні в Катанії", "catania"),
    ("palazzo-biscari", "Palazzo Biscari Catania", "Палац Біскарі — барокові інтер'єри", "biscari"),
    ("san-giovanni-li-cuti", "San Giovanni li Cuti Catania", "Чорний вулканічний пляж Сан-Джованні-лі-Куті", "cuti"),
    ("aci-castello-trezza", "Aci Castello castello normanno", "Норманський замок Ачі-Кастелло над морем", "aci"),
    ("casa-del-nespolo", "Faraglioni Aci Trezza", "Фаральйоні в Ачі-Трецца", "trezza"),
    ("siracusa-ortigia", "Ortigia Siracusa", "Острів Ортиджа в Сиракузах", "ortigia"),
    ("taormina-taobuk", "Teatro Greco Taormina", "Грецький театр у Таорміні", "taormina"),
    ("etna", "Etna volcano Sicily", "Вулкан Етна на Сицилії", "etna"),
    ("le-ciminiere", "Ciminiere Catania", "Комплекс Ле-Чімінʼєре в Катанії", "ciminiere"),
    ("via-santa-filomena", "Via Santa Filomena Catania", "Вулиця їжі Санта-Філомена в Катанії", "catania"),
    ("anfiteatro-romano", "Anfiteatro romano Catania", "Римський амфітеатр на площі Стезікоро", "catania"),
    ("giardino-bellini", "Villa Bellini Catania", "Парк Вілла Белліні в Катанії", "bellini"),
    ("ognina-scogliera", "Ognina Catania", "Гавань і скелі Оньїна в Катанії", "ognina"),
    ("piazza-universita", "Piazza Universita Catania", "Університетська площа в Катанії", "catania"),
    ("teatro-bellini", "Teatro Massimo Bellini Catania", "Театр Массімо Белліні в Катанії", "bellini"),
    ("fera-o-luni", "Mercato Catania Carlo Alberto", "Ринок Fera o' Luni в Катанії", "catania"),
    ("acireale", "Duomo Acireale", "Барокковий собор Ачіреале", "acireale"),
    ("san-benedetto", "Chiesa San Benedetto Catania", "Барокова церква Сан-Бенедетто в Катанії", "catania"),
    ("piazza-mazzini", "Piazza Mazzini Catania portici", "Барокові аркади площі Мадзіні в Катанії", "catania"),
    ("san-gaetano-grotte", "San Gaetano alle Grotte Catania", "Церква Сан-Гаетано-алле-Гротте", "catania"),
    ("porta-garibaldi", "Porta Garibaldi Catania", "Брама Гарібальді в Катанії", "catania"),
    ("gammazita", "piazza Federico Svevia Castello Ursino Catania", "Площа біля Замку Урсіно", "catania"),
    ("santa-maria-la-scala", "Santa Maria la Scala Acireale", "Рибальське село Санта-Марія-ла-Скала", "scala"),
    ("isole-ciclopi", "Isole Ciclopi Aci Trezza", "Острови Циклопів біля Ачі-Трецца", "ciclopi"),
    ("giardini-naxos", "Giardini Naxos Sicily", "Морський курорт Джардіні-Наксос", "naxos"),
    ("noto", "Noto Cathedral Sicily", "Барокковий собор Ното", "noto"),
    ("randazzo-circumetnea", "Randazzo Catania town", "Містечко Рандаццо на Етні", "randazzo"),
    ("cannizzaro", "Cannizzaro Catania", "Узбережжя Каннідзаро", "cannizzaro"),
    ("trattoria-forestiero", "Pasta alla Norma", "Паста алла Норма", None),
    ("trattoria-la-paglia", "Pescheria Catania", "Рибний ринок Катанії", "catania"),
    ("chiosco-giammona", "Seltz limone sale", "Сельтерська з лимоном і сіллю", None),
    ("savia", "Arancini siciliani", "Сицилійські аранчіні", None),
    ("spinella", "Granita brioche", "Ґраніта з бріошшю", None),
    ("borgo-federico", "Carne di cavallo Sicilia", "Кінське м'ясо — катанійська традиція", None),
    ("biancuccia", "Pane siciliano", "Сицилійський хліб і випічка", None),
    ("bar-alecci", "Granita siciliana", "Сицилійська ґраніта", None),
    ("bangla-spicy", "Mercato Catania", "Вуличний ринок у Катанії", "catania"),
]

BAD = ("map", "mappa", "stemma", "coat", "logo", "flag", "diagram", "plan", "icon", "seal", "blason")

def load_cache():
    try:
        with open(CACHE) as f:
            return json.load(f)
    except Exception:
        return {}

def save_cache(c):
    with open(CACHE, "w") as f:
        json.dump(c, f)

def fetch(query, must):
    params = {
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": query, "gsrnamespace": "6", "gsrlimit": "12",
        "prop": "imageinfo", "iiprop": "url", "iiurlwidth": "1200", "maxlag": "5",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                data = json.load(r)
            pages = list((data.get("query", {}) or {}).get("pages", {}).values())
            pages.sort(key=lambda p: p.get("index", 999))
            cand = []
            for p in pages:
                t = p.get("title", "")
                tl = t.lower()
                if not (tl.endswith(".jpg") or tl.endswith(".jpeg") or tl.endswith(".png")):
                    continue
                if any(b in tl for b in BAD):
                    continue
                ii = p.get("imageinfo", [{}])[0]
                thumb = ii.get("thumburl") or ii.get("url")
                if not thumb:
                    continue
                cand.append((t, thumb, ii.get("descriptionurl", "")))
            if must:
                for t, thumb, page in cand:
                    if must.lower() in t.lower():
                        return thumb, page, t
                return None, None, None  # require the token; no off-target fallback
            if cand:
                return cand[0][1], cand[0][2], cand[0][0]
            return None, None, None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(8 * (attempt + 1))
            elif attempt < 3:
                time.sleep(3)
            else:
                print(f"# ERROR {query}: {e}", file=sys.stderr)
        except Exception as e:
            if attempt < 3:
                time.sleep(3)
            else:
                print(f"# ERROR {query}: {e}", file=sys.stderr)
    return None, None, None

cache = load_cache()
for pid, query, alt, must in PLACES:
    if cache.get(pid):
        continue
    thumb, page, title = fetch(query, must)
    if thumb:
        cache[pid] = {"url": thumb, "page": page, "title": title}
        save_cache(cache)
        print(f"# OK   {pid:26} <- {title}", file=sys.stderr)
        time.sleep(1.6)
    else:
        print(f"# MISS {pid:26} (query: {query} | must: {must})", file=sys.stderr)
        time.sleep(0.8)

print("export const realPhotos: Record<string, GuideImage[]> = {")
for pid, query, alt, must in PLACES:
    e = cache.get(pid)
    if not e:
        continue
    u = e["url"].replace('"', '%22')
    s = (e.get("page") or "").replace('"', '%22')
    print(f'  "{pid}": [{{ url: "{u}", alt: "{alt}", credit: "Wikimedia Commons", sourceUrl: "{s}" }}],')
print("};")
miss = [pid for pid, *_ in PLACES if not cache.get(pid)]
print(f"# MISSING ({len(miss)}): {miss}", file=sys.stderr)
