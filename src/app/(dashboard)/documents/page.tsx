"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, FileText, ChevronRight, Upload, AlertTriangle, Globe, RefreshCw,
  Plus, X, Loader2, CheckCircle2, FileUp, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import { ApiFailure, Empty, Loading } from "@/components/ui/api-state";
import { useApi } from "@/lib/use-api";
import { listConflicts, listDocuments, uploadDocument, type DocumentRecord } from "@/lib/api";

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

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDept, setUploadDept] = useState("Human Resources");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ filename: string; chunks: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError(null);
    try {
      const res = await uploadDocument(uploadFile, uploadDept, "Dev Anand");
      setUploadResult({ filename: res.filename, chunks: res.chunks_stored });
      setUploadFile(null);
      setShowUploadModal(false);
      await docs.reload();
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  // Which documents are currently caught in an unresolved conflict.
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
      {/* Top Header */}
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
        <div className="flex items-center gap-3">
          <button
            onClick={docs.reload}
            className="flex items-center gap-2 rounded-lg border border-nx-border px-3 py-2 text-xs font-medium text-nx-text-secondary transition-colors hover:bg-nx-elevated"
          >
            <RefreshCw size={13} className={cn(docs.loading && "animate-spin")} /> Refresh
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white px-4 py-2 text-xs font-medium transition-colors shadow-lg shadow-nx-accent/20"
          >
            <Upload size={14} /> Upload Document
          </button>
        </div>
      </div>

      {/* Ingestion Success Alert Banner */}
      {uploadResult && (
        <div className="rounded-xl border border-nx-success/40 bg-nx-success-muted/20 p-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-nx-success shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-nx-text-primary">
                  Document &quot;{uploadResult.filename}&quot; Ingested Successfully!
                </p>
                <p className="text-xs text-nx-text-secondary mt-0.5">
                  Extracted text sections, computed 768d vectors with Gemini, and indexed {uploadResult.chunks} chunks in MongoDB Atlas.
                </p>
              </div>
            </div>
            <button
              onClick={() => setUploadResult(null)}
              className="text-xs text-nx-text-muted hover:text-nx-text-primary"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-nx-surface border border-nx-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-nx-border pb-4">
              <div className="flex items-center gap-2">
                <FileUp size={18} className="text-nx-accent" />
                <h2 className="text-lg font-semibold text-nx-text-primary">Upload & Ingest PDF Document</h2>
              </div>
              <button
                onClick={() => { setShowUploadModal(false); setUploadError(null); }}
                className="text-nx-text-muted hover:text-nx-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg border border-nx-danger/40 bg-nx-danger-muted/20 text-xs text-nx-danger">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-nx-text-muted uppercase tracking-wider mb-1.5">
                  Select Policy PDF File
                </label>
                <div className="relative border-2 border-dashed border-nx-border hover:border-nx-accent rounded-xl p-6 text-center transition-colors bg-nx-bg">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileUp size={32} className="mx-auto text-nx-text-muted mb-2" />
                  <p className="text-sm font-medium text-nx-text-primary">
                    {uploadFile ? uploadFile.name : "Click or Drag & Drop PDF here"}
                  </p>
                  <p className="text-xs text-nx-text-muted mt-1">
                    {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB` : "Supports enterprise policy PDFs (.pdf)"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-nx-text-muted uppercase tracking-wider mb-1.5">
                  Department Owner
                </label>
                <select
                  value={uploadDept}
                  onChange={(e) => setUploadDept(e.target.value)}
                  className="w-full bg-nx-bg border border-nx-border rounded-xl px-3.5 py-2.5 text-sm text-nx-text-primary outline-none focus:border-nx-accent transition-colors"
                >
                  <option value="Human Resources">Human Resources</option>
                  <option value="Legal">Legal</option>
                  <option value="Security">Security</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-nx-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-nx-text-muted hover:text-nx-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-nx-accent hover:bg-nx-accent-hover text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Ingesting Vector DB..." : "Upload & Ingest PDF"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <span className="text-[11px] text-nx-text-disabled">{s.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDepartment(d)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    department === d
                      ? "bg-nx-accent text-white shadow-sm"
                      : "text-nx-text-muted hover:bg-nx-elevated hover:text-nx-text-primary"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nx-text-muted" />
                <input
                  type="text"
                  placeholder="Search by title, owner, or department…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 rounded-lg border border-nx-border bg-nx-surface pl-9 pr-3 py-1.5 text-xs text-nx-text-primary placeholder:text-nx-text-muted focus:border-nx-accent focus:outline-none"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-nx-border bg-nx-surface px-3 py-1.5 text-xs font-medium text-nx-text-secondary focus:border-nx-accent focus:outline-none"
              >
                <option value="name">Sort by name</option>
                <option value="department">Sort by department</option>
                <option value="size">Sort by section count</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <Empty
              title="No documents matched"
              hint="Try clearing your search query or picking 'All departments'."
            />
          ) : (
            <div className="rounded-xl border border-nx-border bg-nx-surface overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-nx-border bg-nx-elevated/50 text-[11px] font-semibold text-nx-text-muted uppercase tracking-wider">
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Indexed</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nx-border/60 text-nx-text-secondary font-normal">
                  {filtered.map((doc: DocumentRecord) => {
                    const activeConflicts = conflicted.get(doc.title) ?? [];
                    const isConflicted = activeConflicts.length > 0;

                    return (
                      <tr key={doc._id} className="hover:bg-nx-elevated/40 transition-colors group">
                        <td className="py-3.5 px-4 font-medium text-nx-text-primary">
                          <Link href={`/documents/${doc._id}`} className="flex items-center gap-3 hover:text-nx-accent transition-colors">
                            <div className="p-2 rounded-lg bg-nx-elevated border border-nx-border text-nx-accent group-hover:border-nx-accent/40 transition-colors">
                              <FileText size={16} />
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-snug">{doc.title}</p>
                              <p className="text-[11px] text-nx-text-disabled mt-0.5">
                                {doc.pageCount} pages · {doc.chunkCount} sections {doc.version ? `· v${doc.version}` : ""}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">{doc.owner}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-nx-elevated text-nx-text-muted text-[11px] font-medium border border-nx-border">
                            {doc.department}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-nx-text-muted">
                          <RelativeTime date={new Date(doc.ingestedAt * 1000)} />
                        </td>
                        <td className="py-3.5 px-4">
                          {isConflicted ? (
                            <Link href={`/conflicts/${activeConflicts[0].id}`} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-nx-danger-muted text-nx-danger text-[11px] font-medium border border-nx-danger/30 hover:bg-nx-danger/20 transition-colors">
                              <AlertTriangle size={12} /> Conflict
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-nx-success-muted text-nx-success text-[11px] font-medium border border-nx-success/30">
                              Analysed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/documents/${doc._id}`} className="inline-flex items-center justify-center p-1.5 rounded text-nx-text-muted hover:text-nx-accent hover:bg-nx-accent-muted transition-colors">
                            <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>

                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
