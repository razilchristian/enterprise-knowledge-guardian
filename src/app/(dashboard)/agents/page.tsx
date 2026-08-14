"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot, Play, Copy, Activity, ChevronRight, Plus,
  FileSearch, ShieldCheck, Lock, Code, Users, AlertTriangle,
  FileText, BarChart3, Loader2, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import { useApi } from "@/lib/use-api";
import { listAgents, runAgent, type AgentRecord, type RunAgentResult } from "@/lib/api";
import { Loading, ApiFailure } from "@/components/ui/api-state";

const iconMap: Record<string, React.ReactNode> = {
  "file-search": <FileSearch size={20} />,
  "shield-check": <ShieldCheck size={20} />,
  "lock": <Lock size={20} />,
  "code": <Code size={20} />,
  "users": <Users size={20} />,
  "alert-triangle": <AlertTriangle size={20} />,
  "file-text": <FileText size={20} />,
  "activity": <BarChart3 size={20} />,
};

const statusStyle: Record<string, string> = {
  Active: "bg-nx-success-muted text-nx-success",
  Idle: "bg-nx-elevated text-nx-text-muted",
  Running: "bg-nx-accent-muted text-nx-accent animate-pulse",
  Error: "bg-nx-danger-muted text-nx-danger",
  Paused: "bg-nx-warning-muted text-nx-warning",
};

export default function AgentsPage() {
  const { data, loading, error, reload } = useApi(listAgents);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RunAgentResult | null>(null);

  const handleRunAgent = async (agentId: string) => {
    setRunningAgentId(agentId);
    setLastResult(null);
    try {
      const res = await runAgent(agentId, "Sarah Chen (HR Lead)");
      setLastResult(res);
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAgentId(null);
    }
  };

  if (loading) return <Loading label="Loading agent catalog..." />;
  if (error) return <ApiFailure message={error} />;

  const agentList: AgentRecord[] = data?.agents ?? [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">AI Agents</h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-nx-success-muted text-nx-success border border-nx-success/30">
              Live Engine Connected
            </span>
          </div>
          <p className="text-sm text-nx-text-muted mt-0.5">
            Autonomous enterprise AI workers executing real-time document audits over MongoDB Atlas
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Create Agent
        </button>
      </div>

      {/* Execution Result Banner */}
      {lastResult && (
        <div className="rounded-xl border border-nx-success/40 bg-nx-success-muted/20 p-4 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-nx-success shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-semibold text-nx-text-primary">
                  {lastResult.agent_name} Executed Successfully
                </p>
                <p className="text-xs text-nx-text-secondary mt-1">
                  {lastResult.summary}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-nx-text-muted">
                  <span>Docs Scanned: {lastResult.documents_scanned}</span>
                  <span>Chunks Analyzed: {lastResult.chunks_analyzed}</span>
                  <span>Duration: {lastResult.duration}</span>
                </div>
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

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agentList.map((agent) => {
          const isRunning = runningAgentId === agent.id;

          return (
            <div
              key={agent.id}
              className="bg-nx-surface border border-nx-border rounded-xl p-5 hover:border-nx-border-strong transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-nx-elevated border border-nx-border text-nx-accent">
                    {iconMap[agent.icon] || <Bot size={20} />}
                  </div>
                  <div>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="text-sm font-semibold text-nx-text-primary group-hover:text-nx-accent transition-colors"
                    >
                      {agent.name}
                    </Link>
                    <p className="text-[11px] text-nx-text-muted mt-0.5">{agent.department}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-mono font-medium px-2 py-0.5 rounded",
                    statusStyle[isRunning ? "Running" : agent.status]
                  )}
                >
                  {isRunning ? "Running..." : agent.status}
                </span>
              </div>

              <p className="text-xs text-nx-text-secondary leading-relaxed mb-4 line-clamp-2">
                {agent.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-nx-border">
                <div>
                  <p className="text-sm font-semibold">{agent.runs.toLocaleString()}</p>
                  <p className="text-[10px] text-nx-text-muted">Runs</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-nx-success">{agent.successRate}%</p>
                  <p className="text-[10px] text-nx-text-muted">Success</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{agent.avgDuration}</p>
                  <p className="text-[10px] text-nx-text-muted">Avg Duration</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <RelativeTime
                  date={new Date(agent.lastRun)}
                  prefix="Last run "
                  className="text-[11px] text-nx-text-disabled font-mono"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRunAgent(agent.id)}
                    disabled={isRunning}
                    className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-success hover:bg-nx-success-muted transition-colors disabled:opacity-50"
                    aria-label="Run agent"
                  >
                    {isRunning ? <Loader2 size={14} className="animate-spin text-nx-accent" /> : <Play size={14} />}
                  </button>
                  <button
                    className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors"
                    aria-label="Duplicate agent"
                  >
                    <Copy size={14} />
                  </button>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-accent hover:bg-nx-accent-muted transition-colors"
                  >
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
