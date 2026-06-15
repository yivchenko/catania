import { Heart, MapPin, Utensils } from "lucide-react";
import { useGuide } from "../hooks/useGuideState";
import type { FoodItem } from "../types/guide";
import { RatingControl } from "./RatingControl";

type FoodCardProps = {
  item: FoodItem;
};

export function FoodCard({ item }: FoodCardProps) {
  const { state, updateFood } = useGuide();
  const userState = state.foods[item.id] ?? {
    tried: false,
    favorite: false,
    updatedAt: "",
  };

  return (
    <article className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => updateFood(item.id, { tried: !userState.tried })}
          className={[
            "tap-highlight mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-card border transition",
            userState.tried
              ? "border-basil-500 bg-basil-500 text-white"
              : "border-ink-200 bg-ink-50 text-ink-500 hover:border-basil-500 dark:border-white/10 dark:bg-white/6 dark:text-ink-200",
          ].join(" ")}
          title={userState.tried ? "Скуштовано" : "Позначити «скуштовано»"}
        >
          <Utensils aria-hidden="true" size={20} />
          <span className="sr-only">Позначити «скуштовано»</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ionian-600 dark:text-ionian-100">
                {item.category}
              </p>
              <h2 className="mt-1 text-lg font-bold leading-tight text-ink-900 dark:text-white">{item.name}</h2>
            </div>
            <button
              type="button"
              onClick={() => updateFood(item.id, { favorite: !userState.favorite })}
              className={[
                "tap-highlight inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-card border transition",
                userState.favorite
                  ? "border-lava-500 bg-lava-50 text-lava-700 dark:bg-lava-500/15 dark:text-lava-50"
                  : "border-ink-200 bg-white text-ink-500 hover:border-lava-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
              ].join(" ")}
              title={userState.favorite ? "Улюблене" : "Додати в улюблене"}
            >
              <Heart aria-hidden="true" size={19} fill={userState.favorite ? "currentColor" : "none"} />
              <span className="sr-only">Додати в улюблене</span>
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-200">{item.summary}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-card bg-ink-50 px-3 py-2 dark:bg-white/6">
            <span className="font-bold text-ink-900 dark:text-white">Де: </span>
            <span className="text-ink-600 dark:text-ink-200">{item.whereToTry}</span>
          </div>
          <div className="rounded-card bg-ink-50 px-3 py-2 dark:bg-white/6">
            <span className="font-bold text-ink-900 dark:text-white">Коли: </span>
            <span className="text-ink-600 dark:text-ink-200">{item.bestTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-card border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-600 dark:border-white/10 dark:text-ink-200"
            >
              {tag}
            </span>
          ))}
        </div>

        <RatingControl value={userState.rating} label="Оцінка смаку" onChange={(rating) => updateFood(item.id, { rating })} />

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-600 dark:text-ink-200">
            <MapPin aria-hidden="true" size={15} />
            Де куштував
          </span>
          <input
            value={userState.whereTried ?? ""}
            onChange={(event) => updateFood(item.id, { whereTried: event.target.value })}
            placeholder="Бар, ятка на ринку, місто, ресторан..."
            className="h-11 w-full rounded-card border border-ink-200 bg-white px-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink-600 dark:text-ink-200">Нотатка</span>
          <textarea
            value={userState.note ?? ""}
            onChange={(event) => updateFood(item.id, { note: event.target.value })}
            placeholder="Текстура, ціна, адреса, чи варто повторити..."
            className="min-h-20 w-full resize-y rounded-card border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
          />
        </label>
      </div>
    </article>
  );
}
