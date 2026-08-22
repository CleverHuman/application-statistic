import type { ResumeTable } from "@/lib/supabase";

export const resumeTabs: {
  id: ResumeTable;
  label: string;
  description: string;
}[] = [
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
