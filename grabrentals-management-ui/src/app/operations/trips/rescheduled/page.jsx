"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Clock } from "lucide-react";

export default function RescheduledTripsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rescheduled Trips Register"
        subtitle="Customer travel date modifications, itinerary extensions, and schedule changes"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Trips", href: "/operations/trips/active" },
          { label: "Rescheduled" },
        ]}
      />

      <Card className="text-center py-12">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-700">No Rescheduled Trips Pending Action</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          All customer requested itinerary modifications have been adjusted and dispatched into the regular booking queue.
        </p>
      </Card>
    </div>
  );
}
