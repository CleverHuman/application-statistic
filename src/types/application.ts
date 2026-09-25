export interface Application {
  id: number;
  created_at: string;
  name: string;
  title: string;
  job_title: string;
  company: string;
  resume: unknown;
  cover_letter: string | null;
}

export interface Job {
  url: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  jobType: string;
  salary: string;
  postedAt: string;
  postedAtUtc: string;
  description: string;
  requirements: string;
  skills: string;
  scrapedAt: string;
}

export type ApplicationChartPeriod = "daily" | "monthly" | "yearly";

export interface ApplicationChartPoint {
  label: string;
  shortLabel: string;
  count: number;
}

export interface JobTitleCount {
  jobTitle: string;
  count: number;
}

export interface ApplicationTrends {
  daily: ApplicationChartPoint[];
  monthly: ApplicationChartPoint[];
  yearly: ApplicationChartPoint[];
}

export interface ApplicationStats {
  total: number;
  withCoverLetter: number;
  withoutCoverLetter: number;
  coverLetterRate: number;
  uniqueCompanies: number;
  uniqueJobTitles: number;
  thisWeek: number;
  thisMonth: number;
  applicationTrends: ApplicationTrends;
  topJobTitles: JobTitleCount[];
  applications: Application[];
}
