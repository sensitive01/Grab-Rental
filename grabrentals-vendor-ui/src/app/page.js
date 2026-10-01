"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/vendor/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Redirecting to Vendor Portal...</p>
      </div>
    </div>
  );
}
