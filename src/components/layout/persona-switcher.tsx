"use client";

import { useState } from "react";
import { Check, ChevronDown, Crown, User as UserIcon, UserCog, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, usePersona } from "@/lib/persona";
import { personas } from "@/data";
import type { Role } from "@/types";

const roleIcons: Record<string, React.ReactNode> = {
  user: <UserIcon size={15} />,
  "user-cog": <UserCog size={15} />,
  crown: <Crown size={15} />,
};

const approvalLabel: Record<string, string> = {
  none: "Reads everything · approves nothing",
  department: "Reads everything · approves own department",
  organization: "Reads everything · approves org-wide",
};

export default function PersonaSwitcher() {
  const { user, persona, setRole } = usePersona();
  const [open, setOpen] = useState(false);

  const choose = (role: Role) => {
    setRole(role);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-lg border border-nx-border bg-nx-bg/50 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-nx-accent/50 hover:bg-nx-elevated"
        aria-label="Switch role"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nx-accent to-nx-cyan text-[10px] font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-medium leading-tight text-nx-text-primary">{user.name}</span>
          <span className="block text-[10px] leading-tight text-nx-text-muted">{persona.role}</span>
        </span>
        <ChevronDown size={13} className={cn("text-nx-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-xl border border-nx-border bg-nx-surface shadow-2xl">
            <div className="border-b border-nx-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Users size={13} className="text-nx-accent" />
                <h3 className="text-sm font-semibold">View as</h3>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-nx-text-muted">
                Every role below reads the same knowledge base. Switching changes what surfaces
                first and what you can approve — never what you can see.
              </p>
            </div>

            <div className="p-2">
              {personas.map((option) => {
                const active = option.role === persona.role;
                return (
                  <button
                    key={option.role}
                    onClick={() => choose(option.role)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      active ? "bg-nx-accent/10" : "hover:bg-nx-elevated"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 rounded-md border p-1.5",
                        active
                          ? "border-nx-accent/30 bg-nx-accent-muted text-nx-accent"
                          : "border-nx-border bg-nx-elevated text-nx-text-muted"
                      )}
                    >
                      {roleIcons[option.icon]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn("text-xs font-semibold", active ? "text-nx-accent" : "text-nx-text-primary")}>
                          {option.role}
                        </span>
                        {active && <Check size={12} className="text-nx-accent" />}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-nx-text-muted">{option.covers}</span>
                      <span className="mt-1 block font-mono text-[10px] text-nx-text-disabled">
                        {approvalLabel[option.approvalScope]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
