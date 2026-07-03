import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-100 dark:from-purple-950 dark:via-zinc-950 dark:to-pink-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,180,254,0.45),transparent_32%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.35),transparent_30%)]" />
      <div className="relative">
        <Dashboard />
      </div>
    </main>
  );
}
