"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, Play, Settings, Upload, FileInput,
  Scissors, CheckCircle, AlertTriangle, FileText, UserCheck,
  ArrowDown, Clock, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { agents, contractReviewNodes } from "@/data";
import { formatRelativeTime } from "@/lib/utils";

const nodeIconMap: Record<string, React.ReactNode> = {
  "upload": <Upload size={18} />,
  "file-input": <FileInput size={18} />,
  "scissors": <Scissors size={18} />,
  "check-circle": <CheckCircle size={18} />,
  "alert-triangle": <AlertTriangle size={18} />,
  "file-text": <FileText size={18} />,
  "user-check": <UserCheck size={18} />,
};

const nodeStatusStyle: Record<string, { bg: string; border: string; icon: string }> = {
  completed: { bg: "bg-nx-success/8", border: "border-nx-success/30", icon: "text-nx-success" },
  running: { bg: "bg-nx-accent/8", border: "border-nx-accent/30", icon: "text-nx-accent" },
  pending: { bg: "bg-nx-elevated", border: "border-nx-border", icon: "text-nx-text-muted" },
  error: { bg: "bg-nx-danger/8", border: "border-nx-danger/30", icon: "text-nx-danger" },
};

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id) || agents[0];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/agents" className="flex items-center gap-1 text-nx-text-muted hover:text-nx-accent transition-colors">
          <ArrowLeft size={14} /> Agents
        </Link>
        <ChevronRight size={14} className="text-nx-text-disabled" />
        <span className="text-nx-text-secondary truncate">{agent.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-nx-elevated border border-nx-border">
            <Bot size={24} className="text-nx-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{agent.name}</h1>
            <p className="text-sm text-nx-text-muted mt-1">{agent.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-nx-text-muted">Owner: <span className="text-nx-text-secondary">{agent.owner}</span></span>
              <span className="text-xs text-nx-text-muted">Dept: <span className="text-nx-text-secondary">{agent.department}</span></span>
              <span className="text-xs text-nx-text-disabled font-mono">Last run {formatRelativeTime(agent.lastRun)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors">
            <Play size={14} /> Run Agent
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-nx-border text-sm text-nx-text-secondary hover:bg-nx-elevated transition-colors">
            <Settings size={14} /> Configure
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4">
          <p className="text-xl font-semibold">{agent.runs.toLocaleString()}</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">Total Runs</p>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4">
          <p className="text-xl font-semibold text-nx-success">{agent.successRate}%</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">Success Rate</p>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4">
          <p className="text-xl font-semibold">{agent.avgDuration}</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">Avg Duration</p>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4">
          <p className="text-xl font-semibold">{agent.documentsProcessed.toLocaleString()}</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">Documents Processed</p>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="bg-nx-surface border border-nx-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-nx-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Agent Workflow</h2>
          <span className="text-[11px] text-nx-text-disabled font-mono">{contractReviewNodes.length} steps</span>
        </div>
        <div className="p-8 flex flex-col items-center gap-0">
          {contractReviewNodes.map((node, i) => {
            const style = nodeStatusStyle[node.status];
            return (
              <div key={node.id} className="flex flex-col items-center">
                {/* Node */}
                <div className={cn(
                  "w-[400px] p-4 rounded-xl border-2 transition-all hover:shadow-lg",
                  style.bg, style.border
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg bg-nx-bg/50", style.icon)}>
                      {nodeIconMap[node.icon] || <CheckCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-nx-text-primary">{node.title}</p>
                        <span className={cn(
                          "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded",
                          node.status === "completed" ? "bg-nx-success-muted text-nx-success" :
                          node.status === "running" ? "bg-nx-accent-muted text-nx-accent" :
                          node.status === "pending" ? "bg-nx-elevated text-nx-text-muted" :
                          "bg-nx-danger-muted text-nx-danger"
                        )}>
                          {node.status}
                        </span>
                      </div>
                      <p className="text-xs text-nx-text-muted mt-1">{node.description}</p>
                      {node.details && (
                        <p className="text-[11px] text-nx-text-disabled font-mono mt-2 flex items-center gap-1">
                          <Clock size={10} /> {node.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Arrow */}
                {i < contractReviewNodes.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-px h-6 bg-nx-border-strong" />
                    <ArrowDown size={14} className="text-nx-text-disabled -mt-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
