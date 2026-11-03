"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Users, 
  CreditCard, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronRight, 
  FileText, 
  KeyRound, 
  Loader2,
  Camera,
  Receipt,
  FileCheck,
  ZoomIn,
  X,
  ExternalLink,
  Banknote,
  HelpCircle,
  Gauge
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import { vendorApi } from "@/lib/vendorApi";
import { formatINR } from "@/lib/utils";

export default function BookingDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams?.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // { url, title }

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await vendorApi.getBookingById(bookingId);
        if (data) {
          setBooking(data);
        } else {
          setError("Booking not found");
        }
      } catch (err) {
        console.error("Failed to load booking details:", err);
        setError("Unable to load booking details from the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="text-xs text-slate-500 font-medium">Fetching real-time booking particulars...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Booking Not Found</h2>
        <p className="text-xs text-slate-500">{error || `No booking found for identifier #${bookingId}`}</p>
        <Link
          href="/vendor/bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Ledger
        </Link>
      </div>
    );
  }

  const isTripCompleted = String(booking.status || "").toUpperCase() === "COMPLETED" || 
    booking.tripCompletedAt != null || 
    booking.endKm != null;

  const totalExtraCharges = (Number(booking.extraKmCharge) || 0) +
    (Number(booking.tollCharges) || 0) +
    (Number(booking.permitCharges) || 0) +
    (Number(booking.parkingCharges) || 0) +
    (Number(booking.driverAllowanceCharges) || 0) +
    (Number(booking.otherCharges) || 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Lightbox Modal for Photo Proofs */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">{previewImage.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto flex items-center justify-center rounded-2xl bg-black/60 p-2">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Grab Rentals Driver Operational Proof Document</span>
              <a
                href={previewImage.url}
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

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Bookings", href: "/vendor/bookings" },
              { label: `#${booking.bookingReference || booking.id}` }
            ]}
          />
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              #{booking.bookingReference || booking.id}
            </h1>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {booking.tripType} · Booked on {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString("en-IN") : "Recent"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isTripCompleted && (
            <Link
              href={`/vendor/trips/${booking.bookingReference || booking.id}/invoice`}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Receipt className="w-4 h-4 text-amber-400" /> View Tax Invoice
            </Link>
          )}
          <Link
            href="/vendor/bookings"
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Ledger
          </Link>
        </div>
      </div>

      {/* Booking Details Hero Banner Photo */}
      <div className="relative h-44 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <img
          src="/images/cars/innova.jpg"
          alt="Trip Execution & Route"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Assigned Fleet Mission</span>
          <h2 className="text-xl font-black text-white">Trip #{booking.bookingReference || booking.id}</h2>
          <p className="text-xs text-slate-200">{booking.pickup} ➔ {booking.drop} · {booking.tripType}</p>
        </div>
      </div>

      {/* Driver Duty & Trip Closing Audit Sheet (Visible upon completion) */}
      {isTripCompleted && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Driver Duty & Trip Closing Audit Sheet
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Verified Closed
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Duty finalized by <strong>{booking.tripClosedBy || booking.driverName || "Commercial Chauffeur"}</strong>
                  {booking.tripCompletedAt && ` on ${new Date(booking.tripCompletedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`}
                </p>
              </div>
            </div>

            <Link
              href={`/vendor/trips/${booking.bookingReference || booking.id}/invoice`}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" /> Print Tax Invoice
            </Link>
          </div>

          {/* Odometer Telemetry Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-slate-500" />
              Vehicle Odometer & Distance Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Start Reading</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {booking.startKm != null ? `${booking.startKm} KM` : "Recorded"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">End Reading</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {booking.endKm != null ? `${booking.endKm} KM` : "Recorded"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Actual Traveled</span>
                <p className="text-base font-black text-emerald-700 mt-0.5">
                  {booking.actualKm != null ? `${booking.actualKm} KM` : "Calculated"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Package Included</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {booking.packageKm || booking.distanceKm || "250"} KM
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-amber-800 font-bold uppercase block">Extra Distance</span>
                <p className="text-base font-black text-amber-950 mt-0.5">
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
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-500" />
              Uploaded Proofs & Verification Photos
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Start Odometer Photo Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
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
                    onClick={() => setPreviewImage({ url: booking.startOdometerProofUrl || booking.startOdometerProof, title: `Start Odometer Proof - Trip #${booking.bookingReference || booking.id}` })}
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
                  <div className="h-32 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Camera className="w-6 h-6 mb-1 text-slate-300" />
                    <span>No digital odometer photo attached</span>
                  </div>
                )}
              </div>

                            {/* Odometer Photo Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
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
                    onClick={() => setPreviewImage({ url: booking.endOdometerProofUrl, title: `End Odometer Proof - Trip #${booking.bookingReference || booking.id}` })}
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
                  <div className="h-32 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Camera className="w-6 h-6 mb-1 text-slate-300" />
                    <span>No digital odometer photo attached</span>
                  </div>
                )}
              </div>

              {/* Payment Receipt / UPI Screenshot Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
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
                    onClick={() => setPreviewImage({ url: booking.paymentProofUrl, title: `Payment Receipt Proof - Trip #${booking.bookingReference || booking.id}` })}
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
                  <div className="h-32 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Banknote className="w-6 h-6 mb-1 text-slate-300" />
                    <span>Paid in {booking.paymentMethod || "Cash"} or Settled directly</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Itemized Extra Expenses Table */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Chauffeur Extra Duty & Toll Expenses Breakdown
            </h3>
            
            <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3.5">Expense Item</th>
                    <th className="py-2.5 px-3.5 text-center">Duty Remarks</th>
                    <th className="py-2.5 px-3.5 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.extraKm > 0 && (
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                        Extra Distance ({booking.extraKm} KM)
                      </td>
                      <td className="py-2.5 px-3.5 text-center text-slate-500">
                        @ ₹{booking.extraKmRate || 14}/km
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                        {formatINR(booking.extraKmCharge || 0)}
                      </td>
                    </tr>
                  )}
                  {Number(booking.tollCharges) > 0 && (
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">FASTag Highway Tolls</td>
                      <td className="py-2.5 px-3.5 text-center text-slate-500">National/State Highway Plaza</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">{formatINR(booking.tollCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.permitCharges) > 0 && (
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">State Entry Permit / Tax</td>
                      <td className="py-2.5 px-3.5 text-center text-slate-500">Interstate Border Tax</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">{formatINR(booking.permitCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.parkingCharges) > 0 && (
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">Airport / Commercial Parking</td>
                      <td className="py-2.5 px-3.5 text-center text-slate-500">Actual Parking Fees</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">{formatINR(booking.parkingCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.driverAllowanceCharges) > 0 && (
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">Driver Allowance / Night Batta</td>
                      <td className="py-2.5 px-3.5 text-center text-slate-500">Chauffeur Overnight Duty</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">{formatINR(booking.driverAllowanceCharges)}</td>
                    </tr>
                  )}
                  {Number(booking.otherCharges) > 0 && (
                    <tr>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">Other Incidental Charges</td>
                      <td className="py-2.5 px-3.5 text-center text-slate-500">{booking.otherChargesNotes || "Miscellaneous expenses"}</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">{formatINR(booking.otherCharges)}</td>
                    </tr>
                  )}
                  {totalExtraCharges === 0 && (
                    <tr>
                      <td colSpan={3} className="py-3 px-3.5 text-center text-slate-400">
                        No extra KM, toll, or permit charges incurred during this trip.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Closing Notes */}
          {booking.tripClosingNotes && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                Chauffeur Closing Log & Remarks
              </span>
              <p className="text-slate-800 italic">"{booking.tripClosingNotes}"</p>
            </div>
          )}
        </div>
      )}

      {/* Main Booking Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Route & Assignment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trip Itinerary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Journey Route & Timing</span>
              {booking.rideOtp && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-black text-xs font-mono">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Start OTP: {booking.rideOtp}
                </span>
              )}
            </h2>

            <div className="space-y-6 relative pl-6 border-l-2 border-slate-200 ml-3">
              
              {/* Pickup */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-200"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Pickup Location · {booking.pickupDate}
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.pickup}
                </p>
                <p className="text-xs text-slate-500">Scheduled Chauffeur Reporting Time</p>
              </div>

              {/* Drop */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white ring-2 ring-rose-200"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
                  Drop Destination
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {booking.drop}
                </p>
                <p className="text-xs text-slate-500">Destination Arrival Hub</p>
              </div>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle Class</span>
                <p className="font-bold text-slate-800 mt-0.5">{booking.vehicleType}</p>
              </div>
              {/* <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Passengers</span>
                <p className="font-bold text-slate-800 mt-0.5">{booking.passengers} Guests</p>
              </div> */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Trip Mode</span>
                <p className="font-bold text-slate-800 mt-0.5">{booking.tripType}</p>
              </div>
            </div>
          </div>

          {/* Assigned Resources Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Allocated Chauffeur & Vehicle
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Driver Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Chauffeur
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                    {booking.driverName ? booking.driverName.charAt(0) : "D"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{booking.driverName || "Chauffeur Pending"}</p>
                    <p className="text-slate-500 font-medium">{booking.driverPhone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Vehicle
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <NumberPlate number={booking.vehicleNumber || "UNASSIGNED"} />
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5">{booking.vehicleType}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Col: Customer & Commercial Breakdown */}
        <div className="space-y-6">
          
          {/* Customer Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              Passenger Information
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Customer Name</span>
                <p className="text-sm font-black text-slate-900">{booking.customer?.name || "Customer"}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Contact Phone</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {booking.customer?.phone || "N/A"}
                </p>
              </div>

              {booking.customer?.email && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Email Address</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {booking.customer.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
              Commercial & Payout Details
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Base Booking Fare</span>
                <span className="font-bold text-slate-900">{formatINR(booking.totalFare || booking.estimatedAmount)}</span>
              </div>

              {totalExtraCharges > 0 && (
                <div className="flex items-center justify-between text-amber-700 font-bold">
                  <span>Additional Extras & Tolls</span>
                  <span>+{formatINR(totalExtraCharges)}</span>
                </div>
              )}

              {booking.finalTotalFare && (
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Final Total Fare</span>
                  <span>{formatINR(booking.finalTotalFare)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-rose-600">
                <span>Platform Commission (10%)</span>
                <span>-{formatINR(booking.platformFee)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-black text-slate-900">Net Vendor Payout</span>
                <span className="font-black text-emerald-600">{formatINR(booking.vendorNet || booking.totalFare)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Payment Status
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {booking.paymentStatus}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
