"use client";

import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <LoadingAnimation
        title="Loading Grab Rentals..."
        subtitle="Connecting to secure platform services..."
        className="w-full max-w-md"
      />
    </div>
  );
}
