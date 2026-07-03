import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  isAfter,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import type {
  Application,
  ApplicationChartPoint,
  ApplicationStats,
} from "@/types/application";

export function computeStats(applications: Application[]): ApplicationStats {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const withCoverLetter = applications.filter(
    (app) => app.cover_letter && app.cover_letter.trim().length > 0,
  ).length;

  const companies = new Set(applications.map((app) => app.company));
  const jobTitles = new Set(applications.map((app) => app.job_title));

  const thisWeek = applications.filter((app) =>
    isAfter(parseISO(app.created_at), weekStart),
  ).length;

  const thisMonth = applications.filter((app) =>
    isAfter(parseISO(app.created_at), monthStart),
  ).length;

  const applicationTrends = buildApplicationTrends(applications);
  const topJobTitles = buildTopJobTitles(applications);

  return {
    total: applications.length,
    withCoverLetter,
    withoutCoverLetter: applications.length - withCoverLetter,
    coverLetterRate:
      applications.length > 0
        ? Math.round((withCoverLetter / applications.length) * 100)
        : 0,
    uniqueCompanies: companies.size,
    uniqueJobTitles: jobTitles.size,
    thisWeek,
    thisMonth,
    applicationTrends,
    topJobTitles,
    applications,
  };
}

function buildApplicationTrends(applications: Application[]) {
  return {
    daily: buildTrend(applications, {
      length: 14,
      getDate: (index, now) => subDays(now, 13 - index),
      keyFormat: "yyyy-MM-dd",
      labelFormat: "MMM d, yyyy",
      shortLabelFormat: "MMM d",
    }),
    monthly: buildTrend(applications, {
      length: 12,
      getDate: (index, now) => subMonths(now, 11 - index),
      keyFormat: "yyyy-MM",
      labelFormat: "MMM yyyy",
      shortLabelFormat: "MMM",
    }),
    yearly: buildTrend(applications, {
      length: 5,
      getDate: (index, now) => subYears(now, 4 - index),
      keyFormat: "yyyy",
      labelFormat: "yyyy",
      shortLabelFormat: "yyyy",
    }),
  };
}

interface TrendConfig {
  length: number;
  getDate: (index: number, now: Date) => Date;
  keyFormat: string;
  labelFormat: string;
  shortLabelFormat: string;
}

function buildTrend(
  applications: Application[],
  config: TrendConfig,
): ApplicationChartPoint[] {
  const buckets: (ApplicationChartPoint & { key: string })[] = [];
  const now = new Date();

  for (let i = 0; i < config.length; i++) {
    const date = config.getDate(i, now);
    buckets.push({
      key: format(date, config.keyFormat),
      label: format(date, config.labelFormat),
      shortLabel: format(date, config.shortLabelFormat),
      count: 0,
    });
  }

  const bucketIndexes = new Map(
    buckets.map((bucket, index) => [bucket.key, index]),
  );

  for (const app of applications) {
    const key = format(parseISO(app.created_at), config.keyFormat);
    const index = bucketIndexes.get(key);

    if (index !== undefined) {
      buckets[index].count += 1;
    }
  }

  return buckets.map((bucket) => ({
    label: bucket.label,
    shortLabel: bucket.shortLabel,
    count: bucket.count,
  }));
}

function buildTopJobTitles(applications: Application[]) {
  const counts = new Map<string, number>();

  for (const app of applications) {
    counts.set(app.job_title, (counts.get(app.job_title) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([jobTitle, count]) => ({ jobTitle, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}
