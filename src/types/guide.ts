export type PlaceStatus = "none" | "want" | "visited" | "skipped";
export type EventStatus = "none" | "interested" | "going" | "went" | "missed";
export type ThemeMode = "system" | "light" | "dark";

export interface PlaceUserState {
  status: PlaceStatus;
  favorite: boolean;
  note?: string;
  rating?: number;
  updatedAt: string;
  seen?: boolean;
  eaten?: boolean;
  swum?: boolean;
  sunset?: boolean;
  revisit?: boolean;
}

export interface FoodUserState {
  tried: boolean;
  favorite: boolean;
  rating?: number;
  note?: string;
  whereTried?: string;
  updatedAt: string;
}

export interface EventUserState {
  status: EventStatus;
  favorite: boolean;
  note?: string;
  updatedAt: string;
}

export interface AppState {
  version: 2;
  places: Record<string, PlaceUserState>;
  foods: Record<string, FoodUserState>;
  events: Record<string, EventUserState>;
  settings: {
    theme: ThemeMode;
  };
  lastUpdatedAt: string;
}

export type PlaceCategory =
  | "Історичне ядро"
  | "Прихований скарб"
  | "Узбережжя"
  | "Поїздка на день"
  | "Музей"
  | "Вулиця їжі"
  | "Оглядовий майданчик";

export type Priority = "must" | "high" | "hidden" | "optional" | "backup";
export type Confidence = "verified official" | "traditional recurring" | "needs local check";
export type TimeOfDay = "Ранок" | "День" | "Вечір";

export interface GuideImage {
  url: string;
  alt: string;
  credit: string;
  sourceUrl: string;
}

export interface Place {
  id: string;
  name: string;
  area: string;
  category: PlaceCategory;
  priority: Priority;
  summary: string;
  whyGo: string;
  bestTime: string;
  duration: string;
  cost: string;
  fromCenter: string;
  cheapestRoute: string;
  fallbackRoute: string;
  queueRisk: string;
  closedDayRisk: string;
  pairing: string;
  tags: string[];
  distanceScore: number;
  mapsUrl: string;
  images: GuideImage[];
  confidence: Confidence;
}

export interface FoodItem {
  id: string;
  name: string;
  category: "Вулична їжа" | "Солодке" | "Класична страва" | "Напій" | "Морепродукти";
  summary: string;
  whereToTry: string;
  bestTime: string;
  tags: string[];
}

export interface EventItem {
  id: string;
  name: string;
  dateLabel: string;
  location: string;
  summary: string;
  action: string;
  confidence: Confidence;
  tags: string[];
  mapsUrl?: string;
}


