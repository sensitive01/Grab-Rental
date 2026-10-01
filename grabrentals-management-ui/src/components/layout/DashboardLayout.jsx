"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { getCurrentUser } from "@/lib/auth";

export function DashboardLayout({ children, role = "OPERATIONS" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirectUrl);
      return;
    }

    // Role boundary guard
    if (role === "ADMIN" && user.role !== "ADMIN") {
      router.replace("/operations/dashboard");
      return;
    }

    setIsReady(true);
  }, [role, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="relative flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-5">
            <div className="absolute w-20 h-20 rounded-full bg-amber-500/10 animate-ping" />
            <div className="w-14 h-14 rounded-full border-3 border-slate-700 border-t-amber-500 animate-spin" />
            <div className="absolute text-amber-500 font-bold text-xs tracking-wider">GR</div>
          </div>
          <span className="text-xs text-slate-300 font-medium tracking-wide animate-pulse">
            Verifying secure session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopNavbar
          role={role}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
