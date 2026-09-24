"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import {
  Navigation,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  Send,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function ActiveTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [milestoneInputs, setMilestoneInputs] = useState({});

  async function loadTrips() {
    setLoading(true);
    try {
      const res = await operationsApi.getBookings();
      setTrips(res.data.filter((b) => ["ASSIGNED", "EN_ROUTE"].includes(b.status)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  async function handleProgressStatus(tripId, nextStatus) {
    try {
      await operationsApi.updateTripStatus(tripId, nextStatus);
      setToast({ type: "success", message: `Trip #${tripId} marked as ${nextStatus}` });
      loadTrips();
    } catch {
      setToast({ type: "error", message: "Failed to update trip status" });
    }
  }

  async function handleAddMilestone(tripId) {
    const text = milestoneInputs[tripId];
    if (!text) return;
    try {
      await operationsApi.updateTripStatus(tripId, "EN_ROUTE", text);
      setToast({ type: "success", message: "Live milestone update recorded" });
      setMilestoneInputs({ ...milestoneInputs, [tripId]: "" });
      loadTrips();
    } catch {
      setToast({ type: "error", message: "Failed to record milestone" });
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
        title="Live Active Trips Monitor"
        subtitle="Real-time control over on-road trips, waypoint milestones, and completion sign-offs"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Trips", href: "/operations/trips/active" },
          { label: "Live Active" },
        ]}
        action={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadTrips}>
            Refresh Live Radar
          </Button>
        }
      />

      {loading ? (
        <div className="py-12 text-center text-slate-500">Scanning active fleet...</div>
      ) : trips.length === 0 ? (
        <Card className="text-center py-12">
          <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Active Trips On Road</h3>
          <p className="text-xs text-slate-500 mt-1">
            All dispatched bookings are either completed or awaiting scheduled departure.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((t) => (
            <Card key={t.id} className="border-t-4 border-t-blue-600 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{t.id}</span>
                  <Badge variant="primary" size="sm" dot>
                    {t.status}
                  </Badge>
                </div>
                <span className="font-bold text-slate-900 text-sm">{formatINR(t.fare)}</span>
              </div>

              {/* Passenger & Chauffeur Info */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 text-xs mb-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Customer</p>
                  <p className="font-bold text-slate-800">{t.customerName}</p>
                  <p className="text-[11px] text-slate-500">{t.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Chauffeur & Vehicle</p>
                  <p className="font-bold text-slate-800">{t.assignedDriverName || "Assigned"}</p>
                  <NumberPlate registrationNumber={t.assignedVehicleNumber} />
                </div>
              </div>

              {/* Route */}
              <div className="text-xs space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold">{t.pickupLocation}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-semibold">{t.dropLocation}</span>
                </div>
              </div>

              {/* Current Milestone */}
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/70 text-xs text-blue-900 mb-4">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Latest Status / Location:</span>
                </div>
                <p className="italic text-[11px]">
                  {t.tripMilestone || "Vehicle dispatched from hub towards pickup location."}
                </p>
              </div>

              {/* Quick Milestone Update Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Record waypoint milestone (e.g. Cross toll)..."
                  value={milestoneInputs[t.id] || ""}
                  onChange={(e) =>
                    setMilestoneInputs({ ...milestoneInputs, [t.id]: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Send}
                  onClick={() => handleAddMilestone(t.id)}
                >
                  Log
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link href={`/operations/trips/${t.id}`}>
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    View Trip Log
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  {t.status === "ASSIGNED" && (
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleProgressStatus(t.id, "EN_ROUTE")}
                    >
                      Start En Route
                    </Button>
                  )}
                  {t.status === "EN_ROUTE" && (
                    <Button
                      size="xs"
                      variant="emerald"
                      icon={CheckCircle2}
                      onClick={() => handleProgressStatus(t.id, "COMPLETED")}
                    >
                      Complete Trip
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
