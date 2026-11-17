"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { CreateBookingModal } from "@/components/bookings/CreateBookingModal";
import { PaymentVerificationModal } from "@/components/bookings/PaymentVerificationModal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { AlertCircle, UserCheck, PlusCircle, QrCode } from "lucide-react";

export default function PendingAllocationsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [verifyModalBooking, setVerifyModalBooking] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await operationsApi.getBookings();
        const list = (res.data || []).filter(
          (b) =>
            b.status === "PENDING_ALLOCATION" ||
            b.status === "REASSIGN_REQUIRED" ||
            b.status === "PENDING_PAYMENT_VERIFICATION" ||
            b.paymentStatus === "UNDER_REVIEW"
        );
        if (!ignore) setBookings(list);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const handleVerifyPayment = async (bookingId, { action, rejectionReason }) => {
    setVerifying(true);
    try {
      const res = await operationsApi.verifyBookingPayment(bookingId, { action, rejectionReason });
      if (res?.success) {
        setToast({
          type: "success",
          message:
            action === "APPROVE"
              ? "Payment verified & approved! Ready for fleet allocation."
              : "Payment rejected.",
        });
        setVerifyModalBooking(null);
        setReloadTrigger((prev) => prev + 1);
      }
    } catch (err) {
      setToast({ type: "error", message: err.message || "Failed to verify payment." });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Allocations Dispatch Queue"
        subtitle="Incoming customer bookings awaiting vehicle and chauffeur assignment"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Bookings", href: "/operations/bookings" },
          { label: "Pending Allocations" },
        ]}
        action={
          <Button
            variant="amber"
            size="sm"
            icon={PlusCircle}
            onClick={() => setCreateModalOpen(true)}
          >
            Manual Booking Entry
          </Button>
        }
      />

      <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Attention Dispatcher:</strong> Verify customer payment first before assigning fleet. Licensed vehicles and chauffeurs must be allocated at least 4 hours before pickup.
          </span>
        </div>
        <Badge variant="warning">{bookings.length} Pending</Badge>
      </div>

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pickup Route</TableHead>
              <TableHead>Pickup Time</TableHead>
              <TableHead>Vehicle Needed</TableHead>
              <TableHead>Total Fare</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  Loading pending bookings...
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  All bookings have been successfully allocated!
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => {
                const isPendingPayment =
                  b.status === "PENDING_PAYMENT_VERIFICATION" ||
                  b.paymentStatus === "UNDER_REVIEW";

                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-slate-900">{b.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-slate-900">{b.customerName}</div>
                      <div className="text-[11px] text-slate-500">{b.customerPhone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium text-slate-800">{b.pickupLocation}</div>
                      <div className="text-[11px] text-slate-500">to {b.dropLocation}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-slate-900">{b.startDate}</div>
                      <div className="text-[11px] text-slate-500">{b.serviceType}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {b.vehicleCategory} ({b.preferredVehicle})
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-xs text-slate-900">{formatINR(b.fare)}</span>
                    </TableCell>
                    <TableCell>
                      {isPendingPayment ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          Under Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.paymentStatus === "FULL_PAID"
                            ? "Full Paid"
                            : b.paymentStatus === "ADVANCE_PAID"
                            ? "Advance Paid"
                            : b.paymentStatus || "Verified"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.urgency === "HIGH" ? "danger" : "warning"} size="sm">
                        {b.urgency || "NORMAL"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isPendingPayment ? (
                        <Button
                          size="xs"
                          variant="amber"
                          icon={QrCode}
                          onClick={() => setVerifyModalBooking(b)}
                          className="font-bold shadow-xs animate-pulse"
                          title="Verify customer UPI payment proof before allocating fleet"
                        >
                          Verify Payment
                        </Button>
                      ) : (
                        <Link href={`/operations/assignments/vehicle?bookingId=${b.id}`}>
                          <Button size="xs" variant="amber" icon={UserCheck}>
                            Allocate Fleet
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={Boolean(verifyModalBooking)}
        onClose={() => setVerifyModalBooking(null)}
        booking={verifyModalBooking}
        onVerify={handleVerifyPayment}
        loading={verifying}
      />

      {/* Manual Booking Entry Modal */}
      <CreateBookingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => setReloadTrigger((prev) => prev + 1)}
        onToast={setToast}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
