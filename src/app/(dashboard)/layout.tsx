"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { PersonaProvider } from "@/lib/persona";
import { cn } from "@/lib/utils";

/**
 * Shell for every dashboard page.
 *
 * The sidebar behaves differently by size, so its state lives here rather than
 * inside it: on phones and tablets it is an off-canvas drawer over the content,
 * and from `lg` up it is a permanent column the content sits beside. Holding
 * both flags here also lets the content padding follow the collapsed width,
 * which it previously did not — collapsing the sidebar used to leave a 260px
 * gap behind.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Escape closes the drawer, which is what anyone expects of an overlay.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <PersonaProvider>
      <div className="min-h-screen bg-nx-bg">
        <Sidebar
          navOpen={navOpen}
          onCloseNav={() => setNavOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />

        {/* Backdrop, mobile only. Sits under the drawer, over the content. */}
        {navOpen && (
          <div
            onClick={() => setNavOpen(false)}
            aria-hidden
            className="fixed inset-0 z-30 bg-nx-text-primary/40 backdrop-blur-[2px] lg:hidden"
          />
        )}

        <div
          className={cn(
            "transition-[padding] duration-300",
            // No offset below lg — the drawer floats above instead.
            collapsed ? "lg:pl-[68px]" : "lg:pl-[260px]"
          )}
        >
          <TopBar onOpenNav={() => setNavOpen(true)} />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </div>
      </div>
    </PersonaProvider>
  );
}
