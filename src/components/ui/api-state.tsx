"use client";

import { Loader2, WifiOff } from "lucide-react";

/**
 * Shared loading and error states.
 *
 * Every page that talks to the backend fails the same visible way. A page that
 * silently shows nothing when the API is down is indistinguishable from a page
 * with no data, and on a demo that ambiguity costs minutes.
 */

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-nx-border bg-nx-surface p-8 text-sm text-nx-text-muted">
      <Loader2 size={15} className="animate-spin text-nx-accent" />
      {label}
    </div>
  );
}

export function ApiFailure({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-nx-danger/25 bg-nx-danger-muted/40 p-5">
      <WifiOff size={17} className="mt-0.5 shrink-0 text-nx-danger" />
      <div>
        <p className="text-sm font-semibold text-nx-danger">Backend unavailable</p>
        <p className="mt-1 text-xs leading-relaxed text-nx-text-secondary">{message}</p>
      </div>
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-nx-border bg-nx-surface p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-xs text-nx-text-muted">{hint}</p>}
    </div>
  );
}
