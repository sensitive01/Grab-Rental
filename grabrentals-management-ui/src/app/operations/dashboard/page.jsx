"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { operationsApi } from "@/lib/operationsApi";
import { formatINR, getStatusStyle } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import {
  Car,
  Users,
  Navigation,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  PlusCircle,
  CalendarCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const HOURLY_DISPATCH_DATA = [
  { hour: "06 AM", dispatches: 4, onRoad: 3 },
  { hour: "08 AM", dispatches: 8, onRoad: 7 },
  { hour: "10 AM", dispatches: 12, onRoad: 11 },
  { hour: "12 PM", dispatches: 7, onRoad: 14 },
  { hour: "02 PM", dispatches: 6, onRoad: 15 },
  { hour: "04 PM", dispatches: 10, onRoad: 18 },
  { hour: "06 PM", dispatches: 9, onRoad: 16 },
  { hour: "08 PM", dispatches: 5, onRoad: 12 },
];

export default function OperationsDashboard() {
  const [kpis, setKpis] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiRes, bookRes] = await Promise.all([
          operationsApi.getKPIs(),
          operationsApi.getBookings(),
        ]);
        setKpis(kpiRes.data);
        setPendingBookings(
          bookRes.data.filter((b) => b.status === "PENDING_ALLOCATION")
        );
        setActiveTrips(
          bookRes.data.filter((b) => ["EN_ROUTE", "ASSIGNED"].includes(b.status))
        );
      } catch (err) {
        console.error("Failed to load operations dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Command Center"
        subtitle="Real-time dispatch control, vehicle assignments, and trip monitoring"
        breadcrumbs={[{ label: "Operations" }, { label: "Dashboard" }]}
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/operations/assignments/vehicle">
              <Button variant="secondary" size="sm" icon={Car}>
                Assign Vehicles
              </Button>
            </Link>
            <Link href="/operations/bookings/new">
              <Button variant="amber" size="sm" icon={PlusCircle}>
                Pending Requests ({pendingBookings.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trips */}
        <Card className="border-l-4 border-l-blue-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Live Active Trips
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "..." : kpis?.activeTrips ?? 0}
              </h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>On-road tracking active</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Navigation className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Pending Allocation */}
        <Card className="border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Allocations
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "..." : kpis?.pendingAllocations ?? 0}
              </h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Action required immediately</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Available Fleet */}
        <Card className="border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available Fleet
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "..." : `${kpis?.availableVehicles ?? 0} / ${kpis?.totalVehicles ?? 0}`}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for dispatch</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Chauffeurs On Call */}
        <Card className="border-l-4 border-l-purple-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available Drivers
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "..." : `${kpis?.availableDrivers ?? 0} / ${kpis?.totalDrivers ?? 0}`}
              </h3>
              <p className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Chauffeurs verified & ready</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Live Dispatches Chart */}
      <Card
        title="Today's Hourly Fleet Dispatch & On-Road Volume"
        subtitle="Tracking peak dispatch hours across Chennai, Bangalore, Coimbatore, and Kochi"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_DISPATCH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="dispatches" name="New Dispatches" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="onRoad" name="On Road Active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Grid: Pending Allocations & Live Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Allocation Queue */}
        <Card
          title="Incoming Bookings Needing Allocation"
          subtitle="Assign available vehicle and driver before pickup time"
          action={
            <Link
              href="/operations/bookings/new"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {pendingBookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No pending allocations at this time. All bookings dispatched!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {b.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {b.customerName}
                      </span>
                      <Badge variant="warning" size="sm">
                        {b.vehicleCategory}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">{b.pickupLocation}</span> ➔{" "}
                      <span>{b.dropLocation}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Pickup: <strong className="text-slate-800">{b.startDate}</strong>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/operations/assignments/vehicle?bookingId=${b.id}`}>
                      <Button size="xs" variant="amber">
                        Assign Now
                      </Button>
                    </Link>
                    <Link href={`/operations/bookings/${b.id}`}>
                      <Button size="xs" variant="secondary">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Live Active Trips */}
        <Card
          title="Live On-Road Trips"
          subtitle="Trips currently en route or in progress"
          action={
            <Link
              href="/operations/trips/active"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Track Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {activeTrips.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No active trips on road right now.
            </div>
          ) : (
            <div className="space-y-3">
              {activeTrips.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {b.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {b.customerName}
                      </span>
                      <Badge variant="primary" size="sm" dot>
                        {b.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <NumberPlate registrationNumber={b.assignedVehicleNumber} />
                      <span className="text-xs text-slate-600">
                        Driver: <strong>{b.assignedDriverName || "Assigned"}</strong>
                      </span>
                    </div>
                    {b.tripMilestone && (
                      <div className="text-[11px] text-blue-600 mt-1 italic flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        <span>{b.tripMilestone}</span>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Link href={`/operations/trips/${b.id}`}>
                      <Button size="xs" variant="secondary">
                        Track Trip
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
