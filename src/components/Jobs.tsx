"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJobs, type ResumeTable } from "@/lib/supabase";
import { resumeTabs } from "@/lib/tabs";
import type { Job } from "@/types/application";
import { PersonTabs } from "@/components/PersonTabs";
import { JobsTable } from "@/components/JobsTable";

export function Jobs() {
  const [activeTab, setActiveTab] = useState<ResumeTable>("resume");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activePerson =
    resumeTabs.find((tab) => tab.id === activeTab)?.label ?? "Jay";

  const loadJobs = useCallback(async (personName: string) => {
    setLoading(true);
    setError(null);

    try {
      setJobs(await fetchJobs(personName));
    } catch (err) {
      setJobs([]);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadActiveTab() {
      try {
        const nextJobs = await fetchJobs(activePerson);

        if (!ignore) {
          setJobs(nextJobs);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setJobs([]);
          setError(err instanceof Error ? err.message : "Failed to load jobs");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadActiveTab();

    return () => {
      ignore = true;
    };
  }, [activePerson]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PersonTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setLoading(true);
          }}
        />

        <button
          type="button"
          onClick={() => loadJobs(activePerson)}
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
      ) : null}

      {loading && jobs.length === 0 && !error ? (
        <div className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <JobsTable key={activeTab} jobs={jobs} />
        </div>
      )}
    </div>
  );
}
