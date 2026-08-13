"use client";

import { useState } from "react";
import {
  Activity, Bot, User, CheckCircle, Clock, XCircle, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { activityEvents } from "@/data";
import { formatRelativeTime } from "@/lib/utils";

const resultStyle: Record<string, string> = {
  Success: "bg-nx-success-muted text-nx-success",
  Pending: "bg-nx-warning-muted text-nx-warning",
  Failed: "bg-nx-danger-muted text-nx-danger",
};

const resultIcon: Record<string, React.ReactNode> = {
  Success: <CheckCircle size={12} />,
  Pending: <Clock size={12} />,
  Failed: <XCircle size={12} />,
};

export default function ActivityPage() {
  const [filter, setFilter] = useState<"all" | "human" | "ai">("all");

  const filtered = filter === "all" ? activityEvents :
    filter === "human" ? activityEvents.filter(e => !e.isAI) :
    activityEvents.filter(e => e.isAI);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Activity & Audit</h1>
          <p className="text-sm text-nx-text-muted mt-0.5">Complete audit trail of all user and AI agent actions</p>
        </div>
        <div className="flex items-center gap-1 bg-nx-surface border border-nx-border rounded-lg p-0.5">
          {(["all", "human", "ai"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                filter === f ? "bg-nx-elevated text-nx-text-primary" : "text-nx-text-muted hover:text-nx-text-secondary"
              )}
            >
              {f === "ai" ? <Bot size={12} /> : f === "human" ? <User size={12} /> : <Activity size={12} />}
              {f === "ai" ? "AI Actions" : f === "human" ? "Human" : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-nx-surface border border-nx-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-nx-border">
              <th className="text-left px-5 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Who</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Action</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Resource</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden lg:table-cell">Agent</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider hidden md:table-cell">Time</th>
              <th className="text-left px-3 py-3 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-border">
            {filtered.map((event) => (
              <tr key={event.id} className="hover:bg-nx-elevated/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {event.isAI ? (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nx-accent to-nx-cyan flex items-center justify-center shrink-0">
                        <Bot size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-nx-elevated border border-nx-border flex items-center justify-center shrink-0">
                        <User size={12} className="text-nx-text-muted" />
                      </div>
                    )}
                    <span className="text-sm text-nx-text-primary">{event.who}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <span className="text-xs font-medium text-nx-text-secondary bg-nx-elevated px-2 py-1 rounded">{event.action}</span>
                </td>
                <td className="px-3 py-3.5">
                  <p className="text-sm text-nx-text-secondary">{event.resource}</p>
                  {event.details && <p className="text-[11px] text-nx-text-muted mt-0.5">{event.details}</p>}
                </td>
                <td className="px-3 py-3.5 text-xs text-nx-text-muted hidden lg:table-cell">{event.agent || "—"}</td>
                <td className="px-3 py-3.5 text-xs text-nx-text-muted font-mono hidden md:table-cell">{formatRelativeTime(event.timestamp)}</td>
                <td className="px-3 py-3.5">
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded", resultStyle[event.result])}>
                    {resultIcon[event.result]} {event.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
