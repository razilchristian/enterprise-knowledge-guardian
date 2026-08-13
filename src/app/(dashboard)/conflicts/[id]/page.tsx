"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, AlertTriangle, CheckCircle, Flag, X, FileText, Brain, Eye, ShieldCheck, Workflow
} from "lucide-react";
import { cn } from "@/lib/utils";
import { conflicts } from "@/data";
import { formatRelativeTime } from "@/lib/utils";

export default function ConflictDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const conflict = conflicts.find((c) => c.id === id) || conflicts[0];
  const [decision, setDecision] = useState<"open" | "accepted" | "review">("open");

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/conflicts" className="flex items-center gap-1 text-nx-text-muted hover:text-nx-accent transition-colors">
          <ArrowLeft size={14} /> Conflicts
        </Link>
        <ChevronRight size={14} className="text-nx-text-disabled" />
        <span className="text-nx-text-secondary truncate">{conflict.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl border",
            conflict.severity === "High" ? "bg-nx-danger-muted border-nx-danger/20" : "bg-nx-warning-muted border-nx-warning/20"
          )}>
            <AlertTriangle size={24} className={conflict.severity === "High" ? "text-nx-danger" : "text-nx-warning"} />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-nx-danger uppercase">Decision required</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{conflict.title}</h1>
            <p className="text-sm text-nx-text-muted mt-1">{conflict.description}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={cn(
                "text-[11px] font-mono font-medium px-2 py-0.5 rounded border",
                conflict.severity === "High" ? "bg-nx-danger-muted text-nx-danger border-nx-danger/20" : "bg-nx-warning-muted text-nx-warning border-nx-warning/20"
              )}>
                {conflict.severity.toUpperCase()} SEVERITY
              </span>
              <span className="text-xs text-nx-text-disabled font-mono">Detected {formatRelativeTime(conflict.detectedAt)}</span>
              <span className="text-xs text-nx-text-muted">{conflict.departments.join(", ")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDecision("accepted")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nx-success hover:bg-nx-success/80 text-white text-sm font-semibold transition-colors">
            <CheckCircle size={14} /> Accept Change
          </button>
          <button onClick={() => setDecision("review")} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-nx-border text-sm text-nx-text-secondary hover:bg-nx-elevated transition-colors">
            <Flag size={14} /> Flag for Review
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-nx-border text-sm text-nx-text-secondary hover:bg-nx-elevated transition-colors">
            <X size={14} /> Dismiss
          </button>
        </div>
      </div>

      {decision !== "open" && <div className={cn("flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm", decision === "accepted" ? "border-nx-success/25 bg-nx-success-muted text-nx-success" : "border-nx-warning/25 bg-nx-warning-muted text-nx-warning")}><span className="flex items-center gap-2"><ShieldCheck size={16} />{decision === "accepted" ? "Resolution accepted. This decision is recorded in the audit trail." : "Review task created and routed to HR and IT policy owners."}</span><Link href="/activity" className="text-xs font-semibold underline underline-offset-4">View audit trail</Link></div>}

      {/* Comparison Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-nx-surface border border-nx-border rounded-xl p-4 text-center">
          <p className="text-lg font-semibold text-nx-danger">{conflict.changes} conflicts</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">detected in comparison</p>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-xl p-4 text-center">
          <p className="text-lg font-semibold">{conflict.changes + 4} changes</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">total differences</p>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-xl p-4 text-center">
          <p className="text-lg font-semibold text-nx-accent">{conflict.semanticSimilarity}%</p>
          <p className="text-[11px] text-nx-text-muted mt-0.5">semantic similarity</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-nx-accent/20 bg-nx-accent-muted/35 px-4 py-3"><Brain size={16} className="mt-0.5 shrink-0 text-nx-accent" /><div><p className="text-xs font-semibold text-nx-text-primary">A third source is also affected</p><p className="mt-0.5 text-xs leading-relaxed text-nx-text-secondary">Manager Guide §3.1 states 15 casual-leave days. It is preserved as evidence and included in the review task—Guardian does not choose a value automatically.</p></div></div>

      {/* Split-Screen Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document A */}
        <div className="bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-nx-border flex items-center gap-2">
            <FileText size={14} className="text-nx-text-muted" />
            <span className="text-sm font-medium">{conflict.documentA.name}</span>
            <span className="text-[11px] text-nx-text-disabled font-mono ml-auto">{conflict.documentA.section}</span>
          </div>
          <div className="p-5">
            <div className="p-4 rounded-xl bg-nx-danger-muted/50 border border-nx-danger/20">
              <p className="text-xs text-nx-danger font-medium mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Conflicting content</p>
              <p className="text-sm text-nx-text-secondary leading-relaxed">{conflict.documentA.content}</p>
            </div>
          </div>
        </div>

        {/* Document B */}
        <div className="bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-nx-border flex items-center gap-2">
            <FileText size={14} className="text-nx-text-muted" />
            <span className="text-sm font-medium">{conflict.documentB.name}</span>
            <span className="text-[11px] text-nx-text-disabled font-mono ml-auto">{conflict.documentB.section}</span>
          </div>
          <div className="p-5">
            <div className="p-4 rounded-xl bg-nx-warning-muted/50 border border-nx-warning/20">
              <p className="text-xs text-nx-warning font-medium mb-2 flex items-center gap-1"><Eye size={12} /> Different provision</p>
              <p className="text-sm text-nx-text-secondary leading-relaxed">{conflict.documentB.content}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-nx-surface border border-nx-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-nx-accent" />
          <h2 className="text-sm font-semibold">AI Analysis</h2>
          <span className="text-[11px] text-nx-text-disabled font-mono ml-auto">94% confidence · 4 sources</span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-2">What changed?</h3>
            <p className="text-sm text-nx-text-secondary leading-relaxed">{conflict.aiExplanation}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-2">Recommended Resolution</h3>
            <p className="text-sm text-nx-text-secondary leading-relaxed">{conflict.recommendedResolution}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-nx-border pt-4"><div className="flex items-center gap-2 text-xs text-nx-text-muted"><Workflow size={14} className="text-nx-accent" />Suggested automation: <span className="font-semibold text-nx-text-secondary">Policy amendment review</span></div><Link href="/workflows" className="ml-auto flex items-center gap-1 text-xs font-semibold text-nx-accent hover:underline">Open workflow <ChevronRight size={13} /></Link></div>
      </div>
    </div>
  );
}
