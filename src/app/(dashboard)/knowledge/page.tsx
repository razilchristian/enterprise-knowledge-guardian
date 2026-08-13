"use client";

import { useState } from "react";
import {
  Brain, FileText, Users, Building2, Bot, Shield, Box, Workflow,
  AlertCircle, CheckCircle, Clock, AlertTriangle, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { knowledgeNodes } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import type { KnowledgeNodeType } from "@/types";

const typeIcon: Record<KnowledgeNodeType, React.ReactNode> = {
  document: <FileText size={18} />,
  person: <Users size={18} />,
  policy: <Shield size={18} />,
  project: <Box size={18} />,
  department: <Building2 size={18} />,
  system: <Workflow size={18} />,
  agent: <Bot size={18} />,
};

const typeColor: Record<KnowledgeNodeType, string> = {
  document: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  person: "border-green-500/40 bg-green-500/10 text-green-400",
  policy: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  project: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  department: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  system: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  agent: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
};

const healthIcon: Record<string, React.ReactNode> = {
  healthy: <CheckCircle size={12} className="text-nx-success" />,
  "at-risk": <Clock size={12} className="text-nx-warning" />,
  outdated: <AlertCircle size={12} className="text-nx-danger" />,
  conflicting: <AlertTriangle size={12} className="text-nx-danger" />,
};

export default function KnowledgePage() {
  const [selected, setSelected] = useState(knowledgeNodes[0]);
  const [search, setSearch] = useState("");

  const filtered = knowledgeNodes.filter(n =>
    n.label.toLowerCase().includes(search.toLowerCase()) ||
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  // Knowledge Health stats
  const healthCounts = {
    healthy: knowledgeNodes.filter(n => n.health === "healthy").length,
    atRisk: knowledgeNodes.filter(n => n.health === "at-risk").length,
    outdated: knowledgeNodes.filter(n => n.health === "outdated").length,
    conflicting: knowledgeNodes.filter(n => n.health === "conflicting").length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Knowledge Graph</h1>
        <p className="text-sm text-nx-text-muted mt-0.5">Explore relationships between documents, people, policies, and systems</p>
      </div>

      {/* Knowledge Health */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-nx-success-muted"><CheckCircle size={18} className="text-nx-success" /></div>
          <div><p className="text-lg font-semibold">{healthCounts.healthy}</p><p className="text-[11px] text-nx-text-muted">Healthy</p></div>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-nx-warning-muted"><Clock size={18} className="text-nx-warning" /></div>
          <div><p className="text-lg font-semibold">{healthCounts.atRisk}</p><p className="text-[11px] text-nx-text-muted">At Risk</p></div>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-nx-danger-muted"><AlertCircle size={18} className="text-nx-danger" /></div>
          <div><p className="text-lg font-semibold">{healthCounts.outdated}</p><p className="text-[11px] text-nx-text-muted">Outdated</p></div>
        </div>
        <div className="bg-nx-surface border border-nx-border rounded-lg p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-nx-danger-muted"><AlertTriangle size={18} className="text-nx-danger" /></div>
          <div><p className="text-lg font-semibold">{healthCounts.conflicting}</p><p className="text-[11px] text-nx-text-muted">Conflicting</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization Area */}
        <div className="lg:col-span-2 bg-nx-surface border border-nx-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-nx-border flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2"><Brain size={14} className="text-nx-accent" /> Entity Graph</h2>
            <div className="flex items-center gap-2 bg-nx-bg border border-nx-border rounded-lg px-2.5 h-8">
              <Search size={13} className="text-nx-text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search nodes..." className="bg-transparent text-xs outline-none text-nx-text-primary placeholder:text-nx-text-muted w-32" />
            </div>
          </div>
          {/* Simulated Graph */}
          <div className="p-6 min-h-[500px] bg-grid relative">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {filtered.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelected(node)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center hover:shadow-lg",
                    typeColor[node.type],
                    selected.id === node.id && "ring-2 ring-nx-accent ring-offset-2 ring-offset-nx-bg scale-105"
                  )}
                >
                  <div className="flex justify-center mb-2">{typeIcon[node.type]}</div>
                  <p className="text-xs font-medium text-nx-text-primary truncate">{node.label}</p>
                  <p className="text-[10px] text-nx-text-muted mt-0.5 capitalize">{node.type}</p>
                  {node.health && (
                    <div className="flex justify-center mt-1.5">{healthIcon[node.health]}</div>
                  )}
                </button>
              ))}
            </div>
            {/* Simulated connections overlay text */}
            <p className="absolute bottom-4 right-4 text-[10px] text-nx-text-disabled font-mono">
              {knowledgeNodes.length} nodes · 13 connections
            </p>
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-nx-surface border border-nx-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-nx-border">
            <h2 className="text-sm font-semibold">Node Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl border-2", typeColor[selected.type])}>
                {typeIcon[selected.type]}
              </div>
              <div>
                <p className="text-sm font-semibold">{selected.label}</p>
                <p className="text-[11px] text-nx-text-muted capitalize">{selected.type}</p>
              </div>
            </div>

            <p className="text-xs text-nx-text-secondary leading-relaxed">{selected.description}</p>

            <div className="space-y-2 pt-2 border-t border-nx-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-nx-text-muted">Connections</span>
                <span className="text-xs font-mono text-nx-text-secondary">{selected.connections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-nx-text-muted">Last Updated</span>
                <span className="text-xs font-mono text-nx-text-secondary">{formatRelativeTime(selected.lastUpdated)}</span>
              </div>
              {selected.health && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-nx-text-muted">Health</span>
                  <span className="flex items-center gap-1 text-xs font-medium capitalize">
                    {healthIcon[selected.health]} {selected.health}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
