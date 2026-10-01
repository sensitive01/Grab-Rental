"use client";

import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export default function OperationsLoading() {
  return (
    <div className="py-8">
      <LoadingAnimation
        title="Loading Operations Console..."
        subtitle="Retrieving real-time dispatch schedules, fleet status, and active assignments..."
        type="operations"
        minHeight="min-h-[440px]"
      />
    </div>
  );
}
