"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ChevronRight, CheckCircle, XCircle, Eye, Loader2,
  WifiOff, Globe, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import {
  ApiError, listConflicts,
  type ConflictStatus, type ConflictSummary, type StoredConflict,
} from "@/lib/api";

const severityStyle: Record<string, string> = {
  High: "bg-nx-danger-muted text-nx-danger border-nx-danger/20",
  Medium: "bg-nx-warning-muted text-nx-warning border-nx-warning/20",
  Low: "bg-nx-success-muted text-nx-success border-nx-success/20",
};

const statusIcon: Record<ConflictStatus, React.ReactNode> = {
  Open: <AlertTriangle size={12} />,
  "In Review": <Eye size={12} />,
  Resolved: <CheckCircle size={12} />,
  Dismissed: <XCircle size={12} />,
};

const statusStyle: Record<ConflictStatus, string> = {
  Open: "bg-nx-accent-muted text-nx-accent",
  "In Review": "bg-nx-warning-muted text-nx-warning",
  Resolved: "bg-nx-success-muted text-nx-success",
  Dismissed: "bg-nx-elevated text-nx-text-muted",
};

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<StoredConflict[]>([]);
  const [summary, setSummary] = useState<ConflictSummary | null>(null);
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kept free of synchronous setState so it is safe to call straight from an
  // effect; the spinner state is already true on mount.
  const fetchConflicts = useCallback(() => {
    listConflicts()
      .then(({ conflicts, summary }) => {
        setConflicts(conflicts);
        setSummary(summary);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load conflicts."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConflicts();
  }, [fetchConflicts]);

  const refresh = () => {
    setLoading(true);
    fetchConflicts();
  };

  const filtered = filter === "All" ? conflicts : conflicts.filter((c) => c.severity === filter);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      {/* Hero */}
      <div className="relative overflow-hidden bg-nx-surface border border-nx-border rounded-2xl p-6 shadow-sm md:p-7">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-nx-danger/10 blur-3xl" />
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-nx-danger-muted border border-nx-danger/20">
            <AlertTriangle size={24} className="text-nx-danger" />
          </div>
          <div className="relative flex-1">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-nx-danger uppercase">Risk control center</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Resolve contradictions before they spread.</h1>
            <p className="text-sm text-nx-text-muted mt-1">
              Every conflict below was found by comparing what your documents actually say, across all six departments.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-nx-border px-3 py-2 text-xs font-medium text-nx-text-secondary transition-colors hover:bg-nx-elevated disabled:opacity-50"
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { value: summary?.active, label: "Active Conflicts", tone: "" },
            { value: summary?.high, label: "High Risk", tone: "text-nx-danger" },
            { value: summary?.medium, label: "Medium Risk", tone: "text-nx-warning" },
            { value: summary?.crossDepartment, label: "Cross-Department", tone: "text-nx-accent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-nx-bg/60 border border-nx-border rounded-xl p-4 text-center">
              <p className={cn("text-2xl font-semibold", stat.tone)}>
                {loading ? "—" : stat.value ?? 0}
              </p>
              <p className="text-[11px] text-nx-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 bg-nx-surface border border-nx-border rounded-xl p-1 w-fit">
        {(["All", "High", "Medium", "Low"] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === sev ? "bg-nx-accent-muted text-nx-accent" : "text-nx-text-muted hover:text-nx-text-secondary"
            )}
          >
            {sev}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-nx-danger/25 bg-nx-danger-muted/40 p-5">
          <WifiOff size={17} className="mt-0.5 shrink-0 text-nx-danger" />
          <div>
            <p className="text-sm font-semibold text-nx-danger">Could not load conflicts</p>
            <p className="mt-1 text-xs leading-relaxed text-nx-text-secondary">{error}</p>
          </div>
        </div>
      )}

      {loading && !error && (
        <div className="flex items-center gap-2 rounded-2xl border border-nx-border bg-nx-surface p-8 text-sm text-nx-text-muted">
          <Loader2 size={15} className="animate-spin text-nx-accent" /> Loading detected conflicts…
        </div>
      )}

      {!loading && !error && conflicts.length === 0 && (
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-10 text-center">
          <p className="text-sm font-medium">No conflicts detected yet.</p>
          <p className="mt-1 text-xs text-nx-text-muted">
            Ask questions in the workspace, or run{" "}
            <code className="rounded bg-nx-elevated px-1.5 py-0.5 font-mono text-[11px]">
              python -m scripts.detect_all
            </code>{" "}
            to sweep the corpus.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-nx-border bg-nx-elevated/35">
                  <th className="text-left px-5 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider w-20">Severity</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Conflict</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Disagreeing sources</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Departments</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Detected</th>
                  <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nx-border">
                {filtered.map((conflict) => (
                  <tr key={conflict.fingerprint} className="hover:bg-nx-elevated/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 rounded border", severityStyle[conflict.severity] ?? severityStyle.Medium)}>
                        {conflict.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <Link href={`/conflicts/${conflict.fingerprint}`} className="block">
                        <p className="text-sm font-medium text-nx-text-primary group-hover:text-nx-accent transition-colors">
                          {conflict.title}
                        </p>
                        <p className="text-xs text-nx-text-muted mt-0.5 line-clamp-1">{conflict.explanation}</p>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">
                      {/* The values, side by side — this is the whole point of the row. */}
                      <div className="flex flex-wrap gap-1">
                        {conflict.claims.map((claim, i) => (
                          <span key={i} className="rounded bg-nx-danger-muted px-1.5 py-0.5 text-[11px] font-medium text-nx-danger">
                            {claim.value}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-[10px] text-nx-text-disabled">
                        {conflict.claimCount} sources disagree
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="text-xs text-nx-text-muted">{conflict.departments.join(", ")}</span>
                      {conflict.crossDepartment && (
                        <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-nx-accent">
                          <Globe size={9} /> cross-department
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <RelativeTime
                        date={new Date(conflict.detectedAt * 1000)}
                        className="text-xs text-nx-text-muted font-mono"
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded", statusStyle[conflict.status])}>
                        {statusIcon[conflict.status]}
                        {conflict.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <Link href={`/conflicts/${conflict.fingerprint}`}>
                        <ChevronRight size={16} className="text-nx-text-disabled group-hover:text-nx-text-muted transition-colors" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && conflicts.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl border border-nx-border bg-nx-surface p-10 text-center text-sm text-nx-text-muted">
          No {filter.toLowerCase()}-severity conflicts.
        </div>
      )}
    </div>
  );
}
