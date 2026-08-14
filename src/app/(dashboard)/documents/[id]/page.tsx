"use client";

import { use, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, FileText, Globe, MessageSquare, User,
} from "lucide-react";
import RelativeTime from "@/components/ui/relative-time";
import { ApiFailure, Loading } from "@/components/ui/api-state";
import { useApi } from "@/lib/use-api";
import { getDocument, listConflicts } from "@/lib/api";

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const fetchDoc = useCallback(() => getDocument(id), [id]);
  const doc = useApi(fetchDoc);
  const conflicts = useApi(listConflicts);

  const record = doc.data?.document;

  // Conflicts this document is part of. Shown here because "is what I'm reading
  // contradicted somewhere else?" is the question this product exists to answer.
  const related = useMemo(() => {
    if (!record) return [];
    return (conflicts.data?.conflicts ?? []).filter((c) => c.documents.includes(record.title));
  }, [conflicts.data, record]);

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6 md:p-8">
      <Link href="/documents" className="inline-flex items-center gap-1.5 text-xs text-nx-accent hover:underline">
        <ArrowLeft size={13} /> All documents
      </Link>

      {doc.error && <ApiFailure message={doc.error} />}
      {doc.loading && !doc.error && <Loading label="Loading document…" />}

      {record && (
        <>
          <div className="rounded-2xl border border-nx-border bg-nx-surface p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-nx-border bg-nx-bg p-3">
                <FileText size={24} className="text-nx-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold tracking-tight">{record.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-nx-text-muted">
                  <span className="flex items-center gap-1"><User size={11} /> {record.owner}</span>
                  <span>{record.department}</span>
                  {record.version && <span>Version {record.version}</span>}
                  {record.docId && <span className="font-mono">{record.docId}</span>}
                  <span>{record.pageCount} pages</span>
                  <span>{record.chunkCount} indexed sections</span>
                  <span className="flex items-center gap-1">
                    Indexed <RelativeTime date={new Date(record.ingestedAt * 1000)} />
                  </span>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-nx-success">
                  <Globe size={11} /> Readable by every role in the organization
                </p>
              </div>
              <Link
                href="/workspace"
                className="hidden shrink-0 items-center gap-2 rounded-lg bg-nx-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-nx-accent-hover sm:flex"
              >
                <MessageSquare size={14} /> Ask about this
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <div className="rounded-2xl border border-nx-danger/25 bg-nx-danger-muted/25 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-nx-danger" />
                <h2 className="text-sm font-semibold text-nx-danger">
                  This document is contradicted elsewhere
                </h2>
              </div>
              <div className="mt-3 space-y-2">
                {related.map((c) => (
                  <Link
                    key={c.fingerprint}
                    href={`/conflicts/${c.fingerprint}`}
                    className="block rounded-xl border border-nx-border bg-nx-surface p-3.5 transition-colors hover:border-nx-danger/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-nx-danger-muted px-1.5 py-0.5 text-[10px] font-bold text-nx-danger">
                        {c.severity.toUpperCase()}
                      </span>
                      <p className="text-sm font-medium">{c.title}</p>
                      <span className="ml-auto text-[10px] text-nx-text-disabled">{c.status}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.claims.map((claim, i) => (
                        <span key={i} className="rounded bg-nx-elevated px-1.5 py-0.5 text-[11px] text-nx-text-secondary">
                          {claim.value} — {claim.document}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold">
              Indexed sections
              <span className="ml-2 text-[11px] font-normal text-nx-text-muted">
                the passages retrieval actually searches
              </span>
            </h2>
            <div className="space-y-2">
              {(doc.data?.sections ?? []).map((section) => (
                <div key={section.chunkIndex} className="rounded-xl border border-nx-border bg-nx-surface p-4">
                  <p className="font-mono text-[11px] text-nx-accent">{section.section}</p>
                  <p className="mt-2 text-xs leading-relaxed text-nx-text-secondary">
                    {section.text.replace(section.section, "").trim().slice(0, 460)}
                    {section.text.length > 460 && "…"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
