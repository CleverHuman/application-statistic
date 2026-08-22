import { createClient } from "@supabase/supabase-js";
import type { Application, Job } from "@/types/application";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ResumeTable = "resume" | "resumev1" | "euresumev0" | "caleb";

export async function fetchApplications(
  table: ResumeTable,
): Promise<Application[]> {
  const { data, error } = await supabase
    .from(table)
    .select(
      "id, created_at, name, title, job_title, company, resume, cover_letter",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchJobs(personName?: string): Promise<Job[]> {
  let query = supabase
    .from("jobs")
    .select("id, created_at, name, title, company, job_link, status")
    .order("created_at", { ascending: false });

  if (personName) {
    query = query.ilike("name", `%${personName}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
