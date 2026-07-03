"use client";

import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { format, parseISO } from "date-fns";
import { jsPDF } from "jspdf";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Application } from "@/types/application";

interface ApplicationsTableProps {
  applications: Application[];
  initialPageSize?: number;
}

const pageSizeOptions = [10, 20, 50, 100];
const dialogTabs: { id: "resume" | "coverLetter"; label: string }[] = [
  { id: "resume", label: "Resume" },
  { id: "coverLetter", label: "Cover Letter" },
];

export function ApplicationsTable({
  applications,
  initialPageSize = 10,
}: ApplicationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const filteredApplications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return applications.filter((app) => {
      const applicationDate = format(parseISO(app.created_at), "yyyy-MM-dd");
      const matchesSearch =
        search.length === 0 ||
        app.company.toLowerCase().includes(search) ||
        app.job_title.toLowerCase().includes(search);
      const matchesStartDate = !startDate || applicationDate >= startDate;
      const matchesEndDate = !endDate || applicationDate <= endDate;

      return matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [applications, endDate, searchTerm, startDate]);
  const totalPages = Math.max(
    Math.ceil(filteredApplications.length / pageSize),
    1,
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstItem = (safeCurrentPage - 1) * pageSize;
  const pageApplications = useMemo(
    () => filteredApplications.slice(firstItem, firstItem + pageSize),
    [filteredApplications, firstItem, pageSize],
  );
  const rangeStart = filteredApplications.length === 0 ? 0 : firstItem + 1;
  const rangeEnd = Math.min(firstItem + pageSize, filteredApplications.length);
  const hasActiveFilters = Boolean(searchTerm || startDate || endDate);
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };
  const openResumePreview = (application: Application) => {
    setSelectedApplication(application);
  };
  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    application: Application,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openResumePreview(application);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-white/50 bg-white/55 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Applications
        </h3>
        <p className="mt-8 text-center text-sm text-zinc-500">
          No applications found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/45 dark:shadow-none">
      <div className="flex flex-col gap-3 border-b border-white/50 px-6 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Applications
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Showing {rangeStart}-{rangeEnd} of {filteredApplications.length}
            {hasActiveFilters ? ` filtered from ${applications.length}` : ""}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Click a row to preview the resume.
          </p>
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Page {safeCurrentPage} of {totalPages}
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/50 px-6 py-4 dark:border-white/10 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
        <label className="block">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Search company or job title
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by company or job title..."
            className="mt-1 w-full rounded-lg border border-white/60 bg-white/55 px-3 py-2 text-sm text-zinc-900 outline-none backdrop-blur transition-colors placeholder:text-zinc-400 focus:border-blue-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            From
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setCurrentPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-white/60 bg-white/55 px-3 py-2 text-sm text-zinc-900 outline-none backdrop-blur transition-colors focus:border-blue-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 lg:w-40"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            To
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setCurrentPage(1);
            }}
            className="mt-1 w-full rounded-lg border border-white/60 bg-white/55 px-3 py-2 text-sm text-zinc-900 outline-none backdrop-blur transition-colors focus:border-blue-500 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-100 lg:w-40"
          />
        </label>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/35 text-xs uppercase tracking-wide text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Job Title</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Cover Letter</th>
              <th className="px-6 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pageApplications.map((app) => {
              const hasCoverLetter =
                !!app.cover_letter && app.cover_letter.trim().length > 0;

              return (
                <tr
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openResumePreview(app)}
                  onKeyDown={(event) => handleRowKeyDown(event, app)}
                  className="cursor-pointer transition-colors hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-white/10"
                >
                  <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                    {app.company}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-300">
                    {app.job_title}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-300">
                    {app.name}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        hasCoverLetter
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {hasCoverLetter ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-zinc-500 dark:text-zinc-400">
                    {format(parseISO(app.created_at), "MMM d, yyyy")}
                  </td>
                </tr>
              );
            })}
            {pageApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  No applications match your filters.
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
      {selectedApplication ? (
        <ResumePreviewDialog
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      ) : null}
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

function ResumePreviewDialog({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"resume" | "coverLetter">(
    "resume",
  );
  const hasCoverLetter = Boolean(application.cover_letter?.trim());

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-preview-title"
        className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-2xl shadow-purple-300/30 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/85 dark:shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Resume Preview
            </p>
            <h2
              id="resume-preview-title"
              className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50"
            >
              {application.company}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {application.job_title} - {application.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-xl bg-white/35 p-1 backdrop-blur dark:bg-white/10">
            {dialogTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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

          <div className="flex flex-wrap gap-2">
            {activeTab === "resume" ? (
              <>
                <button
                  type="button"
                  onClick={() => downloadResumePdf(application)}
                  className="rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  Download Resume PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadResumeDocx(application)}
                  className="rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  Download Resume DOCX
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => downloadCoverLetterPdf(application)}
                disabled={!hasCoverLetter}
                className="rounded-lg border border-white/60 bg-white/35 px-3 py-2 text-sm font-medium text-zinc-700 backdrop-blur transition-colors hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                Download Cover Letter PDF
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5 grid gap-3 rounded-xl border border-white/50 bg-white/35 p-4 text-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:grid-cols-3">
            <PreviewMeta label="Application Title" value={application.title} />
            <PreviewMeta
              label="Applied Date"
              value={format(parseISO(application.created_at), "MMM d, yyyy")}
            />
            <PreviewMeta
              label="Cover Letter"
              value={
                application.cover_letter?.trim()
                  ? "Included"
                  : "Not included"
              }
            />
          </div>

          {activeTab === "resume" ? (
            <ResumeDocumentPreview application={application} />
          ) : (
            <CoverLetterPreview coverLetter={application.cover_letter} />
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function ResumeDocumentPreview({ application }: { application: Application }) {
  const resume = isRecord(application.resume) ? application.resume : null;

  if (!resume) {
    return (
      <p className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        No resume data available.
      </p>
    );
  }

  const data = buildResumeData(application);

  return (
    <article className="mx-auto max-w-3xl rounded-sm bg-white px-8 py-10 text-[13px] leading-relaxed text-zinc-950 shadow-sm ring-1 ring-zinc-200 dark:bg-white dark:text-zinc-950">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {data.header.name}
        </h1>
        {data.header.title ? (
          <p className="mt-1 text-base font-medium text-zinc-800">
            {data.header.title}
          </p>
        ) : null}
        {data.header.contact.length > 0 ? (
          <p className="mt-1 text-sm text-zinc-700">
            {data.header.contact.join(" | ")}
          </p>
        ) : null}
      </header>

      {data.summary ? (
        <ResumeSection title="Professional Summary">
          <p>{data.summary}</p>
        </ResumeSection>
      ) : null}

      {data.skills ? (
        <ResumeSection title="Technical Skills">
          <SkillsPreview value={data.skills} />
        </ResumeSection>
      ) : null}

      {data.experience.length > 0 ? (
        <ResumeSection title="Experience">
          <div className="space-y-4">
            {data.experience.map((item, index) => (
              <ExperiencePreview key={index} value={item} />
            ))}
          </div>
        </ResumeSection>
      ) : null}

      {data.projects.length > 0 ? (
        <ResumeSection title="Projects">
          <div className="space-y-4">
            {data.projects.map((item, index) => (
              <ExperiencePreview key={index} value={item} />
            ))}
          </div>
        </ResumeSection>
      ) : null}

      {data.education.length > 0 ? (
        <ResumeSection title="Education">
          <div className="space-y-3">
            {data.education.map((item, index) => (
              <EducationPreview key={index} value={item} />
            ))}
          </div>
        </ResumeSection>
      ) : null}

      {!data.summary &&
      !data.skills &&
      data.experience.length === 0 &&
      data.education.length === 0 ? (
        <ResumeSection title="Resume Data">
          {renderResumeValue(resume)}
        </ResumeSection>
      ) : null}
    </article>
  );
}

function CoverLetterPreview({ coverLetter }: { coverLetter: string | null }) {
  const text = coverLetter?.trim();

  if (!text) {
    return (
      <p className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        No cover letter available for this application.
      </p>
    );
  }

  return (
    <article className="mx-auto max-w-3xl rounded-sm bg-white px-8 py-10 text-[14px] leading-7 text-zinc-950 shadow-sm ring-1 ring-zinc-200 dark:bg-white dark:text-zinc-950">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="mb-4 whitespace-pre-wrap last:mb-0">
          {paragraph}
        </p>
      ))}
    </article>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-zinc-900 pb-1 text-[13px] font-bold uppercase tracking-wide">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SkillsPreview({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return <p>{value.map(valueToText).join(", ")}</p>;
  }

  if (!isRecord(value)) {
    return <p>{valueToText(value)}</p>;
  }

  return (
    <div className="space-y-1.5">
      {Object.entries(value).map(([category, skills]) => (
        <p key={category}>
          <span className="font-semibold">{formatKey(category)}: </span>
          {Array.isArray(skills)
            ? skills.map(valueToText).join(", ")
            : valueToText(skills)}
        </p>
      ))}
    </div>
  );
}

function ExperiencePreview({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return <p>{valueToText(value)}</p>;
  }

  const title = getFirstString(value, [
    "title",
    "role",
    "position",
    "job_title",
    "jobTitle",
  ]);
  const company = getFirstString(value, [
    "company",
    "organization",
    "employer",
    "client",
  ]);
  const location = getFirstString(value, ["location", "city"]);
  const startDate = getFirstString(value, [
    "start_date",
    "startDate",
    "start",
    "from",
  ]);
  const endDate = getFirstString(value, [
    "end_date",
    "endDate",
    "end",
    "to",
  ]);
  const dateRange =
    getFirstString(value, ["date", "dates", "period", "duration"]) ||
    [startDate, endDate].filter(Boolean).join(" - ");
  const bullets = getBulletList(value);

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
        <p className="font-semibold">{title || "Experience"}</p>
        {dateRange ? <p>{dateRange}</p> : null}
      </div>
      {[company, location].filter(Boolean).length > 0 ? (
        <p className="text-zinc-700">
          {[company, location].filter(Boolean).join(" - ")}
        </p>
      ) : null}
      {bullets.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2">{renderResumeValue(value, 1)}</div>
      )}
    </section>
  );
}

function EducationPreview({ value }: { value: unknown }) {
  if (!isRecord(value)) {
    return <p>{valueToText(value)}</p>;
  }

  const school = getFirstString(value, [
    "school",
    "university",
    "institution",
    "name",
  ]);
  const degree = getFirstString(value, ["degree", "qualification"]);
  const field = getFirstString(value, [
    "field",
    "field_of_study",
    "fieldOfStudy",
    "major",
  ]);
  const date = getFirstString(value, [
    "date",
    "dates",
    "period",
    "graduation",
    "graduationDate",
  ]);
  const description = [degree, field].filter(Boolean).join(", ");

  return (
    <section>
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
        <p className="font-semibold">{school || "Education"}</p>
        {date ? <p>{date}</p> : null}
      </div>
      {description ? <p>{description}</p> : null}
    </section>
  );
}

interface ResumeData {
  header: ResumeHeader;
  summary: string;
  skills: unknown;
  experience: unknown[];
  projects: unknown[];
  education: unknown[];
  rawResume: Record<string, unknown> | null;
}

interface ResumeHeader {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  links: string[];
  contact: string[];
}

interface ExperienceData {
  title: string;
  company: string;
  location: string;
  dateRange: string;
  bullets: string[];
}

interface EducationData {
  school: string;
  description: string;
  date: string;
}

function buildResumeData(application: Application): ResumeData {
  const resume = isRecord(application.resume) ? application.resume : null;

  if (!resume) {
    return {
      header: {
        name: application.name,
        title: application.title || application.job_title,
        location: "",
        phone: "",
        email: "",
        links: [],
        contact: [],
      },
      summary: "",
      skills: undefined,
      experience: [],
      projects: [],
      education: [],
      rawResume: null,
    };
  }

  return {
    header: getResumeHeader(resume, application),
    summary: getFirstString(resume, [
      "professional_summary",
      "professionalSummary",
      "summary",
      "profile",
      "objective",
    ]),
    skills: getFirstValue(resume, [
      "technical_skills",
      "technicalSkills",
      "skills",
      "core_skills",
      "coreSkills",
    ]),
    experience: getFirstArray(resume, [
      "experience",
      "work_experience",
      "workExperience",
      "professional_experience",
      "professionalExperience",
      "employment",
    ]),
    projects: getFirstArray(resume, ["projects", "project_experience"]),
    education: getFirstArray(resume, [
      "education",
      "educations",
      "academic_background",
      "academicBackground",
    ]),
    rawResume: resume,
  };
}

function downloadResumePdf(application: Application) {
  const data = buildResumeData(application);
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = 54;

  const ensureSpace = (height: number) => {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const addText = (
    text: string,
    options: { size?: number; bold?: boolean; center?: boolean; gap?: number } = {},
  ) => {
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(options.size ?? 10);
    const lines = doc.splitTextToSize(text, maxWidth);
    ensureSpace(lines.length * ((options.size ?? 10) + 4));
    doc.text(lines, options.center ? pageWidth / 2 : margin, y, {
      align: options.center ? "center" : "left",
    });
    y += lines.length * ((options.size ?? 10) + 4) + (options.gap ?? 4);
  };
  const addSection = (title: string) => {
    ensureSpace(24);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title.toUpperCase(), margin, y);
    doc.line(margin, y + 4, pageWidth - margin, y + 4);
    y += 18;
  };

  addText(data.header.name, { size: 18, bold: true, center: true, gap: 2 });
  if (data.header.title) {
    addText(data.header.title, { size: 11, bold: true, center: true, gap: 2 });
  }
  if (data.header.contact.length > 0) {
    addText(data.header.contact.join(" | "), { size: 9, center: true, gap: 14 });
  }

  if (data.summary) {
    addSection("Professional Summary");
    addText(data.summary);
  }

  const skillLines = getSkillLines(data.skills);
  if (skillLines.length > 0) {
    addSection("Technical Skills");
    skillLines.forEach((line) => addText(line));
  }

  if (data.experience.length > 0) {
    addSection("Experience");
    data.experience.map(getExperienceData).forEach((item) => {
      addText(
        [item.title, item.dateRange].filter(Boolean).join("    "),
        { bold: true, gap: 2 },
      );
      if (item.company || item.location) {
        addText([item.company, item.location].filter(Boolean).join(" - "), {
          gap: 2,
        });
      }
      item.bullets.forEach((bullet) => addText(`- ${bullet}`, { gap: 1 }));
      y += 4;
    });
  }

  if (data.projects.length > 0) {
    addSection("Projects");
    data.projects.map(getExperienceData).forEach((item) => {
      addText(item.title || item.company || "Project", { bold: true, gap: 2 });
      item.bullets.forEach((bullet) => addText(`- ${bullet}`, { gap: 1 }));
      y += 4;
    });
  }

  if (data.education.length > 0) {
    addSection("Education");
    data.education.map(getEducationData).forEach((item) => {
      addText([item.school, item.date].filter(Boolean).join("    "), {
        bold: true,
        gap: 2,
      });
      if (item.description) {
        addText(item.description);
      }
    });
  }

  doc.save(`${getBaseFileName(application)}-resume.pdf`);
}

async function downloadResumeDocx(application: Application) {
  const data = buildResumeData(application);
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: data.header.name, bold: true, size: 32 }),
      ],
    }),
  ];

  if (data.header.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: data.header.title, bold: true, size: 22 }),
        ],
      }),
    );
  }

  if (data.header.contact.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: data.header.contact.join(" | "), size: 20 })],
      }),
    );
  }

  if (data.summary) {
    addDocxSection(children, "Professional Summary");
    children.push(new Paragraph({ children: [new TextRun(data.summary)] }));
  }

  const skillLines = getSkillLines(data.skills);
  if (skillLines.length > 0) {
    addDocxSection(children, "Technical Skills");
    skillLines.forEach((line) => {
      children.push(new Paragraph({ children: [new TextRun(line)] }));
    });
  }

  if (data.experience.length > 0) {
    addDocxSection(children, "Experience");
    data.experience.map(getExperienceData).forEach((item) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: item.title || "Experience", bold: true }),
            new TextRun({
              text: item.dateRange ? `\t${item.dateRange}` : "",
            }),
          ],
        }),
      );
      if (item.company || item.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun(
                [item.company, item.location].filter(Boolean).join(" - "),
              ),
            ],
          }),
        );
      }
      item.bullets.forEach((bullet) => {
        children.push(
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun(bullet)] }),
        );
      });
    });
  }

  if (data.projects.length > 0) {
    addDocxSection(children, "Projects");
    data.projects.map(getExperienceData).forEach((item) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: item.title || item.company || "Project", bold: true }),
          ],
        }),
      );
      item.bullets.forEach((bullet) => {
        children.push(
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun(bullet)] }),
        );
      });
    });
  }

  if (data.education.length > 0) {
    addDocxSection(children, "Education");
    data.education.map(getEducationData).forEach((item) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: item.school || "Education", bold: true }),
            new TextRun({ text: item.date ? `\t${item.date}` : "" }),
          ],
        }),
      );
      if (item.description) {
        children.push(new Paragraph({ children: [new TextRun(item.description)] }));
      }
    });
  }

  const document = new Document({
    sections: [{ properties: {}, children }],
  });
  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `${getBaseFileName(application)}-resume.docx`);
}

function downloadCoverLetterPdf(application: Application) {
  const text = application.cover_letter?.trim();

  if (!text) {
    return;
  }

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = 54;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${application.company} Cover Letter`, margin, y);
  y += 28;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  text.split(/\n{2,}/).forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, maxWidth);
    const height = lines.length * 15 + 12;

    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(lines, margin, y);
    y += height;
  });

  doc.save(`${getBaseFileName(application)}-cover-letter.pdf`);
}

function addDocxSection(children: Paragraph[], title: string) {
  children.push(
    new Paragraph({
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [new TextRun({ text: title.toUpperCase(), bold: true })],
    }),
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getBaseFileName(application: Application) {
  return `${application.name}-${application.company}-${application.job_title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getSkillLines(value: unknown) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return [value.map(valueToText).join(", ")];
  }

  if (!isRecord(value)) {
    return [valueToText(value)];
  }

  return Object.entries(value).map(([category, skills]) => {
    const skillText = Array.isArray(skills)
      ? skills.map(valueToText).join(", ")
      : valueToText(skills);

    return `${formatKey(category)}: ${skillText}`;
  });
}

function getExperienceData(value: unknown): ExperienceData {
  if (!isRecord(value)) {
    return {
      title: valueToText(value),
      company: "",
      location: "",
      dateRange: "",
      bullets: [],
    };
  }

  const title = getFirstString(value, [
    "title",
    "role",
    "position",
    "job_title",
    "jobTitle",
    "name",
  ]);
  const company = getFirstString(value, [
    "company",
    "organization",
    "employer",
    "client",
  ]);
  const location = getFirstString(value, ["location", "city"]);
  const startDate = getFirstString(value, [
    "start_date",
    "startDate",
    "start",
    "from",
  ]);
  const endDate = getFirstString(value, [
    "end_date",
    "endDate",
    "end",
    "to",
  ]);
  const dateRange =
    getFirstString(value, ["date", "dates", "period", "duration"]) ||
    [startDate, endDate].filter(Boolean).join(" - ");

  return {
    title,
    company,
    location,
    dateRange,
    bullets: getBulletList(value),
  };
}

function getEducationData(value: unknown): EducationData {
  if (!isRecord(value)) {
    return { school: valueToText(value), description: "", date: "" };
  }

  const school = getFirstString(value, [
    "school",
    "university",
    "institution",
    "name",
  ]);
  const degree = getFirstString(value, ["degree", "qualification"]);
  const field = getFirstString(value, [
    "field",
    "field_of_study",
    "fieldOfStudy",
    "major",
  ]);
  const date = getFirstString(value, [
    "date",
    "dates",
    "period",
    "graduation",
    "graduationDate",
  ]);

  return {
    school,
    description: [degree, field].filter(Boolean).join(", "),
    date,
  };
}

function getResumeHeader(
  resume: Record<string, unknown>,
  application: Application,
): ResumeHeader {
  const personalInfo = getFirstRecord(resume, [
    "personal_information",
    "personalInformation",
    "personal_info",
    "personalInfo",
    "contact",
    "header",
    "basics",
  ]);
  const contactInfo = getFirstRecord(resume, [
    "contact_information",
    "contactInformation",
    "contact_info",
    "contactInfo",
    "contact_details",
    "contactDetails",
  ]);
  const name =
    getFirstString(resume, ["name", "full_name", "fullName"]) ||
    (personalInfo
      ? getFirstString(personalInfo, ["name", "full_name", "fullName"])
      : "") ||
    application.name;
  const contactSources = [resume, personalInfo, contactInfo].filter(isRecord);
  const title =
    getFirstStringFromSources(contactSources, [
      "title",
      "professional_title",
      "professionalTitle",
      "headline",
      "role",
      "job_title",
      "jobTitle",
      "target_title",
      "targetTitle",
    ]) ||
    application.title ||
    application.job_title;
  const location = getFirstStringFromSources(contactSources, [
    "location",
    "address",
    "city",
    "current_location",
    "currentLocation",
  ]);
  const phone = getFirstStringFromSources(contactSources, [
    "phone",
    "phone_number",
    "phoneNumber",
    "contact_number",
    "contactNumber",
    "mobile",
    "mobile_number",
    "mobileNumber",
    "telephone",
  ]);
  const email = getFirstStringFromSources(contactSources, [
    "email",
    "email_address",
    "emailAddress",
  ]);
  const links = [
    getFirstStringFromSources(contactSources, ["linkedin", "linkedIn"]),
    getFirstStringFromSources(contactSources, ["github"]),
    getFirstStringFromSources(contactSources, ["portfolio", "website", "url"]),
  ].filter(Boolean);
  const contact = uniqueStrings([location, email, phone, ...links]);

  return { name, title, location, phone, email, links, contact };
}

function getFirstValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function getFirstString(record: Record<string, unknown>, keys: string[]) {
  const value = getFirstValue(record, keys);

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function getFirstStringFromSources(
  records: Record<string, unknown>[],
  keys: string[],
) {
  for (const record of records) {
    const value = getFirstString(record, keys);

    if (value) {
      return value;
    }
  }

  return "";
}

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function getFirstArray(record: Record<string, unknown>, keys: string[]) {
  const value = getFirstValue(record, keys);

  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function getFirstRecord(record: Record<string, unknown>, keys: string[]) {
  const value = getFirstValue(record, keys);

  return isRecord(value) ? value : null;
}

function getBulletList(record: Record<string, unknown>) {
  const value = getFirstValue(record, [
    "bullets",
    "bullet_points",
    "bulletPoints",
    "responsibilities",
    "achievements",
    "highlights",
    "description",
    "descriptions",
  ]);

  if (Array.isArray(value)) {
    return value
      .map((item) => (isPrimitive(item) ? valueToText(item) : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n+|\u2022/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function renderResumeValue(value: unknown, depth = 0): ReactNode {
  if (value === null || value === undefined || isPrimitive(value)) {
    return <p className="whitespace-pre-wrap">{valueToText(value)}</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-zinc-500 dark:text-zinc-400">No items.</p>;
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            {isPrimitive(item) ? (
              <p>{valueToText(item)}</p>
            ) : (
              renderResumeValue(item, depth + 1)
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!isRecord(value)) {
    return <p>{String(value)}</p>;
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return <p className="text-zinc-500 dark:text-zinc-400">No details.</p>;
  }

  if (entries.every(([, item]) => isPrimitive(item) || item === null)) {
    return (
      <dl className="grid gap-3 sm:grid-cols-2">
        {entries.map(([key, item]) => (
          <div key={key}>
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {formatKey(key)}
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {valueToText(item)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className={depth === 0 ? "space-y-5" : "space-y-4"}>
      {entries.map(([key, item]) => (
        <section key={key}>
          <h3
            className={
              depth === 0
                ? "mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50"
                : "mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
            }
          >
            {formatKey(key)}
          </h3>
          {renderResumeValue(item, depth + 1)}
        </section>
      ))}
    </div>
  );
}

function isPrimitive(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function valueToText(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return String(value);
}

function formatKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
