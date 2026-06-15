import { describe, test, expect } from "vitest";
import { validateAppState } from "../hooks/useGuideState";
import { defaultState } from "../data/cataniaGuide";

describe("Guide State Management & Migration", () => {
  test("validateAppState handles invalid or empty inputs by returning default state", () => {
    const fallback = defaultState();
    
    // Test null/undefined/non-object input
    const resNull = validateAppState(null);
    expect(resNull.valid).toBe(false);
    expect(resNull.value.version).toBe(2);
    expect(resNull.value.places).toEqual({});

    // Test invalid version numbers
    const resBadVersion = validateAppState({ version: 99, places: {} });
    expect(resBadVersion.valid).toBe(false);
    expect(resBadVersion.value.version).toBe(2);
  });

  test("validateAppState successfully validates a correct version 2 state", () => {
    const validV2Input = {
      version: 2,
      places: {
        "duomo-pescheria": {
          status: "visited",
          favorite: true,
          note: "Good food!",
          rating: 4,
          updatedAt: "2026-06-14T12:00:00.000Z",
          seen: true,
          eaten: true,
          swum: false,
          sunset: true,
          revisit: true
        }
      },
      foods: {},
      events: {},
      settings: {
        theme: "dark"
      },
      lastUpdatedAt: "2026-06-14T12:00:00.000Z"
    };

    const res = validateAppState(validV2Input);
    expect(res.valid).toBe(true);
    expect(res.value.version).toBe(2);
    expect(res.value.settings.theme).toBe("dark");
    expect(res.value.places["duomo-pescheria"]).toBeDefined();
    
    const place = res.value.places["duomo-pescheria"];
    expect(place.status).toBe("visited");
    expect(place.favorite).toBe(true);
    expect(place.note).toBe("Good food!");
    expect(place.rating).toBe(4);
    expect(place.seen).toBe(true);
    expect(place.eaten).toBe(true);
    expect(place.swum).toBe(false);
    expect(place.sunset).toBe(true);
    expect(place.revisit).toBe(true);
  });

  test("validateAppState automatically migrates version 1 state to version 2", () => {
    // Version 1 state lacks 'seen', 'eaten', 'swum', 'sunset', 'revisit'
    const validV1Input = {
      version: 1,
      places: {
        "duomo-pescheria": {
          status: "visited",
          favorite: true,
          note: "Awesome market",
          rating: 5,
          updatedAt: "2026-06-14T12:00:00.000Z"
        }
      },
      foods: {
        "arancino": {
          tried: true,
          favorite: true,
          note: "Yummy!",
          updatedAt: "2026-06-14T12:00:00.000Z"
        }
      },
      events: {},
      settings: {
        theme: "light"
      },
      lastUpdatedAt: "2026-06-14T12:00:00.000Z"
    };

    const res = validateAppState(validV1Input);
    expect(res.valid).toBe(true);
    
    // Upgraded to version 2
    expect(res.value.version).toBe(2);
    expect(res.value.settings.theme).toBe("light");
    
    // Check that place state got successfully migrated and missing version 2 checklist fields default to false
    const place = res.value.places["duomo-pescheria"];
    expect(place).toBeDefined();
    expect(place.status).toBe("visited");
    expect(place.favorite).toBe(true);
    expect(place.note).toBe("Awesome market");
    expect(place.rating).toBe(5);
    
    // Migrated checklist fields!
    expect(place.seen).toBe(false);
    expect(place.eaten).toBe(false);
    expect(place.swum).toBe(false);
    expect(place.sunset).toBe(false);
    expect(place.revisit).toBe(false);

    // Food tried state preserved
    expect(res.value.foods["arancino"]).toBeDefined();
    expect(res.value.foods["arancino"].tried).toBe(true);
  });

  test("validateAppState sanitizes corrupted/incorrect place user states gracefully", () => {
    const corruptedInput = {
      version: 2,
      places: {
        // status is invalid
        "bad-status": {
          status: "super-visited",
          favorite: true,
        },
        // valid place
        "good-place": {
          status: "want",
          favorite: "yes", // should convert to boolean true
          note: 12345, // invalid note, should default to undefined
          rating: 10, // rating exceeds 5, should cap at 5
          seen: 1, // should convert to boolean true
          swum: null, // should convert to boolean false
        }
      },
      foods: {},
      events: {},
      settings: {
        theme: "system"
      }
    };

    const res = validateAppState(corruptedInput);
    expect(res.valid).toBe(true);
    
    // "bad-status" should be removed by sanitizeRecord because status is invalid
    expect(res.value.places["bad-status"]).toBeUndefined();

    // "good-place" should be sanitized correctly
    const good = res.value.places["good-place"];
    expect(good).toBeDefined();
    expect(good.status).toBe("want");
    expect(good.favorite).toBe(true);
    expect(good.note).toBeUndefined();
    expect(good.rating).toBe(5); // Capped at 5
    expect(good.seen).toBe(true);
    expect(good.swum).toBe(false);
    expect(good.revisit).toBe(false); // default false
  });
});
