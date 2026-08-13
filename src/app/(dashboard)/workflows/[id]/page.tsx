"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, Save, Play, Upload as UploadIcon,
  FileText, Brain, GitCompare, AlertTriangle, FileOutput,
  UserCheck, Bell, ArrowDown, Settings, Zap, Filter,
  CheckCircle, Clock, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { workflows } from "@/data";

interface WfNode {
  id: string;
  label: string;
  description: string;
  type: string;
  icon: React.ReactNode;
  status: "completed" | "pending";
}

const workflowNodes: WfNode[] = [
  { id: "wn-1", label: "New Document Added", description: "Triggered when a document is uploaded to the workspace", type: "trigger", icon: <UploadIcon size={18} />, status: "completed" },
  { id: "wn-2", label: "Classify Document", description: "AI determines document type, department, and category", type: "ai-action", icon: <Brain size={18} />, status: "completed" },
  { id: "wn-3", label: "Extract Key Terms", description: "Identify important entities, clauses, and metadata", type: "ai-action", icon: <FileText size={18} />, status: "completed" },
  { id: "wn-4", label: "Compare Against Policies", description: "Cross-reference extracted terms with existing policies", type: "ai-action", icon: <GitCompare size={18} />, status: "completed" },
  { id: "wn-5", label: "Detect Conflicts", description: "Identify contradictions and inconsistencies", type: "condition", icon: <AlertTriangle size={18} />, status: "completed" },
  { id: "wn-6", label: "Generate Report", description: "Compile analysis into structured findings report", type: "output", icon: <FileOutput size={18} />, status: "pending" },
  { id: "wn-7", label: "Request Human Approval", description: "Route to appropriate reviewer for sign-off", type: "approval", icon: <UserCheck size={18} />, status: "pending" },
  { id: "wn-8", label: "Notify Legal Team", description: "Send Slack notification with summary to Legal channel", type: "integration", icon: <Bell size={18} />, status: "pending" },
];

const nodeLibrary = [
  { group: "Triggers", items: [{ label: "Document Upload", icon: <UploadIcon size={14} /> }, { label: "Schedule", icon: <Clock size={14} /> }, { label: "Webhook", icon: <Zap size={14} /> }] },
  { group: "AI Actions", items: [{ label: "Classify", icon: <Brain size={14} /> }, { label: "Extract", icon: <FileText size={14} /> }, { label: "Compare", icon: <GitCompare size={14} /> }, { label: "Summarize", icon: <FileOutput size={14} /> }] },
  { group: "Conditions", items: [{ label: "If/Else", icon: <Filter size={14} /> }, { label: "Conflict Check", icon: <AlertTriangle size={14} /> }] },
  { group: "Approvals", items: [{ label: "Human Review", icon: <UserCheck size={14} /> }, { label: "Auto-Approve", icon: <CheckCircle size={14} /> }] },
  { group: "Integrations", items: [{ label: "Slack", icon: <Bell size={14} /> }, { label: "Email", icon: <Bell size={14} /> }, { label: "Jira", icon: <Settings size={14} /> }] },
];

const typeColors: Record<string, string> = {
  trigger: "border-nx-cyan/30 bg-nx-cyan/5",
  "ai-action": "border-nx-accent/30 bg-nx-accent/5",
  condition: "border-nx-warning/30 bg-nx-warning/5",
  output: "border-nx-success/30 bg-nx-success/5",
  approval: "border-purple-500/30 bg-purple-500/5",
  integration: "border-orange-500/30 bg-orange-500/5",
};

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const wf = workflows.find((w) => w.id === id) || workflows[0];
  const [selectedNode, setSelectedNode] = useState<string | null>("wn-2");

  const selected = workflowNodes.find((n) => n.id === selectedNode);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Node Library */}
      <div className="w-[220px] border-r border-nx-border bg-nx-surface shrink-0 flex flex-col">
        <div className="px-3 py-3 border-b border-nx-border">
          <Link href="/workflows" className="flex items-center gap-1 text-xs text-nx-text-muted hover:text-nx-accent transition-colors mb-2">
            <ArrowLeft size={12} /> Back to Workflows
          </Link>
          <h2 className="text-sm font-semibold">Node Library</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {nodeLibrary.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] font-medium text-nx-text-muted uppercase tracking-wider px-2 mb-1.5">{group.group}</p>
              {group.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-nx-text-secondary hover:bg-nx-elevated hover:text-nx-text-primary cursor-grab transition-colors"
                >
                  <span className="text-nx-text-muted">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-nx-border bg-nx-surface/80 flex items-center justify-between px-4">
          <div>
            <span className="text-sm font-semibold">{wf.name}</span>
            <span className="text-[11px] text-nx-text-muted ml-2 font-mono">{workflowNodes.length} nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nx-border text-xs text-nx-text-secondary hover:bg-nx-elevated transition-colors">
              <Save size={12} /> Save
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-nx-border text-xs text-nx-text-secondary hover:bg-nx-elevated transition-colors">
              <Play size={12} /> Test
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-xs font-medium transition-colors">
              <Zap size={12} /> Publish
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-nx-bg bg-grid p-8">
          <div className="flex flex-col items-center gap-0 min-w-[400px] max-w-[480px] mx-auto">
            {workflowNodes.map((node, i) => (
              <div key={node.id} className="flex flex-col items-center w-full">
                <div
                  onClick={() => setSelectedNode(node.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg",
                    typeColors[node.type] || "border-nx-border bg-nx-surface",
                    selectedNode === node.id && "ring-2 ring-nx-accent ring-offset-2 ring-offset-nx-bg"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-nx-text-muted">{node.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-nx-text-primary">{node.label}</p>
                      <p className="text-[11px] text-nx-text-muted mt-0.5">{node.description}</p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded",
                      node.type === "trigger" ? "bg-nx-cyan-muted text-nx-cyan" : "bg-nx-elevated text-nx-text-muted"
                    )}>
                      {node.type}
                    </span>
                  </div>
                </div>
                {i < workflowNodes.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-px h-4 bg-nx-border-strong" />
                    <ArrowDown size={12} className="text-nx-text-disabled -mt-0.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-[280px] border-l border-nx-border bg-nx-surface shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-nx-border">
          <h2 className="text-sm font-semibold">Configuration</h2>
        </div>
        {selected ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Node Name</label>
              <input defaultValue={selected.label} className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Description</label>
              <textarea defaultValue={selected.description} rows={3} className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent resize-none" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">Type</label>
              <p className="mt-1.5 text-sm text-nx-text-secondary capitalize">{selected.type.replace("-", " ")}</p>
            </div>
            <div className="pt-3 border-t border-nx-border">
              <button className="flex items-center gap-2 text-xs text-nx-danger hover:underline">
                <Trash2 size={12} /> Remove node
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-nx-text-muted text-center">Select a node to configure</p>
          </div>
        )}
      </div>
    </div>
  );
}
