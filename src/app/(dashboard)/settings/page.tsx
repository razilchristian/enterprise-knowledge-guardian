"use client";

import { useState } from "react";
import { User, Building2, Bell, Brain, Shield, Save, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, usePersona } from "@/lib/persona";

const tabs = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "workspace", label: "Workspace", icon: <Building2 size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "ai", label: "AI Preferences", icon: <Brain size={16} /> },
];

export default function SettingsPage() {
  const { user } = usePersona();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-nx-text-muted mt-0.5">Manage your profile, workspace, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-nx-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-nx-accent text-nx-accent"
                : "border-transparent text-nx-text-muted hover:text-nx-text-secondary"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-nx-surface border border-nx-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nx-accent to-nx-accent-hover flex items-center justify-center text-white text-xl font-semibold">
              {initials(user.name)}
            </div>
            <div>
              <h3 className="text-sm font-semibold">{user.name}</h3>
              <p className="text-xs text-nx-text-muted">{user.email}</p>
              <p className="text-[11px] text-nx-accent mt-0.5">{user.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-nx-text-muted">Full Name</label>
              <input key={user.id} defaultValue={user.name} className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-nx-text-muted">Email</label>
              <input key={user.id} defaultValue={user.email} className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent" />
            </div>
            <div>
              <label className="text-xs font-medium text-nx-text-muted">Role</label>
              <input key={user.id} defaultValue={user.role} disabled className="mt-1.5 w-full bg-nx-elevated border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-muted outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-nx-text-muted">Department</label>
              <input key={user.id} defaultValue={user.department} className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent" />
            </div>
          </div>

          {/* The rule, restated where someone would look for a permissions setting */}
          <div className="flex items-start gap-2.5 rounded-lg border border-nx-border bg-nx-bg p-3.5">
            <Globe size={15} className="mt-0.5 shrink-0 text-nx-success" />
            <p className="text-[11px] leading-relaxed text-nx-text-muted">
              <span className="font-medium text-nx-text-secondary">Your role does not limit what you can read.</span>{" "}
              Every person in the organization can open every document, in every department. Role
              decides only what you can approve — {user.role === "Employee" ? "as an Employee, changes are proposed on your behalf and signed off by a document owner." : user.role === "Department Owner" ? "you sign off on changes to documents your department owns." : "you can sign off on any change, org-wide."}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Workspace Tab */}
      {activeTab === "workspace" && (
        <div className="bg-nx-surface border border-nx-border rounded-xl p-6 space-y-6">
          <div>
            <label className="text-xs font-medium text-nx-text-muted">Workspace Name</label>
            <input defaultValue="Acme Corporation" className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-nx-text-muted">Industry</label>
            <input defaultValue="Technology" className="mt-1.5 w-full bg-nx-bg border border-nx-border rounded-lg px-3 py-2 text-sm text-nx-text-primary outline-none focus:border-nx-accent" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nx-accent hover:bg-nx-accent-hover text-white text-sm font-medium transition-colors">
              <Save size={14} /> {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-nx-surface border border-nx-border rounded-xl p-6 space-y-4">
          {[
            { label: "Conflict Detections", description: "Get notified when AI detects document conflicts", on: true },
            { label: "Agent Completions", description: "Notifications when agents complete their runs", on: true },
            { label: "Approval Requests", description: "Alert when a document needs your approval", on: true },
            { label: "Document Staleness", description: "Warnings when documents become outdated", on: false },
            { label: "Weekly Digest", description: "Summary of all activity across your workspace", on: true },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-nx-text-primary">{pref.label}</p>
                <p className="text-xs text-nx-text-muted mt-0.5">{pref.description}</p>
              </div>
              <button className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                pref.on ? "bg-nx-accent" : "bg-nx-elevated"
              )}>
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  pref.on ? "left-5.5 translate-x-0" : "left-0.5"
                )} style={{ left: pref.on ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Preferences Tab */}
      {activeTab === "ai" && (
        <div className="bg-nx-surface border border-nx-border rounded-xl p-6 space-y-4">
          {[
            { label: "Auto-analyze uploaded documents", description: "AI will automatically analyze new documents upon upload", on: true },
            { label: "Proactive conflict detection", description: "Continuously scan for cross-document conflicts", on: true },
            { label: "Knowledge health monitoring", description: "Track document freshness and suggest reviews", on: true },
            { label: "AI agent auto-execution", description: "Allow agents to run on schedule without manual trigger", on: false },
            { label: "Show confidence scores", description: "Display AI confidence level on all generated insights", on: true },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-nx-text-primary">{pref.label}</p>
                <p className="text-xs text-nx-text-muted mt-0.5">{pref.description}</p>
              </div>
              <button className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                pref.on ? "bg-nx-accent" : "bg-nx-elevated"
              )}>
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                )} style={{ left: pref.on ? "22px" : "2px" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
