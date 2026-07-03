"use client";

import { useState } from "react";
import type {
  ApplicationChartPeriod,
  ApplicationTrends,
} from "@/types/application";

interface ApplicationChartProps {
  trends: ApplicationTrends;
}

const periodLabels: Record<ApplicationChartPeriod, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

const periodDescriptions: Record<ApplicationChartPeriod, string> = {
  daily: "Last 14 days",
  monthly: "Last 12 months",
  yearly: "Last 5 years",
};

export function ApplicationChart({ trends }: ApplicationChartProps) {
  const [period, setPeriod] = useState<ApplicationChartPeriod>("monthly");
  const data = trends[period];
  const max = Math.max(...data.map((item) => item.count), 1);
  const chartWidth = 640;
  const chartHeight = 220;
  const padding = { top: 20, right: 24, bottom: 28, left: 32 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const points = data.map((item, index) => {
    const x =
      padding.left +
      (data.length > 1 ? (index / (data.length - 1)) * plotWidth : plotWidth / 2);
    const y = padding.top + plotHeight - (item.count / max) * plotHeight;

    return { ...item, x, y };
  });
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          padding.top + plotHeight
        } L ${points[0].x} ${padding.top + plotHeight} Z`
      : "";

  return (
    <div className="rounded-2xl border border-white/50 bg-white/55 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Applications Chart
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {periodDescriptions[period]}
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-white/35 p-1 backdrop-blur dark:bg-white/10">
          {(Object.keys(periodLabels) as ApplicationChartPeriod[]).map(
            (option) => {
              const isActive = option === period;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPeriod(option)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white/85 text-zinc-900 shadow-sm dark:bg-zinc-950/80 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {periodLabels[option]}
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="mt-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`${periodLabels[period]} applications line chart`}
          className="h-64 w-full overflow-visible"
        >
          <defs>
            <linearGradient id="application-chart-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = padding.top + ratio * plotHeight;
            const value = Math.round(max * (1 - ratio));

            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  x2={chartWidth - padding.right}
                  y1={y}
                  y2={y}
                  className="stroke-white/70 dark:stroke-white/10"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {areaPath ? (
            <path d={areaPath} fill="url(#application-chart-area)" />
          ) : null}
          {linePath ? (
            <path
              d={linePath}
              fill="none"
              stroke="#2563eb"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          ) : null}

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                className="fill-white/90 stroke-blue-600 dark:fill-zinc-950/90"
                strokeWidth="3"
              >
                <title>
                  {point.label}: {point.count}
                </title>
              </circle>
              <text
                x={point.x}
                y={chartHeight - 4}
                textAnchor="middle"
                className="fill-zinc-500 text-[11px] dark:fill-zinc-400"
              >
                {point.shortLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
