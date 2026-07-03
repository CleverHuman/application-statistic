import type { JobTitleCount } from "@/types/application";

interface JobTitleChartProps {
  data: JobTitleCount[];
}

export function JobTitleChart({ data }: JobTitleChartProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/50 bg-white/55 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Top Job Titles
        </h3>
        <p className="mt-8 text-center text-sm text-zinc-500">No data yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/50 bg-white/55 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Top Job Titles
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Most applied roles
      </p>

      <div className="mt-5 space-y-3">
        {data.map((item) => (
          <div key={item.jobTitle}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                {item.jobTitle}
              </span>
              <span className="shrink-0 text-xs font-medium text-zinc-500">
                {item.count}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/50 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
