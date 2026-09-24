"use client";

import { use } from "react";
import Link from "next/link";
import { initialBookings } from "@/lib/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { ArrowLeft, Printer, Shield, CheckCircle2 } from "lucide-react";

export default function AdminBookingDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const booking = initialBookings.find((b) => b.id === id) || initialBookings[0];
  const statusStyle = getStatusStyle(booking.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Audit Dossier: Booking #${booking.id}`}
        subtitle={`Logged on ${booking.createdAt} • Partner: ${booking.vendorName}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Bookings", href: "/admin/bookings" },
          { label: booking.id },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/bookings">
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                Back to Ledger
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Audit Certificate
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Financial Settlement Breakdown">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gross Tariff</span>
              <span className="font-bold text-slate-900">{formatINR(booking.fare)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Advance Collected</span>
              <span className="text-emerald-700 font-semibold">{formatINR(booking.advancePaid)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Platform Commission (12%)</span>
              <span className="text-blue-700 font-semibold">{formatINR(booking.fare * 0.12)}</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold">
              <span className="text-slate-900">Vendor Net Payout</span>
              <span className="text-slate-900">{formatINR(booking.fare * 0.88)}</span>
            </div>
          </div>
        </Card>

        <Card title="Customer & Trip Route">
          <div className="space-y-2 text-xs">
            <p className="font-bold text-slate-900 text-sm">{booking.customerName}</p>
            <p className="text-slate-600">{booking.customerPhone}</p>
            <p className="text-slate-500">{booking.customerEmail}</p>
            <div className="pt-2 border-t border-slate-100">
              <p className="font-semibold text-slate-800">{booking.pickupLocation} ➔ {booking.dropLocation}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{booking.startDate} to {booking.endDate}</p>
            </div>
          </div>
        </Card>

        <Card title="Allocated Fleet Asset">
          <div className="space-y-2 text-xs">
            <NumberPlate registrationNumber={booking.assignedVehicleNumber} />
            <p className="font-semibold text-slate-800">{booking.preferredVehicle}</p>
            <p className="text-slate-500">Chauffeur: {booking.assignedDriverName || "Pending"}</p>
            <div className="pt-2">
              <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyle.bg}`}>
                {statusStyle.label}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
