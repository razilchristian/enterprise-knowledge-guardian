"use client";

import Link from "next/link";
import {
  ArrowRight, FileText, AlertTriangle, Bot, GitBranch, Brain,
  Shield, CheckCircle, Zap, Globe,
  ChevronRight, ExternalLink, Activity, Eye, Clock, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";

const features = [
  {
    icon: <FileText size={22} />,
    title: "Document Intelligence",
    description: "Ingest, analyze, and understand enterprise documents at scale. AI extracts key entities, clauses, and relationships automatically.",
  },
  {
    icon: <AlertTriangle size={22} />,
    title: "Conflict Detection",
    description: "Find contradictions across policies, contracts, and documentation before they become problems. AI-powered cross-reference analysis.",
  },
  {
    icon: <Bot size={22} />,
    title: "AI Agents",
    description: "Deploy reusable AI workers for contract review, policy auditing, compliance checking, and more. Each agent learns your enterprise context.",
  },
  {
    icon: <GitBranch size={22} />,
    title: "Workflow Automation",
    description: "Build visual workflows that combine AI analysis, human approval, and integrations into seamless enterprise processes.",
  },
  {
    icon: <Brain size={22} />,
    title: "Knowledge Graph",
    description: "Visualize relationships between documents, people, policies, and systems. Track knowledge health across your organization.",
  },
  {
    icon: <Shield size={22} />,
    title: "Enterprise Trust",
    description: "Every AI insight includes sources, confidence scores, and audit trails. SOC 2, GDPR, and ISO 27001 ready architecture.",
  },
];

const stats = [
  { value: "12,482", label: "Documents Analyzed" },
  { value: "97.2%", label: "AI Accuracy" },
  { value: "3.2x", label: "Faster Reviews" },
  { value: "89%", label: "Conflicts Caught" },
];

const logos = ["Meridian Labs", "Vertex Systems", "Cascade Analytics", "Helix Corp", "Stratos AI", "Prism Industries"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nx-bg text-nx-text-primary">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 border-b border-nx-border/50 bg-nx-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5 text-nx-accent">
            <Logo size={28} />
            <span className="font-serif text-base font-bold tracking-[0.02em] text-nx-text-primary">
              NEXORA GUARDIAN
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-nx-text-muted">
            <a href="#features" className="hover:text-nx-text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-nx-text-primary transition-colors">How it works</a>
            <a href="#trust" className="hover:text-nx-text-primary transition-colors">Security</a>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors"
          >
            Enter Workspace
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nx-accent/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-nx-border bg-nx-surface/50 text-xs text-nx-text-muted mb-8">
            <span className="w-2 h-2 rounded-full bg-nx-success animate-pulse" />
            AI-powered enterprise intelligence platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Enterprise intelligence,
            <br />
            <span className="text-gradient">in motion.</span>
          </h1>

          <p className="text-lg text-nx-text-muted mt-6 max-w-2xl mx-auto leading-relaxed">
            Turn fragmented documents, knowledge, and workflows into trusted AI-powered action.
            Nexora Guardian verifies, connects, and governs enterprise knowledge.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-nx-accent hover:bg-nx-accent-hover text-white font-medium transition-colors shadow-lg shadow-nx-accent/20"
            >
              Enter Workspace <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-nx-border text-nx-text-secondary hover:bg-nx-surface transition-colors font-medium"
            >
              Explore how it works
            </a>
          </div>
        </div>

        {/* Product Preview */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="absolute -inset-1 bg-gradient-to-b from-nx-accent/20 via-nx-accent-hover/10 to-transparent rounded-2xl blur-xl" />
          <div className="relative bg-nx-surface border border-nx-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Simulated dashboard */}
            <div className="h-8 border-b border-nx-border bg-nx-elevated/50 flex items-center gap-2 px-4">
              <div className="w-2.5 h-2.5 rounded-full bg-nx-danger/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-nx-warning/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-nx-success/60" />
              <span className="text-[10px] text-nx-text-disabled font-mono ml-4">app.nexora.ai/dashboard</span>
            </div>
            <div className="p-6 space-y-4">
              {/* Simulated AI command */}
              <div className="flex items-center gap-3 bg-nx-bg border border-nx-border rounded-xl px-4 py-3">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-nx-accent to-nx-accent-hover flex items-center justify-center">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="text-sm text-nx-text-muted">Ask Guardian anything — every department is in scope...</span>
              </div>
              {/* Simulated metrics */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Documents", value: "12,482", icon: <FileText size={14} /> },
                  { label: "Conflicts", value: "8", icon: <AlertTriangle size={14} /> },
                  { label: "Agents", value: "17", icon: <Bot size={14} /> },
                  { label: "AI Actions", value: "126", icon: <Zap size={14} /> },
                ].map((m) => (
                  <div key={m.label} className="bg-nx-elevated/50 border border-nx-border rounded-lg p-3">
                    <span className="text-nx-text-muted">{m.icon}</span>
                    <p className="text-lg font-semibold mt-1">{m.value}</p>
                    <p className="text-[10px] text-nx-text-muted">{m.label}</p>
                  </div>
                ))}
              </div>
              {/* Simulated intelligence feed */}
              <div className="space-y-2">
                {[
                  { title: "Policy conflict detected", badge: "HIGH", badgeColor: "text-nx-danger bg-nx-danger-muted" },
                  { title: "Agent completed: 42 contracts analyzed", badge: "DONE", badgeColor: "text-nx-success bg-nx-success-muted" },
                  { title: "Security playbook stale — 11 months", badge: "WARN", badgeColor: "text-nx-warning bg-nx-warning-muted" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 bg-nx-bg border border-nx-border rounded-lg px-4 py-2.5">
                    <span className={cn("text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded", item.badgeColor)}>{item.badge}</span>
                    <span className="text-xs text-nx-text-secondary">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="py-12 border-y border-nx-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-nx-text-disabled uppercase tracking-widest mb-8">Trusted by modern enterprise teams</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {logos.map((logo) => (
              <span key={logo} className="text-sm font-semibold text-nx-text-disabled/60 tracking-wide">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6" id="how-it-works">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-nx-accent font-medium uppercase tracking-widest mb-4">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Enterprise knowledge is scattered, contradictory, and going stale.
          </h2>
          <p className="text-base text-nx-text-muted mt-4 leading-relaxed">
            Policies conflict with each other. Documents go months without review.
            Teams make decisions based on outdated information. Manual reviews can&apos;t keep up.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-nx-surface/30" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-nx-accent font-medium uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Intelligence at every layer of your organization.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-nx-surface border border-nx-border rounded-xl p-6 hover:border-nx-border-strong transition-all group">
                <div className="p-3 rounded-xl bg-nx-elevated border border-nx-border text-nx-accent w-fit mb-4 group-hover:bg-nx-accent group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-nx-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-gradient">{stat.value}</p>
              <p className="text-sm text-nx-text-muted mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 px-6 bg-nx-surface/30" id="trust">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-nx-accent font-medium uppercase tracking-widest mb-4">Enterprise Trust</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            AI you can verify. Security you can trust.
          </h2>
          <p className="text-base text-nx-text-muted max-w-2xl mx-auto leading-relaxed mb-12">
            Every AI insight comes with sources, confidence scores, and reasoning.
            One open knowledge base for every department, with full audit trails
            and a named human approving every change.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Eye size={20} />, title: "Transparent AI", desc: "Sources and confidence on every insight" },
              { icon: <Globe size={20} />, title: "One Shared Truth", desc: "Every role reads the same answer" },
              { icon: <Activity size={20} />, title: "Full Auditability", desc: "Complete trail of every action" },
            ].map((item) => (
              <div key={item.title} className="bg-nx-surface border border-nx-border rounded-xl p-6 text-center">
                <div className="p-3 rounded-xl bg-nx-elevated border border-nx-border text-nx-accent w-fit mx-auto mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-nx-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to bring intelligence to your enterprise?
          </h2>
          <p className="text-base text-nx-text-muted mt-4 mb-8">
            Start analyzing your documents, detecting conflicts, and automating workflows today.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-nx-accent hover:bg-nx-accent-hover text-white font-medium text-lg transition-colors shadow-lg shadow-nx-accent/20"
          >
            Enter Workspace <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-nx-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-nx-accent to-nx-accent-hover flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            <span className="text-sm font-semibold text-nx-text-muted">NEXORA GUARDIAN</span>
          </div>
          <p className="text-xs text-nx-text-disabled">Enterprise Intelligence Platform · Frontend Prototype</p>
        </div>
      </footer>
    </div>
  );
}
