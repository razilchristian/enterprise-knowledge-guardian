"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Play, Plus, ChevronRight, Edit, Loader2, CheckCircle2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { listWorkflows, runWorkflow, type WorkflowRecord } from "@/lib/api";
import { Loading, ApiFailure } from "@/components/ui/api-state";

const statusStyle: Record<string, string> = {
  Active: "bg-nx-success-muted text-nx-success",
  Draft: "bg-nx-elevated text-nx-text-muted",
  Paused: "bg-nx-warning-muted text-nx-warning",
  Archived: "bg-nx-elevated text-nx-text-disabled",
};

export default function WorkflowsPage() {
  const { data, loading, error, reload } = useApi(listWorkflows);
  const [runningWfId, setRunningWfId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any | null>(null);

  const handleRunWorkflow = async (workflowId: string) => {
    setRunningWfId(workflowId);
    setLastResult(null);
    try {
      const res = await runWorkflow(workflowId, "Alex Morgan");
      setLastResult(res);
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningWfId(null);
    }
  };

  if (loading) return <Loading label="Loading workflows..." />;
  if (error) return <ApiFailure message={error} />;



  const workflowList: WorkflowRecord[] = data?.workflows ?? [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Workflows</h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-nx-success-muted text-nx-success border border-nx-success/30">
              Pipeline Execution Engine Live
            </span>
          </div>
          <p className="text-sm text-nx-text-muted mt-0.5">
            Automated enterprise pipelines executing document ingestion, audits, and conflict detection
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Create Workflow
        </button>
      </div>

      {/* Result Banner */}
      {lastResult && (
        <div className="rounded-xl border border-nx-success/40 bg-nx-success-muted/20 p-4 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-nx-success shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-nx-text-primary">
                  {lastResult.workflow_name} Executed Successfully
                </p>
                <p className="text-xs text-nx-text-secondary mt-1">
                  {lastResult.summary}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastResult(null)}
              className="text-xs text-nx-text-muted hover:text-nx-text-primary"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
            {workflowList.map((wf) => {
              const isRunning = runningWfId === wf.id;

              return (
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
                  <td className="px-3 py-3.5 text-xs text-nx-text-muted font-mono hidden md:table-cell">{formatRelativeTime(new Date(wf.lastRun))}</td>
                  <td className="px-3 py-3.5 text-sm text-nx-text-secondary hidden lg:table-cell">{wf.owner}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRunWorkflow(wf.id)}
                        disabled={isRunning}
                        className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-success hover:bg-nx-success-muted transition-colors disabled:opacity-50"
                        aria-label="Run"
                      >
                        {isRunning ? <Loader2 size={14} className="animate-spin text-nx-accent" /> : <Play size={14} />}
                      </button>
                      <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors" aria-label="Edit"><Edit size={14} /></button>
                      <Link href={`/workflows/${wf.id}`} className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-accent hover:bg-nx-accent-muted transition-colors">
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
