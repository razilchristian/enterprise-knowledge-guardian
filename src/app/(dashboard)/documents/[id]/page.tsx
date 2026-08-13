"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, FileText, MessageSquare, GitCompare, Brain, AlertTriangle,
  Bot, CheckCircle, Clock, User, Building2, Shield, ExternalLink,
  ChevronRight, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { documents } from "@/data";
import { formatRelativeTime } from "@/lib/utils";

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const doc = documents.find((d) => d.id === id) || documents[0];

  const riskColor: Record<string, string> = {
    Low: "text-nx-success",
    Medium: "text-nx-warning",
    High: "text-nx-danger",
    Critical: "text-nx-danger",
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/documents" className="flex items-center gap-1 text-nx-text-muted hover:text-nx-accent transition-colors">
          <ArrowLeft size={14} />
          Documents
        </Link>
        <ChevronRight size={14} className="text-nx-text-disabled" />
        <span className="text-nx-text-secondary truncate">{doc.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-nx-accent-muted border border-nx-accent/20">
            <FileText size={24} className="text-nx-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{doc.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-nx-text-muted font-mono bg-nx-elevated px-2 py-1 rounded border border-nx-border">{doc.type}</span>
              <span className="text-xs text-nx-text-muted font-mono">v{doc.version}</span>
              <span className="text-xs text-nx-text-muted">{doc.size}</span>
              {doc.pages && <span className="text-xs text-nx-text-muted">{doc.pages} pages</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workspace" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-nx-border text-sm text-nx-text-secondary hover:bg-nx-elevated transition-colors">
            <MessageSquare size={14} /> Ask AI
          </Link>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-nx-border text-sm text-nx-text-secondary hover:bg-nx-elevated transition-colors">
            <GitCompare size={14} /> Compare
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-nx-border text-sm text-nx-text-secondary hover:bg-nx-elevated transition-colors">
            <Brain size={14} /> Summarize
          </button>
          <Link href="/conflicts/con-1" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-semibold transition-colors">
            <AlertTriangle size={14} /> Detect Conflicts
          </Link>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-4 bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-nx-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Document Preview</h2>
            <button className="text-xs text-nx-accent hover:underline flex items-center gap-1">
              Open <ExternalLink size={10} />
            </button>
          </div>
          <div className="p-6 space-y-4 text-xs text-nx-text-secondary leading-relaxed">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-nx-text-primary">{doc.name}</p>
              <p className="text-[11px] text-nx-text-muted mt-1">Version {doc.version} — Last updated {formatRelativeTime(doc.lastUpdated)}</p>
            </div>
            <div className="space-y-3 border-t border-nx-border pt-4">
              <p className="font-medium text-nx-text-primary text-sm">§7.3 — Casual Leave</p>
              <p>All full-time employees are entitled to ten (10) days of casual leave per calendar year, subject to manager approval and standard carry-forward rules.</p>
              <p className="font-medium text-nx-text-primary text-sm mt-4">§7.4 — Leave Approval</p>
              <p>Casual leave requests are submitted through the employee portal and require manager approval prior to the start date, except in an emergency.</p>
              <p className="font-medium text-nx-text-primary text-sm mt-4">§7.3 — Paid Time Off</p>
              <p>Unused casual leave expires at the end of the calendar year unless a documented exception is approved by Human Resources.</p>
              <div className="mt-4 p-3.5 rounded-xl bg-nx-danger-muted border border-nx-danger/20">
                <p className="text-[11px] font-medium text-nx-danger flex items-center gap-1"><AlertTriangle size={12} /> Conflict Zone</p>
                <p className="text-xs text-nx-text-secondary mt-1">Guardian found conflicting entitlements: 12 days in HR Leave Policy §4.2 and 15 days in Manager Guide §3.1.</p>
              </div>
              <p className="font-medium text-nx-text-primary text-sm mt-4">§12.4 — Termination Procedures</p>
              <p>All company property, including laptops, access badges, and peripherals, must be returned within five (5) business days of the last working day.</p>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-nx-border">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Brain size={16} className="text-nx-accent" />
                Document Intelligence
              </h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Summary */}
              {doc.summary && (
                <div>
                  <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-2">Summary</h3>
                  <p className="text-sm text-nx-text-secondary leading-relaxed">{doc.summary}</p>
                </div>
              )}

              {/* Key Findings */}
              {doc.keyFindings && (
                <div>
                  <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-2">Key Findings</h3>
                  <div className="space-y-2">
                    {doc.keyFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2 p-3.5 rounded-xl bg-nx-bg border border-nx-border">
                        <AlertTriangle size={14} className={cn("mt-0.5 shrink-0", i === 0 ? "text-nx-danger" : "text-nx-warning")} />
                        <div>
                          <p className="text-sm text-nx-text-secondary">{finding}</p>
                          {i === 0 && (
                            <button className="text-[11px] text-nx-accent hover:underline mt-1 font-medium flex items-center gap-1">
                              <BookOpen size={10} /> HR Policy §4.2
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {doc.entities && (
                <div>
                  <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-2">Entities Detected</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.entities.map((entity) => (
                      <span key={entity} className="text-xs bg-nx-elevated border border-nx-border px-2 py-1 rounded text-nx-text-secondary">{entity}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Referenced Policies */}
              {doc.referencedPolicies && (
                <div>
                  <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-2">Referenced Policies</h3>
                  <div className="space-y-1.5">
                    {doc.referencedPolicies.map((policy) => (
                      <div key={policy} className="flex items-center gap-2 text-sm text-nx-accent hover:underline cursor-pointer">
                        <FileText size={14} />
                        {policy}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI Confidence */}
          <div className="bg-nx-surface border border-nx-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-3">AI Confidence</h3>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-nx-border)" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-nx-accent)" strokeWidth="4" strokeDasharray={`${(doc.aiConfidence || 0) * 1.76} 176`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{doc.aiConfidence || 0}%</span>
              </div>
              <div>
                <p className="text-sm font-medium text-nx-text-primary">High confidence</p>
                <p className="text-[11px] text-nx-text-muted mt-0.5">Based on {doc.pages || 0} pages</p>
                <p className="text-[11px] text-nx-text-disabled font-mono mt-0.5">Indexed {formatRelativeTime(doc.lastUpdated)}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-nx-surface border border-nx-border rounded-2xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-3">Details</h3>
            {[
              { label: "Owner", value: doc.owner, icon: <User size={14} /> },
              { label: "Department", value: doc.department, icon: <Building2 size={14} /> },
              { label: "Status", value: doc.status, icon: <CheckCircle size={14} /> },
              { label: "Risk Level", value: doc.risk, icon: <Shield size={14} /> },
              { label: "Last Updated", value: formatRelativeTime(doc.lastUpdated), icon: <Clock size={14} /> },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-nx-text-muted">
                  {item.icon} {item.label}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  item.label === "Risk Level" ? riskColor[item.value] : "text-nx-text-secondary"
                )}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-nx-surface border border-nx-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-medium text-nx-text-muted uppercase tracking-wider mb-3">Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-nx-text-secondary hover:bg-nx-elevated border border-nx-border transition-colors">
                <Bot size={14} /> Create Agent for this document
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-nx-text-secondary hover:bg-nx-elevated border border-nx-border transition-colors">
                <GitCompare size={14} /> Compare with another document
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
