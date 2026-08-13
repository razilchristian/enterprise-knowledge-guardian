"use client";

import { useState } from "react";
import {
  FileText, Database, Bot, Clock, AlertTriangle, AlertCircle, Zap,
  TrendingUp, TrendingDown, Paperclip, Mic, ChevronRight, ArrowUpRight,
  Shield, Eye, CheckCircle, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardMetrics, intelligenceFeed } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import { usePersona } from "@/lib/persona";
import type { Role } from "@/types";
import Link from "next/link";

const iconMap: Record<string, React.ReactNode> = {
  "file-text": <FileText size={18} />,
  "database": <Database size={18} />,
  "bot": <Bot size={18} />,
  "clock": <Clock size={18} />,
  "alert-triangle": <AlertTriangle size={18} />,
  "alert-circle": <AlertCircle size={18} />,
  "zap": <Zap size={18} />,
};

const severityStyles: Record<string, string> = {
  high: "bg-nx-danger-muted text-nx-danger border-nx-danger/20",
  medium: "bg-nx-warning-muted text-nx-warning border-nx-warning/20",
  low: "bg-nx-success-muted text-nx-success border-nx-success/20",
  info: "bg-nx-accent-muted text-nx-accent border-nx-accent/20",
};

const severityIcons: Record<string, React.ReactNode> = {
  conflict: <AlertTriangle size={16} />,
  stale: <Clock size={16} />,
  agent: <Bot size={16} />,
  approval: <CheckCircle size={16} />,
  insight: <Eye size={16} />,
  security: <Shield size={16} />,
};

/**
 * The lens. Every role queries the same corpus and can open every document;
 * the lens only decides what the platform puts in front of you first.
 * Nothing here removes information — a narrower lens still links to the whole set.
 */
interface Lens {
  subtitle: string;
  /** Metric labels surfaced first for this role, in order. */
  metrics: string[];
  /** Feed categories this role is put in front of. */
  feedTypes: string[];
  queries: string[];
  actions: { label: string; icon: React.ReactNode; href: string }[];
}

const lenses: Record<Role, Lens> = {
  Employee: {
    subtitle: "Ask anything about company policy. You can read every document here, from every department.",
    metrics: ["Documents Indexed", "Knowledge Sources", "Detected Conflicts", "Outdated Documents"],
    feedTypes: ["conflict", "stale", "insight"],
    queries: [
      "How many casual leave days am I entitled to?",
      "What is the equipment return deadline when I leave?",
      "What does Legal say about NDAs for contractors?",
      "Show me every policy that changed this month.",
    ],
    actions: [
      { label: "Ask a policy question", icon: <MessageSquare size={16} />, href: "/workspace" },
      { label: "Browse all departments", icon: <FileText size={16} />, href: "/documents" },
      { label: "See open conflicts", icon: <AlertTriangle size={16} />, href: "/conflicts" },
      { label: "View knowledge graph", icon: <Eye size={16} />, href: "/knowledge" },
    ],
  },
  "Department Owner": {
    subtitle: "Conflicts touching documents you own, plus everything else the organization has published.",
    metrics: ["Detected Conflicts", "Pending Reviews", "Outdated Documents", "Documents Indexed", "AI Actions Today"],
    feedTypes: ["conflict", "stale", "approval", "agent", "security"],
    queries: [
      "Which of my documents contradict another department?",
      "Compare our employee handbook against the latest HR policy.",
      "What did the last policy update make outdated?",
      "Which documents am I the owner of?",
    ],
    actions: [
      { label: "Resolve open conflicts", icon: <AlertTriangle size={16} />, href: "/conflicts" },
      { label: "Ask a policy question", icon: <MessageSquare size={16} />, href: "/workspace" },
      { label: "Upload documents", icon: <FileText size={16} />, href: "/documents" },
      { label: "Run an agent", icon: <Bot size={16} />, href: "/agents" },
      { label: "Build workflow", icon: <Zap size={16} />, href: "/workflows" },
    ],
  },
  Director: {
    subtitle: "Where the organization currently disagrees with itself, and what is waiting on your sign-off.",
    metrics: ["Detected Conflicts", "Pending Reviews", "Outdated Documents", "Documents Indexed", "Knowledge Sources", "Active Agents", "AI Actions Today"],
    feedTypes: ["conflict", "approval", "stale", "agent", "insight", "security"],
    queries: [
      "Where do departments contradict each other right now?",
      "Which conflicts have been open longest?",
      "What is waiting on my approval?",
      "Which departments have the weakest knowledge health?",
    ],
    actions: [
      { label: "Review approvals", icon: <CheckCircle size={16} />, href: "/conflicts" },
      { label: "Run conflict detection", icon: <AlertTriangle size={16} />, href: "/conflicts" },
      { label: "View knowledge graph", icon: <Eye size={16} />, href: "/knowledge" },
      { label: "Ask a policy question", icon: <MessageSquare size={16} />, href: "/workspace" },
      { label: "Build workflow", icon: <Zap size={16} />, href: "/workflows" },
    ],
  },
};

export default function DashboardPage() {
  const [commandValue, setCommandValue] = useState("");
  const { user, persona } = usePersona();
  const lens = lenses[persona.role];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

  // Order the shared metric set by this lens, dropping nothing the role cares about.
  const metrics = lens.metrics
    .map((label) => dashboardMetrics.find((m) => m.label === label))
    .filter((m): m is (typeof dashboardMetrics)[number] => Boolean(m));

  const feed = intelligenceFeed.filter((event) => lens.feedTypes.includes(event.type));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}, {firstName}.</h1>
          <p className="text-sm text-nx-text-muted mt-1 max-w-2xl">{lens.subtitle}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-nx-border bg-nx-elevated px-2.5 py-1.5 text-[11px] font-medium text-nx-text-muted">
          <Eye size={11} className="text-nx-accent" />
          {persona.role} view
        </span>
      </div>

      {/* AI Command Input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-nx-accent/20 to-nx-cyan/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-nx-surface border border-nx-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nx-accent to-nx-cyan flex items-center justify-center shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <input
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
              placeholder="Ask Guardian anything — every department's knowledge is in scope..."
              className="flex-1 bg-transparent text-sm text-nx-text-primary placeholder:text-nx-text-muted outline-none"
            />
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors" aria-label="Attach document">
                <Paperclip size={16} />
              </button>
              <button className="p-1.5 rounded-md text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors" aria-label="Voice input">
                <Mic size={16} />
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-xs font-medium transition-colors">
                Ask AI
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {lens.queries.map((q, i) => (
              <button
                key={i}
                onClick={() => setCommandValue(q)}
                className="text-[11px] text-nx-text-muted bg-nx-elevated hover:bg-nx-overlay px-2.5 py-1 rounded-md border border-nx-border hover:border-nx-border-strong transition-colors truncate max-w-[300px]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-3",
        metrics.length > 5 ? "lg:grid-cols-7" : "lg:grid-cols-5"
      )}>
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="bg-nx-surface border border-nx-border rounded-lg p-4 hover:border-nx-border-strong transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-nx-text-muted">{iconMap[metric.icon]}</span>
              <span className={cn(
                "flex items-center gap-0.5 text-[11px] font-mono font-medium",
                metric.trend === "up" && metric.label !== "Detected Conflicts" && metric.label !== "Outdated Documents" ? "text-nx-success" : "",
                metric.trend === "down" && (metric.label === "Pending Reviews" || metric.label === "Outdated Documents") ? "text-nx-success" : "",
                metric.trend === "up" && (metric.label === "Detected Conflicts") ? "text-nx-warning" : "",
              )}>
                {metric.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {metric.change > 0 ? "+" : ""}{metric.change}%
              </span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{metric.value}</p>
            <p className="text-[11px] text-nx-text-muted mt-0.5">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Intelligence Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intelligence Feed */}
        <div className="lg:col-span-2 bg-nx-surface border border-nx-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-nx-border">
            <div>
              <h2 className="text-sm font-semibold">Intelligence Feed</h2>
              <p className="text-[11px] text-nx-text-muted mt-0.5">
                Surfaced for {persona.role.toLowerCase()}s · drawn from all 6 departments
              </p>
            </div>
            <Link href="/activity" className="text-xs text-nx-accent hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-nx-border">
            {feed.slice(0, 6).map((event) => (
              <div key={event.id} className="px-5 py-4 hover:bg-nx-elevated/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-0.5 p-1.5 rounded-md border",
                    severityStyles[event.severity]
                  )}>
                    {severityIcons[event.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{event.title}</p>
                      <span className={cn(
                        "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border",
                        severityStyles[event.severity]
                      )}>
                        {event.severity}
                      </span>
                    </div>
                    <p className="text-xs text-nx-text-muted mt-1">{event.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-nx-text-disabled font-mono">{formatRelativeTime(event.timestamp)}</span>
                      <span className="text-[11px] text-nx-text-disabled">via {event.source}</span>
                    </div>
                  </div>
                  <Link
                    href={event.actionUrl}
                    className="shrink-0 text-xs text-nx-accent hover:text-nx-accent-hover bg-nx-accent-muted hover:bg-nx-accent/15 px-2.5 py-1.5 rounded-md transition-colors font-medium"
                  >
                    {event.actionLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-nx-surface border border-nx-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {lens.actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-nx-text-secondary hover:text-nx-text-primary hover:bg-nx-elevated transition-colors"
                >
                  <span className="text-nx-text-muted">{action.icon}</span>
                  <span>{action.label}</span>
                  <ChevronRight size={14} className="ml-auto text-nx-text-disabled" />
                </Link>
              ))}
            </div>
          </div>

          {/* Knowledge Health Summary */}
          <div className="bg-nx-surface border border-nx-border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Knowledge Health</h2>
            <div className="space-y-3">
              {[
                { label: "Policy Documents", health: 92, color: "bg-nx-success" },
                { label: "HR Documentation", health: 88, color: "bg-nx-success" },
                { label: "Engineering Docs", health: 76, color: "bg-nx-warning" },
                { label: "Security Protocols", health: 64, color: "bg-nx-danger" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-nx-text-secondary">{item.label}</span>
                    <span className="text-xs font-mono text-nx-text-muted">{item.health}%</span>
                  </div>
                  <div className="h-1.5 bg-nx-elevated rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.health}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
