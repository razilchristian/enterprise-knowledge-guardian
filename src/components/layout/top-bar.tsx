"use client";

import { useState } from "react";
import { Search, Command, Bell, HelpCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications as notifData } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import CommandPalette from "@/components/ui/command-palette";
import PersonaSwitcher from "@/components/layout/persona-switcher";

export default function TopBar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const unreadCount = notifData.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 h-[64px] border-b border-nx-border bg-nx-surface/80 backdrop-blur-xl flex items-center px-6 gap-4">
        {/* Search */}
        <button
          onClick={() => setShowPalette(true)}
          className="flex items-center gap-3 h-10 px-3 rounded-lg border border-nx-border bg-nx-bg/50 hover:bg-nx-elevated hover:border-nx-accent/50 transition-colors flex-1 max-w-md cursor-text"
        >
          <Search size={15} className="text-nx-text-muted shrink-0" />
          <span className="text-sm text-nx-text-muted">Search every department&apos;s documents...</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-1 text-[11px] text-nx-text-disabled font-mono bg-nx-elevated border border-nx-border rounded px-1.5 py-0.5">
            <Command size={10} />K
          </kbd>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Open knowledge indicator — the whole corpus is in scope, always */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-nx-success/8 border border-nx-success/20 mr-2"
            title="Every department's documents are searchable by every role. No filtering."
          >
            <Globe size={12} className="text-nx-success" />
            <span className="text-xs text-nx-success font-medium">All 6 departments in scope</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-nx-danger text-[10px] text-white font-medium flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-12 z-50 w-[380px] max-h-[480px] bg-nx-surface border border-nx-border rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-nx-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <span className="text-[11px] text-nx-accent cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="overflow-y-auto max-h-[400px] divide-y divide-nx-border">
                    {notifData.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          "px-4 py-3 hover:bg-nx-elevated/50 transition-colors cursor-pointer",
                          !notif.read && "bg-nx-accent/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!notif.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-nx-accent shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-nx-text-primary truncate">{notif.title}</p>
                            <p className="text-xs text-nx-text-muted mt-0.5 line-clamp-2">{notif.description}</p>
                            <p className="text-[11px] text-nx-text-disabled mt-1 font-mono">{formatRelativeTime(notif.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Help */}
          <button
            className="p-2 rounded-lg text-nx-text-muted hover:text-nx-text-secondary hover:bg-nx-elevated transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={18} />
          </button>

          {/* Role switcher — same knowledge base, different lens */}
          <div className="ml-1">
            <PersonaSwitcher />
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} />
    </>
  );
}
