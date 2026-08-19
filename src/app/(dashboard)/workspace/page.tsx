"use client";

import { FormEvent, Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle, ArrowUpRight, Bot, BookOpen, CheckCircle2, ChevronRight,
  FileText, History, Loader2, Paperclip, Plus, Send, Globe, Sparkles, User,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError, ask, health, type AskResponse } from "@/lib/api";
import GuardianBot, { type BotMood } from "@/components/ui/guardian-bot";
import GuardianPopup from "@/components/ui/guardian-popup";

const SUGGESTIONS = [
  "How many casual leave days do I get?",
  "What is our data retention period?",
  "What is the vendor liability cap?",
  "How do I request time off?",
];

interface Turn {
  question: string;
  result?: AskResponse;
  error?: string;
}

// useSearchParams needs a Suspense boundary so the route can still prerender.
// See next/docs 01-app/03-api-reference/04-functions/use-search-params.
export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] bg-nx-bg" />}>
      <Workspace />
    </Suspense>
  );
}

function Workspace() {
  const searchParams = useSearchParams();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [backendUp, setBackendUp] = useState<boolean | null>(null);
  const [activeSource, setActiveSource] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Surface a dead backend immediately rather than on first question — far
  // better to discover it while setting up than in front of an audience.
  useEffect(() => {
    health().then((h) => setBackendUp(h.ok));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, pending]);

  const latest = turns[turns.length - 1];
  const citations = latest?.result?.citations ?? [];

  // What Guardian is doing right now, in one place, so the bot in the corner
  // and the avatar in the header always agree.
  const mood: BotMood = pending
    ? "thinking"
    : latest?.result?.has_conflict
      ? "alert"
      : latest?.result?.superseded_by
        ? "resolved"
        : "idle";

  const said = pending
    ? "Searching every department, then checking the sources against each other…"
    : latest?.error
      ? "I could not reach the knowledge base for that one."
      : latest?.result?.has_conflict
        ? `Your documents disagree on this. ${latest.result.conflict?.claims.length ?? 0} sources, and I am not going to pick one for you.`
        : latest?.result?.superseded_by
          ? "That one is settled — a newer policy retired the older wording."
          : latest?.result
            ? `Answered from ${latest.result.hits_considered} passages. The sources agree.`
            : null;

  const saidDetail = latest?.result?.superseded_by ?? null;

  // Stable identity so the ?q= effect below can depend on it honestly rather
  // than suppressing the lint rule. The in-flight guard is a ref written only
  // inside this handler — `pending` state drives the UI, this stops a second
  // request racing the first.
  const inFlight = useRef(false);

  const submit = useCallback(async (question: string) => {
    if (!question.trim() || inFlight.current) return;
    inFlight.current = true;
    setInput("");
    setPending(true);
    setActiveSource(0);
    setTurns((prev) => [...prev, { question }]);

    try {
      const result = await ask(question);
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, result } : t)));
      setBackendUp(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, error: message } : t)));
      if (err instanceof ApiError && !err.status) setBackendUp(false);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, []);

  // A question arriving from the dashboard as ?q=... is asked once on arrival.
  const incoming = searchParams.get("q");
  const asked = useRef(false);
  useEffect(() => {
    if (!incoming || asked.current) return;
    asked.current = true;
    void submit(incoming);
  }, [incoming, submit]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(input.trim());
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-nx-bg">
      {/* Left rail */}
      <aside className="hidden xl:flex w-[274px] shrink-0 flex-col border-r border-nx-border bg-nx-surface/50">
        <div className="p-4 border-b border-nx-border">
          <button
            onClick={() => { setTurns([]); setInput(""); }}
            className="group w-full flex items-center justify-between rounded-xl bg-nx-accent px-3.5 py-3 text-sm font-semibold text-white transition-all hover:bg-nx-accent-hover hover:shadow-lg hover:shadow-nx-accent/10"
          >
            <span className="flex items-center gap-2"><Plus size={16} /> New research</span>
          </button>
        </div>

        <div className="p-4 pb-2">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-nx-text-muted uppercase">This session</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {turns.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-nx-text-disabled">No questions asked yet.</p>
          )}
          {turns.map((turn, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg px-3 py-2.5",
                index === turns.length - 1 ? "bg-nx-elevated text-nx-text-primary" : "text-nx-text-muted"
              )}
            >
              <p className="truncate text-xs font-medium">{turn.question}</p>
              <p className="mt-1 text-[10px] text-nx-text-disabled">
                {turn.error
                  ? "Failed"
                  : turn.result
                    ? `${turn.result.hits_considered} sources${turn.result.has_conflict ? " · conflict" : ""}`
                    : "Thinking…"}
              </p>
            </div>
          ))}
        </div>

        <div className="m-3 rounded-xl border border-nx-border bg-nx-bg p-3.5">
          <div className="flex items-center gap-2 text-nx-cyan">
            <Globe size={15} />
            <span className="text-xs font-semibold">Open knowledge base</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-nx-text-muted">
            Every department is searched, whatever your role. You and the CEO get the same answer.
          </p>
        </div>
      </aside>

      {/* Main column */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-nx-border px-5 py-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nx-accent-muted">
              <GuardianBot mood={mood} size={30} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-nx-text-primary">Research workspace</p>
              <p className="truncate text-[11px] text-nx-text-muted">Grounded answers across your organization</p>
            </div>
          </div>
          {backendUp === false ? (
            <div className="flex items-center gap-2 rounded-full border border-nx-danger/25 bg-nx-danger-muted px-2.5 py-1.5 text-[11px] font-medium text-nx-danger">
              <WifiOff size={12} /> Backend offline
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-nx-success/20 bg-nx-success-muted px-2.5 py-1.5 text-[11px] font-medium text-nx-success">
              <Globe size={12} /> All departments searched
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
          {turns.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center pt-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-nx-accent-muted">
                <GuardianBot mood="idle" size={54} />
              </div>
              <p className="text-2xl font-semibold tracking-tight">What can I help you understand?</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-nx-text-muted">
                Ask a question across your company knowledge. Every answer is grounded in sources you can inspect.
              </p>
              <div className="stagger mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => submit(prompt)}
                    className="rounded-xl border border-nx-border bg-nx-surface p-3.5 text-left text-xs text-nx-text-secondary transition-colors hover:border-nx-accent/50 hover:bg-nx-elevated"
                  >
                    {prompt}
                    <ChevronRight size={14} className="mt-2 text-nx-accent" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8">
              {turns.map((turn, index) => (
                <div key={index} className="space-y-5">
                  <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 md:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-elevated text-nx-text-secondary">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-nx-text-muted">Your question</p>
                        <p className="mt-1.5 text-base leading-relaxed text-nx-text-primary">{turn.question}</p>
                      </div>
                    </div>
                  </div>

                  {turn.error && <ErrorCard message={turn.error} />}
                  {!turn.error && !turn.result && <Thinking />}
                  {turn.result && <ResultBlock result={turn.result} />}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-nx-border bg-nx-surface/80 p-4 backdrop-blur-xl md:px-8 md:py-5">
          <form
            onSubmit={onSubmit}
            className="mx-auto max-w-3xl rounded-2xl border border-nx-border bg-nx-bg p-2 shadow-[0_12px_34px_rgba(0,0,0,0.16)] transition-colors focus-within:border-nx-accent/60"
          >
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-lg p-2 text-nx-text-muted transition-colors hover:bg-nx-elevated hover:text-nx-text-primary" aria-label="Attach a document">
                <Paperclip size={17} />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={pending}
                placeholder={pending ? "Searching every department…" : "Ask about your organization…"}
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-nx-text-primary outline-none placeholder:text-nx-text-muted disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || pending}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-nx-accent text-white transition-all hover:bg-nx-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send question"
              >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between px-2 pb-0.5 text-[10px] text-nx-text-disabled">
              <span className="hidden sm:inline">Every department is searched; answers always include the citations behind them</span>
              <span className="flex items-center gap-1"><History size={11} />Session saved automatically</span>
            </div>
          </form>
        </div>
      </section>

      {/* Evidence rail */}
      <aside className="hidden w-[320px] shrink-0 flex-col border-l border-nx-border bg-nx-surface/45 lg:flex">
        <div className="border-b border-nx-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-nx-accent" />
            <h2 className="text-sm font-semibold">Evidence</h2>
          </div>
          <p className="mt-1 text-[11px] text-nx-text-muted">
            {citations.length > 0
              ? `${citations.length} sources cited in this answer`
              : latest?.result
                ? "No sources cited"
                : "Ask a question to see sources"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {citations.map((citation, index) => (
            <button
              onClick={() => setActiveSource(index)}
              key={`${citation}-${index}`}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition-all",
                activeSource === index
                  ? "border-nx-accent/50 bg-nx-accent-muted/50 shadow-[inset_2px_0_0_var(--color-nx-accent)]"
                  : "border-nx-border bg-nx-bg hover:border-nx-border-strong hover:bg-nx-elevated"
              )}
            >
              <div className="flex gap-2">
                <FileText size={14} className="mt-0.5 shrink-0 text-nx-text-muted" />
                <p className="min-w-0 flex-1 text-xs font-medium leading-relaxed text-nx-text-primary">{citation}</p>
              </div>
            </button>
          ))}
        </div>

        {latest?.result && (
          <div className="border-t border-nx-border p-4">
            <div className="rounded-xl border border-nx-border bg-nx-bg p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Passages considered</span>
                <span className="text-xs font-bold text-nx-accent">{latest.result.hits_considered}</span>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-nx-text-muted">
                Retrieved by meaning across all 6 departments, then checked against each other for contradictions.
              </p>
            </div>
          </div>
        )}
      </aside>

      <GuardianPopup mood={mood} message={said} detail={saidDetail} />
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nx-accent to-nx-accent-hover text-white">
        <Bot size={16} />
      </div>
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-nx-text-muted">
          <Loader2 size={12} className="animate-spin text-nx-accent" />
          Searching every department, then checking the sources against each other…
        </div>
        <div className="h-3 w-3/4 animate-pulse rounded bg-nx-elevated" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-nx-elevated" />
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-nx-danger/25 bg-nx-danger-muted/40 p-5">
      <WifiOff size={17} className="mt-0.5 shrink-0 text-nx-danger" />
      <div>
        <p className="text-sm font-semibold text-nx-danger">Could not get an answer</p>
        <p className="mt-1 text-xs leading-relaxed text-nx-text-secondary">{message}</p>
      </div>
    </div>
  );
}

function ResultBlock({ result }: { result: AskResponse }) {
  return (
    <article className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nx-accent to-nx-accent-hover text-white">
          <Bot size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">Nexora Guardian</p>
            {result.has_conflict ? (
              <span className="flex items-center gap-1 rounded-full bg-nx-danger-muted px-1.5 py-0.5 text-[10px] font-medium text-nx-danger">
                <AlertTriangle size={10} />Conflict detected
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-nx-success-muted px-1.5 py-0.5 text-[10px] font-medium text-nx-success">
                <CheckCircle2 size={10} />Sources agree
              </span>
            )}
            <span className="text-[10px] text-nx-text-disabled">{result.hits_considered} passages considered</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-nx-text-secondary">{result.answer}</p>
        </div>
      </div>

      {/* Settled by a newer policy. Named explicitly, because "no conflict" and
          "a newer document already fixed this" are different facts. */}
      {result.superseded_by && (
        <div className="flex items-start gap-3 rounded-2xl border border-nx-success/25 bg-nx-success-muted p-4">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-nx-success" />
          <div>
            <p className="text-sm font-semibold text-nx-success">
              Resolved by a superseding policy
            </p>
            <p className="mt-1 text-xs leading-relaxed text-nx-text-secondary">
              <strong className="text-nx-text-primary">{result.superseded_by}</strong> explicitly
              retires the earlier documents on this point, so there is a single correct answer.
              The legacy documents still carry the old wording and remain queued for their owners
              to update.
            </p>
          </div>
        </div>
      )}

      {result.conflict && <ConflictCard conflict={result.conflict} />}
    </article>
  );
}

function ConflictCard({ conflict }: { conflict: NonNullable<AskResponse["conflict"]> }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-nx-border bg-nx-elevated/45 px-5 py-3.5">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider",
            conflict.severity === "High"
              ? "border-nx-danger/30 bg-nx-danger-muted text-nx-danger"
              : conflict.severity === "Medium"
                ? "border-nx-warning/30 bg-nx-warning-muted text-nx-warning"
                : "border-nx-border bg-nx-elevated text-nx-text-muted"
          )}
        >
          {conflict.severity.toUpperCase()} RISK
        </span>
        <p className="text-sm font-semibold">{conflict.topic}</p>
        <span className="ml-auto text-[10px] font-medium tracking-[0.14em] text-nx-text-disabled">
          {conflict.claims.length} SOURCES DISAGREE
        </span>
      </div>

      <div className="p-5">
        {/* One block per claim — a pair-shaped layout could not show three. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {conflict.claims.map((claim, index) => (
            <div key={index} className="rounded-xl border border-nx-border bg-nx-bg p-3.5">
              <p className="text-base font-semibold text-nx-danger">{claim.value}</p>
              <p className="mt-2 text-xs font-semibold text-nx-text-primary">{claim.document}</p>
              <p className="mt-0.5 text-[11px] text-nx-text-muted">{claim.section}</p>
              <p className="mt-2 border-t border-nx-border pt-2 text-[10px] text-nx-text-disabled">
                {claim.department} · {claim.owner}
              </p>
              {claim.quote && (
                <p className="mt-2 text-[11px] italic leading-relaxed text-nx-text-muted">“{claim.quote}”</p>
              )}
            </div>
          ))}
        </div>

        {conflict.explanation && (
          <p className="mt-4 text-xs leading-6 text-nx-text-secondary">{conflict.explanation}</p>
        )}

        {conflict.recommended_action && (
          <div className="mt-4 rounded-xl border border-nx-success/15 bg-nx-success-muted/40 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nx-success">Recommended resolution</p>
            <p className="mt-1.5 text-xs leading-5 text-nx-text-secondary">{conflict.recommended_action}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/conflicts"
            className="inline-flex items-center gap-1.5 rounded-lg bg-nx-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-nx-accent-hover"
          >
            Review conflict <ArrowUpRight size={13} />
          </Link>
          <button className="rounded-lg border border-nx-border px-3 py-2 text-xs font-medium text-nx-text-secondary transition-colors hover:bg-nx-elevated">
            Create approval task
          </button>
        </div>
      </div>
    </div>
  );
}
