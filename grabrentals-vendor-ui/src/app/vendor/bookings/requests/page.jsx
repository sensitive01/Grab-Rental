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
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqData, drvData] = await Promise.all([
        vendorApi.getBookingRequests(),
        vendorApi.getDrivers(),
      ]);
      setRequests(reqData || []);
      setDrivers(drvData || []);
      if (drvData && drvData.length > 0) {
        setSelectedDriverId(drvData[0].id);
      }
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
        await vendorApi.acceptBooking(targetId, selectedDriverId || null);
        const assignedDriver = drivers.find((d) => d.id === selectedDriverId);
        const driverName = assignedDriver ? assignedDriver.name : "Assigned";
        setToastMessage(`Booking #${selectedRequest.bookingReference || selectedRequest.id} accepted! Chauffeur (${driverName}) assigned & customer notified.`);
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
        title={actionType === "accept" ? "Accept Booking & Assign Chauffeur" : "Decline Booking Request?"}
        message={
          actionType === "accept"
            ? `Confirm accepting #${selectedRequest?.bookingReference || selectedRequest?.id} for ₹${(selectedRequest?.totalFare || selectedRequest?.estimatedAmount || 0).toLocaleString("en-IN")}? Your net earnings will be ₹${(selectedRequest?.vendorNet || 0).toLocaleString("en-IN")}.`
            : `Are you sure you want to decline #${selectedRequest?.bookingReference || selectedRequest?.id}? It will be returned to operations.`
        }
        confirmText={actionLoading ? "Processing..." : (actionType === "accept" ? "Assign Chauffeur & Dispatch" : "Decline Request")}
        type={actionType === "accept" ? "success" : "danger"}
      >
        {actionType === "accept" && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-left">
            <label className="block text-xs font-bold text-slate-800">
              Assign Your Chauffeur <span className="text-emerald-600">(Fleet Owner Action)</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Operations assigned the vehicle. Select which of your drivers will fulfill this duty:
            </p>
            {drivers.length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                No active drivers registered in your fleet yet. Please add a driver in Fleet Management or accept now to assign later.
              </div>
            ) : (
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900 cursor-pointer"
              >
                <option value="">-- Choose Chauffeur from your roster --</option>
                {drivers.map((drv) => (
                  <option key={drv.id} value={drv.id}>
                    {drv.name} ({drv.phone || "No phone"}) • Rating: {drv.rating || 5}★
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </ConfirmationModal>

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

      {/* Booking Requests Hero Banner Photo */}
      <div className="relative h-44 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <img
          src="/images/fleet/suv.jpg"
          alt="Incoming Customer Trip Requests"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Live Dispatch Queue</span>
          <h2 className="text-xl font-black text-white">Incoming Passenger Trips & Broadcasts</h2>
          <p className="text-xs text-slate-200">Review pickup locations, passenger counts, luggage requirements, and net vendor share.</p>
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
