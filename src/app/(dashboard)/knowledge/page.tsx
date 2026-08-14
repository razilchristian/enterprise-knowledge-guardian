"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, Brain, Building2, FileText, Globe, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiFailure, Empty, Loading } from "@/components/ui/api-state";
import { useApi } from "@/lib/use-api";
import { getKnowledgeGraph, type GraphNode } from "@/lib/api";

export default function KnowledgePage() {
  const { data, loading, error, reload } = useApi(getKnowledgeGraph);
  const [selected, setSelected] = useState<string | null>(null);

  const departments = useMemo(
    () => (data?.nodes ?? []).filter((n) => n.type === "department"),
    [data]
  );

  const documentsByDept = useMemo(() => {
    const map = new Map<string, GraphNode[]>();
    for (const node of data?.nodes ?? []) {
      if (node.type !== "document" || !node.department) continue;
      map.set(node.department, [...(map.get(node.department) ?? []), node]);
    }
    return map;
  }, [data]);

  const conflictEdges = useMemo(
    () => (data?.edges ?? []).filter((e) => e.kind === "conflict"),
    [data]
  );

  // Conflict edges that join two different departments. These are the ones that
  // justify the open-knowledge model: no single department could see them.
  const crossDept = useMemo(() => {
    const dept = new Map((data?.nodes ?? []).map((n) => [n.id, n.department]));
    return conflictEdges.filter((e) => dept.get(e.source) !== dept.get(e.target));
  }, [conflictEdges, data]);

  const edgesFor = (nodeId: string) =>
    conflictEdges.filter((e) => e.source === nodeId || e.target === nodeId);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-nx-accent">Knowledge graph</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">How your documents relate — and where they fight.</h1>
          <p className="mt-1 max-w-2xl text-sm text-nx-text-muted">
            Departments own documents. A red line between two documents means they contradict
            each other — a relationship no folder structure would ever show you.
          </p>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 rounded-lg border border-nx-border px-3 py-2 text-xs font-medium text-nx-text-secondary transition-colors hover:bg-nx-elevated"
        >
          <RefreshCw size={13} className={cn(loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {error && <ApiFailure message={error} />}
      {loading && !error && <Loading label="Building the graph…" />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Departments", value: departments.length, icon: <Building2 size={17} />, tone: "" },
              { label: "Documents", value: data.nodes.length - departments.length, icon: <FileText size={17} />, tone: "" },
              { label: "Contradiction links", value: conflictEdges.length, icon: <AlertTriangle size={17} />, tone: "text-nx-danger" },
              { label: "Crossing departments", value: crossDept.length, icon: <Globe size={17} />, tone: "text-nx-accent" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-nx-border bg-nx-surface p-4">
                <span className={cn("block", s.tone || "text-nx-text-muted")}>{s.icon}</span>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-[11px] text-nx-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {crossDept.length > 0 && (
            <div className="rounded-2xl border border-nx-accent/25 bg-nx-accent-soft/40 p-5"
                 style={{ background: "color-mix(in srgb, var(--color-nx-accent) 6%, transparent)" }}>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-nx-accent" />
                <h2 className="text-sm font-semibold text-nx-accent">Contradictions that cross departments</h2>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-nx-text-secondary">
                These are the ones that justify open knowledge. Neither department could have
                found them alone, because neither could see the other&apos;s documents.
              </p>
              <div className="mt-3 space-y-2">
                {crossDept.map((e) => (
                  <Link
                    key={e.id}
                    href={`/conflicts/${e.conflictId}`}
                    className="block rounded-xl border border-nx-border bg-nx-surface p-3.5 transition-colors hover:border-nx-accent/40"
                  >
                    <p className="text-sm font-medium">{e.label}</p>
                    <p className="mt-1 font-mono text-[11px] text-nx-text-muted">
                      {e.source.replace("doc::", "")} ⟷ {e.target.replace("doc::", "")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {departments.map((dept) => {
              const docs = documentsByDept.get(dept.label) ?? [];
              const conflicting = docs.filter((d) => d.health === "conflicting").length;
              return (
                <div key={dept.id} className="rounded-2xl border border-nx-border bg-nx-surface p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-nx-accent" />
                      <h3 className="text-sm font-semibold">{dept.label}</h3>
                    </div>
                    <span className="text-[11px] text-nx-text-muted">{docs.length} docs</span>
                  </div>
                  {conflicting > 0 && (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-nx-danger">
                      <AlertTriangle size={10} /> {conflicting} in conflict
                    </p>
                  )}
                  <div className="mt-3 space-y-1">
                    {docs.map((doc) => {
                      const links = edgesFor(doc.id);
                      const open = selected === doc.id;
                      return (
                        <div key={doc.id}>
                          <button
                            onClick={() => setSelected(open ? null : doc.id)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                              doc.health === "conflicting"
                                ? "text-nx-danger hover:bg-nx-danger-muted/40"
                                : "text-nx-text-secondary hover:bg-nx-elevated"
                            )}
                          >
                            <span className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              doc.health === "conflicting" ? "bg-nx-danger" : "bg-nx-success"
                            )} />
                            <span className="min-w-0 flex-1 truncate">{doc.label}</span>
                            {links.length > 0 && (
                              <span className="shrink-0 rounded bg-nx-danger-muted px-1 text-[10px] font-medium text-nx-danger">
                                {links.length}
                              </span>
                            )}
                          </button>
                          {open && links.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-nx-border pl-3">
                              {links.map((link) => (
                                <Link
                                  key={link.id}
                                  href={`/conflicts/${link.conflictId}`}
                                  className="block text-[11px] text-nx-text-muted hover:text-nx-accent"
                                >
                                  ⟷ {(link.source === doc.id ? link.target : link.source).replace("doc::", "")}
                                  <span className="block text-[10px] text-nx-text-disabled">{link.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {departments.length === 0 && (
            <Empty title="No documents indexed yet." hint="Run the ingestion script to build the graph." />
          )}

          <div className="flex flex-wrap items-center gap-5 rounded-xl border border-nx-border bg-nx-surface px-5 py-3 text-[11px] text-nx-text-muted">
            <span className="flex items-center gap-1.5"><Brain size={12} className="text-nx-accent" /> Click a document to see what it contradicts</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-nx-success" /> consistent</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-nx-danger" /> in conflict</span>
          </div>
        </>
      )}
    </div>
  );
}
