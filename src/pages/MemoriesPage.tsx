import { Heart } from "lucide-react";
import { useMemo } from "react";
import { foods, places } from "../data/cataniaGuide";
import { useGuide } from "../hooks/useGuideState";

export function MemoriesPage() {
  const { state } = useGuide();

  const visitedPlaces = useMemo(
    () => places.filter((place) => state.places[place.id]?.status === "visited"),
    [state.places],
  );
  const favoritePlaces = useMemo(
    () => places.filter((place) => state.places[place.id]?.favorite),
    [state.places],
  );
  const notes = useMemo(() => {
    return places
      .map((place) => ({ name: place.name, note: state.places[place.id]?.note, image: place.images[0] }))
      .filter((item) => item.note?.trim());
  }, [state.places]);

  const favoriteFoods = useMemo(
    () => foods.filter((food) => state.foods[food.id]?.favorite),
    [state.foods],
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-lava-600 dark:text-citrus-400">Твоя поїздка</p>
        <h2 className="mt-1 text-3xl font-black text-ink-900 dark:text-white">Мій список</h2>
        <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-200">
          Твої відмітки, улюблене та нотатки — щоб згадати, як було круто.
        </p>
      </section>

      {/* Прості лічильники */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Відвідано</p>
          <p className="mt-1 text-4xl font-black text-ink-900 dark:text-white">{visitedPlaces.length}</p>
        </div>
        <div className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Улюблене</p>
          <p className="mt-1 text-4xl font-black text-ink-900 dark:text-white">
            {favoritePlaces.length + favoriteFoods.length}
          </p>
        </div>
        <div className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900 sm:col-span-1 col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">Нотатки</p>
          <p className="mt-1 text-4xl font-black text-ink-900 dark:text-white">{notes.length}</p>
        </div>
      </div>

      {/* Відвідано з фото */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink-900 dark:text-white">
          <Heart className="text-lava-600 dark:text-citrus-400" size={20} /> Відвідано
        </h3>
        {visitedPlaces.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {visitedPlaces.map((place) => (
              <div
                key={place.id}
                className="flex gap-3 rounded-card border border-ink-200 bg-white p-3 shadow-soft dark:border-white/10 dark:bg-ink-900"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-card bg-ink-200 dark:bg-ink-700">
                  <img
                    src={place.images[0].url}
                    alt={place.images[0].alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="font-bold leading-tight text-ink-900 dark:text-white">{place.name}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-200">{place.area}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-ink-200 bg-ink-50 p-4 text-sm text-ink-600 dark:border-white/10 dark:bg-white/6 dark:text-ink-200">
            Поки нічого не відмічено. Повертайся після прогулянок і додавай спогади.
          </p>
        )}
      </section>

      {/* Улюблене */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink-900 dark:text-white">
          <Heart className="text-lava-600 dark:text-citrus-400" size={20} /> Улюблене
        </h3>
        {favoritePlaces.length + favoriteFoods.length > 0 ? (
          <div className="space-y-2">
            {favoritePlaces.map((place) => (
              <div key={place.id} className="flex items-center gap-3 rounded-card border border-ink-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-900">
                <div className="h-10 w-10 overflow-hidden rounded-card bg-ink-200 dark:bg-ink-700">
                  <img src={place.images[0].url} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{place.name}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-200">Місце</p>
                </div>
              </div>
            ))}
            {favoriteFoods.map((food) => (
              <div key={food.id} className="flex items-center gap-3 rounded-card border border-ink-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-ink-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-card bg-citrus-100 text-xl dark:bg-citrus-400/20">🍽️</div>
                <div>
                  <p className="font-semibold text-ink-900 dark:text-white">{food.name}</p>
                  <p className="text-xs text-ink-500 dark:text-ink-200">Їжа</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-ink-200 bg-ink-50 p-4 text-sm text-ink-600 dark:border-white/10 dark:bg-white/6 dark:text-ink-200">
            Додай сердечко до місць і страв, які найбільше сподобались.
          </p>
        )}
      </section>

      {/* Нотатки */}
      <section>
        <h3 className="mb-3 text-lg font-black text-ink-900 dark:text-white">Нотатки</h3>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note, idx) => (
              <div key={idx} className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900">
                <p className="font-bold text-ink-900 dark:text-white">{note.name}</p>
                <p className="mt-1 text-sm leading-6 text-ink-600 dark:text-ink-200">{note.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-ink-200 bg-ink-50 p-4 text-sm text-ink-600 dark:border-white/10 dark:bg-white/6 dark:text-ink-200">
            Додавай короткі нотатки на картках — вони збережуться тут.
          </p>
        )}
      </section>
    </div>
  );
}
