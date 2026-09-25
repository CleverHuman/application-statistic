import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Job } from "@/types/application";

interface JobRow {
  Url: string | null;
  JobId: string | null;
  Title: string | null;
  Company: string | null;
  Location: string | null;
  WorkMode: string | null;
  JobType: string | null;
  Salary: string | null;
  PostedAt: string | null;
  PostedAtUtc: string | null;
  Description: string | null;
  Requirements: string | null;
  Skills: string | null;
  ScrapedAt: string | null;
}

export function getJobsDbPath() {
  const localAppData = process.env.LOCALAPPDATA;

  if (!localAppData) {
    throw new Error("LOCALAPPDATA is not set");
  }

  return path.join(localAppData, "JobrightScraper", "jobs.db");
}

export function getScrapedJobs(): Job[] {
  const dbPath = getJobsDbPath();

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Jobs database not found at ${dbPath}`);
  }

  const db = new DatabaseSync(dbPath, { readOnly: true });

  try {
    const rows = db
      .prepare(
        `SELECT
          Url,
          JobId,
          Title,
          Company,
          Location,
          WorkMode,
          JobType,
          Salary,
          PostedAt,
          PostedAtUtc,
          Description,
          Requirements,
          Skills,
          ScrapedAt
        FROM Jobs
        ORDER BY COALESCE(PostedAtUtc, ScrapedAt) DESC`,
      )
      .all() as JobRow[];

    return rows.map(mapJobRow);
  } finally {
    db.close();
  }
}

function mapJobRow(row: JobRow): Job {
  return {
    url: row.Url?.trim() ?? "",
    jobId: row.JobId?.trim() ?? "",
    title: row.Title?.trim() ?? "",
    company: row.Company?.trim() ?? "",
    location: row.Location?.trim() ?? "",
    workMode: row.WorkMode?.trim() ?? "",
    jobType: row.JobType?.trim() ?? "",
    salary: row.Salary?.trim() ?? "",
    postedAt: row.PostedAt?.trim() ?? "",
    postedAtUtc: row.PostedAtUtc?.trim() ?? "",
    description: row.Description?.trim() ?? "",
    requirements: row.Requirements?.trim() ?? "",
    skills: row.Skills?.trim() ?? "",
    scrapedAt: row.ScrapedAt?.trim() ?? "",
  };
}
