"use client";

import Link from "next/link";
import { GitBranch, Play, Plus, ChevronRight, Pause, Edit, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { workflows } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import type { WorkflowStatus } from "@/types";
import RoadmapNotice from "@/components/ui/roadmap-notice";

const statusStyle: Record<WorkflowStatus, string> = {
  Active: "bg-nx-success-muted text-nx-success",
  Draft: "bg-nx-elevated text-nx-text-muted",
  Paused: "bg-nx-warning-muted text-nx-warning",
  Archived: "bg-nx-elevated text-nx-text-disabled",
};

export default function WorkflowsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <RoadmapNotice what="These workflows are designed, not yet executable: there is no workflow engine behind this screen." />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-sm text-nx-text-muted mt-0.5">Automated enterprise workflows powered by AI agents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Create Workflow
        </button>
      </div>

      <div className="bg-nx-surface border border-nx-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nx-border">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Workflow</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Runs</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Success</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden md:table-cell">Last Run</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Owner</th>
              <th className="px-3 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-border">
            {workflows.map((wf) => (
              <tr key={wf.id} className="hover:bg-nx-elevated/30 transition-colors group">
                <td className="px-5 py-3.5">
                  <Link href={`/workflows/${wf.id}`} className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-nx-elevated border border-nx-border">
                      <GitBranch size={16} className="text-nx-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-nx-text-primary group-hover:text-nx-accent transition-colors truncate">{wf.name}</p>
                      <p className="text-xs text-nx-text-muted mt-0.5 truncate">{wf.description}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-3.5 hidden md:table-cell">
                  <span className={cn("text-[11px] font-mono font-medium px-2 py-0.5 rounded", statusStyle[wf.status])}>{wf.status}</span>
                </td>
                <td className="px-3 py-3.5 text-sm text-nx-text-secondary hidden lg:table-cell font-mono">{wf.runs.toLocaleString()}</td>
                <td className="px-3 py-3.5 hidden lg:table-cell">
                  <span className={cn("text-xs font-mono", wf.successRate >= 95 ? "text-nx-success" : wf.successRate >= 80 ? "text-nx-warning" : "text-nx-text-muted")}>
                    {wf.successRate > 0 ? `${wf.successRate}%` : "—"}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-xs text-nx-text-muted font-mono hidden md:table-cell">{formatRelativeTime(wf.lastRun)}</td>
                <td className="px-3 py-3.5 text-sm text-nx-text-secondary hidden lg:table-cell">{wf.owner}</td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-success hover:bg-nx-success-muted transition-colors" aria-label="Run"><Play size={14} /></button>
                    <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors" aria-label="Edit"><Edit size={14} /></button>
                    <Link href={`/workflows/${wf.id}`} className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-accent hover:bg-nx-accent-muted transition-colors">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
