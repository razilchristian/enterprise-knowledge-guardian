"use client";

import Link from "next/link";
import {
  Bot, Play, Copy, Activity, ChevronRight, Plus,
  FileSearch, ShieldCheck, Lock, Code, Users, AlertTriangle,
  FileText, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { agents } from "@/data";
import RelativeTime from "@/components/ui/relative-time";
import type { AgentStatus } from "@/types";

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

const statusStyle: Record<AgentStatus, string> = {
  Active: "bg-nx-success-muted text-nx-success",
  Idle: "bg-nx-elevated text-nx-text-muted",
  Running: "bg-nx-accent-muted text-nx-accent",
  Error: "bg-nx-danger-muted text-nx-danger",
  Paused: "bg-nx-warning-muted text-nx-warning",
};

export default function AgentsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI Agents</h1>
          <p className="text-sm text-nx-text-muted mt-0.5">Reusable enterprise AI workers for automated analysis and monitoring</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Create Agent
        </button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
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
                  <Link href={`/agents/${agent.id}`} className="text-sm font-semibold text-nx-text-primary group-hover:text-nx-accent transition-colors">
                    {agent.name}
                  </Link>
                  <p className="text-[11px] text-nx-text-muted mt-0.5">{agent.department}</p>
                </div>
              </div>
              <span className={cn("text-[10px] font-mono font-medium px-2 py-0.5 rounded", statusStyle[agent.status])}>
                {agent.status}
              </span>
            </div>

            <p className="text-xs text-nx-text-secondary leading-relaxed mb-4 line-clamp-2">{agent.description}</p>

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
              <RelativeTime date={agent.lastRun} prefix="Last run " className="text-[11px] text-nx-text-disabled font-mono" />
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-success hover:bg-nx-success-muted transition-colors" aria-label="Run agent">
                  <Play size={14} />
                </button>
                <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors" aria-label="Duplicate agent">
                  <Copy size={14} />
                </button>
                <Link href={`/agents/${agent.id}`} className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-accent hover:bg-nx-accent-muted transition-colors">
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
