"use client";

import { LoadingAnimation } from "@/components/ui/LoadingAnimation";

export default function AdminLoading() {
  return (
    <div className="py-8">
      <LoadingAnimation
        title="Loading Admin Console..."
        subtitle="Verifying administrative ledger, platform compliance, and directory registries..."
        type="admin"
        minHeight="min-h-[440px]"
      />
    </div>
  );
}
