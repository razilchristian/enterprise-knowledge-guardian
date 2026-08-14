"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Activity as ActivityIcon, Bot, CheckCircle, RefreshCw, ShieldCheck, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import { ApiFailure, Empty, Loading } from "@/components/ui/api-state";
import { useApi } from "@/lib/use-api";
import { listActivity } from "@/lib/api";

const actionStyle: Record<string, string> = {
  Flagged: "bg-nx-danger-muted text-nx-danger",
  Analyzed: "bg-nx-accent-muted text-nx-accent",
  Uploaded: "bg-nx-success-muted text-nx-success",
  Reviewed: "bg-nx-warning-muted text-nx-warning",
  Resolved: "bg-nx-success-muted text-nx-success",
  Dismissed: "bg-nx-elevated text-nx-text-muted",
};

export default function ActivityPage() {
  const fetcher = useCallback(() => listActivity(150), []);
  const { data, loading, error, reload } = useApi(fetcher);
  const [filter, setFilter] = useState<"All" | "AI" | "Human">("All");

  const events = useMemo(() => {
    const all = data?.events ?? [];
    if (filter === "AI") return all.filter((e) => e.isAI);
    if (filter === "Human") return all.filter((e) => !e.isAI);
    return all;
  }, [data, filter]);

  const aiCount = (data?.events ?? []).filter((e) => e.isAI).length;
  const humanCount = (data?.events ?? []).length - aiCount;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-nx-accent">Audit trail</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Every action, attributed.</h1>
          <p className="mt-1 max-w-2xl text-sm text-nx-text-muted">
            Open knowledge raises the stakes on accountability. If everyone can read every
            answer, then who asked what — and who decided what — belongs on the record.
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
      {loading && !error && <Loading label="Loading the audit trail…" />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total events", value: data?.events.length ?? 0, icon: <ActivityIcon size={18} />, tone: "" },
              { label: "AI actions", value: aiCount, icon: <Bot size={18} />, tone: "text-nx-accent" },
              { label: "Human actions", value: humanCount, icon: <User size={18} />, tone: "text-nx-success" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-nx-border bg-nx-surface p-4">
                <span className={cn("block", s.tone || "text-nx-text-muted")}>{s.icon}</span>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-[11px] text-nx-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex w-fit items-center gap-1 rounded-xl border border-nx-border bg-nx-surface p-1">
            {(["All", "AI", "Human"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === f ? "bg-nx-accent-muted text-nx-accent" : "text-nx-text-muted hover:text-nx-text-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {events.length === 0 ? (
            <Empty
              title="No activity recorded yet."
              hint="Ask a question in the workspace, or resolve a conflict, and it appears here."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface shadow-sm">
              <div className="divide-y divide-nx-border">
                {events.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-nx-elevated/40">
                    <div className={cn(
                      "mt-0.5 rounded-lg border border-nx-border p-2",
                      event.isAI ? "bg-nx-accent-muted text-nx-accent" : "bg-nx-success-muted text-nx-success"
                    )}>
                      {event.isAI ? <Bot size={14} /> : <ShieldCheck size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-nx-text-primary">{event.who}</span>
                        <span className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          actionStyle[event.action] ?? "bg-nx-elevated text-nx-text-muted"
                        )}>
                          {event.action}
                        </span>
                        <span className="min-w-0 truncate text-sm text-nx-text-secondary">{event.resource}</span>
                      </div>
                      {event.details && (
                        <p className="mt-1 text-[11px] text-nx-text-muted">{event.details}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <RelativeTime
                        date={new Date(event.timestamp * 1000)}
                        className="block font-mono text-[11px] text-nx-text-disabled"
                      />
                      {event.result === "Success" && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-nx-success">
                          <CheckCircle size={9} /> {event.result}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
