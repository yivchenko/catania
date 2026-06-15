import { ArrowRight, Info, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { places } from "../data/cataniaGuide";
import { useGuide } from "../hooks/useGuideState";

function MetricTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500 dark:text-ink-200">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-ink-600 dark:text-ink-200">{detail}</p>
    </div>
  );
}

export function HomePage() {
  const { state } = useGuide();
  const visitedPlaces = places.filter((place) => state.places[place.id]?.status === "visited").length;
  const wantedPlaces = places.filter((place) => state.places[place.id]?.status === "want").length;
  const favoriteCount = Object.values(state.places).filter((place) => place.favorite).length;

  const mustPlaces = places.filter((place) => place.priority === "must").slice(0, 6);

  return (
    <div className="space-y-5">
      <section className="relative min-h-[390px] overflow-hidden rounded-card bg-ink-900 text-white shadow-soft">
        <img
          src={places[0].images[0].url}
          alt={places[0].images[0].alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/45 to-ink-900/95" />
        <div className="relative flex min-h-[390px] flex-col justify-end p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-card bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">14–22 червня</span>
            <span className="rounded-card bg-citrus-400 px-3 py-1 text-xs font-bold text-ink-900">Живемо в Катанії</span>
            <span className="rounded-card bg-ionian-500 px-3 py-1 text-xs font-bold text-white">Автобусом + потягом</span>
          </div>
          <h2 className="max-w-2xl text-4xl font-black leading-none sm:text-5xl [text-shadow:0_2px_16px_rgb(0_0_0/0.45)]">
            Готовий до Катанії?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0/0.5)]">
            Старе місто пішки, Таорміна з Таобуком, море на автобусі, Сиракузи потягом. Етна — тільки якщо погода дозволить і ти готовий до пригоди.
          </p>
          <div className="mt-5">
            <Link
              to="/places"
              className="tap-highlight inline-flex h-12 w-full items-center justify-center gap-2 rounded-card bg-white px-6 text-sm font-bold text-ink-900 transition hover:bg-citrus-100 sm:w-auto"
            >
              <MapPin aria-hidden="true" size={17} />
              Показати всі місця
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricTile label="Відвідано" value={`${visitedPlaces}/${places.length}`} detail={`${wantedPlaces} ще «хочу»`} />
        <MetricTile label="Улюблене" value={`${favoriteCount}`} detail="Те, що запам’ятається" />
        <MetricTile label="Хочу туди" value={`${wantedPlaces}`} detail="У планах" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-lava-600 dark:text-citrus-400">Обов’язково</p>
            <h2 className="mt-1 text-2xl font-black text-ink-900 dark:text-white">Місця, які не можна пропустити</h2>
          </div>
          <Link to="/places" className="text-sm font-bold text-ionian-700 dark:text-ionian-100">
            Усі місця →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mustPlaces.map((place) => (
            <Link
              key={place.id}
              to="/places"
              className="tap-highlight group block overflow-hidden rounded-card border border-ink-200 bg-white shadow-soft transition active:scale-[0.985] dark:border-white/10 dark:bg-ink-900"
            >
              <div className="relative aspect-[16/9]">
                <img src={place.images[0].url} alt={place.images[0].alt} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50" />
                <div className="absolute bottom-0 p-3 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">{place.category}</div>
                  <div className="text-lg font-black leading-tight">{place.name}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-ink-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-ink-900">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lava-600 dark:text-citrus-400">
          <Info size={15} /> Як пересуватися
        </div>
        <div className="mt-2 text-xl font-black">Квитки та лайфхаки</div>
        <ul className="mt-3 space-y-2 text-sm text-ink-600 dark:text-ink-200 list-disc list-inside">
          <li>AMTS 90 хв або метро 120 хв — 1,40 €</li>
          <li>Метро разова — 1 €</li>
          <li>MetroBus 120 хв — 2 € (автобус + метро)</li>
          <li>Лінія 434 — найзручніший варіант до Aci Castello / Aci Trezza</li>
          <li>На Таорміну, Сиракузи, Ното — Interbus / AST</li>
        </ul>
        <Link to="/places" className="mt-5 inline-flex h-11 items-center gap-2 text-sm font-bold text-ionian-700 dark:text-ionian-300">
          Дивитися всі місця <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
