import { AlertTriangle, CalendarClock, ExternalLink, Heart, MapPin } from "lucide-react";
import { useGuide } from "../hooks/useGuideState";
import type { EventItem, EventStatus } from "../types/guide";

const statuses: Array<{ value: EventStatus; label: string }> = [
  { value: "none", label: "—" },
  { value: "interested", label: "Цікаво" },
  { value: "going", label: "Іду" },
  { value: "went", label: "Був" },
  { value: "missed", label: "Пропустив" },
];

export function EventCard({ event }: { event: EventItem }) {
  const { state, updateEvent } = useGuide();
  const userState = state.events[event.id] ?? {
    status: "none",
    favorite: false,
    updatedAt: "",
  };

  return (
    <article className="rounded-card border border-ink-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-ink-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lava-600 dark:text-citrus-400">
            <CalendarClock aria-hidden="true" size={15} />
            {event.dateLabel}
          </p>
          <h3 className="mt-2 text-lg font-bold text-ink-900 dark:text-white">{event.name}</h3>
          <p className="mt-1 text-sm font-semibold text-ink-500 dark:text-ink-200">{event.location}</p>
        </div>
        <button
          type="button"
          onClick={() => updateEvent(event.id, { favorite: !userState.favorite })}
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
      <p className="mt-3 text-sm leading-6 text-ink-600 dark:text-ink-200">{event.summary}</p>
      <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-200">
        <span className="font-bold text-ink-900 dark:text-white">Що робити: </span>
        {event.action}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {event.confidence === "needs local check" ? (
          <span className="inline-flex items-center gap-1 rounded-card bg-citrus-100 px-2.5 py-1 text-xs font-bold text-ink-900 dark:bg-citrus-400/12 dark:text-citrus-50">
            <AlertTriangle aria-hidden="true" size={13} />
            Уточни на місці
          </span>
        ) : null}
        {event.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-card border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-600 dark:border-white/10 dark:text-ink-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {statuses.map((status) => {
          const active = userState.status === status.value;
          return (
            <button
              type="button"
              key={status.value}
              onClick={() => updateEvent(event.id, { status: status.value })}
              className={[
                "tap-highlight min-h-11 rounded-card border px-2 text-sm font-bold transition",
                active
                  ? "border-ionian-500 bg-ionian-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:border-ionian-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
              ].join(" ")}
            >
              {status.label}
            </button>
          );
        })}
      </div>
      {event.mapsUrl ? (
        <a
          href={event.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="tap-highlight mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-card border border-ink-200 bg-white px-3 text-sm font-bold text-ink-700 transition hover:border-ionian-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-100"
        >
          <MapPin aria-hidden="true" size={17} />
          Відкрити карту
          <ExternalLink aria-hidden="true" size={14} />
        </a>
      ) : null}
      <label className="mt-3 block">
        <span className="mb-2 block text-sm font-semibold text-ink-600 dark:text-ink-200">Нотатка про подію</span>
        <textarea
          value={userState.note ?? ""}
          onChange={(inputEvent) => updateEvent(event.id, { note: inputEvent.target.value })}
          placeholder="Посилання на програму, статус квитків, деталі майданчика..."
          className="min-h-20 w-full resize-y rounded-card border border-ink-200 bg-white px-3 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-ionian-500 focus:ring-2 focus:ring-ionian-500/20 dark:border-white/10 dark:bg-ink-950 dark:text-white"
        />
      </label>
    </article>
  );
}
