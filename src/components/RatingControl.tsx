import { Star } from "lucide-react";

type RatingControlProps = {
  value?: number;
  onChange: (rating?: number) => void;
  label: string;
};

export function RatingControl({ value, onChange, label }: RatingControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-ink-600 dark:text-ink-200">{label}</span>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const active = value !== undefined && rating <= value;
          return (
            <button
              type="button"
              key={rating}
              onClick={() => onChange(value === rating ? undefined : rating)}
              className="tap-highlight flex h-11 w-9 items-center justify-center rounded-card text-citrus-600 transition hover:bg-citrus-100 dark:text-citrus-400 dark:hover:bg-white/8"
              aria-label={`${rating} з 5`}
              aria-checked={value === rating}
              role="radio"
            >
              <Star aria-hidden="true" size={19} fill={active ? "currentColor" : "none"} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
