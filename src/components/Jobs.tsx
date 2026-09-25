"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Job } from "@/types/application";

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs", { cache: "no-store" });
      const payload = (await response.json()) as {
        jobs?: Job[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load jobs");
      }

      const nextJobs = payload.jobs ?? [];
      setJobs(nextJobs);
      setSelectedUrl((current) => {
        if (current && nextJobs.some((job) => job.url === current)) {
          return current;
        }

        return nextJobs[0]?.url ?? null;
      });
    } catch (err) {
      setJobs([]);
      setSelectedUrl(null);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return jobs;
    }

    return jobs.filter(
      (job) =>
        job.url.toLowerCase().includes(search) ||
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.location.toLowerCase().includes(search),
    );
  }, [jobs, searchTerm]);

  const selectedJob =
    jobs.find((job) => job.url === selectedUrl) ?? filteredJobs[0] ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {loading ? "Loading jobs..." : `${jobs.length} jobs from Jobright scraper`}
        </p>
        <button
          type="button"
          onClick={() => void loadJobs()}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/45 px-4 py-2 text-sm font-medium text-zinc-700 shadow-lg shadow-purple-200/20 backdrop-blur-xl transition-colors hover:bg-white/60 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:shadow-none dark:hover:bg-white/10"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Failed to load jobs: {error}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
            <div className="border-b border-white/50 px-4 py-4 dark:border-white/10">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Job links
              </h2>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search links, title, or company..."
                className="mt-3 w-full rounded-lg border border-white/60 bg-white/55 px-3 py-2 text-sm text-zinc-900 outline-none backdrop-blur transition-colors placeholder:text-zinc-400 focus:border-blue-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading && jobs.length === 0 ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-14 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
                    />
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No job links found.
                </p>
              ) : (
                <ul className="divide-y divide-white/40 dark:divide-white/10">
                  {filteredJobs.map((job) => {
                    const isActive = selectedJob?.url === job.url;

                    return (
                      <li
                        key={job.url || job.jobId}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          isActive
                            ? "bg-white/80 dark:bg-zinc-950/70"
                            : "hover:bg-white/40 dark:hover:bg-white/10"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedUrl(job.url)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-sm font-medium text-blue-600 dark:text-blue-400">
                            {job.url || "Missing job link"}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {[job.title, job.company].filter(Boolean).join(" · ") ||
                              "Untitled job"}
                          </p>
                        </button>

                        {job.url ? (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center rounded-lg border border-white/60 bg-white/45 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/70 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-white/10"
                          >
                            Apply
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex shrink-0 cursor-not-allowed items-center rounded-lg border border-white/60 bg-white/35 px-3 py-1.5 text-xs font-medium text-zinc-400 opacity-50 dark:border-white/10 dark:text-zinc-500"
                          >
                            Apply
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-sm text-zinc-500 dark:text-zinc-400">
                Select a job link to view details.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function JobDetail({ job }: { job: Job }) {
  const skills = splitSkills(job.skills);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Job detail
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {job.title || "Untitled job"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {[job.company, job.location].filter(Boolean).join(" · ") ||
              "Company not listed"}
          </p>
        </div>

        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-white/60 bg-white/45 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/60 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Open job link
          </a>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailMeta label="Work mode" value={job.workMode} />
        <DetailMeta label="Job type" value={job.jobType} />
        <DetailMeta label="Salary" value={job.salary} />
        <DetailMeta label="Posted" value={job.postedAt} />
      </div>

      <div className="mt-5 rounded-xl border border-white/50 bg-white/35 p-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Job link
        </p>
        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {job.url}
          </a>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">No link available</p>
        )}
      </div>

      <DetailSection title="Description" body={job.description} />
      <DetailSection title="Requirements" body={job.requirements} />

      {skills.length > 0 ? (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Skills
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DetailMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/35 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value || "—"}
      </p>
    </div>
  );
}

function DetailSection({ title, body }: { title: string; body: string }) {
  if (!body) {
    return null;
  }

  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        {body.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function splitSkills(value: string) {
  return value
    .split(/\s*,\s*/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}
