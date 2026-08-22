"use client";

import type { ResumeTable } from "@/lib/supabase";
import { resumeTabs } from "@/lib/tabs";

interface PersonTabsProps {
  activeTab: ResumeTable;
  onChange: (tab: ResumeTable) => void;
}

export function PersonTabs({ activeTab, onChange }: PersonTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-white/50 bg-white/35 p-1 shadow-lg shadow-purple-200/20 backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-none">
      {resumeTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id !== activeTab) {
                onChange(tab.id);
              }
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
  );
}
