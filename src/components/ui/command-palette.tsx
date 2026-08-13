"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, FileText, Bot, GitBranch, BarChart3, Brain, Activity,
  Shield, Settings, MessageSquare, Zap, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  group: string;
  action?: () => void;
}

const commands: CommandItem[] = [
  { id: "search", label: "Search documents", description: "Find any document by name or content", icon: <Search size={16} />, href: "/documents", group: "Quick Actions" },
  { id: "ask-ai", label: "Ask Guardian", description: "Get evidence-backed answers from every department", icon: <MessageSquare size={16} />, href: "/workspace", group: "Quick Actions" },
  { id: "run-agent", label: "Run an agent", description: "Execute an AI workflow agent", icon: <Zap size={16} />, href: "/agents", group: "Quick Actions" },
  { id: "nav-dashboard", label: "Go to Dashboard", icon: <ArrowRight size={16} />, href: "/dashboard", group: "Navigation" },
  { id: "nav-documents", label: "Go to Documents", icon: <FileText size={16} />, href: "/documents", group: "Navigation" },
  { id: "nav-conflicts", label: "Go to Conflicts", icon: <BarChart3 size={16} />, href: "/conflicts", group: "Navigation" },
  { id: "nav-agents", label: "Go to Agents", icon: <Bot size={16} />, href: "/agents", group: "Navigation" },
  { id: "nav-workflows", label: "Go to Workflows", icon: <GitBranch size={16} />, href: "/workflows", group: "Navigation" },
  { id: "nav-knowledge", label: "Go to Knowledge Graph", icon: <Brain size={16} />, href: "/knowledge", group: "Navigation" },
  { id: "nav-activity", label: "Go to Activity", icon: <Activity size={16} />, href: "/activity", group: "Navigation" },
  { id: "nav-security", label: "Go to Security", icon: <Shield size={16} />, href: "/security", group: "Navigation" },
  { id: "nav-settings", label: "Go to Settings", icon: <Settings size={16} />, href: "/settings", group: "Navigation" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const execute = useCallback((item: CommandItem) => {
    if (item.href) router.push(item.href);
    if (item.action) item.action();
    onClose();
    setQuery("");
  }, [router, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // Parent handles opening
        }
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      execute(filtered[activeIndex]);
    }
  };

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-nx-surface border border-nx-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-nx-border">
          <Search size={16} className="text-nx-text-muted shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-nx-text-primary placeholder:text-nx-text-muted outline-none"
          />
          <kbd className="text-[11px] text-nx-text-disabled font-mono bg-nx-elevated border border-nx-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto py-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="px-4 py-1.5 text-[11px] font-medium text-nx-text-muted uppercase tracking-wider">
                {group}
              </p>
              {items.map((item) => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => execute(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors",
                      idx === activeIndex
                        ? "bg-nx-accent/10 text-nx-accent"
                        : "text-nx-text-secondary hover:bg-nx-elevated"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{item.label}</p>
                      {item.description && (
                        <p className="text-xs text-nx-text-muted truncate">{item.description}</p>
                      )}
                    </div>
                    {idx === activeIndex && <ArrowRight size={14} className="shrink-0 text-nx-accent" />}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-nx-text-muted">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
