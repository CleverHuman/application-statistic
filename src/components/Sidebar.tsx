"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-white/50 bg-white/35 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-white/40 px-5 py-6 dark:border-white/10">
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Application Tracker
        </p>
        <h1 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          ADB
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/85 text-zinc-900 shadow-sm dark:bg-zinc-950/70 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-white/40 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
