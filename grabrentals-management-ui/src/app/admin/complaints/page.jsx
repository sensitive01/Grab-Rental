"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [toast, setToast] = useState(null);

  async function loadData() {
    const res = await adminApi.getComplaints();
    setComplaints(res.data);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleResolve(id) {
    try {
      await adminApi.updateComplaint(id, "RESOLVED");
      setToast({ type: "success", message: `Complaint #${id} resolved` });
      loadData();
    } catch {
      setToast({ type: "error", message: "Failed to resolve complaint" });
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Grievances & Customer Complaints"
        subtitle="Manage escalated service tickets, driver conduct reports, and AC/cleanliness disputes"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Complaints" }]}
      />

      <div className="space-y-4">
        {complaints.map((c) => (
          <Card key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-900">{c.id}</span>
                <Badge variant={c.severity === "MEDIUM" ? "warning" : "neutral"} size="sm">
                  {c.category}
                </Badge>
                <Badge variant={c.status === "RESOLVED" ? "success" : "danger"} size="sm">
                  {c.status}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{c.customerName} (Trip #{c.bookingId})</h4>
              <p className="text-xs text-slate-600 max-w-2xl">{c.summary}</p>
              <p className="text-[11px] text-slate-400">Assigned: {c.assignedTo} • Logged: {c.createdAt}</p>
            </div>

            {c.status !== "RESOLVED" && (
              <div className="shrink-0">
                <Button size="xs" variant="emerald" icon={CheckCircle} onClick={() => handleResolve(c.id)}>
                  Mark Resolved
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
