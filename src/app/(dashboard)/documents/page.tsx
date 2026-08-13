"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, Filter, FileText, File, FileCode, Presentation,
  ChevronRight, Upload, AlertTriangle, Clock,
  CheckCircle, Loader2, Eye, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { documents } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import type { DocumentType, DocumentStatus, RiskLevel, Department } from "@/types";

const typeFilters: { label: string; value: DocumentType | "All" }[] = [
  { label: "All", value: "All" },
  { label: "PDF", value: "PDF" },
  { label: "DOCX", value: "DOCX" },
  { label: "PPTX", value: "PPTX" },
  { label: "TXT", value: "TXT" },
  { label: "Code", value: "Code" },
  { label: "MD", value: "MD" },
];

// Department is a filter over one shared library, never a boundary — the sidebar
// links here with ?dept=, and every one of these is open to every role.
const departmentFilters: { label: string; slug: string; value: Department | "All" }[] = [
  { label: "All departments", slug: "all", value: "All" },
  { label: "HR", slug: "hr", value: "Human Resources" },
  { label: "Legal", slug: "legal", value: "Legal" },
  { label: "Engineering", slug: "eng", value: "Engineering" },
  { label: "Security", slug: "sec", value: "Security" },
  { label: "Operations", slug: "ops", value: "Operations" },
  { label: "Finance", slug: "fin", value: "Finance" },
];

const statusIcon: Record<DocumentStatus, React.ReactNode> = {
  "Analyzed": <CheckCircle size={14} className="text-nx-success" />,
  "Processing": <Loader2 size={14} className="text-nx-accent animate-spin" />,
  "Needs Review": <Eye size={14} className="text-nx-warning" />,
  "Outdated": <Clock size={14} className="text-nx-warning" />,
  "Conflict Detected": <AlertTriangle size={14} className="text-nx-danger" />,
};

const statusStyle: Record<DocumentStatus, string> = {
  "Analyzed": "bg-nx-success-muted text-nx-success",
  "Processing": "bg-nx-accent-muted text-nx-accent",
  "Needs Review": "bg-nx-warning-muted text-nx-warning",
  "Outdated": "bg-nx-warning-muted text-nx-warning",
  "Conflict Detected": "bg-nx-danger-muted text-nx-danger",
};

const riskStyle: Record<RiskLevel, string> = {
  "Low": "text-nx-success",
  "Medium": "text-nx-warning",
  "High": "text-nx-danger",
  "Critical": "text-nx-danger font-semibold",
};

const typeIcon: Record<DocumentType, React.ReactNode> = {
  "PDF": <FileText size={16} className="text-nx-danger" />,
  "DOCX": <File size={16} className="text-nx-accent" />,
  "PPTX": <Presentation size={16} className="text-nx-warning" />,
  "TXT": <File size={16} className="text-nx-text-muted" />,
  "Code": <FileCode size={16} className="text-nx-success" />,
  "MD": <FileCode size={16} className="text-nx-cyan" />,
};

// Only the filterable region reads the URL, so the page header and stats above it
// still prerender — see next/docs 01-app/03-api-reference/04-functions/use-search-params.
export default function DocumentsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-nx-accent uppercase">Knowledge library</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Documents that stay trustworthy.</h1>
          <p className="text-sm text-nx-text-muted mt-1">{documents.length.toLocaleString()} indexed documents · continuously analyzed for risk, staleness, and policy conflicts</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-nx-success">
            <Globe size={11} /> Every document below is readable by every role, in every department
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-semibold transition-colors shadow-lg shadow-nx-accent/10">
          <Upload size={16} />
          Upload
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open to everyone", value: "12,482", note: "Documents indexed", tone: "text-nx-success" },
          { label: "Needs attention", value: "22", note: "Stale or pending review", tone: "text-nx-warning" },
          { label: "Conflicts found", value: "8", note: "Across 14 documents", tone: "text-nx-danger" },
          { label: "Source coverage", value: "94%", note: "Average AI confidence", tone: "text-nx-accent" },
        ].map((stat) => <div key={stat.label} className="rounded-xl border border-nx-border bg-nx-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-nx-text-muted">{stat.label}</p><div className="mt-2 flex items-end justify-between"><p className={cn("text-2xl font-semibold tracking-tight", stat.tone)}>{stat.value}</p><p className="text-[10px] text-right text-nx-text-muted">{stat.note}</p></div></div>)}
      </div>

      <Suspense fallback={<LibraryFallback />}>
        <DocumentsLibrary />
      </Suspense>
    </div>
  );
}

function LibraryFallback() {
  return (
    <div className="space-y-6">
      <div className="h-11 animate-pulse rounded-xl bg-nx-elevated" />
      <div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-nx-elevated" />
      <div className="h-96 animate-pulse rounded-2xl bg-nx-elevated" />
    </div>
  );
}

function DocumentsLibrary() {
  const searchParams = useSearchParams();
  const deptSlug = searchParams.get("dept") ?? "all";
  const deptFromUrl =
    departmentFilters.find((d) => d.slug === deptSlug)?.value ?? "All";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "All">("All");
  const [sortBy, setSortBy] = useState<"updated" | "risk" | "name">("updated");
  const [deptOverride, setDeptOverride] = useState<Department | "All" | null>(null);

  // The URL drives the department until the user picks one here.
  const deptFilter = deptOverride ?? deptFromUrl;

  const filtered = useMemo(() => {
    let docs = documents.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.owner.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase())
    );
    if (deptFilter !== "All") docs = docs.filter((d) => d.department === deptFilter);
    if (typeFilter !== "All") docs = docs.filter((d) => d.type === typeFilter);
    docs.sort((a, b) => {
      if (sortBy === "updated") return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      if (sortBy === "risk") {
        const riskOrder: Record<RiskLevel, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return riskOrder[a.risk] - riskOrder[b.risk];
      }
      return a.name.localeCompare(b.name);
    });
    return docs;
  }, [search, typeFilter, sortBy, deptFilter]);

  return (
    <div className="space-y-6">
      {/* Department filter — narrows the view, never the permissions */}
      <div className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-nx-border bg-nx-surface p-1">
        {departmentFilters.map((d) => (
          <button
            key={d.slug}
            onClick={() => setDeptOverride(d.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              deptFilter === d.value
                ? "bg-nx-accent-muted text-nx-accent"
                : "text-nx-text-muted hover:text-nx-text-secondary"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-sm bg-nx-surface border border-nx-border rounded-xl px-3 h-10 focus-within:border-nx-accent/60 transition-colors">
          <Search size={15} className="text-nx-text-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 bg-transparent text-sm text-nx-text-primary placeholder:text-nx-text-muted outline-none"
          />
        </div>
        <div className="flex max-w-full overflow-x-auto items-center gap-1 bg-nx-surface border border-nx-border rounded-xl p-1">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                typeFilter === f.value
                  ? "bg-nx-accent-muted text-nx-accent"
                  : "text-nx-text-muted hover:text-nx-text-secondary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-nx-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-nx-surface border border-nx-border rounded-lg px-2.5 py-1.5 text-xs text-nx-text-secondary outline-none cursor-pointer"
          >
            <option value="updated">Recently updated</option>
            <option value="risk">Risk level</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nx-border bg-nx-elevated/35">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Document</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden md:table-cell">Owner</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Department</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Updated</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Status</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden md:table-cell">Risk</th>
              <th className="px-3 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-border">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-nx-elevated/60 transition-colors group">
                <td className="px-5 py-3.5">
                  <Link href={`/documents/${doc.id}`} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-nx-border bg-nx-bg">{typeIcon[doc.type]}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-nx-text-primary group-hover:text-nx-accent transition-colors truncate">{doc.name}</p>
                      <p className="text-[11px] text-nx-text-disabled font-mono mt-0.5">{doc.type} · {doc.size} · v{doc.version}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-3.5 text-sm text-nx-text-secondary hidden md:table-cell">{doc.owner}</td>
                <td className="px-3 py-3.5 hidden lg:table-cell">
                  <span className="text-xs text-nx-text-muted bg-nx-elevated px-2 py-1 rounded">{doc.department}</span>
                </td>
                <td className="px-3 py-3.5 text-xs text-nx-text-muted font-mono hidden lg:table-cell">{formatRelativeTime(doc.lastUpdated)}</td>
                <td className="px-3 py-3.5">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded", statusStyle[doc.status])}>
                    {statusIcon[doc.status]}
                    {doc.status}
                  </span>
                </td>
                <td className="px-3 py-3.5 hidden md:table-cell">
                  <span className={cn("text-xs font-semibold", riskStyle[doc.risk])}>{doc.risk}</span>
                </td>
                <td className="px-3 py-3.5">
                  <Link href={`/documents/${doc.id}`}>
                    <ChevronRight size={16} className="text-nx-text-disabled group-hover:text-nx-text-muted transition-colors" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-nx-text-muted">No documents match those filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
