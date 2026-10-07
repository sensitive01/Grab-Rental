"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import { isAuthenticated, getCurrentUser, updateSessionStatus } from "@/lib/auth";
import { vendorApi } from "@/lib/vendorApi";
import { Clock } from "lucide-react";

export default function VendorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [vendorStatus, setVendorStatus] = useState("PENDING");

  useEffect(() => {
    if (!isAuthenticated()) {
      if (pathname?.startsWith("/vendor/reset-password")) {
        const search = typeof window !== "undefined" ? window.location.search : "";
        router.replace(`/reset-password${search}`);
        return;
      }
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.replace(redirectUrl);
    } else {
      setIsAuthorized(true);
      const user = getCurrentUser();
      if (user?.status) {
        setVendorStatus(user.status);
      }
      vendorApi.getProfile()
        .then((p) => {
          const fresh = p?.status || p?.approvalStatus;
          if (fresh) {
            setVendorStatus(fresh);
            updateSessionStatus(fresh);
          }
        })
        .catch(() => {});
    }
  }, [router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-semibold tracking-wide">
            Verifying vendor credentials...
          </span>
        </div>
      </div>
    );
  }

  const isPending = vendorStatus === "PENDING";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Role-Specific Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0 max-w-full overflow-x-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Global Pending Admin Approval Notice Banner */}
        {isPending && (
          <div className="bg-amber-500/10 border-b border-amber-300 px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-amber-900">Account Pending Admin Approval: </span>
                <span className="text-amber-800">
                  Your registered fleet vehicles, drivers, and compliance credentials have been submitted for administrator review. You can inspect all details what you added below. Live customer bookings will be enabled once approved.
                </span>
              </div>
            </div>
            <span className="shrink-0 self-start sm:self-auto text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              Under Review
            </span>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
