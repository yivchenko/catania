import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultState, STORAGE_KEY } from "../data/cataniaGuide";
import type {
  AppState,
  EventStatus,
  EventUserState,
  FoodUserState,
  PlaceStatus,
  PlaceUserState,
  ThemeMode,
} from "../types/guide";
import { useLocalStorage } from "./useLocalStorage";

type GuideContextValue = {
  state: AppState;
  storageError: string | null;
  resolvedTheme: "light" | "dark";
  updatePlace: (placeId: string, patch: Partial<Omit<PlaceUserState, "updatedAt">>) => void;
  updateFood: (foodId: string, patch: Partial<Omit<FoodUserState, "updatedAt">>) => void;
  updateEvent: (eventId: string, patch: Partial<Omit<EventUserState, "updatedAt">>) => void;
  setTheme: (theme: ThemeMode) => void;
  importState: (value: unknown) => { ok: true } | { ok: false; error: string };
  resetState: () => void;
};

const GuideContext = createContext<GuideContextValue | null>(null);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTheme = (value: unknown): value is ThemeMode =>
  value === "system" || value === "light" || value === "dark";

const sanitizePlace = (value: unknown): PlaceUserState | null => {
  if (!isRecord(value)) return null;
  const status = value.status;
  if (status !== "none" && status !== "want" && status !== "visited" && status !== "skipped") return null;

  return {
    status,
    favorite: Boolean(value.favorite),
    note: typeof value.note === "string" ? value.note : undefined,
    rating: typeof value.rating === "number" ? Math.min(5, Math.max(1, value.rating)) : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
    seen: Boolean(value.seen),
    eaten: Boolean(value.eaten),
    swum: Boolean(value.swum),
    sunset: Boolean(value.sunset),
    revisit: Boolean(value.revisit),
  };
};

const sanitizeFood = (value: unknown): FoodUserState | null => {
  if (!isRecord(value)) return null;
  return {
    tried: Boolean(value.tried),
    favorite: Boolean(value.favorite),
    rating: typeof value.rating === "number" ? Math.min(5, Math.max(1, value.rating)) : undefined,
    note: typeof value.note === "string" ? value.note : undefined,
    whereTried: typeof value.whereTried === "string" ? value.whereTried : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
};

const sanitizeEvent = (value: unknown): EventUserState | null => {
  if (!isRecord(value)) return null;
  const status = value.status;
  if (
    status !== "none" &&
    status !== "interested" &&
    status !== "going" &&
    status !== "went" &&
    status !== "missed"
  ) {
    return null;
  }

  return {
    status,
    favorite: Boolean(value.favorite),
    note: typeof value.note === "string" ? value.note : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString(),
  };
};

const sanitizeRecord = <T,>(value: unknown, sanitize: (item: unknown) => T | null): Record<string, T> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, sanitize(item)] as const)
      .filter((entry): entry is readonly [string, T] => entry[1] !== null),
  );
};

export const validateAppState = (value: unknown): { valid: boolean; value: AppState } => {
  const fallback = defaultState();
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
    return { valid: false, value: fallback };
  }

  const theme = isRecord(value.settings) && isTheme(value.settings.theme) ? value.settings.theme : fallback.settings.theme;

  return {
    valid: true,
    value: {
      version: 2,
      places: sanitizeRecord(value.places, sanitizePlace),
      foods: sanitizeRecord(value.foods, sanitizeFood),
      events: sanitizeRecord(value.events, sanitizeEvent),
      settings: {
        theme,
      },
      lastUpdatedAt: typeof value.lastUpdatedAt === "string" ? value.lastUpdatedAt : new Date().toISOString(),
    },
  };
};

const emptyPlace = (): PlaceUserState => ({
  status: "none",
  favorite: false,
  updatedAt: new Date().toISOString(),
  seen: false,
  eaten: false,
  swum: false,
  sunset: false,
  revisit: false,
});

const emptyFood = (): FoodUserState => ({
  tried: false,
  favorite: false,
  updatedAt: new Date().toISOString(),
});

const emptyEvent = (): EventUserState => ({
  status: "none",
  favorite: false,
  updatedAt: new Date().toISOString(),
});

const resolveTheme = (theme: ThemeMode) => {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export function GuideProvider({ children }: { children: ReactNode }) {
  const fallback = useMemo(() => defaultState(), []);
  const { value: state, setValue: setState, storageError } = useLocalStorage(STORAGE_KEY, fallback, validateAppState);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => resolveTheme(fallback.settings.theme));

  useEffect(() => {
    const applyTheme = () => {
      const resolved = resolveTheme(state.settings.theme);
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.style.colorScheme = resolved;
    };

    applyTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [state.settings.theme]);

  const withTimestamp = useCallback(
    (producer: (current: AppState, updatedAt: string) => AppState) => {
      setState((current) => {
        const updatedAt = new Date().toISOString();
        return {
          ...producer(current, updatedAt),
          lastUpdatedAt: updatedAt,
        };
      });
    },
    [setState],
  );

  const updatePlace = useCallback(
    (placeId: string, patch: Partial<Omit<PlaceUserState, "updatedAt">>) => {
      withTimestamp((current, updatedAt) => ({
        ...current,
        places: {
          ...current.places,
          [placeId]: {
            ...emptyPlace(),
            ...current.places[placeId],
            ...patch,
            updatedAt,
          },
        },
      }));
    },
    [withTimestamp],
  );

  const updateFood = useCallback(
    (foodId: string, patch: Partial<Omit<FoodUserState, "updatedAt">>) => {
      withTimestamp((current, updatedAt) => ({
        ...current,
        foods: {
          ...current.foods,
          [foodId]: {
            ...emptyFood(),
            ...current.foods[foodId],
            ...patch,
            updatedAt,
          },
        },
      }));
    },
    [withTimestamp],
  );

  const updateEvent = useCallback(
    (eventId: string, patch: Partial<Omit<EventUserState, "updatedAt">>) => {
      withTimestamp((current, updatedAt) => ({
        ...current,
        events: {
          ...current.events,
          [eventId]: {
            ...emptyEvent(),
            ...current.events[eventId],
            ...patch,
            updatedAt,
          },
        },
      }));
    },
    [withTimestamp],
  );

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      withTimestamp((current) => ({
        ...current,
        settings: {
          ...current.settings,
          theme,
        },
      }));
    },
    [withTimestamp],
  );

  const importState = useCallback(
    (value: unknown): { ok: true } | { ok: false; error: string } => {
      const result = validateAppState(value);
      if (!result.valid) {
        return { ok: false, error: "Це не схоже на коректний експорт Catania Guide (v1)." };
      }
      setState({
        ...result.value,
        lastUpdatedAt: new Date().toISOString(),
      });
      return { ok: true };
    },
    [setState],
  );

  const resetState = useCallback(() => {
    setState(defaultState());
  }, [setState]);

  const value = useMemo<GuideContextValue>(
    () => ({
      state,
      storageError,
      resolvedTheme,
      updatePlace,
      updateFood,
      updateEvent,
      setTheme,
      importState,
      resetState,
    }),
    [
      importState,
      resetState,
      resolvedTheme,
      setTheme,
      state,
      storageError,
      updateEvent,
      updateFood,
      updatePlace,
    ],
  );

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error("useGuide must be used within GuideProvider");
  }
  return context;
};

export const getPlaceStatusLabel = (status: PlaceStatus) => {
  switch (status) {
    case "want":
      return "Хочу";
    case "visited":
      return "Відвідано";
    case "skipped":
      return "Пропущено";
    default:
      return "—";
  }
};

export const getEventStatusLabel = (status: EventStatus) => {
  switch (status) {
    case "interested":
      return "Цікаво";
    case "going":
      return "Іду";
    case "went":
      return "Був";
    case "missed":
      return "Пропустив";
    default:
      return "—";
  }
};
