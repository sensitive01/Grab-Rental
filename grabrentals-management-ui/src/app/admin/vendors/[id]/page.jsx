"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Building2, Phone, Mail, MapPin, ArrowLeft, Star, Car, Users } from "lucide-react";

export default function VendorDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getVendorById(id);
        setVendor(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading vendor dossier...</div>;
  }

  if (!vendor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">Vendor Not Found</h2>
        <Link href="/admin/vendors">
          <Button variant="secondary" size="sm" className="mt-4">
            Back to Vendors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Vendor Dossier: ${vendor.name}`}
        subtitle={`Partner since ${vendor.joinedDate} • GSTIN: ${vendor.gstNumber}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Vendors", href: "/admin/vendors" },
          { label: vendor.id },
        ]}
        action={
          <Link href="/admin/vendors">
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Back to Directory
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Contract Commission</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1">{vendor.commissionRate}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Platform take-rate</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Fleet Enrolled</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{vendor.vehicles?.length || vendor.fleetCount} Vehicles</h3>
          <p className="text-[11px] text-emerald-600 mt-1">Compliance verified</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Chauffeurs Enrolled</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{vendor.drivers?.length || vendor.driverCount} Drivers</h3>
          <p className="text-[11px] text-slate-500 mt-1">Licensed commercial</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Service Rating</p>
          <div className="flex items-center gap-1 text-2xl font-bold text-amber-600 mt-1">
            <Star className="w-5 h-5 fill-amber-500" />
            <span>{vendor.rating > 0 ? vendor.rating : "New"}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Customer verified</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Roster */}
        <Card title="Registered Fleet Vehicles">
          {vendor.vehicles && vendor.vehicles.length > 0 ? (
            <div className="space-y-2.5">
              {vendor.vehicles.map((v) => (
                <div key={v.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <NumberPlate registrationNumber={v.registrationNumber} />
                    <p className="font-bold text-slate-800">{v.model}</p>
                    <p className="text-[11px] text-slate-500">{v.category} • {v.seatingCapacity} Seater</p>
                  </div>
                  <Badge variant={v.status === "AVAILABLE" ? "success" : "warning"} size="sm">
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No vehicles linked to this vendor record yet.</p>
          )}
        </Card>

        {/* Drivers Roster */}
        <Card title="Associated Chauffeurs">
          {vendor.drivers && vendor.drivers.length > 0 ? (
            <div className="space-y-2.5">
              {vendor.drivers.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{d.name}</p>
                    <p className="text-slate-600">{d.phone}</p>
                    <p className="text-[11px] text-slate-500">Badge: {d.badgeNumber} • Exp: {d.experienceYears} Yrs</p>
                  </div>
                  <Badge variant={d.status === "AVAILABLE" ? "success" : "warning"} size="sm">
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No chauffeurs linked to this vendor record yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
