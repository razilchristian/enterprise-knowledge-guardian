"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { initials, usePersona } from "@/lib/persona";
import {
  LayoutDashboard, MessageSquare, FileText, Brain, Bot, GitBranch,
  BarChart3, Activity, Plug, Shield, Settings, ChevronLeft, ChevronDown,
  Users, Code, HardHat, ChevronsLeft, LogOut, Lock, Landmark,
  Briefcase, Globe,
} from "lucide-react";
import Logo from "@/components/ui/logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const mainNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "AI Workspace", href: "/workspace", icon: <MessageSquare size={18} /> },
  { label: "Documents", href: "/documents", icon: <FileText size={18} /> },
  { label: "Knowledge", href: "/knowledge", icon: <Brain size={18} /> },
  { label: "Agents", href: "/agents", icon: <Bot size={18} />, badge: 4 },
  { label: "Workflows", href: "/workflows", icon: <GitBranch size={18} /> },
  { label: "Conflicts", href: "/conflicts", icon: <BarChart3 size={18} />, badge: 8 },
  { label: "Activity", href: "/activity", icon: <Activity size={18} /> },
];

// Departments are a filter over one shared corpus, not separate walled workspaces.
// Every one of these is browsable by every role.
const departmentNav: NavItem[] = [
  { label: "Human Resources", href: "/documents?dept=hr", icon: <Users size={16} /> },
  { label: "Legal", href: "/documents?dept=legal", icon: <Briefcase size={16} /> },
  { label: "Engineering", href: "/documents?dept=eng", icon: <Code size={16} /> },
  { label: "Security", href: "/documents?dept=sec", icon: <Lock size={16} /> },
  { label: "Operations", href: "/documents?dept=ops", icon: <HardHat size={16} /> },
  { label: "Finance", href: "/documents?dept=fin", icon: <Landmark size={16} /> },
];

const systemNav: NavItem[] = [
  { label: "Integrations", href: "/integrations", icon: <Plug size={18} /> },
  { label: "Trust Center", href: "/security", icon: <Shield size={18} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, persona } = usePersona();
  const [collapsed, setCollapsed] = useState(false);
  const [wsOpen, setWsOpen] = useState(true);

  const isActive = (href: string) => {
    if (href.includes("?")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        // Inverted panel: violet-deep ground with light text, so it reads as
        // chrome and the paper content area reads as the document.
        "fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-nx-sidebar-border bg-nx-sidebar text-nx-sidebar-text transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-[60px] border-b border-nx-sidebar-border shrink-0">
        <Logo size={26} className="shrink-0 text-nx-sidebar-text" />
        {!collapsed && (
          <div className="flex flex-col min-w-0 leading-none">
            <span className="font-serif text-[14px] font-bold tracking-[0.02em] text-nx-sidebar-text">
              NEXORA GUARDIAN
            </span>
            <span className="mt-1 truncate text-[10.5px] text-nx-sidebar-muted">
              Enterprise knowledge trust
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto p-1.5 rounded-md text-nx-sidebar-muted hover:text-nx-sidebar-text hover:bg-nx-sidebar-hover transition-colors",
            collapsed && "ml-0"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronLeft size={16} className="rotate-180" /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {/* Main Nav */}
        <div className="space-y-0.5">
          {!collapsed && <p className="px-2 mb-2 text-[11px] font-medium text-nx-sidebar-muted uppercase tracking-wider">Platform</p>}
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors group relative",
                isActive(item.href)
                  ? "bg-nx-sidebar-active text-white font-medium"
                  : "text-nx-sidebar-text/80 hover:text-white hover:bg-nx-sidebar-hover"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className={cn(
                  "ml-auto text-[11px] font-mono font-medium px-1.5 py-0.5 rounded",
                  item.label === "Conflicts"
                    ? "bg-nx-danger text-white"
                    : "bg-white/15 text-nx-sidebar-text"
                )}>
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-nx-danger" />
              )}
            </Link>
          ))}
        </div>

        {/* Departments — a filter, not a wall. Everyone can open every one. */}
        <div className="space-y-0.5">
          {!collapsed && (
            <button
              onClick={() => setWsOpen(!wsOpen)}
              className="flex items-center gap-1 px-2 mb-2 text-[11px] font-medium text-nx-sidebar-muted uppercase tracking-wider hover:text-nx-sidebar-text transition-colors w-full"
            >
              Departments
              <span title="Open to every role" className="text-emerald-300"><Globe size={10} /></span>
              <ChevronDown size={12} className={cn("ml-auto transition-transform", !wsOpen && "-rotate-90")} />
            </button>
          )}
          {(collapsed || wsOpen) && departmentNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 px-2.5 py-1.5 rounded-md text-sm text-nx-sidebar-muted hover:text-white hover:bg-nx-sidebar-hover transition-colors"
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* System */}
        <div className="space-y-0.5">
          {!collapsed && <p className="px-2 mb-2 text-[11px] font-medium text-nx-sidebar-muted uppercase tracking-wider">System</p>}
          {systemNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors",
                isActive(item.href)
                  ? "bg-nx-sidebar-active text-white font-medium"
                  : "text-nx-sidebar-text/80 hover:text-white hover:bg-nx-sidebar-hover"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Signed-in persona */}
      <div className="border-t border-nx-sidebar-border px-2 py-3">
        <div className={cn(
          "flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-nx-sidebar-hover transition-colors cursor-pointer",
          collapsed && "justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-nx-sidebar-text text-xs font-bold shrink-0">
            {initials(user.name)}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-nx-sidebar-text truncate">{user.name}</span>
              <span className="text-[11px] text-nx-sidebar-muted truncate">{user.title} · {persona.role}</span>
            </div>
          )}
          {!collapsed && <LogOut size={14} className="text-nx-sidebar-muted shrink-0" />}
        </div>
      </div>
    </aside>
  );
}
