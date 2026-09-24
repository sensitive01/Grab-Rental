"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { MessageSquare, Check, X, Clock } from "lucide-react";

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  async function loadData() {
    try {
      const res = await operationsApi.getCustomerRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleResolve(id, newStatus) {
    try {
      await operationsApi.updateCustomerRequest(id, newStatus);
      setToast({ type: "success", message: `Request marked as ${newStatus}` });
      loadData();
    } catch {
      setToast({ type: "error", message: "Failed to update request" });
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
        title="Customer Modification & Special Requests"
        subtitle="Manage route changes, itinerary adjustments, and passenger requests"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Customer Requests" },
        ]}
      />

      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-xs text-slate-500">No active customer modification requests.</p>
          </Card>
        ) : (
          requests.map((r) => (
            <Card key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{r.id}</span>
                  <Badge variant={r.status === "APPROVED" ? "success" : "warning"} size="sm">
                    {r.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Booking: <strong className="text-slate-900">{r.bookingId}</strong>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{r.customerName} - {r.requestType}</h4>
                <p className="text-xs text-slate-600 max-w-2xl">{r.details}</p>
                <p className="text-[11px] text-slate-400">Requested: {r.requestedAt}</p>
              </div>

              {r.status !== "APPROVED" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="xs"
                    variant="emerald"
                    icon={Check}
                    onClick={() => handleResolve(r.id, "APPROVED")}
                  >
                    Approve Request
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    icon={X}
                    onClick={() => handleResolve(r.id, "REJECTED")}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
