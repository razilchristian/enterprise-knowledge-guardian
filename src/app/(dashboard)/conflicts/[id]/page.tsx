"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, CheckCircle, Eye, Globe, Loader2, WifiOff,
  XCircle, Quote, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RelativeTime from "@/components/ui/relative-time";
import { usePersona } from "@/lib/persona";
import {
  ApiError, getConflict, setConflictStatus,
  type ConflictStatus, type StoredConflict,
} from "@/lib/api";

const STATUSES: { value: ConflictStatus; icon: React.ReactNode; help: string }[] = [
  { value: "In Review", icon: <Eye size={13} />, help: "Owner is working on it" },
  { value: "Resolved", icon: <CheckCircle size={13} />, help: "Documents have been corrected" },
  { value: "Dismissed", icon: <XCircle size={13} />, help: "Not actually a contradiction" },
];

export default function ConflictDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { persona, canApprove } = usePersona();

  const [conflict, setConflict] = useState<StoredConflict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getConflict(id)
      .then(setConflict)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load."))
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (status: ConflictStatus) => {
    setSaving(true);
    try {
      await setConflictStatus(id, status);
      setConflict((c) => (c ? { ...c, status } : c));
    } catch {
      setError("Could not update the status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto md:p-8">
        <div className="flex items-center gap-2 rounded-2xl border border-nx-border bg-nx-surface p-8 text-sm text-nx-text-muted">
          <Loader2 size={15} className="animate-spin text-nx-accent" /> Loading conflict…
        </div>
      </div>
    );
  }

  if (error || !conflict) {
    return (
      <div className="p-6 max-w-[1100px] mx-auto space-y-4 md:p-8">
        <Link href="/conflicts" className="inline-flex items-center gap-1.5 text-xs text-nx-accent hover:underline">
          <ArrowLeft size={13} /> All conflicts
        </Link>
        <div className="flex items-start gap-3 rounded-2xl border border-nx-danger/25 bg-nx-danger-muted/40 p-5">
          <WifiOff size={17} className="mt-0.5 shrink-0 text-nx-danger" />
          <div>
            <p className="text-sm font-semibold text-nx-danger">Could not load this conflict</p>
            <p className="mt-1 text-xs text-nx-text-secondary">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Approval rights follow the governance model: an Employee can read everything
  // here but resolves nothing. Ownership is accountability, not secrecy.
  const mayDecide = conflict.departments.some((d) => canApprove(d));

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-6 md:p-8">
      <Link href="/conflicts" className="inline-flex items-center gap-1.5 text-xs text-nx-accent hover:underline">
        <ArrowLeft size={13} /> All conflicts
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-nx-border bg-nx-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider",
            conflict.severity === "High"
              ? "border-nx-danger/30 bg-nx-danger-muted text-nx-danger"
              : conflict.severity === "Medium"
                ? "border-nx-warning/30 bg-nx-warning-muted text-nx-warning"
                : "border-nx-border bg-nx-elevated text-nx-text-muted"
          )}>
            {conflict.severity.toUpperCase()} RISK
          </span>
          {conflict.crossDepartment && (
            <span className="flex items-center gap-1 rounded-full bg-nx-accent-muted px-2 py-0.5 text-[10px] font-medium text-nx-accent">
              <Globe size={9} /> CROSS-DEPARTMENT
            </span>
          )}
          <span className="text-[10px] font-mono text-nx-text-disabled">
            {conflict.claimCount} SOURCES DISAGREE
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{conflict.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-nx-text-secondary">{conflict.explanation}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-nx-text-disabled">
          <span className="flex items-center gap-1">
            Detected <RelativeTime date={new Date(conflict.detectedAt * 1000)} />
          </span>
          <span>Surfaced by {conflict.timesSurfaced} question{conflict.timesSurfaced === 1 ? "" : "s"}</span>
          <span>Owners: {conflict.owners.join(", ") || "unassigned"}</span>
        </div>
      </div>

      {/* The claims. One card per source — never a fixed pair. */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">What each document says</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conflict.claims.map((claim, index) => (
            <div key={index} className="flex flex-col rounded-2xl border border-nx-border bg-nx-surface p-5">
              <p className="text-xl font-semibold text-nx-danger">{claim.value}</p>
              <p className="mt-3 text-sm font-semibold text-nx-text-primary">{claim.document}</p>
              <p className="mt-0.5 text-xs text-nx-text-muted">{claim.section}</p>
              {claim.quote && (
                <p className="mt-3 flex gap-1.5 text-[11px] italic leading-relaxed text-nx-text-muted">
                  <Quote size={11} className="mt-0.5 shrink-0 text-nx-text-disabled" />
                  {claim.quote}
                </p>
              )}
              <p className="mt-auto pt-3 text-[10px] text-nx-text-disabled border-t border-nx-border mt-3">
                {claim.department} · {claim.owner}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      {conflict.recommendedAction && (
        <div className="rounded-2xl border border-nx-success/20 bg-nx-success-muted/30 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nx-success">
            AI recommendation
          </p>
          <p className="mt-2 text-sm leading-relaxed text-nx-text-secondary">{conflict.recommendedAction}</p>
          <p className="mt-3 text-[11px] text-nx-text-disabled">
            Guardian does not choose between the sources. Deciding which policy is correct is a
            decision with consequences, and it belongs to the document&apos;s owner.
          </p>
        </div>
      )}

      {/* Human decision */}
      <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
        <div className="flex items-center gap-2">
          <UserCheck size={15} className="text-nx-accent" />
          <h2 className="text-sm font-semibold">Human decision</h2>
          <span className={cn(
            "ml-auto rounded px-2 py-1 text-[11px] font-medium",
            conflict.status === "Open" ? "bg-nx-accent-muted text-nx-accent"
              : conflict.status === "In Review" ? "bg-nx-warning-muted text-nx-warning"
              : conflict.status === "Resolved" ? "bg-nx-success-muted text-nx-success"
              : "bg-nx-elevated text-nx-text-muted"
          )}>
            {conflict.status}
          </span>
        </div>

        {mayDecide ? (
          <>
            <p className="mt-2 text-xs text-nx-text-muted">
              You are signed in as <strong className="text-nx-text-secondary">{persona.role}</strong> and
              can act on {conflict.departments.join(" and ")} documents.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => changeStatus(option.value)}
                  disabled={saving || conflict.status === option.value}
                  title={option.help}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40",
                    conflict.status === option.value
                      ? "border-nx-accent/40 bg-nx-accent-muted text-nx-accent"
                      : "border-nx-border text-nx-text-secondary hover:bg-nx-elevated"
                  )}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : option.icon}
                  {option.value}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-nx-border bg-nx-bg p-3.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-nx-text-muted" />
            <p className="text-[11px] leading-relaxed text-nx-text-muted">
              As <strong className="text-nx-text-secondary">{persona.role}</strong> you can read every
              detail of this conflict, but resolving it belongs to the owner of the affected
              documents ({conflict.owners.join(", ") || "unassigned"}). Reading is open to everyone;
              only deciding is governed.
            </p>
          </div>
        )}
      </div>

      {/* Provenance */}
      <div className="rounded-2xl border border-nx-border bg-nx-surface p-5">
        <h2 className="text-sm font-semibold">Questions that surfaced this</h2>
        <p className="mt-1 text-[11px] text-nx-text-muted">
          The same contradiction reached from different phrasings. Recorded once, not once per question.
        </p>
        <ul className="mt-3 space-y-1.5">
          {conflict.questions.map((question, index) => (
            <li key={index} className="text-xs text-nx-text-secondary">&ldquo;{question}&rdquo;</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
