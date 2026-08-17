"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Database, AlertTriangle, Zap, ChevronRight, ArrowUpRight,
  Eye, CheckCircle, MessageSquare, Globe, Layers, Activity as ActivityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import { ApiFailure, Loading } from "@/components/ui/api-state";
import { useApi } from "@/lib/use-api";
import { usePersona } from "@/lib/persona";
import { getStats, listActivity, listConflicts } from "@/lib/api";
import type { Role } from "@/types";

/** What each role is put in front of first. Never what they may see. */
const LENS: Record<Role, { subtitle: string; queries: string[] }> = {
  Employee: {
    subtitle: "Ask anything about company policy. You can read every document here, from every department.",
    queries: [
      "How many casual leave days do I get?",
      "What is the equipment return deadline when I leave?",
      "When will I receive my experience letter?",
      "How do I request time off?",
    ],
  },
  "Department Owner": {
    subtitle: "Contradictions touching documents you own, plus everything else the organization has published.",
    queries: [
      "Which of my documents contradict another department?",
      "How long do we retain personal data?",
      "What is the vendor liability cap?",
      "How often are performance reviews conducted?",
    ],
  },
  Director: {
    subtitle: "Where the organization currently disagrees with itself, and what is waiting on your sign-off.",
    queries: [
      "How long do we retain personal data?",
      "How many casual leave days do I get?",
      "What is the vendor liability cap?",
      "When must equipment be returned after termination?",
    ],
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, persona } = usePersona();
  const stats = useApi(getStats);
  const conflicts = useApi(listConflicts);
  const activity = useApi(listActivity);

  const [question, setQuestion] = useState("");
  const lens = LENS[persona.role];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const ask = (q: string) => {
    if (!q.trim()) return;
    router.push(`/workspace?q=${encodeURIComponent(q.trim())}`);
  };

  const s = stats.data;
  const metrics = [
    { label: "Documents Indexed", value: s?.documents, icon: <FileText size={18} />, href: "/documents" },
    { label: "Searchable Sections", value: s?.chunks, icon: <Layers size={18} />, href: "/documents" },
    { label: "Departments", value: s?.departments, icon: <Database size={18} />, href: "/documents" },
    { label: "Open Conflicts", value: s?.conflicts.active, icon: <AlertTriangle size={18} />, href: "/conflicts", alert: true },
    { label: "Cross-Department", value: s?.conflicts.crossDepartment, icon: <Globe size={18} />, href: "/conflicts", alert: true },
    { label: "Audit Events", value: s?.activityEvents, icon: <ActivityIcon size={18} />, href: "/activity" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}, {user.name.split(" ")[0]}.</h1>
          <p className="mt-1 max-w-2xl text-sm text-nx-text-muted">{lens.subtitle}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-nx-border bg-nx-elevated px-2.5 py-1.5 text-[11px] font-medium text-nx-text-muted">
          <Eye size={11} className="text-nx-accent" /> {persona.role} view
        </span>
      </div>

      {/* Ask */}
      <div className="relative rounded-xl border border-nx-border bg-nx-surface p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-nx-accent to-nx-accent-hover">
            <Zap size={16} className="text-white" />
          </div>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
            placeholder="Ask Guardian anything — every department's knowledge is in scope…"
            className="flex-1 bg-transparent text-sm text-nx-text-primary outline-none placeholder:text-nx-text-muted"
          />
          <button
            onClick={() => ask(question)}
            className="rounded-lg bg-nx-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-nx-accent-hover"
          >
            Ask AI
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {lens.queries.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="max-w-[320px] truncate rounded-md border border-nx-border bg-nx-elevated px-2.5 py-1 text-[11px] text-nx-text-muted transition-colors hover:border-nx-border-strong hover:bg-nx-overlay"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {stats.error && <ApiFailure message={stats.error} />}
      {stats.loading && !stats.error && <Loading label="Loading live metrics…" />}

      {s && (
        <>
          {/* Every number below is queried from MongoDB, not hardcoded. */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {metrics.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="rounded-lg border border-nx-border bg-nx-surface p-4 transition-colors hover:border-nx-border-strong"
              >
                <span className={cn("block", m.alert && (m.value ?? 0) > 0 ? "text-nx-danger" : "text-nx-text-muted")}>
                  {m.icon}
                </span>
                <p className="mt-3 text-xl font-semibold tracking-tight">{m.value ?? "—"}</p>
                <p className="mt-0.5 text-[11px] text-nx-text-muted">{m.label}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Conflicts feed */}
            <div className="overflow-hidden rounded-xl border border-nx-border bg-nx-surface lg:col-span-2">
              <div className="flex items-center justify-between border-b border-nx-border px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">What the organization disagrees on</h2>
                  <p className="mt-0.5 text-[11px] text-nx-text-muted">
                    Detected across all {s.departments} departments
                  </p>
                </div>
                <Link href="/conflicts" className="flex items-center gap-1 text-xs text-nx-accent hover:underline">
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-nx-border">
                {(conflicts.data?.conflicts ?? []).slice(0, 6).map((c) => (
                  <Link
                    key={c.fingerprint}
                    href={`/conflicts/${c.fingerprint}`}
                    className="block px-5 py-4 transition-colors hover:bg-nx-elevated/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 rounded-md border p-1.5",
                        c.severity === "High"
                          ? "border-nx-danger/20 bg-nx-danger-muted text-nx-danger"
                          : "border-nx-warning/20 bg-nx-warning-muted text-nx-warning"
                      )}>
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{c.title}</p>
                          {c.crossDepartment && (
                            <span className="flex items-center gap-1 rounded bg-nx-accent-muted px-1.5 py-0.5 text-[10px] font-medium text-nx-accent">
                              <Globe size={9} /> cross-dept
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {c.claims.map((claim, i) => (
                            <span key={i} className="rounded bg-nx-elevated px-1.5 py-0.5 text-[11px] text-nx-text-secondary">
                              {claim.value}
                            </span>
                          ))}
                        </div>
                        <p className="mt-1.5 text-[11px] text-nx-text-disabled">
                          {c.departments.join(", ")} · {c.claimCount} sources
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {conflicts.data?.conflicts.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-nx-text-muted">No conflicts detected yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Knowledge health, computed from real conflicts */}
              <div className="rounded-xl border border-nx-border bg-nx-surface p-5">
                <h2 className="text-sm font-semibold">Knowledge Health</h2>
                <p className="mt-0.5 text-[11px] text-nx-text-muted">
                  Share of each department&apos;s documents free of open conflicts
                </p>
                <div className="mt-4 space-y-3">
                  {s.knowledgeHealth.map((h) => (
                    <div key={h.department}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs text-nx-text-secondary">{h.department}</span>
                        <span className="font-mono text-xs text-nx-text-muted">{h.health}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-nx-elevated">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            h.health >= 90 ? "bg-nx-success" : h.health >= 70 ? "bg-nx-warning" : "bg-nx-danger"
                          )}
                          style={{ width: `${h.health}%` }}
                        />
                      </div>
                      {h.inConflict > 0 && (
                        <p className="mt-1 text-[10px] text-nx-text-disabled">
                          {h.inConflict} of {h.documents} in conflict
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-xl border border-nx-border bg-nx-surface p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Recent activity</h2>
                  <Link href="/activity" className="text-xs text-nx-accent hover:underline">All</Link>
                </div>
                <div className="mt-3 space-y-2.5">
                  {(activity.data?.events ?? []).slice(0, 5).map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        e.isAI ? "bg-nx-accent" : "bg-nx-success"
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] text-nx-text-secondary">
                          <span className="font-medium text-nx-text-primary">{e.who}</span> {e.action.toLowerCase()} {e.resource}
                        </p>
                        <RelativeTime date={new Date(e.timestamp * 1000)} className="text-[10px] text-nx-text-disabled" />
                      </div>
                    </div>
                  ))}
                  {(activity.data?.events ?? []).length === 0 && (
                    <p className="text-[11px] text-nx-text-muted">No activity recorded yet.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-nx-border bg-nx-surface p-5">
                <h2 className="mb-4 text-sm font-semibold">Quick Actions</h2>
                <div className="space-y-2">
                  {[
                    { label: "Ask a policy question", icon: <MessageSquare size={16} />, href: "/workspace" },
                    { label: "Review open conflicts", icon: <AlertTriangle size={16} />, href: "/conflicts" },
                    { label: "Browse all departments", icon: <FileText size={16} />, href: "/documents" },
                    { label: "View knowledge graph", icon: <Eye size={16} />, href: "/knowledge" },
                    { label: "Read the audit trail", icon: <CheckCircle size={16} />, href: "/activity" },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-nx-text-secondary transition-colors hover:bg-nx-elevated hover:text-nx-text-primary"
                    >
                      <span className="text-nx-text-muted">{a.icon}</span>
                      <span>{a.label}</span>
                      <ChevronRight size={14} className="ml-auto text-nx-text-disabled" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
