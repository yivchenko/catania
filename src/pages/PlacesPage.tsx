import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { FilterChips } from "../components/FilterChips";
import { PlaceCard } from "../components/PlaceCard";
import { places } from "../data/cataniaGuide";

const priorityWeight = {
  must: 0,
  hidden: 1,
  high: 2,
  optional: 3,
  backup: 4,
};

const allTags = Array.from(new Set(places.flatMap((place) => place.tags))).sort((a, b) => a.localeCompare(b));

type SortMode = "priority" | "distance" | "time";

export function PlacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = searchParams.get("id");
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [onlyHighlights, setOnlyHighlights] = useState(true);

  const filteredPlaces = useMemo(() => {
    if (targetId) {
      return places.filter((place) => place.id === targetId);
    }
    const normalizedQuery = query.trim().toLowerCase();
    return places
      .filter((place) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [place.name, place.area, place.category, place.summary, place.cheapestRoute, ...place.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every((tag) => place.tags.includes(tag) || place.category === tag);
        const matchesHighlights = !onlyHighlights || place.priority === "must" || place.priority === "high";
        return matchesQuery && matchesTags && matchesHighlights;
      })
      .sort((a, b) => {
        if (sortMode === "distance") return a.distanceScore - b.distanceScore;
        if (sortMode === "time") return a.bestTime.localeCompare(b.bestTime);
        return priorityWeight[a.priority] - priorityWeight[b.priority] || a.distanceScore - b.distanceScore;
      });
  }, [query, selectedTags, sortMode, targetId, onlyHighlights]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-lava-600 dark:text-citrus-400">Огляд</p>
          <h2 className="mt-1 text-3xl font-black text-ink-900 dark:text-white">Місця</h2>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-ink-600 dark:text-ink-200">
          Пішки по центру, море на автобусі, день потягом. Бери ідеї та плануй під себе.
        </p>
      </section>

      <section className="sticky top-[69px] z-30 -mx-4 space-y-3 border-y border-ink-200 bg-ink-50/94 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/92 md:top-[82px] md:mx-0 md:rounded-card md:border">
        <div className="grid gap-2 sm:grid-cols-[1fr_190px]">
          <label className="relative block">
            <span className="sr-only">Пошук місць</span>
            <Search
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Шукай за назвою, районом або настроєм..."
              className="h-11 w-full rounded-card border border-ink-200 bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="sr-only">Сортувати місця</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="h-11 w-full rounded-card border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 outline-none transition focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
            >
              <option value="priority">Спочатку must-see</option>
              <option value="distance">Ближче до центру</option>
              <option value="time">Кращий час для візиту</option>
            </select>
          </label>
        </div>
        <FilterChips tags={allTags} selectedTags={selectedTags} onToggle={toggleTag} onClear={() => setSelectedTags([])} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-3 dark:border-white/10">
          <button
            type="button"
            role="switch"
            aria-checked={onlyHighlights}
            onClick={() => setOnlyHighlights(!onlyHighlights)}
            className="tap-highlight flex items-center gap-2 text-xs font-bold text-ink-700 dark:text-ink-200 outline-none"
          >
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                onlyHighlights ? "bg-ionian-600" : "bg-ink-300 dark:bg-ink-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  onlyHighlights ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
            <span>Тільки must-see та топові місця</span>
          </button>
          <span className="text-[11px] font-semibold text-ink-500 dark:text-ink-400">
            {filteredPlaces.length} з {places.length}
          </span>
        </div>
      </section>

      {targetId && filteredPlaces.length > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-card border border-ionian-200 bg-ionian-50 p-4 text-ionian-700 dark:border-ionian-500/30 dark:bg-ionian-500/15 dark:text-ionian-100">
          <p className="text-sm font-semibold">
            Рекомендація з твого маршруту: <strong className="font-bold">{filteredPlaces[0].name}</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              searchParams.delete("id");
              setSearchParams(searchParams);
            }}
            className="tap-highlight inline-flex h-9 items-center gap-1.5 rounded-card bg-white px-3 text-xs font-black text-ink-700 shadow-sm transition hover:bg-ionian-100 dark:bg-ink-950 dark:text-ink-200 dark:hover:bg-white/6"
          >
            <X size={14} />
            Усі місця
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      {filteredPlaces.length === 0 ? (
        <EmptyState title="Нічого не знайшлося" body="Спробуй зняти фільтри або пошукати простіше — «море», «центр» чи «спека»." />
      ) : null}
    </div>
  );
}
