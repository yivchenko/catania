import { SearchX } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-dashed border-ink-300 bg-white px-4 py-10 text-center dark:border-white/15 dark:bg-ink-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card bg-ink-100 text-ink-500 dark:bg-white/8 dark:text-ink-200">
        <SearchX aria-hidden="true" size={22} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-ink-900 dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-600 dark:text-ink-200">{body}</p>
    </div>
  );
}
