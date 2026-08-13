"use client";

import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { PersonaProvider } from "@/lib/persona";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <div className="min-h-screen bg-nx-bg">
        <Sidebar />
        <div className="pl-[260px] transition-all duration-300">
          <TopBar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </div>
      </div>
    </PersonaProvider>
  );
}
