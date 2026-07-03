interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "blue" | "emerald" | "violet" | "amber" | "rose" | "slate";
}

const accentStyles = {
  blue: "from-blue-500/15 to-blue-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400",
  emerald:
    "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  violet:
    "from-violet-500/15 to-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400",
  amber:
    "from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400",
  rose: "from-rose-500/15 to-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400",
  slate:
    "from-slate-500/15 to-slate-500/5 border-slate-500/20 text-slate-600 dark:text-slate-300",
};

export function StatCard({
  label,
  value,
  hint,
  accent = "slate",
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white/55 bg-gradient-to-br p-5 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:bg-zinc-950/45 dark:shadow-none ${accentStyles[accent]}`}
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
