"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import GuardianBot, { type BotMood } from "@/components/ui/guardian-bot";

/**
 * Guardian in the corner, saying what it just did.
 *
 * It speaks only when something happened — a search finished, a contradiction
 * surfaced, a newer policy settled one. An assistant that chirps on a timer
 * becomes wallpaper within a minute, and then nobody reads it when it matters.
 *
 * Dismissing it once silences it for the session, because a demo should never
 * be fighting its own mascot.
 */

interface Props {
  mood: BotMood;
  message: string | null;
  /** Small print under the message, e.g. which policy settled the question. */
  detail?: string | null;
}

export default function GuardianPopup({ mood, message, detail }: Props) {
  const [dismissed, setDismissed] = useState(false);
  // The message that has already had its say. Derived visibility rather than
  // stored, so the effect below never setStates during render.
  const [spent, setSpent] = useState<string | null>(null);

  const visible = Boolean(message) && !dismissed && message !== spent;

  useEffect(() => {
    // "Thinking" stays up for as long as it is thinking; the rest clear
    // themselves so the corner does not accumulate stale commentary.
    if (!message || dismissed || mood === "thinking") return;
    const timer = setTimeout(() => setSpent(message), 7000);
    return () => clearTimeout(timer);
  }, [message, mood, dismissed]);

  if (!message) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-6 right-6 z-40 max-w-[330px] transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-nx-border bg-nx-surface p-3.5 shadow-[0_16px_40px_rgba(33,27,46,0.16)]">
        <GuardianBot mood={mood} size={38} className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-nx-text-muted">
            Guardian
          </p>
          <p className="mt-1 text-xs leading-relaxed text-nx-text-primary">{message}</p>
          {detail && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-nx-text-muted">{detail}</p>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss Guardian"
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-nx-text-disabled transition-colors hover:bg-nx-elevated hover:text-nx-text-secondary"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
