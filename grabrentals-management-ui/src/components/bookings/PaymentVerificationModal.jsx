"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  QrCode,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  ZoomIn,
  Clock,
  ShieldCheck,
} from "lucide-react";

export function PaymentVerificationModal({
  isOpen,
  onClose,
  booking,
  onVerify,
  loading = false,
}) {
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [fullImagePreview, setFullImagePreview] = useState(false);

  if (!booking) return null;

  const handleCopyUtr = () => {
    if (booking.paymentUtrNumber) {
      navigator.clipboard.writeText(booking.paymentUtrNumber);
      setCopiedUtr(true);
      setTimeout(() => setCopiedUtr(false), 2000);
    }
  };

  const handleApprove = () => {
    onVerify(booking.id || booking.bookingReference, { action: "APPROVE" });
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    onVerify(booking.id || booking.bookingReference, {
      action: "REJECT",
      rejectionReason: rejectionReason.trim(),
    });
  };

  const isPendingReview =
    booking.status === "PENDING_PAYMENT_VERIFICATION" ||
    booking.paymentStatus === "UNDER_REVIEW";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        title={
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            <span className="font-black text-slate-900">
              Verify Customer UPI Payment Proof
            </span>
          </div>
        }
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-slate-700 hover:bg-slate-100 font-bold text-xs px-4 py-2"
            >
              Close
            </Button>

            <div className="flex items-center gap-2.5">
              {!showRejectForm && isPendingReview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs px-4 py-2"
                >
                  <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                  Reject Payment
                </Button>
              )}

              {isPendingReview && (
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 shadow-sm shadow-emerald-600/30 flex items-center"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-white" />
                  {loading ? "Verifying..." : "Approve & Confirm Advance"}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Status Alert Banner */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between ${
              booking.paymentStatus === "ADVANCE_PAID"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : booking.paymentStatus === "REJECTED"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {booking.paymentStatus === "ADVANCE_PAID" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : booking.paymentStatus === "REJECTED" ? (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-wider">
                  {booking.paymentStatus === "ADVANCE_PAID"
                    ? "Payment Verified & Approved"
                    : booking.paymentStatus === "REJECTED"
                    ? "Payment Rejected"
                    : "Payment Under Review"}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  Booking #{booking.bookingReference} • Trip: {booking.pickupCity} to {booking.dropCity || "Destination"}
                </p>
              </div>
            </div>

            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white/80 border border-current shadow-sm shrink-0 ml-2">
              {booking.status}
            </span>
          </div>

          {/* Booking Financials & Customer Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Fare
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900">
                ₹{Number(booking.totalFare || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Advance Paid Claim
              </span>
              <span className="text-sm sm:text-base font-black text-amber-800">
                ₹{Number(booking.advancePaid || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Passenger Phone
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                {booking.passengerPhone || booking.customerPhone || "N/A"}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Passenger Name
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block mt-0.5" title={booking.passengerName || booking.customerName}>
                {booking.passengerName || booking.customerName || "Customer"}
              </span>
            </div>
          </div>

          {/* Payment Proof Screenshot & UTR Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Screenshot Preview */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Uploaded Payment Screenshot
              </span>

              {booking.paymentProofUrl ? (
                <div className="relative group border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center h-48 sm:h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={booking.paymentProofUrl}
                    alt="Payment Proof Receipt"
                    className="max-h-48 sm:max-h-52 w-auto object-contain cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setFullImagePreview(true)}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Click to Expand
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50 text-slate-400">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No payment receipt uploaded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Customer booked without attaching a proof image.
                  </p>
                </div>
              )}

              {booking.paymentProofUrl && (
                <a
                  href={booking.paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open full resolution in new tab
                </a>
              )}
            </div>

            {/* UTR & Transaction Details */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Transaction Reference (UTR)
                </span>

                <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    12-Digit UPI Transaction ID
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-black tracking-wider text-white">
                      {booking.paymentUtrNumber || "No UTR provided"}
                    </span>
                    {booking.paymentUtrNumber && (
                      <button
                        onClick={handleCopyUtr}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Copy UTR"
                      >
                        {copiedUtr ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Payment Mode:</span>
                    <span className="font-bold text-slate-800">{booking.paymentMethod || "UPI_QR"}</span>
                  </div>
                  {booking.paymentVerifiedBy && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Verified By:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[150px]">{booking.paymentVerifiedBy}</span>
                    </div>
                  )}
                  {booking.paymentRejectionReason && (
                    <div className="pt-2 border-t border-slate-200 text-rose-700">
                      <span className="font-bold block">Rejection Note:</span>
                      <p className="text-[11px] mt-0.5">{booking.paymentRejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions check tip */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 text-[11px] text-amber-900 font-medium flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Please verify with your bank app (Axis, HDFC, or UPI merchant console) that ₹{Number(booking.advancePaid || 0).toLocaleString()} was credited with UTR &quot;{booking.paymentUtrNumber || "---"}&quot;.
                </span>
              </div>
            </div>
          </div>

          {/* Rejection Form Input (Conditionally rendered) */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-rose-900">
                Reason for Rejecting Payment <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR number not found in bank statement, or partial amount received..."
                required
                className="w-full text-xs font-medium text-slate-800 bg-white border border-rose-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs py-1.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !rejectionReason.trim()}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-1.5"
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Full Size Image Modal */}
      {fullImagePreview && booking.paymentProofUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullImagePreview(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={booking.paymentProofUrl}
            alt="Payment Proof Full"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
