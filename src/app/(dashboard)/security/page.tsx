"use client";

import {
  Shield, Lock, Scroll, Brain, ShieldCheck, Globe, Award,
  CheckCircle, AlertCircle, BookOpen, Pencil, UserCheck, Building2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { securityFeatures, complianceBadges, accessPrinciples, personas } from "@/data";

const statusStyle: Record<string, { bg: string; icon: React.ReactNode }> = {
  Operational: { bg: "bg-nx-success-muted text-nx-success", icon: <CheckCircle size={14} className="text-nx-success" /> },
  Configured: { bg: "bg-nx-accent-muted text-nx-accent", icon: <CheckCircle size={14} className="text-nx-accent" /> },
  "Needs Attention": { bg: "bg-nx-warning-muted text-nx-warning", icon: <AlertCircle size={14} className="text-nx-warning" /> },
};

const featureIcons: Record<string, React.ReactNode> = {
  lock: <Lock size={22} />,
  "book-open": <BookOpen size={22} />,
  scroll: <Scroll size={22} />,
  brain: <Brain size={22} />,
  "user-check": <UserCheck size={22} />,
  building: <Building2 size={22} />,
};

const principleIcons: Record<string, React.ReactNode> = {
  "book-open": <BookOpen size={18} />,
  pencil: <Pencil size={18} />,
  "user-check": <UserCheck size={18} />,
};

const badgeIcons: Record<string, React.ReactNode> = {
  "shield-check": <ShieldCheck size={22} />,
  globe: <Globe size={22} />,
  award: <Award size={22} />,
};

const complianceStatusStyle: Record<string, string> = {
  Active: "bg-nx-success-muted text-nx-success border-nx-success/20",
  "In Progress": "bg-nx-warning-muted text-nx-warning border-nx-warning/20",
  Planned: "bg-nx-elevated text-nx-text-muted border-nx-border",
};

export default function TrustCenterPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Trust Center</h1>
        <p className="text-sm text-nx-text-muted mt-0.5">How knowledge is shared, who can change it, and how AI is governed</p>
      </div>

      {/* The open knowledge model — the headline claim, stated first */}
      <section className="relative overflow-hidden rounded-xl border border-nx-accent/25 bg-gradient-to-br from-nx-accent/[0.07] to-transparent p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-nx-accent/25 bg-nx-accent-muted p-2.5 text-nx-accent shrink-0">
            <Globe size={22} />
          </div>
          <div className="max-w-3xl">
            <h2 className="text-base font-semibold text-nx-text-primary">One company, one truth</h2>
            <p className="mt-2 text-sm leading-relaxed text-nx-text-secondary">
              Every employee reads the same knowledge base. An associate engineer and the CEO
              searching &ldquo;casual leave&rdquo; get the identical answer, drawn from the identical
              sources, including the parts that disagree. There is no permission filter on retrieval
              and no version of the truth reserved for senior roles.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-nx-text-secondary">
              This is deliberate. Contradictions between departments only get fixed if people across
              departments can see them. Hiding HR&apos;s handbook from Legal would hide the conflict too.
            </p>
          </div>
        </div>
      </section>

      {/* Read / Write / Approve */}
      <div>
        <h2 className="text-sm font-semibold mb-1">What each action requires</h2>
        <p className="text-[11px] text-nx-text-muted mb-4">
          Reading is open. Only changing and approving are governed — accountability, not secrecy.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessPrinciples.map((principle) => (
            <div
              key={principle.id}
              className={cn(
                "rounded-xl border p-5 transition-colors",
                principle.openToEveryone
                  ? "border-nx-success/25 bg-nx-success-muted/25"
                  : "border-nx-border bg-nx-surface hover:border-nx-border-strong"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "rounded-lg border p-2",
                    principle.openToEveryone
                      ? "border-nx-success/25 bg-nx-success-muted text-nx-success"
                      : "border-nx-border bg-nx-elevated text-nx-accent"
                  )}
                >
                  {principleIcons[principle.icon]}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-nx-text-disabled">
                  {principle.action}
                </span>
              </div>
              <h3
                className={cn(
                  "text-sm font-semibold",
                  principle.openToEveryone ? "text-nx-success" : "text-nx-text-primary"
                )}
              >
                {principle.rule}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-nx-text-muted">{principle.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles — lenses, not gates */}
      <div>
        <h2 className="text-sm font-semibold mb-1">Roles on the platform</h2>
        <p className="text-[11px] text-nx-text-muted mb-4">
          One uniform platform for the whole organization. A role changes what surfaces first and what
          you may approve — never what you may read.
        </p>
        <div className="overflow-x-auto rounded-xl border border-nx-border bg-nx-surface">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-nx-border text-[11px] uppercase tracking-wider text-nx-text-muted">
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Covers</th>
                <th className="px-5 py-3 font-medium">Can read</th>
                <th className="px-5 py-3 font-medium">Can approve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nx-border">
              {personas.map((persona) => (
                <tr key={persona.role} className="hover:bg-nx-elevated/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-nx-text-primary whitespace-nowrap">
                    {persona.role}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-nx-text-muted">{persona.covers}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded bg-nx-success-muted px-2 py-1 text-[11px] font-medium text-nx-success">
                      <CheckCircle size={11} /> Everything
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-nx-text-secondary whitespace-nowrap">
                    {persona.approvalScope === "none" && <span className="text-nx-text-disabled">Nothing — reads and reports</span>}
                    {persona.approvalScope === "department" && "Documents their department owns"}
                    {persona.approvalScope === "organization" && "Any document, org-wide"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Controls */}
      <div>
        <h2 className="text-sm font-semibold mb-4">Platform Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityFeatures.map((feature) => {
            const style = statusStyle[feature.status];
            return (
              <div key={feature.id} className="bg-nx-surface border border-nx-border rounded-xl p-5 hover:border-nx-border-strong transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-nx-elevated border border-nx-border text-nx-accent">
                    {featureIcons[feature.icon] || <Shield size={22} />}
                  </div>
                  <span className={cn("flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded", style.bg)}>
                    {style.icon} {feature.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-nx-text-primary">{feature.name}</h3>
                <p className="text-xs text-nx-text-muted mt-1 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Governance */}
      <div>
        <h2 className="text-sm font-semibold mb-4">AI Governance</h2>
        <div className="rounded-xl border border-nx-border bg-nx-surface p-5">
          <p className="text-xs text-nx-text-muted mb-5">
            Open knowledge raises the stakes on accuracy: if everyone reads the same answer, a wrong
            answer spreads to everyone. So nothing reaches a document without a human signing for it.
          </p>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {[
              { step: "AI detects", detail: "Conflict or drift flagged with evidence" },
              { step: "AI recommends", detail: "Draft resolution and impacted owners" },
              { step: "Human approves", detail: "Named owner accepts, edits, or rejects" },
              { step: "Change logged", detail: "Attributed in the audit trail, visible to all" },
            ].map((item, index, all) => (
              <div key={item.step} className="flex flex-1 items-center gap-3">
                <div className="flex-1 rounded-lg border border-nx-border bg-nx-bg p-3.5">
                  <p className="text-xs font-semibold text-nx-text-primary">{item.step}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-nx-text-muted">{item.detail}</p>
                </div>
                {index < all.length - 1 && (
                  <ArrowRight size={14} className="hidden lg:block shrink-0 text-nx-text-disabled" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div>
        <h2 className="text-sm font-semibold mb-4">Compliance & Certifications</h2>
        <p className="text-[11px] text-nx-text-disabled mb-3 italic">
          Note: Compliance statuses shown are UI representations for demonstration purposes only.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {complianceBadges.map((badge) => (
            <div key={badge.name} className="bg-nx-surface border border-nx-border rounded-xl p-5 hover:border-nx-border-strong transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-lg bg-nx-elevated border border-nx-border text-nx-accent">
                  {badgeIcons[badge.icon] || <Shield size={22} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-nx-text-primary">{badge.name}</h3>
                  <span className={cn("text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border mt-1 inline-block", complianceStatusStyle[badge.status])}>
                    {badge.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-nx-text-muted leading-relaxed">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-sm font-semibold mb-4">Trust Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Knowledge Openness", value: "100%", color: "text-nx-success" },
            { label: "Encryption Coverage", value: "100%", color: "text-nx-success" },
            { label: "Changes With Named Approver", value: "100%", color: "text-nx-success" },
            { label: "AI Governance Score", value: "89%", color: "text-nx-accent" },
          ].map((metric) => (
            <div key={metric.label} className="bg-nx-surface border border-nx-border rounded-lg p-4 text-center">
              <p className={cn("text-2xl font-semibold", metric.color)}>{metric.value}</p>
              <p className="text-[11px] text-nx-text-muted mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
