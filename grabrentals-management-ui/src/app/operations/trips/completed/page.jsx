"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { formatINR } from "@/lib/utils";
import { CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CompletedTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await operationsApi.getBookings("COMPLETED");
        setTrips(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed Trips Archive"
        subtitle="Historical duty slips, completed customer journeys, and trip logs"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Trips", href: "/operations/trips/active" },
          { label: "Completed" },
        ]}
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Vehicle & Driver</TableHead>
              <TableHead>Fare Settled</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  Loading completed trips...
                </TableCell>
              </TableRow>
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No completed trips recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-slate-900">{t.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">{t.customerName}</div>
                    <div className="text-[11px] text-slate-500">{t.customerPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-800">{t.pickupLocation}</div>
                    <div className="text-[11px] text-slate-500">to {t.dropLocation}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-800">{t.startDate}</div>
                    <div className="text-[11px] text-slate-500">{t.endDate}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <NumberPlate registrationNumber={t.assignedVehicleNumber} />
                      <div className="text-[11px] text-slate-600">{t.assignedDriverName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-xs text-slate-900">{formatINR(t.fare)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/operations/bookings/${t.id}`}>
                      <Button size="xs" variant="secondary" icon={Eye}>
                        Duty Slip
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
