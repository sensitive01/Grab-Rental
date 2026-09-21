"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Car, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  CalendarCheck, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles,
  MapPin,
  FileText,
  CreditCard,
  XCircle
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { AreaLineChart, DonutChart, BarChart } from "@/components/ui/Charts";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Toast from "@/components/ui/Toast";
import { 
  currentVendor, 
  mockVehicles, 
  mockBookings, 
  mockBookingRequests, 
  mockEarningsData,
  mockPayments 
} from "@/lib/mockData";
import { formatINR } from "@/lib/utils";

export default function VendorDashboard() {
  const [requests, setRequests] = useState(mockBookingRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // "accept" | "reject"
  const [toastMessage, setToastMessage] = useState(null);

  const availableCount = mockVehicles.filter(v => v.status === "Available").length;
  const onTripCount = mockVehicles.filter(v => v.status === "On Trip").length;
  const bookedCount = mockVehicles.filter(v => v.status === "Booked").length;
  const maintCount = mockVehicles.filter(v => v.status === "Maintenance").length;

  const donutData = [
    { label: "Available", value: availableCount, color: "#10b981" },
    { label: "On Trip", value: onTripCount, color: "#0284c7" },
    { label: "Booked", value: bookedCount, color: "#f59e0b" },
    { label: "Maintenance", value: maintCount, color: "#f43f5e" }
  ];

  const chartData = [
    { label: "Apr", value: 71400, subtitle: "18 Trips" },
    { label: "May", value: 86700, subtitle: "24 Trips" },
    { label: "Jun", value: 80750, subtitle: "21 Trips" },
    { label: "Jul", value: 100300, subtitle: "29 Trips" },
    { label: "Aug", value: 105400, subtitle: "32 Trips" },
    { label: "Sep (MTD)", value: 112400, subtitle: "35 Trips" }
  ];

  const handleConfirmAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "accept") {
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setToastMessage(`Booking #${selectedRequest.bookingId} accepted successfully! Chauffeur assignment notified.`);
    } else {
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setToastMessage(`Booking #${selectedRequest.bookingId} was rejected.`);
    }
    setSelectedRequest(null);
    setActionType(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={actionType === "accept" ? "Accept Booking Request?" : "Decline Booking Request?"}
        message={
          actionType === "accept"
            ? `Confirm accepting #${selectedRequest?.bookingId} for ₹${selectedRequest?.estimatedAmount.toLocaleString()}? Your payout will be ₹${selectedRequest?.vendorShare.toLocaleString()} upon completion.`
            : `Are you sure you want to decline #${selectedRequest?.bookingId}? It will be returned to the dispatch queue for other vendors.`
        }
        confirmText={actionType === "accept" ? "Accept Trip" : "Decline Trip"}
        type={actionType === "accept" ? "success" : "danger"}
      />

      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
                Active Partner Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">Vendor ID: {currentVendor.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentVendor.ownerName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {currentVendor.businessName} · Coimbatore Hub. You have <strong className="text-amber-400">{requests.length} new booking requests</strong> awaiting your approval today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/vendor/bookings/requests"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> View Requests ({requests.length})
            </Link>
            <Link
              href="/vendor/vehicles/add"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700"
            >
              + Add Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Vehicles"
          value={mockVehicles.length}
          subtitle="Cars, Vans & Buses"
          icon={Car}
          iconColor="text-blue-600 bg-blue-50 border-blue-100"
        />
        <StatCard
          title="Available"
          value={availableCount}
          subtitle="Ready for dispatch"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
        <StatCard
          title="Active Bookings"
          value="3"
          subtitle="Today & Tomorrow"
          icon={CalendarCheck}
          iconColor="text-amber-600 bg-amber-50 border-amber-100"
        />
        <StatCard
          title="Pending Requests"
          value={requests.length}
          subtitle="Action required"
          icon={Clock}
          iconColor="text-rose-600 bg-rose-50 border-rose-100"
        />
        <StatCard
          title="Active Trips"
          value={onTripCount}
          subtitle="Live on highway"
          icon={MapPin}
          iconColor="text-purple-600 bg-purple-50 border-purple-100"
        />
        <StatCard
          title="Total Earnings"
          value={formatINR(mockEarningsData.totalEarnings)}
          trend="+14.2%"
          trendPositive={true}
          subtitle="Lifetime net"
          icon={TrendingUp}
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Revenue Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Net Revenue Growth (₹ INR)
              </h2>
              <p className="text-xs text-slate-500">
                Monthly vendor payout trajectory after platform fee
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                Sep MTD: ₹1,12,400
              </span>
            </div>
          </div>

          <AreaLineChart data={chartData} height={230} strokeColor="#f59e0b" />
        </div>

        {/* Chart 2: Vehicle Utilization Donut */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Fleet Status
            </h2>
            <p className="text-xs text-slate-500">
              Real-time vehicle availability allocation
            </p>
          </div>

          <DonutChart data={donutData} size={170} />

          <Link
            href="/vendor/vehicles/availability"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
          >
            Manage Fleet Calendar <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Two Column Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Pending Booking Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                Incoming Booking Requests
                {requests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Requires vendor acceptance to lock allocation
              </p>
            </div>
            <Link
              href="/vendor/bookings/requests"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              All incoming booking requests have been answered!
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {req.bookingId}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1">
                        {req.customer}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{formatINR(req.vendorShare)}</p>
                      <p className="text-[10px] text-slate-400">Net Share</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {req.pickup} ➔ {req.drop}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      📅 {req.pickupDate} · {req.passengers} Pax · {req.vehicleType}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {req.timeRemaining}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType("reject");
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType("accept");
                        }}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Today's Active & Scheduled Trips */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Today's Trip Dispatches
              </h3>
              <p className="text-xs text-slate-500">
                Ongoing and scheduled trips for today
              </p>
            </div>
            <Link
              href="/vendor/trips/active"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Live Map <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockBookings.slice(0, 2).map((trip) => (
              <div
                key={trip.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">#{trip.id}</span>
                    <StatusBadge status={trip.status} />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{trip.pickupDate}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-900">{trip.pickup} ➔ {trip.drop}</p>
                  <p className="text-slate-500">{trip.tripType} · {trip.distanceKm} KM · {trip.vehicleType}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                      {trip.driverName.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700">{trip.driverName} ({trip.vehicleNumber})</span>
                  </div>
                  <Link
                    href={`/vendor/bookings/${trip.id}`}
                    className="font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section: Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Recent Bookings Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Overview of all active, assigned and completed trips
            </p>
          </div>
          <Link
            href="/vendor/bookings"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            All Bookings <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Vehicle & Driver</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockBookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    #{b.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{b.customer.name}</p>
                    <p className="text-[11px] text-slate-400">{b.customer.phone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{b.pickup}</p>
                    <p className="text-slate-400">➔ {b.drop}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{b.vehicleNumber}</p>
                    <p className="text-[11px] text-slate-500">{b.driverName}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    {formatINR(b.vendorNet)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/vendor/bookings/${b.id}`}
                      className="inline-flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
