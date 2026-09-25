"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Car, 
  Edit3, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Users, 
  Fuel, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Loader2,
  AlertCircle,
  Phone
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import NumberPlate from "@/components/ui/NumberPlate";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import DataTable from "@/components/ui/DataTable";
import { axiosClient } from "@/lib/axiosClient";
import { formatINR } from "@/lib/utils";

export default function VehicleDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const vehicleId = unwrappedParams?.id;

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVehicle() {
      if (!vehicleId) return;
      try {
        setLoading(true);
        setError(null);
        const [res, driversRes] = await Promise.all([
          axiosClient.get(`/api/fleet/vehicles/${vehicleId}`),
          axiosClient.get("/api/fleet/drivers").catch(() => ({ data: { data: [] } }))
        ]);

        if (res.data?.success && res.data.data) {
          const v = res.data.data;
          const drivers = Array.isArray(driversRes.data?.data) ? driversRes.data.data : [];
          const matchedDriver = drivers.find((d) => d.assignedVehicleId === v.id);

          setVehicle({
            id: v.id,
            model: v.model,
            vehicleNumber: v.vehicleNumber,
            type: v.vehicleType || "SUV",
            category: v.vehicleType || "SUV",
            seatingCapacity: v.seatingCapacity,
            fuelType: v.fuelType || "Diesel",
            transmission: "Manual",
            acType: v.acType || "Dual AC",
            year: v.year || 2024,
            odometer: "18,400 KM",
            status: v.status === "AVAILABLE" ? "Available" : v.status === "BOOKED" ? "Booked" : v.status === "ON_TRIP" ? "On Trip" : "Maintenance",
            currentLocation: v.currentLocation || "Deployment Hub",
            driverName: v.assignedDriverName || matchedDriver?.name || "Unassigned",
            driverPhone: v.assignedDriverPhone || matchedDriver?.phone || "",
            assignedDriverId: v.assignedDriverId || matchedDriver?.id || null,
            dailyRate: v.dailyRate || 3500,
            perKmRate: v.perKmRate || 15,
            insuranceExpiry: v.insuranceExpiry || "Pending",
            permitExpiry: v.permitExpiry || "Pending",
            fitnessExpiry: v.fitnessExpiry || "Pending",
            image: v.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60",
            rcDocumentUrl: v.rcDocumentUrl,
            insuranceDocumentUrl: v.insuranceDocumentUrl,
            permitDocumentUrl: v.permitDocumentUrl,
          });
        } else {
          setError("Vehicle asset details not found.");
        }
      } catch (err) {
        console.error("Failed to load vehicle details:", err);
        setError(err.response?.data?.message || "Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold">Loading vehicle particulars from fleet database...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500">{error || "Could not retrieve the requested asset."}</p>
        <Link
          href="/vendor/vehicles"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Fleet
        </Link>
      </div>
    );
  }

  const vehicleTrips = [];

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Vehicles", href: "/vendor/vehicles" },
              { label: vehicle.vehicleNumber }
            ]}
          />
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {vehicle.model}
            </h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <NumberPlate number={vehicle.vehicleNumber} />
            <span className="text-xs text-slate-400 font-mono">ID: {vehicle.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/vendor/vehicles"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" /> All Vehicles
          </Link>
          <Link
            href={`/vendor/vehicles/${vehicle.id}/edit`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-slate-500" /> Edit Vehicle
          </Link>
          <Link
            href="/vendor/vehicles/availability"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" /> Manage Calendar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Card & Driver */}
        <div className="space-y-6">
          
          {/* Main Visual Profile */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                src={vehicle.image}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                {vehicle.type}
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-500">Plate Number</span>
                <NumberPlate number={vehicle.vehicleNumber} />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-500">Current Location</span>
                <span className="font-semibold text-slate-800 text-right flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {vehicle.currentLocation}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-500">Model Year</span>
                <span className="font-bold text-slate-900">{vehicle.year}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Default Daily Rate</span>
                <span className="font-black text-slate-900">{formatINR(vehicle.dailyRate)} / Day</span>
              </div>
            </div>
          </div>

          {/* Assigned Driver Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Assigned Chauffeur
              </span>
              <Link
                href="/vendor/drivers"
                className="text-[11px] font-bold text-amber-600 hover:underline"
              >
                Manage Roster ↗
              </Link>
            </div>

            {vehicle.driverName && vehicle.driverName !== "Unassigned" ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                  {vehicle.driverName.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs space-y-0.5">
                  <Link 
                    href={vehicle.assignedDriverId ? `/vendor/drivers/${vehicle.assignedDriverId}` : "/vendor/drivers"}
                    className="font-black text-slate-900 hover:text-amber-600 transition-colors block"
                  >
                    {vehicle.driverName}
                  </Link>
                  {vehicle.driverPhone && (
                    <a href={`tel:${vehicle.driverPhone}`} className="text-amber-600 font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {vehicle.driverPhone}
                    </a>
                  )}
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Dedicated Chauffeur
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-400 italic">No permanent driver assigned.</p>
                <Link
                  href="/vendor/drivers"
                  className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs hover:bg-amber-500/20"
                >
                  Assign Chauffeur
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right 2 Columns: Specifications, Compliance & Trip History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Specs Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Seating</span>
                <p className="text-sm font-black text-slate-900">{vehicle.seatingCapacity} Passengers</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fuel Type</span>
                <p className="text-sm font-black text-slate-900">{vehicle.fuelType}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Air Conditioning</span>
                <p className="text-sm font-black text-slate-900">{vehicle.acType}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Per KM Rate</span>
                <p className="text-sm font-black text-slate-900">₹{vehicle.perKmRate} / km</p>
              </div>
            </div>
          </div>

          {/* Statutory Document Expiry Dates */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Statutory Compliance & Expiry Tracker
              </h2>
              <Link
                href="/vendor/documents"
                className="text-xs font-bold text-amber-600 hover:underline"
              >
                Upload Renewals ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Commercial Insurance</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs font-black text-slate-900">{vehicle.insuranceExpiry}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Policy Status
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Tourist Permit (AITP)</span>
                  <FileText className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-xs font-black text-slate-900">{vehicle.permitExpiry}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Permit Status
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Fitness Certificate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs font-black text-slate-900">{vehicle.fitnessExpiry}</p>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Fitness Status
                </span>
              </div>
            </div>
          </div>

          {/* Booking History Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-black text-slate-900 tracking-tight px-1">
              Assigned Trips History
            </h2>

            <DataTable
              columns={[
                {
                  key: "id",
                  label: "Trip ID",
                  sortable: true,
                  render: (t) => (
                    <span className="font-mono font-black text-slate-900">#{t.id}</span>
                  )
                },
                {
                  key: "customer.name",
                  label: "Customer",
                  sortable: true,
                  className: "font-semibold text-slate-800"
                },
                {
                  key: "route",
                  label: "Route",
                  sortable: true,
                  sortValue: (t) => `${t.pickup} ${t.drop}`,
                  render: (t) => (
                    <span className="text-slate-600 truncate max-w-[200px] block">
                      {t.pickup} ➔ {t.drop}
                    </span>
                  )
                },
                {
                  key: "status",
                  label: "Status",
                  sortable: true,
                  render: (t) => <StatusBadge status={t.status} />
                },
                {
                  key: "vendorNet",
                  label: "Net Share",
                  align: "right",
                  sortable: true,
                  sortValue: (t) => Number(t.vendorNet) || 0,
                  render: (t) => (
                    <span className="font-black text-slate-900">
                      {formatINR(t.vendorNet)}
                    </span>
                  )
                }
              ]}
              data={vehicleTrips}
              keyField="id"
              defaultPageSize={5}
              pageSizeOptions={[5, 10, 20]}
              searchPlaceholder="Search trip history..."
              searchKeys={["id", "customer.name", "pickup", "drop"]}
              emptyTitle="No Trips Found"
              emptyDescription="No recent trips registered for this vehicle."
            />
          </div>

        </div>

      </div>

    </div>
  );
}
