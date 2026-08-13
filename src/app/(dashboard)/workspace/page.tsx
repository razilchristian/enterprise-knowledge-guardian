"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Bot, BookOpen, CheckCircle2, ChevronRight, FileText,
  History, Paperclip, Plus, Send, Globe, Sparkles, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Source {
  name: string;
  section: string;
  relevance: number;
  excerpt: string;
}

interface ConflictResult {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  sourceA: { name: string; section: string };
  sourceB: { name: string; section: string };
  difference: string;
  resolution: string;
}

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: Source[];
  conflicts?: ConflictResult[];
}

const researchSources: Source[] = [
  { name: "HR Leave Policy", section: "§4.2 · Casual leave entitlement", relevance: 96, excerpt: "Eligible employees receive twelve (12) days of casual leave annually." },
  { name: "Employee Handbook v3.2", section: "§7.3 · Casual leave", relevance: 92, excerpt: "Full-time employees are entitled to ten (10) days of casual leave per year." },
  { name: "Manager Guide", section: "§3.1 · Time-off guidance", relevance: 88, excerpt: "Managers may approve up to fifteen (15) days of casual leave annually." },
  { name: "HR Guidelines", section: "§7 · Policy exceptions", relevance: 81, excerpt: "Policy owners must publish amendments to all dependent employee-facing materials." },
];

const initialMessages: Message[] = [
  { id: "m-1", role: "user", content: "How many casual leave days are employees entitled to?" },
  {
    id: "m-2",
    role: "ai",
    content: "I can’t provide one definitive number because three HR sources disagree. I found 10 days in the Employee Handbook, 12 in the HR Leave Policy, and 15 in the Manager Guide. Guardian has opened a review recommendation instead of guessing. Every employee asking this question sees the same three sources.",
    sources: researchSources,
    conflicts: [
      {
        id: "cr-1", title: "Casual leave entitlement", severity: "High",
        sourceA: { name: "Employee Handbook §7.3", section: "10 days per year" },
        sourceB: { name: "HR Leave Policy §4.2", section: "12 days per year" },
        difference: "A third source, the Manager Guide §3.1, states 15 days. Guardian detected 10, 12, and 15-day entitlements for the same employee group.",
        resolution: "Confirm the approved entitlement with Compensation & Benefits, amend outdated sources, and publish the decision only after HR approval.",
      },
      {
        id: "cr-2", title: "Equipment return deadline", severity: "Medium",
        sourceA: { name: "Employee Handbook §12.4", section: "5 business days to return" },
        sourceB: { name: "IT Procurement Policy §8.1", section: "Return on last day" },
        difference: "The two policies define incompatible deadlines for returning company equipment after termination.",
        resolution: "Set a single three-business-day return window and route the change to HR and IT owners.",
      },
    ],
  },
];

const conversations = [
  "Casual leave entitlement conflict", "Vendor contract risk assessment", "SOC 2 compliance gaps", "Engineering standards review", "Q3 financial summary analysis",
];

export default function WorkspacePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [activeSource, setActiveSource] = useState(0);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const activeSources = messages.find((message) => message.sources)?.sources ?? researchSources;

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewResearch = () => {
    setMessages([]);
    setInput("");
    setActiveSource(0);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: question },
      {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: "I’ve searched every HR document in the organization — nothing was filtered out for your role. The evidence still contains a conflicting casual-leave entitlement, so I recommend a human review task before communicating guidance to employees.",
        sources: researchSources,
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-nx-bg">
      <aside className="hidden xl:flex w-[274px] shrink-0 flex-col border-r border-nx-border bg-nx-surface/50">
        <div className="p-4 border-b border-nx-border">
          <button onClick={startNewResearch} className="group w-full flex items-center justify-between rounded-xl bg-nx-accent px-3.5 py-3 text-sm font-semibold text-white transition-all hover:bg-nx-accent-hover hover:shadow-lg hover:shadow-nx-accent/10">
            <span className="flex items-center gap-2"><Plus size={16} /> New research</span><span className="text-white/60 group-hover:translate-x-0.5 transition-transform">⌘ K</span>
          </button>
        </div>
        <div className="p-4 pb-2"><p className="text-[10px] font-semibold tracking-[0.16em] text-nx-text-muted uppercase">Recent research</p></div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {conversations.map((title, index) => (
            <button key={title} className={cn("group w-full rounded-lg px-3 py-3 text-left transition-colors", index === 0 ? "bg-nx-elevated text-nx-text-primary" : "text-nx-text-muted hover:bg-nx-elevated/60 hover:text-nx-text-secondary")}>
              <p className="truncate text-xs font-medium">{title}</p>
              <p className="mt-1 text-[10px] text-nx-text-disabled">{index === 0 ? "Just now" : `${index * 2}h ago`} · {index === 0 ? "4 sources" : "Research"}</p>
            </button>
          ))}
        </div>
        <div className="m-3 rounded-xl border border-nx-border bg-nx-bg p-3.5">
          <div className="flex items-center gap-2 text-nx-cyan"><Globe size={15} /><span className="text-xs font-semibold">Open knowledge base</span></div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-nx-text-muted">Every department is searched, whatever your role. You and the CEO get the same answer.</p>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-nx-border px-5 py-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nx-accent-muted text-nx-accent"><Sparkles size={17} /></div>
            <div className="min-w-0"><p className="text-sm font-semibold text-nx-text-primary">Research workspace</p><p className="truncate text-[11px] text-nx-text-muted">Grounded answers across your organization</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-nx-success/20 bg-nx-success-muted px-2.5 py-1.5 text-[11px] font-medium text-nx-success"><Globe size={12} />All departments searched</div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center pt-16 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nx-accent to-nx-cyan text-white shadow-xl shadow-nx-accent/10"><Sparkles size={28} /></div>
              <p className="text-2xl font-semibold tracking-tight">What can I help you understand?</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-nx-text-muted">Ask a question across your company knowledge. Every answer is grounded in sources you can inspect.</p>
              <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">{["Compare our HR policies for conflicts", "Summarize the latest vendor agreement", "What SOC 2 gaps need attention?", "Find outdated engineering standards"].map((prompt) => <button key={prompt} onClick={() => setInput(prompt)} className="rounded-xl border border-nx-border bg-nx-surface p-3.5 text-left text-xs text-nx-text-secondary transition-colors hover:border-nx-accent/50 hover:bg-nx-elevated">{prompt}<ChevronRight size={14} className="mt-2 text-nx-accent" /></button>)}</div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="rounded-2xl border border-nx-border bg-nx-surface p-5 md:p-6">
                <div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-elevated text-nx-text-secondary"><User size={14} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-nx-text-muted">Your question</p><p className="mt-1.5 text-base leading-relaxed text-nx-text-primary">{messages[0]?.content}</p></div></div>
              </div>
              {messages.filter((message) => message.role === "ai").map((message) => (
                <article key={message.id} className="space-y-5">
                  <div className="flex items-start gap-3"><div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nx-accent to-nx-cyan text-white"><Bot size={16} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold">Nexora Guardian</p><span className="flex items-center gap-1 rounded-full bg-nx-success-muted px-1.5 py-0.5 text-[10px] font-medium text-nx-success"><CheckCircle2 size={10} />Evidence verified</span></div><p className="mt-2 text-sm leading-7 text-nx-text-secondary">{message.content}</p></div></div>
                  {message.conflicts?.map((conflict, index) => (
                    <div key={conflict.id} className="overflow-hidden rounded-2xl border border-nx-border bg-nx-surface shadow-sm">
                      <div className="flex flex-wrap items-center gap-3 border-b border-nx-border bg-nx-elevated/45 px-5 py-3.5"><span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider", conflict.severity === "High" ? "border-nx-danger/30 bg-nx-danger-muted text-nx-danger" : "border-nx-warning/30 bg-nx-warning-muted text-nx-warning")}>{conflict.severity.toUpperCase()} RISK</span><span className="text-[10px] font-medium tracking-[0.14em] text-nx-text-disabled">FINDING {String(index + 1).padStart(2, "0")}</span><p className="text-sm font-semibold">{conflict.title}</p></div>
                      <div className="p-5"><div className="grid gap-3 sm:grid-cols-2"><EvidenceBlock label="Current handbook" source={conflict.sourceA} /><EvidenceBlock label="Conflicting policy" source={conflict.sourceB} /></div><p className="mt-4 text-xs leading-6 text-nx-text-secondary">{conflict.difference}</p><div className="mt-4 rounded-xl border border-nx-success/15 bg-nx-success-muted/40 p-3.5"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-nx-success">Recommended resolution</p><p className="mt-1.5 text-xs leading-5 text-nx-text-secondary">{conflict.resolution}</p></div><div className="mt-4 flex flex-wrap gap-2"><Link href="/conflicts/con-1" className="inline-flex items-center gap-1.5 rounded-lg bg-nx-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-nx-accent-hover">Review conflict <ArrowUpRight size={13} /></Link><button className="rounded-lg border border-nx-border px-3 py-2 text-xs font-medium text-nx-text-secondary transition-colors hover:bg-nx-elevated">Create approval task</button></div></div>
                    </div>
                  ))}
                </article>
              ))}
              <div ref={messagesEnd} />
            </div>
          )}
        </div>

        <div className="border-t border-nx-border bg-nx-surface/80 p-4 backdrop-blur-xl md:px-8 md:py-5">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-2xl border border-nx-border bg-nx-bg p-2 shadow-[0_12px_34px_rgba(0,0,0,0.16)] transition-colors focus-within:border-nx-accent/60">
            <div className="flex items-center gap-2"><button type="button" className="rounded-lg p-2 text-nx-text-muted transition-colors hover:bg-nx-elevated hover:text-nx-text-primary" aria-label="Attach a document"><Paperclip size={17} /></button><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your organization…" className="min-w-0 flex-1 bg-transparent px-1 text-sm text-nx-text-primary outline-none placeholder:text-nx-text-muted" /><button type="submit" disabled={!input.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-nx-accent text-white transition-all hover:bg-nx-accent-hover disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send question"><Send size={15} /></button></div>
            <div className="mt-1 flex items-center justify-between px-2 pb-0.5 text-[10px] text-nx-text-disabled"><span className="hidden sm:inline">Every department is searched; answers always include the citations behind them</span><span className="flex items-center gap-1"><History size={11} />Session saved automatically</span></div>
          </form>
        </div>
      </section>

      <aside className="hidden w-[320px] shrink-0 flex-col border-l border-nx-border bg-nx-surface/45 lg:flex">
        <div className="border-b border-nx-border px-5 py-4"><div className="flex items-center gap-2"><BookOpen size={15} className="text-nx-accent" /><h2 className="text-sm font-semibold">Evidence</h2></div><p className="mt-1 text-[11px] text-nx-text-muted">{activeSources.length} sources used in this answer</p></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">{activeSources.map((source, index) => <button onClick={() => setActiveSource(index)} key={source.name} className={cn("w-full rounded-xl border p-3.5 text-left transition-all", activeSource === index ? "border-nx-accent/50 bg-nx-accent-muted/50 shadow-[inset_2px_0_0_var(--color-nx-accent)]" : "border-nx-border bg-nx-bg hover:border-nx-border-strong hover:bg-nx-elevated")}><div className="flex gap-2"><FileText size={14} className="mt-0.5 shrink-0 text-nx-text-muted" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-xs font-semibold text-nx-text-primary">{source.name}</p><span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", source.relevance >= 90 ? "bg-nx-success-muted text-nx-success" : "bg-nx-accent-muted text-nx-accent")}>{source.relevance}%</span></div><p className="mt-1 text-[10px] text-nx-text-muted">{source.section}</p></div></div></button>)}</div>
        <div className="border-t border-nx-border p-4"><div className="rounded-xl border border-nx-border bg-nx-bg p-3.5"><div className="flex items-center justify-between"><span className="text-xs font-semibold">Answer confidence</span><span className="text-xs font-bold text-nx-success">94%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-nx-elevated"><div className="h-full w-[94%] rounded-full bg-nx-success" /></div><p className="mt-2 text-[10px] leading-relaxed text-nx-text-muted">High source agreement · Last indexed 12 min ago</p></div></div>
      </aside>
    </div>
  );
}

function EvidenceBlock({ label, source }: { label: string; source: { name: string; section: string } }) {
  return <div className="rounded-xl border border-nx-border bg-nx-bg p-3.5"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-nx-text-disabled">{label}</p><p className="mt-2 text-xs font-semibold text-nx-text-primary">{source.name}</p><p className="mt-1 text-[11px] text-nx-text-muted">{source.section}</p></div>;
}
