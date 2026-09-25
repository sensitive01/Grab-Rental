"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  Edit3, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Car, 
  Award, 
  Calendar,
  CheckCircle2, 
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import StatusBadge from "@/components/ui/StatusBadge";
import { axiosClient } from "@/lib/axiosClient";

export default function DriverDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const driverId = unwrappedParams?.id;

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDriver() {
      if (!driverId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await axiosClient.get(`/api/fleet/drivers/${driverId}`);
        if (res.data?.success && res.data.data) {
          setDriver(res.data.data);
        } else {
          setError("Chauffeur not found in your roster.");
        }
      } catch (err) {
        console.error("Failed to load driver:", err);
        setError(err.response?.data?.message || "Failed to load chauffeur details");
      } finally {
        setLoading(false);
      }
    }

    fetchDriver();
  }, [driverId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold">Loading chauffeur profile...</p>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Chauffeur Not Found</h2>
        <p className="text-xs text-slate-500">{error || "The requested chauffeur could not be found."}</p>
        <Link
          href="/vendor/drivers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Chauffeurs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Breadcrumbs
            items={[
              { label: "Chauffeurs", href: "/vendor/drivers" },
              { label: driver.name }
            ]}
          />
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {driver.name}
            </h1>
            <StatusBadge status={driver.status} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            License: {driver.licenseNumber} · ID: {driver.id}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/vendor/drivers"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> All Drivers
          </Link>
          <Link
            href={`/vendor/drivers/${driver.id}/edit`}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" /> Edit Chauffeur
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Profile & Badges */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
            <div className="flex items-center gap-4">
              {driver.photoUrl ? (
                <img
                  src={driver.photoUrl}
                  alt={driver.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center shrink-0">
                  {driver.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5">
                <h3 className="text-base font-black text-slate-900">{driver.name}</h3>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-sm font-black text-slate-900">{driver.rating || "5.0"}</span>
                  <span className="text-slate-400 font-normal">({driver.totalTrips || 0} Trips)</span>
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Commercial Driver
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Mobile</span>
                <a href={`tel:${driver.phone}`} className="font-bold text-amber-600 hover:underline">
                  {driver.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Email</span>
                <span className="font-semibold text-slate-700">{driver.email || "Not Provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Experience</span>
                <span className="font-bold text-slate-900">{driver.experienceYears} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Blood Group</span>
                <span className="font-bold text-slate-900">{driver.bloodGroup || "N/A"}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Emergency Contact</span>
                <span className="font-semibold text-slate-800 text-right">{driver.emergencyContact}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Address</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs">{driver.address}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Safety Badges & Verification
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Commercial Badge Verified
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Highway Tested
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Vehicle Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 block pb-2 border-b border-slate-100">
              Assigned Vehicle
            </span>
            {driver.assignedVehicle ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {driver.assignedVehicle}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">Dedicated Assignment</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No dedicated vehicle assigned (Floating Chauffeur)
              </p>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Commercial Credentials & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Commercial License & Compliance</h3>
                <p className="text-xs text-slate-500">Government transport authority records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Commercial DL Number</p>
                <p className="text-sm font-black font-mono text-slate-900">{driver.licenseNumber}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">License Validity Expiry</p>
                <p className="text-sm font-black text-slate-900">{driver.licenseExpiry}</p>
              </div>
            </div>

            {/* Document Copies */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800">Uploaded Compliance Documents</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DL Copy */}
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Driving License Copy</p>
                      <p className="text-[11px] text-slate-400">
                        {driver.licenseDocumentUrl ? "Verified document" : "Not uploaded yet"}
                      </p>
                    </div>
                  </div>
                  {driver.licenseDocumentUrl && (
                    <a
                      href={driver.licenseDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-bold text-[11px] hover:bg-slate-800"
                    >
                      View
                    </a>
                  )}
                </div>

                {/* Portrait Photo */}
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Driver Badge Portrait</p>
                      <p className="text-[11px] text-slate-400">
                        {driver.photoUrl ? "Passport photo on file" : "Not uploaded yet"}
                      </p>
                    </div>
                  </div>
                  {driver.photoUrl && (
                    <a
                      href={driver.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-bold text-[11px] hover:bg-slate-800"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
