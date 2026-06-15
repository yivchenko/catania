import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { FilterChips } from "../components/FilterChips";
import { FoodCard } from "../components/FoodCard";
import { foods } from "../data/cataniaGuide";
import { useGuide } from "../hooks/useGuideState";

const foodTags = Array.from(new Set(foods.flatMap((food) => [food.category, ...food.tags]))).sort((a, b) =>
  a.localeCompare(b),
);

export function FoodPage() {
  const { state } = useGuide();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const triedCount = foods.filter((food) => state.foods[food.id]?.tried).length;
  const favoriteCount = foods.filter((food) => state.foods[food.id]?.favorite).length;

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return foods.filter((food) => {
      const haystack = [food.name, food.category, food.summary, food.whereToTry, food.bestTime, ...food.tags]
        .join(" ")
        .toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => food.tags.includes(tag) || food.category === tag);
      return matchesQuery && matchesTags;
    });
  }, [query, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  return (
    <div className="space-y-4">
      <section className="rounded-card bg-ink-900 p-5 text-white shadow-soft dark:bg-black">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-citrus-400">
          <Sparkles aria-hidden="true" size={15} />
          Харчовий чеклист
        </p>
        <h2 className="mt-2 text-3xl font-black">Куштуй Катанію усвідомлено</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-card bg-white/10 p-3">
            <p className="text-2xl font-black">{triedCount}/{foods.length}</p>
            <p className="text-sm text-white/75">Скуштовано</p>
          </div>
          <div className="rounded-card bg-white/10 p-3">
            <p className="text-2xl font-black">{favoriteCount}</p>
            <p className="text-sm text-white/75">Улюблене</p>
          </div>
          <div className="rounded-card bg-white/10 p-3">
            <p className="text-2xl font-black">Червень</p>
            <p className="text-sm text-white/75">Сезон ґраніти</p>
          </div>
        </div>
      </section>

      <section className="sticky top-[69px] z-30 -mx-4 space-y-3 border-y border-ink-200 bg-ink-50/94 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/92 md:top-[82px] md:mx-0 md:rounded-card md:border">
        <label className="relative block">
          <span className="sr-only">Пошук їжі</span>
          <Search
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук їжі, категорії, моменту..."
            className="h-11 w-full rounded-card border border-ink-200 bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
          />
        </label>
        <FilterChips tags={foodTags} selectedTags={selectedTags} onToggle={toggleTag} onClear={() => setSelectedTags([])} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredFoods.map((food) => (
          <FoodCard key={food.id} item={food} />
        ))}
      </div>

      {filteredFoods.length === 0 ? (
        <EmptyState title="Немає збігів" body="Очисти фільтри або пошукай щось простіше — «спека», «дешево», «солодке»." />
      ) : null}
    </div>
  );
}
