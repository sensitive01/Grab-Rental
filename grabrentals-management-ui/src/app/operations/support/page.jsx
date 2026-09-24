"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LifeBuoy, PhoneCall, ShieldAlert, FileText } from "lucide-react";

export default function OperationsSupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Desk Support & Escalation"
        subtitle="Critical contacts, admin hotline, and standard operating procedures (SOP)"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Support" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Admin Emergency Hotline" className="border-t-4 border-t-rose-500">
          <p className="text-xs text-slate-600 mb-4">
            For critical fleet breakdowns, accident escalations, or police/RTO inquiries.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>+91 98409 91199 (24x7 Control Room)</span>
          </div>
        </Card>

        <Card title="Vendor Fleet Escalations" className="border-t-4 border-t-amber-500">
          <p className="text-xs text-slate-600 mb-4">
            For partner vendor disputes, driver no-shows, or immediate backup replacement.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>+91 94440 22331 (Vendor Desk)</span>
          </div>
        </Card>

        <Card title="Dispatcher SOP Manual" className="border-t-4 border-t-blue-500">
          <p className="text-xs text-slate-600 mb-4">
            Official operational procedures for highway breakdown, late return tariffs, and duty slips.
          </p>
          <Button variant="secondary" size="sm" icon={FileText} className="w-full">
            Download SOP PDF v3.1
          </Button>
        </Card>
      </div>
    </div>
  );
}
