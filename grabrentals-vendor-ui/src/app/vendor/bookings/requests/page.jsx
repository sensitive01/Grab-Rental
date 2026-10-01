"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Users, 
  Car, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Loader2
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";

export default function VendorBookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await vendorApi.getBookingRequests();
      setRequests(data || []);
    } catch (err) {
      console.error("Could not fetch live booking requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    const targetId = selectedRequest.rawId || selectedRequest.id;
    setActionLoading(true);

    try {
      if (actionType === "accept") {
        await vendorApi.acceptBooking(targetId);
        setToastMessage(`Booking #${selectedRequest.bookingReference || selectedRequest.id} accepted! Ride OTP generated & dispatched.`);
      } else {
        await vendorApi.declineBooking(targetId, "Vendor vehicle unavailable or schedule conflict");
        setToastMessage(`Booking #${selectedRequest.bookingReference || selectedRequest.id} declined and returned to dispatch queue.`);
      }
      await fetchRequests();
    } catch (err) {
      console.error("Action error:", err);
      setToastMessage(err.response?.data?.message || `Failed to ${actionType} booking.`);
    } finally {
      setActionLoading(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Action Modal */}
      <ConfirmationModal
        isOpen={!!selectedRequest}
        onClose={() => {
          if (!actionLoading) {
            setSelectedRequest(null);
            setActionType(null);
          }
        }}
        onConfirm={handleConfirmAction}
        title={actionType === "accept" ? "Accept Booking Request?" : "Decline Booking Request?"}
        message={
          actionType === "accept"
            ? `Confirm accepting #${selectedRequest?.bookingReference || selectedRequest?.id} for ₹${(selectedRequest?.totalFare || selectedRequest?.estimatedAmount || 0).toLocaleString("en-IN")}? Your net earnings will be ₹${(selectedRequest?.vendorNet || 0).toLocaleString("en-IN")}.`
            : `Are you sure you want to decline #${selectedRequest?.bookingReference || selectedRequest?.id}? It will be returned to operations.`
        }
        confirmText={actionLoading ? "Processing..." : (actionType === "accept" ? "Accept & Dispatch" : "Decline Request")}
        type={actionType === "accept" ? "success" : "danger"}
      />

      {/* Header & Breadcrumbs */}
      <div className="space-y-1">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/vendor/bookings" },
            { label: "Booking Requests" }
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Incoming Booking Requests
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {requests.length} Pending
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Trip dispatches routed to your fleet. Accept to confirm booking and assign vehicle.
            </p>
          </div>
          <Link
            href="/vendor/bookings"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 self-start sm:self-auto"
          >
            ← Back to All Bookings
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-xs text-slate-500 font-medium">Checking live incoming dispatch queue...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-black text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have responded to all incoming booking dispatches. Keep your fleet vehicles marked Available to receive new ride allocations.
          </p>
          <Link
            href="/vendor/bookings"
            className="inline-block mt-2 text-xs font-bold text-amber-600 hover:underline"
          >
            View Active Bookings ↗
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border-2 border-amber-300/80 p-6 sm:p-7 shadow-md space-y-5 hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Top Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono">
                      #{req.bookingReference || req.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">{req.vehicleType}</span>
                  </div>

                  <span className="text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-1 animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    Action Required
                  </span>
                </div>

                {/* Customer & Route */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-slate-900">
                    {req.customer?.name || "Customer"}
                  </h3>
                  <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="flex items-center gap-2 font-bold text-slate-900">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      {req.pickup}
                    </p>
                    <p className="flex items-center gap-2 font-bold text-slate-900">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      {req.drop}
                    </p>
                    <p className="text-[11px] text-slate-500 pt-1">
                      📅 Reporting: <strong>{req.pickupDate}</strong> · {req.passengers} Guests
                    </p>
                  </div>
                </div>

                {/* Payout Summary */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Net Vendor Payout
                    </span>
                    <p className="text-xl font-black text-slate-900">{formatINR(req.vendorNet || req.totalFare)}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <p>Gross Fare: {formatINR(req.totalFare || req.estimatedAmount)}</p>
                    <p className="text-emerald-700 font-semibold">100% Guaranteed Settlement</p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(req);
                    setActionType("reject");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(req);
                    setActionType("accept");
                  }}
                  className="flex-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept & Dispatch
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
