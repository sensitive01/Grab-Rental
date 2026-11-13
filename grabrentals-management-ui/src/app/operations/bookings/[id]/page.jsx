"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { ScenarioInvoiceModal } from "@/components/bookings/ScenarioInvoiceModal";
import {
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Phone,
  Printer,
  Shield,
  User,
  Users,
  Camera,
  Gauge,
  ZoomIn,
  X,
  ExternalLink,
  Banknote,
  FileCheck,
  Receipt,
  MessageSquare
} from "lucide-react";

export default function BookingDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [previewProof, setPreviewProof] = useState(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookingById(id);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleStatusChange(newStatus) {
    try {
      const res = await operationsApi.updateTripStatus(id, newStatus);
      setBooking(res.data);
      setToast({ type: "success", message: `Booking status updated to ${newStatus}` });
    } catch {
      setToast({ type: "error", message: "Failed to update booking status" });
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading booking dossier...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">Booking Not Found</h2>
        <Link href="/operations/bookings">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const statusStyle = getStatusStyle(booking.status);

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
        title={`Booking #${booking.id}`}
        subtitle={`Created on ${booking.createdAt} • ${booking.serviceType}`}
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Bookings", href: "/operations/bookings" },
          { label: booking.id },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Duty Slip
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => setIsInvoiceModalOpen(true)}
              className="border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold"
            >
              Preview Invoices &amp; Vouchers
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={MessageSquare}
              disabled={sendingWhatsApp}
              onClick={() => handleSendScenarioInvoice(1)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
            >
              {sendingWhatsApp ? "Sending..." : "WhatsApp Estimate (S1)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={MessageSquare}
              disabled={sendingWhatsApp}
              onClick={() => handleSendScenarioInvoice(2)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
            >
              {sendingWhatsApp ? "Sending..." : "WhatsApp Confirmed (S2)"}
            </Button>
            {booking.status === "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                icon={MessageSquare}
                disabled={sendingWhatsApp}
                onClick={() => handleSendScenarioInvoice(3)}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold"
              >
                {sendingWhatsApp ? "Sending..." : "WhatsApp Tax Invoice (S3)"}
              </Button>
            )}
            {booking.status === "PENDING_ALLOCATION" && (
              <Link href={`/operations/assignments/vehicle?bookingId=${booking.id}`}>
                <Button variant="amber" size="sm" icon={Car}>
                  Assign Vehicle
                </Button>
              </Link>
            )}
            {["ASSIGNED", "ASSIGNED_TO_VENDOR", "CONFIRMED"].includes(booking.status) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange("IN_TRANSIT")}
              >
                Mark Dispatched (In Transit)
              </Button>
            )}
            {["EN_ROUTE", "ON_THE_WAY", "IN_TRANSIT", "CONFIRMED"].includes(booking.status) && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => handleStatusChange("COMPLETED")}
              >
                Mark Trip Completed
              </Button>
            )}
          </div>
        }
      />

      {/* Top Status Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg}`}>
            {statusStyle.label}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Partner Vendor:</span>
            <strong className="text-slate-900 font-bold">{booking.vendorName || "In-House Fleet"}</strong>
            {booking.vendorPhone && (
              <>
                <span className="text-slate-300">•</span>
                <a
                  href={`tel:${booking.vendorPhone}`}
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  title="Call Vendor"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{booking.vendorPhone}</span>
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            Total Fare: <strong className="text-slate-900 text-sm">{formatINR(booking.fare)}</strong>
          </div>
          <div>
            Advance Paid: <strong className="text-emerald-700">{formatINR(booking.advancePaid)}</strong>
          </div>
          <div>
            Balance: <strong className="text-amber-700">{formatINR(booking.balanceAmount)}</strong>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Photo Proofs */}
      {previewProof && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewProof(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">{previewProof.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProof(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/60 p-2">
              <img
                src={previewProof.url}
                alt={previewProof.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Grab Rentals Driver Operational Audit Proof Document</span>
              <a
                href={previewProof.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open Full Resolution <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Driver Duty & Trip Closing Audit Sheet (Operations Review) */}
      {(String(booking.status || "").toUpperCase() === "COMPLETED" || booking.endKm != null || booking.tripCompletedAt != null) && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/30 p-5 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Chauffeur Duty & Trip Closing Audit Sheet
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Closed
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Duty finalized by <strong>{booking.tripClosedBy || booking.assignedDriverName || booking.driverName || "Chauffeur"}</strong>
                  {booking.tripCompletedAt && ` on ${new Date(booking.tripCompletedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Invoice:</span>
              <span className="font-mono font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {booking.invoiceNumber || `INV-${String(booking.bookingReference || booking.id).replace(/[^A-Za-z0-9]/g, "")}`}
              </span>
            </div>
          </div>

          {/* Odometer Telemetry Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-slate-500" />
              Vehicle Odometer & Distance Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Start Reading</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.startKm != null ? `${booking.startKm} KM` : "Recorded"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">End Reading</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.endKm != null ? `${booking.endKm} KM` : "Recorded"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Actual Traveled</span>
                <p className="text-sm font-black text-emerald-700 mt-0.5">
                  {booking.actualKm != null ? `${booking.actualKm} KM` : "Calculated"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Package Included</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.packageKm || booking.distanceKm || "250"} KM
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Extra Distance</span>
                <p className="text-sm font-black text-amber-950 mt-0.5">
                  {booking.extraKm ? `${booking.extraKm} KM` : "0 KM"}
                </p>
                {booking.extraKmCharge && Number(booking.extraKmCharge) > 0 && (
                  <span className="text-[10px] font-bold text-amber-800 block">
                    (+{formatINR(booking.extraKmCharge)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Uploaded Proofs Gallery */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-500" />
              Uploaded Chauffeur Proofs & Verification Photos
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Start Odometer Photo Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-sky-600" /> Start Odometer Photo
                  </span>
                  {(booking.startOdometerProofUrl || booking.startOdometerProof) ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      No Photo Attached
                    </span>
                  )}
                </div>

                {(booking.startOdometerProofUrl || booking.startOdometerProof) ? (
                  <div 
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video cursor-pointer"
                    onClick={() => setPreviewProof({ url: booking.startOdometerProofUrl || booking.startOdometerProof, title: `Start Odometer Proof - Booking #${booking.bookingReference || booking.id}` })}
                  >
                    <img
                      src={booking.startOdometerProofUrl || booking.startOdometerProof}
                      alt="Start Odometer Reading"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                      <ZoomIn className="w-4 h-4" /> Click to Zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Camera className="w-5 h-5 mb-1 text-slate-300" />
                    <span>No digital odometer photo attached</span>
                  </div>
                )}
              </div>

              {/* End Odometer Photo Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-emerald-600" /> End Odometer Photo
                  </span>
                  {booking.endOdometerProofUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      No Photo Attached
                    </span>
                  )}
                </div>

                {booking.endOdometerProofUrl ? (
                  <div 
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video cursor-pointer"
                    onClick={() => setPreviewProof({ url: booking.endOdometerProofUrl, title: `End Odometer Proof - Booking #${booking.bookingReference || booking.id}` })}
                  >
                    <img
                      src={booking.endOdometerProofUrl}
                      alt="End Odometer Reading"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                      <ZoomIn className="w-4 h-4" /> Click to Zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Camera className="w-5 h-5 mb-1 text-slate-300" />
                    <span>No digital odometer photo attached</span>
                  </div>
                )}
              </div>

              {/* Payment Receipt / UPI Screenshot Card */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-600" /> Payment Collection Proof
                  </span>
                  {booking.paymentProofUrl ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      Uploaded ({booking.paymentMethod || "UPI/Online"})
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      Cash or Settled
                    </span>
                  )}
                </div>

                {booking.paymentProofUrl ? (
                  <div 
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video cursor-pointer"
                    onClick={() => setPreviewProof({ url: booking.paymentProofUrl, title: `Payment Receipt Proof - Booking #${booking.bookingReference || booking.id}` })}
                  >
                    <img
                      src={booking.paymentProofUrl}
                      alt="Payment Collection Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                      <ZoomIn className="w-4 h-4" /> Click to Zoom
                    </div>
                  </div>
                ) : (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Banknote className="w-5 h-5 mb-1 text-slate-300" />
                    <span>Paid in {booking.paymentMethod || "Cash"} or Settled directly</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Itemized Extra Expenses Breakdown */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chauffeur Extra Duty & Toll Expenses Breakdown
            </h4>
            
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[11px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Expense Item</th>
                    <th className="py-2 px-3 text-center">Duty Remarks</th>
                    <th className="py-2 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.extraKm > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        Extra Distance ({booking.extraKm} KM)
                      </td>
                      <td className="py-2 px-3 text-center text-slate-500">
                        @ ₹{booking.extraKmRate || 14}/km
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatINR(booking.extraKmCharge || 0)}
                      </td>
                    </tr>
                  )}
                  {Number(booking.tollCharges) > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">FASTag Highway Tolls</td>
                      <td className="py-2 px-3 text-center text-slate-500">National/State Highway Plaza</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(booking.tollCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.permitCharges) > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">State Entry Permit / Tax</td>
                      <td className="py-2 px-3 text-center text-slate-500">Interstate Border Tax</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(booking.permitCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.parkingCharges) > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">Airport / Commercial Parking</td>
                      <td className="py-2 px-3 text-center text-slate-500">Actual Parking Fees</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(booking.parkingCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.driverAllowanceCharges) > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">Driver Allowance / Night Batta</td>
                      <td className="py-2 px-3 text-center text-slate-500">Chauffeur Overnight Duty</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(booking.driverAllowanceCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.otherCharges) > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-800">Other Incidental Charges</td>
                      <td className="py-2 px-3 text-center text-slate-500">{booking.otherChargesNotes || "Miscellaneous expenses"}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(booking.otherCharges)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Closing Notes */}
          {booking.tripClosingNotes && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wider block">
                Chauffeur Closing Log & Remarks
              </span>
              <p className="text-slate-800 italic">&ldquo;{booking.tripClosingNotes}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Route & Assignment Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route & Schedule */}
          <Card title="Trip Itinerary & Timing">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Pickup Location</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.pickupLocation}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Scheduled: {booking.startDate}</p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-4 pl-7 py-2 text-xs text-slate-500">
                Estimated Distance: <strong>{booking.distanceKm} KM</strong> • Duration:{" "}
                <strong>{booking.durationDays} Days</strong>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Drop Destination</p>
                  <p className="text-sm font-semibold text-slate-900">{booking.dropLocation}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Return: {booking.endDate}</p>
                </div>
              </div>
            </div>

            {booking.specialInstructions && (
              <div className="mt-5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <strong>Passenger Instructions:</strong> {booking.specialInstructions}
              </div>
            )}
          </Card>

          {/* Assigned Fleet & Chauffeur */}
          <Card title="Fleet & Chauffeur Allocation">
            {booking.assignedVehicleNumber ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Assigned Vehicle */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Assigned Vehicle</span>
                    <Badge variant="success" size="sm">Confirmed</Badge>
                  </div>
                  <NumberPlate registrationNumber={booking.assignedVehicleNumber} />
                  <p className="text-xs font-semibold text-slate-800">{booking.preferredVehicle || booking.vehicleModel}</p>
                  <p className="text-[11px] text-slate-500">Category: {booking.vehicleCategory}</p>
                </div>

                {/* 2. Partner Vendor / Fleet Owner */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase">Partner Vendor</span>
                    <Badge variant={booking.status === "ASSIGNED_TO_VENDOR" ? "warning" : "info"} size="sm">
                      {booking.status === "ASSIGNED_TO_VENDOR" ? "Dispatched" : "Fleet Owner"}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{booking.vendorName || "In-House Fleet"}</span>
                  </p>
                  {booking.vendorPhone ? (
                    <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <a href={`tel:${booking.vendorPhone}`} className="hover:underline">
                        {booking.vendorPhone}
                      </a>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">Phone not available</p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {booking.status === "ASSIGNED_TO_VENDOR"
                      ? "Awaiting vendor driver allocation"
                      : "Fleet partner confirmed"}
                  </p>
                </div>

                {/* 3. Assigned Chauffeur */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Assigned Chauffeur</span>
                    <Badge variant={booking.assignedDriverName ? "success" : "warning"} size="sm">
                      {booking.assignedDriverName ? "On Call" : "Pending Vendor"}
                    </Badge>
                  </div>
                  {booking.assignedDriverName ? (
                    <>
                      <p className="text-sm font-bold text-slate-900">{booking.assignedDriverName}</p>
                      {(booking.assignedDriverPhone || booking.driverPhone) ? (
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <a href={`tel:${booking.assignedDriverPhone || booking.driverPhone}`} className="hover:underline">
                            {booking.assignedDriverPhone || booking.driverPhone}
                          </a>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Phone not registered</p>
                      )}
                      <p className="text-[11px] text-emerald-700 font-medium">Duty status confirmed</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-amber-800">To be assigned by Vendor</p>
                      <p className="text-[11px] text-slate-500">
                        {booking.vendorName || "Fleet Owner"} will assign chauffeur upon accepting.
                      </p>
                      {booking.vendorPhone && (
                        <div className="pt-1">
                          <a
                            href={`tel:${booking.vendorPhone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            <Phone className="w-3 h-3" /> Call vendor for update
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-amber-300 rounded-xl bg-amber-50/40">
                <Car className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No Vehicle Assigned Yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  This booking requires a {booking.vehicleCategory} ({booking.preferredVehicle}).
                </p>
                <Link href={`/operations/assignments/vehicle?bookingId=${booking.id}`}>
                  <Button variant="amber" size="sm">
                    Open Fast Dispatch Allocator
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Customer & Payment Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card title="Customer Information">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Passenger Name</p>
                <p className="text-sm font-bold text-slate-900">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Contact Phone</p>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{booking.customerPhone}</span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Email Address</p>
                <p className="text-slate-700">{booking.customerEmail}</p>
              </div>
            </div>
          </Card>

          {/* Partner Vendor Details */}
          <Card title="Partner Vendor Details">
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Vendor / Business Name</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{booking.vendorName || "In-House Fleet"}</span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Vendor Phone Number</p>
                {booking.vendorPhone ? (
                  <p className="font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <a href={`tel:${booking.vendorPhone}`} className="hover:underline">
                      {booking.vendorPhone}
                    </a>
                  </p>
                ) : (
                  <p className="text-slate-400 mt-0.5">Not available</p>
                )}
              </div>
              <div>
                <p className="text-slate-400 font-medium">Dispatch Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Breakdown */}
          <Card title="Payment Summary">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Base Rental Tariff</span>
                <span className="font-medium text-slate-900">{formatINR(booking.fare)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Advance Paid</span>
                <span className="font-semibold text-emerald-600">
                  - {formatINR(booking.advancePaid)}
                </span>
              </div>
              {booking.vendorPayout != null && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100 bg-emerald-50/60 px-2 py-1 rounded-md text-[11px]">
                    <span className="text-emerald-900 font-bold">Assigned Vendor Payout</span>
                    <span className="font-bold text-emerald-700">{formatINR(booking.vendorPayout)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 bg-blue-50/60 px-2 py-1 rounded-md text-[11px]">
                    <span className="text-blue-900 font-bold">Platform Gross Margin</span>
                    <span className="font-bold text-blue-700">{formatINR(Math.max(0, (booking.fare || 0) - (booking.vendorPayout || 0)))}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 text-sm font-bold">
                <span className="text-slate-900">Balance Due at Trip End</span>
                <span className="text-amber-700">{formatINR(booking.balanceAmount)}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Payment Mode: <strong>{booking.paymentMethod}</strong>
              </div>
            </div>
          </Card>

          {/* Quick Dispatch Notes */}
          <Card title="Operations Log">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Booking Created</span>
                  <p className="text-[11px] text-slate-500">{booking.createdAt}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Payment Authorization</span>
                  <p className="text-[11px] text-slate-500">Advance ₹5,000 received via UPI</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* 3-Scenario Invoicing and Voucher Modal */}
      <ScenarioInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        booking={booking}
        onToast={setToast}
      />
    </div>
  );
}