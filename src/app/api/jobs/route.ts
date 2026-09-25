import { getScrapedJobs } from "@/lib/jobs-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = getScrapedJobs();
    return Response.json({ jobs });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load jobs" },
      { status: 500 },
    );
  }
}
