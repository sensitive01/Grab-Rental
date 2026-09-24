"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export default function VendorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Role-Specific Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 max-w-full overflow-x-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
