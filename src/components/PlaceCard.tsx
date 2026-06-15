import { AlertTriangle, Heart, MapPin, Navigation, Timer } from "lucide-react";
import { useGuide } from "../hooks/useGuideState";
import type { Place, PlaceStatus } from "../types/guide";
import { PhotoCarousel } from "./PhotoCarousel";
import { RatingControl } from "./RatingControl";

const priorityLabel: Record<Place["priority"], string> = {
  must: "Маст-хев",
  high: "Високий",
  hidden: "Прихований скарб",
  optional: "За бажанням",
  backup: "Запасний",
};

const priorityClass: Record<Place["priority"], string> = {
  must: "bg-lava-500 text-white",
  high: "bg-ionian-600 text-white",
  hidden: "bg-citrus-400 text-ink-900",
  optional: "bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-ink-100",
  backup: "bg-basil-100 text-basil-700 dark:bg-basil-500/15 dark:text-basil-100",
};

const statusOptions: Array<{ value: PlaceStatus; label: string }> = [
  { value: "none", label: "—" },
  { value: "want", label: "Мрію" },
  { value: "visited", label: "Був!" },
  { value: "skipped", label: "Пропустив" },
];

type PlaceCardProps = {
  place: Place;
};

export function PlaceCard({ place }: PlaceCardProps) {
  const { state, updatePlace } = useGuide();
  const userState = state.places[place.id] ?? {
    status: "none",
    favorite: false,
    updatedAt: "",
  };

  return (
    <article className="overflow-hidden rounded-card border border-ink-200 bg-white shadow-soft dark:border-white/10 dark:bg-ink-900">
      <div className="relative aspect-[16/9] min-h-[210px] bg-ink-200 dark:bg-ink-700">
        <PhotoCarousel images={place.images} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 via-ink-900/50 to-transparent p-4 text-white">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`rounded-card px-2 py-0.5 text-[10px] font-bold ${priorityClass[place.priority]}`}>
              {priorityLabel[place.priority]}
            </span>
            <span className="rounded-card bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
              {place.category}
            </span>
          </div>
          <h2 className="text-[17px] font-bold leading-tight [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]">{place.name}</h2>
          <p className="text-xs font-medium text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.4)]">{place.area}</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-sm leading-6 text-ink-600 dark:text-ink-200">{place.summary}</p>

        {place.confidence === "needs local check" ? (
          <p className="flex items-center gap-2 rounded-card bg-citrus-100 px-3 py-2 text-sm font-semibold text-ink-900 dark:bg-citrus-400/12 dark:text-citrus-50">
            <AlertTriangle aria-hidden="true" size={16} className="shrink-0" />
            Краще перевірити на місці
          </p>
        ) : null}

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex min-h-12 items-center gap-2 rounded-card bg-ink-50 px-3 dark:bg-white/6">
            <Timer aria-hidden="true" size={17} className="shrink-0 text-lava-600 dark:text-citrus-400" />
            <span className="min-w-0">
              <strong className="block text-ink-900 dark:text-white">{place.duration}</strong>
              <span className="text-ink-500 dark:text-ink-200">{place.bestTime}</span>
            </span>
          </div>
          <div className="flex min-h-12 items-center gap-2 rounded-card bg-ink-50 px-3 dark:bg-white/6">
            <Navigation aria-hidden="true" size={17} className="shrink-0 text-ionian-600 dark:text-ionian-100" />
            <span className="min-w-0">
              <strong className="block text-ink-900 dark:text-white">{place.fromCenter}</strong>
              <span className="text-ink-500 dark:text-ink-200">{place.cost}</span>
            </span>
          </div>
        </div>

        <div className="space-y-2 border-y border-ink-200 py-3 text-sm dark:border-white/10">
          <p>
            <span className="font-bold text-ink-900 dark:text-white">Чому варто: </span>
            <span className="text-ink-600 dark:text-ink-200">{place.whyGo}</span>
          </p>
          <p>
            <span className="font-bold text-ink-900 dark:text-white">Як дістатися дешево: </span>
            <span className="text-ink-600 dark:text-ink-200">{place.cheapestRoute}</span>
          </p>
          <p>
            <span className="font-bold text-ink-900 dark:text-white">Що ще зачепити: </span>
            <span className="text-ink-600 dark:text-ink-200">{place.pairing}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {place.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-card border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-600 dark:border-white/10 dark:text-ink-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={`Статус: ${place.name}`}>
          {statusOptions.map((option) => {
            const active = userState.status === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => updatePlace(place.id, { status: option.value })}
                className={[
                  "tap-highlight min-h-11 rounded-card border px-2 text-sm font-bold transition",
                  active
                    ? option.value === "visited"
                      ? "border-basil-500 bg-basil-500 text-white"
                      : option.value === "want"
                        ? "border-citrus-400 bg-citrus-100 text-ink-900"
                        : option.value === "skipped"
                          ? "border-ink-500 bg-ink-700 text-white"
                          : "border-ink-300 bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ionian-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
                ].join(" ")}
                aria-checked={active}
                role="radio"
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updatePlace(place.id, { favorite: !userState.favorite })}
            className={[
              "tap-highlight inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-card border px-3 text-sm font-bold transition",
              userState.favorite
                ? "border-lava-500 bg-lava-50 text-lava-700 dark:bg-lava-500/15 dark:text-lava-50"
                : "border-ink-200 bg-white text-ink-600 hover:border-lava-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
            ].join(" ")}
          >
            <Heart aria-hidden="true" size={17} fill={userState.favorite ? "currentColor" : "none"} />
            Улюблене
          </button>
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="tap-highlight inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-card bg-ionian-600 px-3 text-sm font-bold text-white transition hover:bg-ionian-700"
          >
            <MapPin aria-hidden="true" size={17} />
            Відкрити на карті
          </a>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-semibold text-ink-600 dark:text-ink-200">Мої позначки</span>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "seen" as const, label: "Побачив", icon: "👀" },
              { key: "eaten" as const, label: "Спробував", icon: "🍝" },
              { key: "swum" as const, label: "Купався", icon: "🌊" },
              { key: "sunset" as const, label: "Зловив захід", icon: "🌅" },
              { key: "revisit" as const, label: "Хочу ще раз", icon: "🔁" },
            ].map((item) => {
              const active = Boolean(userState[item.key]);
              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => updatePlace(place.id, { [item.key]: !active })}
                  className={[
                    "tap-highlight inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition",
                    active
                      ? "border-ionian-500 bg-ionian-50 text-ionian-700 dark:bg-ionian-500/15 dark:text-ionian-100"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ionian-400 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
                  ].join(" ")}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <RatingControl
          value={userState.rating}
          label="Твоя оцінка"
          onChange={(rating) => updatePlace(place.id, { rating })}
        />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink-600 dark:text-ink-200">Нотатка собі</span>
          <textarea
            value={userState.note ?? ""}
            onChange={(event) => updatePlace(place.id, { note: event.target.value })}
            placeholder="Що запам’яталося, що пропустити наступного разу, де поїсти..."
            className="min-h-24 w-full resize-y rounded-card border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
          />
        </label>
      </div>
    </article>
  );
}
