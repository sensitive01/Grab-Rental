"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, Check, Clock, AlertTriangle, Info } from "lucide-react";

const INITIAL_NOTIFS = [
  {
    id: 1,
    title: "Fast Dispatch Alert",
    message: "Booking #BK-8091 (Chennai to Ooty) requires vehicle & chauffeur allocation.",
    urgency: "HIGH",
    time: "10 mins ago",
    read: false,
  },
  {
    id: 2,
    title: "Trip Milestone Update",
    message: "Chauffeur Abdul Rahman passed Mysore Ring Road with Force Urbania KA 05 MJ 8821.",
    urgency: "INFO",
    time: "45 mins ago",
    read: false,
  },
  {
    id: 3,
    title: "Customer Request Logged",
    message: "Passenger Priya Sundaram added an extra stopover at Coonoor Tea Factory.",
    urgency: "MEDIUM",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    title: "Vehicle Fitness Reminder",
    message: "Volvo 45-Seater KA 01 EK 9900 fitness inspection is due next week.",
    urgency: "MEDIUM",
    time: "Yesterday",
    read: true,
  },
];

export default function OperationsNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFS);

  function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Dispatch Notifications"
        subtitle="Real-time alerts, trip milestones, and urgent fleet requests"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Notifications" },
        ]}
        action={
          <Button variant="secondary" size="sm" icon={Check} onClick={markAllRead}>
            Mark All as Read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`p-4 transition-all ${
              !n.read ? "border-l-4 border-l-blue-600 bg-blue-50/20" : "bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    n.urgency === "HIGH"
                      ? "bg-rose-100 text-rose-600"
                      : n.urgency === "MEDIUM"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {n.urgency === "HIGH" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
