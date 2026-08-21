"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchApplications, type ResumeTable } from "@/lib/supabase";
import { computeStats } from "@/lib/stats";
import type { ApplicationStats } from "@/types/application";
import { StatCard } from "@/components/StatCard";
import { ApplicationChart } from "@/components/ApplicationChart";
import { JobTitleChart } from "@/components/JobTitleChart";
import { ApplicationsTable } from "@/components/ApplicationsTable";

const tabs: { id: ResumeTable; label: string; description: string }[] = [
  {
    id: "resume",
    label: "Jay",
    description: "Applications from the resume table",
  },
  {
    id: "resumev1",
    label: "Daniel",
    description: "Applications from the resumev1 table",
  },
  {
    id: "euresumev0",
    label: "John",
    description: "Applications from the euresumev0 table",
  },
  {
    id: "caleb",
    label: "Caleb",
    description: "Applications from the caleb table",
  },
];

async function getStats(table: ResumeTable) {
  const applications = await fetchApplications(table);
  return computeStats(applications);
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<ResumeTable>("resume");
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (table: ResumeTable) => {
    setLoading(true);
    setError(null);

    try {
      setStats(await getStats(table));
    } catch (err) {
      setStats(null);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadActiveTab() {
      try {
        const nextStats = await getStats(activeTab);

        if (!ignore) {
          setStats(nextStats);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setStats(null);
          setError(err instanceof Error ? err.message : "Failed to load data");
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
  }, [activeTab]);

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Application Tracker
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Overview of your job applications stored in Supabase.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-white/50 bg-white/35 p-1 shadow-lg shadow-purple-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === activeTab) {
                    return;
                  }

                  setActiveTab(tab.id);
                  setLoading(true);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/85 text-zinc-900 shadow-sm dark:bg-zinc-950/70 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => loadStats(activeTab)}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-white/60 bg-white/45 px-4 py-2 text-sm font-medium text-zinc-700 shadow-lg shadow-purple-200/20 backdrop-blur-xl transition-colors hover:bg-white/60 disabled:opacity-50 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:shadow-none dark:hover:bg-white/10"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {activeTabMeta.description}
      </p>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Failed to load applications: {error}
        </div>
      ) : null}

      {loading && !stats ? (
        <LoadingState />
      ) : stats ? (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Applications"
              value={stats.total}
              hint="All time"
              accent="blue"
            />
            <StatCard
              label="This Week"
              value={stats.thisWeek}
              hint={`${stats.thisMonth} this month`}
              accent="emerald"
            />
            <StatCard
              label="Unique Companies"
              value={stats.uniqueCompanies}
              hint={`${stats.uniqueJobTitles} unique job titles`}
              accent="violet"
            />
            <StatCard
              label="Cover Letter Rate"
              value={`${stats.coverLetterRate}%`}
              hint={`${stats.withCoverLetter} with / ${stats.withoutCoverLetter} without`}
              accent="amber"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ApplicationChart trends={stats.applicationTrends} />
            <JobTitleChart data={stats.topJobTitles} />
          </div>

          <div className="mt-6">
            <ApplicationsTable
              key={activeTab}
              applications={stats.applications}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
