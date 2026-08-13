"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ChevronRight, CheckCircle, XCircle, Eye, ShieldCheck, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conflicts } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import type { ConflictSeverity, ConflictStatus } from "@/types";

const severityStyle: Record<ConflictSeverity, string> = {
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

export default function ConflictsPage() {
  const [filter, setFilter] = useState<ConflictSeverity | "All">("All");
  const highCount = conflicts.filter((c) => c.severity === "High" && c.status !== "Resolved").length;
  const medCount = conflicts.filter((c) => c.severity === "Medium" && c.status !== "Resolved").length;
  const lowCount = conflicts.filter((c) => c.severity === "Low" && c.status !== "Resolved").length;
  const activeCount = conflicts.filter((c) => c.status !== "Resolved" && c.status !== "Dismissed").length;

  const filtered = filter === "All" ? conflicts : conflicts.filter((c) => c.severity === filter);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      {/* Hero */}
      <div className="relative overflow-hidden bg-nx-surface border border-nx-border rounded-2xl p-6 bg-grid shadow-sm md:p-7">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-nx-danger/10 blur-3xl" />
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-nx-danger-muted border border-nx-danger/20">
            <AlertTriangle size={24} className="text-nx-danger" />
          </div>
          <div className="relative">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-nx-danger uppercase">Risk control center</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Resolve contradictions before they spread.</h1>
            <p className="text-sm text-nx-text-muted mt-1">Nexora compares policy meaning, not just keywords, and routes every decision through the right people.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-nx-bg/60 border border-nx-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold">{activeCount}</p>
            <p className="text-[11px] text-nx-text-muted mt-1">Active Conflicts</p>
          </div>
          <div className="bg-nx-bg/60 border border-nx-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-nx-danger">{highCount}</p>
            <p className="text-[11px] text-nx-text-muted mt-1">High Risk</p>
          </div>
          <div className="bg-nx-bg/60 border border-nx-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-nx-warning">{medCount}</p>
            <p className="text-[11px] text-nx-text-muted mt-1">Medium Risk</p>
          </div>
          <div className="bg-nx-bg/60 border border-nx-border rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-nx-success">{lowCount}</p>
            <p className="text-[11px] text-nx-text-muted mt-1">Low Risk</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-nx-surface border border-nx-border rounded-xl p-1">
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
      </div>

      {/* Conflict Table */}
      <div className="bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nx-border bg-nx-elevated/35">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider w-20">Severity</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Conflict</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden md:table-cell">Documents</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Department</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Detected</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Status</th>
              <th className="px-3 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-border">
            {filtered.map((conflict) => (
              <tr key={conflict.id} className="hover:bg-nx-elevated/60 transition-colors group">
                <td className="px-5 py-3.5">
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 rounded border", severityStyle[conflict.severity])}>
                    {conflict.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <Link href={`/conflicts/${conflict.id}`} className="block">
                    <p className="text-sm font-medium text-nx-text-primary group-hover:text-nx-accent transition-colors">{conflict.title}</p>
                    <p className="text-xs text-nx-text-muted mt-0.5 line-clamp-1">{conflict.description}</p>
                  </Link>
                </td>
                <td className="px-3 py-3.5 hidden md:table-cell">
                  <div className="text-xs text-nx-text-secondary space-y-0.5">
                    <p>{conflict.documentA.name}</p>
                    <p>{conflict.documentB.name}</p>
                  </div>
                </td>
                <td className="px-3 py-3.5 hidden lg:table-cell">
                  <span className="text-xs text-nx-text-muted">{conflict.departments.join(", ")}</span>
                </td>
                <td className="px-3 py-3.5 text-xs text-nx-text-muted font-mono hidden lg:table-cell">
                  {formatRelativeTime(conflict.detectedAt)}
                </td>
                <td className="px-3 py-3.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded",
                    conflict.status === "Open" ? "bg-nx-accent-muted text-nx-accent" :
                    conflict.status === "In Review" ? "bg-nx-warning-muted text-nx-warning" :
                    conflict.status === "Resolved" ? "bg-nx-success-muted text-nx-success" :
                    "bg-nx-elevated text-nx-text-muted"
                  )}>
                    {statusIcon[conflict.status]}
                    {conflict.status}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <Link href={`/conflicts/${conflict.id}`}>
                    <ChevronRight size={16} className="text-nx-text-disabled group-hover:text-nx-text-muted transition-colors" />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-nx-text-muted">No conflicts match this filter.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
