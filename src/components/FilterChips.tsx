import { SlidersHorizontal, X } from "lucide-react";

type FilterChipsProps = {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
};

export function FilterChips({ tags, selectedTags, onToggle, onClear }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" aria-label="Filters">
      <button
        type="button"
        onClick={onClear}
        className={[
          "tap-highlight inline-flex h-11 shrink-0 items-center gap-2 rounded-card border px-3 text-sm font-semibold transition",
          selectedTags.length === 0
            ? "border-lava-500 bg-lava-50 text-lava-700 dark:border-citrus-400 dark:bg-citrus-400/12 dark:text-citrus-400"
            : "border-ink-200 bg-white text-ink-600 hover:border-ionian-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
        ].join(" ")}
      >
        <SlidersHorizontal aria-hidden="true" size={16} />
        Усі
      </button>
      {selectedTags.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="tap-highlight inline-flex h-11 shrink-0 items-center gap-2 rounded-card border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-600 transition hover:border-lava-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200"
        >
          <X aria-hidden="true" size={16} />
          Очистити
        </button>
      ) : null}
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag);
        return (
          <button
            type="button"
            key={tag}
            onClick={() => onToggle(tag)}
            className={[
              "tap-highlight inline-flex h-11 shrink-0 items-center rounded-card border px-3 text-sm font-semibold transition",
              selected
                ? "border-ionian-500 bg-ionian-50 text-ionian-700 dark:border-ionian-500 dark:bg-ionian-500/15 dark:text-ionian-100"
                : "border-ink-200 bg-white text-ink-600 hover:border-ionian-500 dark:border-white/10 dark:bg-ink-900 dark:text-ink-200",
            ].join(" ")}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
