"use client";

import { useState } from "react";
import {
  HardDrive, LayoutGrid, MessageSquare, GitBranch, Ticket, BookOpen,
  Globe, Box, Cloud, CheckCircle, Circle, RefreshCw, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { integrations } from "@/data";
import { formatRelativeTime } from "@/lib/utils";
import RoadmapNotice from "@/components/ui/roadmap-notice";

const iconMap: Record<string, React.ReactNode> = {
  "hard-drive": <HardDrive size={24} />,
  "layout-grid": <LayoutGrid size={24} />,
  "message-square": <MessageSquare size={24} />,
  "github": <GitBranch size={24} />,
  "ticket": <Ticket size={24} />,
  "book-open": <BookOpen size={24} />,
  "globe": <Globe size={24} />,
  "box": <Box size={24} />,
  "cloud": <Cloud size={24} />,
};

export default function IntegrationsPage() {
  const [connectionStates, setConnectionStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.connected]))
  );

  const toggleConnection = (id: string) => {
    setConnectionStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <RoadmapNotice what="No connector is live yet; documents are ingested from a local folder." />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-nx-text-muted mt-0.5">Connect your enterprise tools to NEXORA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const connected = connectionStates[integration.id];
          return (
            <div key={integration.id} className="bg-nx-surface border border-nx-border rounded-xl p-5 hover:border-nx-border-strong transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-nx-elevated border border-nx-border text-nx-text-secondary">
                    {iconMap[integration.icon] || <Globe size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-nx-text-primary">{integration.name}</h3>
                    <p className="text-xs text-nx-text-muted mt-0.5">{integration.description}</p>
                  </div>
                </div>
              </div>

              {connected && integration.lastSync && (
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-nx-text-muted">Last synced</span>
                    <span className="text-nx-text-secondary font-mono">{formatRelativeTime(integration.lastSync)}</span>
                  </div>
                  {integration.documentsIndexed && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-nx-text-muted">Documents indexed</span>
                      <span className="text-nx-text-secondary font-mono">{integration.documentsIndexed.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-nx-border">
                <span className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium",
                  connected ? "text-nx-success" : "text-nx-text-muted"
                )}>
                  {connected ? <CheckCircle size={12} /> : <Circle size={12} />}
                  {connected ? "Connected" : "Not connected"}
                </span>
                <button
                  onClick={() => toggleConnection(integration.id)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                    connected
                      ? "text-nx-text-muted border border-nx-border hover:bg-nx-elevated"
                      : "bg-nx-accent hover:bg-nx-accent-hover text-white"
                  )}
                >
                  {connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
