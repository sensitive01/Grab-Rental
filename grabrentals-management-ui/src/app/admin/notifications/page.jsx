"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Bell, ShieldCheck, AlertCircle, Building2 } from "lucide-react";

const ADMIN_NOTIFS = [
  {
    id: 1,
    title: "New Vendor Application",
    message: "Pondy Coastline Travels (8 vehicles) submitted GST verification documents.",
    time: "25 mins ago",
    badge: "ACTION NEEDED",
    type: "warning",
  },
  {
    id: 2,
    title: "Refund Authorization Required",
    message: "Customer Siddharth Menon requested ₹1,700 refund for cancelled booking #BK-8078.",
    time: "1 hour ago",
    badge: "FINANCE",
    type: "rose",
  },
  {
    id: 3,
    title: "Pricing Matrix Audit",
    message: "SUV per-km rate updated from ₹19 to ₹20 by System Administrator.",
    time: "3 hours ago",
    badge: "AUDIT",
    type: "blue",
  },
];

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administrative Alerts & Broadcasts"
        subtitle="Platform governance notifications, vendor compliance alerts, and financial reconciliations"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Notifications" }]}
      />

      <div className="space-y-3">
        {ADMIN_NOTIFS.map((n) => (
          <Card key={n.id} className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <Badge variant="neutral" size="sm">{n.badge}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.time}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
