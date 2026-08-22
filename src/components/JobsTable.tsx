"use client";

import { useMemo, useState } from "react";
import type { Job } from "@/types/application";

interface JobsTableProps {
  jobs: Job[];
  initialPageSize?: number;
}

const pageSizeOptions = [10, 20, 50, 100];

export function JobsTable({ jobs, initialPageSize = 10 }: JobsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return jobs;
    }

    return jobs.filter(
      (job) =>
        job.name.toLowerCase().includes(search) ||
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.status.toLowerCase().includes(search),
    );
  }, [jobs, searchTerm]);

  const totalPages = Math.max(Math.ceil(filteredJobs.length / pageSize), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstItem = (safeCurrentPage - 1) * pageSize;
  const pageJobs = useMemo(
    () => filteredJobs.slice(firstItem, firstItem + pageSize),
    [filteredJobs, firstItem, pageSize],
  );
  const rangeStart = filteredJobs.length === 0 ? 0 : firstItem + 1;
  const rangeEnd = Math.min(firstItem + pageSize, filteredJobs.length);

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/50 bg-white/55 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Jobs
        </h3>
        <p className="mt-8 text-center text-sm text-zinc-500">No jobs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
      <div className="flex flex-col gap-3 border-b border-white/50 px-6 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Jobs
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Showing {rangeStart}-{rangeEnd} of {filteredJobs.length}
            {searchTerm ? ` filtered from ${jobs.length}` : ""}
          </p>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Page {safeCurrentPage} of {totalPages}
        </div>
      </div>

      <div className="border-b border-white/50 px-6 py-4 dark:border-white/10">
        <label className="block max-w-md">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Search
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, title, company, or status..."
            className="mt-1 w-full rounded-lg border border-white/60 bg-white/55 px-3 py-2 text-sm text-zinc-900 outline-none backdrop-blur transition-colors placeholder:text-zinc-400 focus:border-blue-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-white/35 text-xs uppercase tracking-wide text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Job Link</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pageJobs.map((job) => (
              <tr
                key={job.id}
                className="transition-colors hover:bg-white/40 dark:hover:bg-white/10"
              >
                <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {job.name}
                </td>
                <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-300">
                  {job.title}
                </td>
                <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-300">
                  {job.company}
                </td>
                <td className="px-6 py-3.5">
                  <a
                    href={job.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open
                  </a>
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <a
                    href={job.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-lg border border-white/60 bg-white/35 px-3 py-1.5 text-xs font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
            {pageJobs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No jobs match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/50 px-6 py-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-white/60 bg-white/45 px-3 py-2 text-sm font-medium text-zinc-700 outline-none backdrop-blur transition-colors hover:bg-white/60 focus:border-blue-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="inline-flex justify-center rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Previous
          </button>

          <div className="flex flex-wrap justify-center gap-2">
            {getVisiblePages(safeCurrentPage, totalPages).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  page === safeCurrentPage
                    ? "bg-zinc-900/85 text-white dark:bg-zinc-50/90 dark:text-zinc-900"
                    : "border border-white/60 bg-white/25 text-zinc-700 hover:bg-white/50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
                }`}
                aria-current={page === safeCurrentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPages))
            }
            disabled={safeCurrentPage === totalPages}
            className="inline-flex justify-center rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pageCount = Math.min(totalPages, 5);
  const firstPage = Math.min(
    Math.max(currentPage - Math.floor(pageCount / 2), 1),
    totalPages - pageCount + 1,
  );

  return Array.from({ length: pageCount }, (_, index) => firstPage + index);
}
