import { describe, test, expect } from "vitest";
import { places, realPhotos, events } from "../data/cataniaGuide";

describe("Catania Guide Data Consistency", () => {
  test("All 46 places have unique IDs", () => {
    const ids = places.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(46);
    expect(uniqueIds.size).toBe(46);
  });

  test("Every place has local image URLs and no remote upload.wikimedia.org paths", () => {
    places.forEach((place) => {
      expect(place.images.length).toBeGreaterThan(0);
      place.images.forEach((img) => {
        expect(img.url).toBeDefined();
        // Should point to local images path, e.g. /catania/images/...
        expect(img.url.startsWith("/catania/images/")).toBe(true);
        expect(img.url.includes("upload.wikimedia.org")).toBe(false);
        expect(img.url.includes("Special:FilePath")).toBe(false);
      });
    });
  });

  test("Every key in realPhotos corresponds to a valid place ID", () => {
    const placeIds = new Set(places.map((p) => p.id));
    Object.keys(realPhotos).forEach((key) => {
      expect(placeIds.has(key)).toBe(true);
    });
  });

  test("Every place in places has an entry in realPhotos", () => {
    places.forEach((place) => {
      expect(realPhotos[place.id]).toBeDefined();
      expect(realPhotos[place.id].length).toBeGreaterThan(0);
    });
  });

  test("Events are verified and do not include the incorrect Gualtieri Sicaminò festival", () => {
    // Sagra dell'Arancia in Gualtieri Sicaminò is traditionally in May and should not be in the events array
    const gualtieriEvent = events.find((e) => e.id.includes("gualtieri") || e.name.includes("Gualtieri"));
    expect(gualtieriEvent).toBeUndefined();
    
    // Taobuk dates are verified for 18-22 June 2026
    const taobuk = events.find((e) => e.id === "taobuk-2026");
    expect(taobuk).toBeDefined();
    expect(taobuk?.dateLabel).toBe("18–22 червня 2026");
  });

  test("All places have complete required fields with non-empty strings", () => {
    places.forEach((place) => {
      expect(place.id).toBeTruthy();
      expect(place.name).toBeTruthy();
      expect(place.area).toBeTruthy();
      expect(place.category).toBeTruthy();
      expect(place.priority).toBeTruthy();
      expect(place.summary).toBeTruthy();
      expect(place.whyGo).toBeTruthy();
      expect(place.bestTime).toBeTruthy();
      expect(place.duration).toBeTruthy();
      expect(place.cost).toBeTruthy();
      expect(place.fromCenter).toBeTruthy();
      expect(place.cheapestRoute).toBeTruthy();
      expect(place.fallbackRoute).toBeTruthy();
      expect(place.queueRisk).toBeDefined();
      expect(place.closedDayRisk).toBeDefined();
      expect(place.pairing).toBeTruthy();
      expect(place.tags.length).toBeGreaterThan(0);
      expect(place.mapsUrl).toBeDefined();
      expect(place.mapsUrl.startsWith("https://")).toBe(true);
      expect(place.confidence).toBeDefined();
    });
  });

  test("Riviera dei Ciclopi places have correct transit info (AMTS 434, no Borsellino terminal, no 534)", () => {
    const ids = ["aci-castello-trezza", "casa-del-nespolo", "isole-ciclopi"];
    ids.forEach((id) => {
      const place = places.find((p) => p.id === id);
      expect(place).toBeDefined();
      const combined = `${place?.fromCenter} ${place?.cheapestRoute} ${place?.fallbackRoute}`;
      expect(combined.includes("434")).toBe(true);
      expect(combined.includes("534")).toBe(false);
      expect(combined.includes("від Piazza Borsellino") || combined.includes("з Piazza Borsellino")).toBe(false);
    });
  });

  test("Syracuse, Taormina, and Noto specify correct bus transit details", () => {
    const siracusa = places.find((p) => p.id === "siracusa-ortigia");
    expect(siracusa?.cheapestRoute.includes("Interbus")).toBe(true);

    const taormina = places.find((p) => p.id === "taormina-taobuk");
    expect(taormina?.cheapestRoute.includes("Interbus")).toBe(true);
    expect(taormina?.cheapestRoute.includes("Etna Trasporti")).toBe(true);
    expect(taormina?.cheapestRoute.includes("Pirandello")).toBe(true);

    const noto = places.find((p) => p.id === "noto");
    expect(noto?.cheapestRoute.includes("AST")).toBe(true);
    expect(noto?.cheapestRoute.includes("Interbus")).toBe(true);
  });

  test("Mount Etna specifies daily AST bus at 08:15 AM", () => {
    const etna = places.find((p) => p.id === "etna");
    expect(etna?.cheapestRoute.includes("AST")).toBe(true);
    expect(etna?.cheapestRoute.includes("08:15")).toBe(true);
    expect(etna?.cheapestRoute.includes("16:30")).toBe(true);
  });

  test("San Giovanni li Cuti specifies Galatea Metro and Catania Europa train station", () => {
    const cuti = places.find((p) => p.id === "san-giovanni-li-cuti");
    expect(cuti?.cheapestRoute.includes("Galatea")).toBe(true);
    expect(cuti?.fallbackRoute.includes("Catania Europa")).toBe(true);
  });
});
