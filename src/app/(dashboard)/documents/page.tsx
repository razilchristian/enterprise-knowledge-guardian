"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, FileText, ChevronRight, Upload, AlertTriangle, Globe, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import { ApiFailure, Empty, Loading } from "@/components/ui/api-state";
import { useApi } from "@/lib/use-api";
import { listConflicts, listDocuments } from "@/lib/api";

const DEPARTMENTS = [
  "All departments", "Human Resources", "Legal", "Engineering",
  "Security", "Operations", "Finance",
];

export default function DocumentsPage() {
  const docs = useApi(listDocuments);
  const conflicts = useApi(listConflicts);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [sortBy, setSortBy] = useState<"name" | "department" | "size">("name");

  // Which documents are currently caught in an unresolved conflict. This is the
  // column that makes the library worth looking at rather than a file list.
  const conflicted = useMemo(() => {
    const map = new Map<string, { title: string; id: string }[]>();
    for (const c of conflicts.data?.conflicts ?? []) {
      if (c.status !== "Open" && c.status !== "In Review") continue;
      for (const title of c.documents) {
        map.set(title, [...(map.get(title) ?? []), { title: c.title, id: c.fingerprint }]);
      }
    }
    return map;
  }, [conflicts.data]);

  const filtered = useMemo(() => {
    let list = docs.data?.documents ?? [];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.owner.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q)
      );
    }
    if (department !== "All departments") {
      list = list.filter((d) => d.department === department);
    }
    return [...list].sort((a, b) => {
      if (sortBy === "department") return a.department.localeCompare(b.department);
      if (sortBy === "size") return b.chunkCount - a.chunkCount;
      return a.title.localeCompare(b.title);
    });
  }, [docs.data, search, department, sortBy]);

  const total = docs.data?.total ?? 0;
  const totalChunks = (docs.data?.documents ?? []).reduce((n, d) => n + d.chunkCount, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-nx-accent uppercase">Knowledge library</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Documents that stay trustworthy.</h1>
          <p className="text-sm text-nx-text-muted mt-1">
            {docs.loading ? "Loading…" : `${total} documents · ${totalChunks} indexed sections · continuously analysed for contradictions`}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-nx-success">
            <Globe size={11} /> Every document here is readable by every role, in every department
          </p>
        </div>
        <button
          onClick={docs.reload}
          className="flex items-center gap-2 rounded-lg border border-nx-border px-3 py-2 text-xs font-medium text-nx-text-secondary transition-colors hover:bg-nx-elevated"
        >
          <RefreshCw size={13} className={cn(docs.loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {docs.error && <ApiFailure message={docs.error} />}
      {docs.loading && !docs.error && <Loading label="Loading the document library…" />}

      {!docs.loading && !docs.error && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Open to everyone", value: total, note: "Documents indexed", tone: "text-nx-success" },
              { label: "Indexed sections", value: totalChunks, note: "Searchable passages", tone: "" },
              { label: "In conflict", value: conflicted.size, note: "Need owner review", tone: "text-nx-danger" },
              { label: "Departments", value: new Set((docs.data?.documents ?? []).map((d) => d.department)).size, note: "All mutually visible", tone: "text-nx-accent" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-nx-border bg-nx-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-nx-text-muted">{s.label}</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className={cn("text-2xl font-semibold tracking-tight", s.tone)}>{s.value}</p>
                  <p className="text-[10px] text-right text-nx-text-muted">{s.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-nx-border bg-nx-surface p-1">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setDepartment(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  department === d ? "bg-nx-accent-muted text-nx-accent" : "text-nx-text-muted hover:text-nx-text-secondary"
                )}
              >
                {d === "All departments" ? d : d.replace("Human Resources", "HR")}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-10 max-w-sm flex-1 items-center gap-2 rounded-xl border border-nx-border bg-nx-surface px-3 focus-within:border-nx-accent/60">
              <Search size={15} className="shrink-0 text-nx-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, owner, or department…"
                className="min-w-0 flex-1 bg-transparent text-sm text-nx-text-primary outline-none placeholder:text-nx-text-muted"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="cursor-pointer rounded-lg border border-nx-border bg-nx-surface px-2.5 py-1.5 text-xs text-nx-text-secondary outline-none"
            >
              <option value="name">Sort by name</option>
              <option value="department">Sort by department</option>
              <option value="size">Sort by size</option>
            </select>
            <Link
              href="/workspace"
              className="ml-auto flex items-center gap-2 rounded-xl bg-nx-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nx-accent/10 transition-colors hover:bg-nx-accent-hover"
            >
              <Upload size={16} /> Ask about these
            </Link>
          </div>

          {filtered.length === 0 ? (
            <Empty title="No documents match those filters." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-nx-border bg-nx-elevated/35">
                      <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-nx-text-muted">Document</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-nx-text-muted">Owner</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-nx-text-muted">Department</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-nx-text-muted">Indexed</th>
                      <th className="px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-nx-text-muted">Status</th>
                      <th className="w-8 px-3 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nx-border">
                    {filtered.map((doc) => {
                      const issues = conflicted.get(doc.title);
                      return (
                        <tr key={doc._id} className="group transition-colors hover:bg-nx-elevated/60">
                          <td className="px-5 py-3.5">
                            <Link href={`/documents/${doc._id}`} className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-nx-border bg-nx-bg">
                                <FileText size={16} className={issues ? "text-nx-danger" : "text-nx-accent"} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-nx-text-primary transition-colors group-hover:text-nx-accent">
                                  {doc.title}
                                </p>
                                <p className="mt-0.5 font-mono text-[11px] text-nx-text-disabled">
                                  {doc.pageCount} pages · {doc.chunkCount} sections
                                  {doc.version && ` · v${doc.version}`}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 py-3.5 text-sm text-nx-text-secondary">{doc.owner}</td>
                          <td className="px-3 py-3.5">
                            <span className="rounded bg-nx-elevated px-2 py-1 text-xs text-nx-text-muted">{doc.department}</span>
                          </td>
                          <td className="px-3 py-3.5">
                            <RelativeTime date={new Date(doc.ingestedAt * 1000)} className="font-mono text-xs text-nx-text-muted" />
                          </td>
                          <td className="px-3 py-3.5">
                            {issues ? (
                              <Link
                                href={`/conflicts/${issues[0].id}`}
                                className="inline-flex items-center gap-1.5 rounded bg-nx-danger-muted px-2 py-1 text-[11px] font-medium text-nx-danger"
                              >
                                <AlertTriangle size={11} />
                                {issues.length === 1 ? "Conflict" : `${issues.length} conflicts`}
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded bg-nx-success-muted px-2 py-1 text-[11px] font-medium text-nx-success">
                                Analysed
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            <Link href={`/documents/${doc._id}`}>
                              <ChevronRight size={16} className="text-nx-text-disabled transition-colors group-hover:text-nx-text-muted" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
