"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge, NumberPlate } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft, 
  Star, 
  Car, 
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  CreditCard,
  ExternalLink,
  Eye,
  X,
  Check,
  AlertCircle,
  Calendar,
  Sparkles
} from "lucide-react";

export default function VendorDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Approval state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState(12);
  const [approving, setApproving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Photo lightbox
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.getVendorById(id);
        setVendor(res.data);
        if (res.data?.commissionRate) {
          setCommissionRate(res.data.commissionRate);
        }
      } catch (err) {
        console.error("Failed to load vendor details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!vendor) return;
    setApproving(true);
    try {
      await adminApi.approveVendor(vendor.id, Number(commissionRate));
      setToastMessage({
        type: "success",
        text: `Vendor ${vendor.name} has been approved and activated!`,
      });
      setVendor((prev) => ({
        ...prev,
        status: "APPROVED",
        rawStatus: "ACTIVE",
        commissionRate: Number(commissionRate),
        gstStatus: "Verified Active",
      }));
      setApproveModalOpen(false);
    } catch (err) {
      console.error("Error approving vendor:", err);
      setToastMessage({
        type: "error",
        text: err.message || "Failed to approve vendor.",
      });
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading vendor profile & fleet details...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-800">Vendor Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          Could not locate the requested vendor ID in the database registry.
        </p>
        <Link href="/admin/vendors">
          <Button variant="secondary" size="sm" className="mt-4" icon={ArrowLeft}>
            Back to Vendors
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = vendor.status === "PENDING_APPROVAL" || vendor.rawStatus === "PENDING" || vendor.status === "PENDING";

  // Parse vehicle photos helper
  const getVehiclePhotos = (v) => {
    if (v.photoList && Array.isArray(v.photoList)) return v.photoList;
    if (v.photos) {
      if (typeof v.photos === "string") {
        try {
          const parsed = JSON.parse(v.photos);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && typeof parsed === "object") {
            if (Array.isArray(parsed.list)) return parsed.list;
            if (parsed.slots) return Object.values(parsed.slots).filter(Boolean);
          }
        } catch {
          return v.photos.split(",").map((s) => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(v.photos)) {
        return v.photos;
      }
    }
    if (v.imageUrl) return [v.imageUrl];
    return [];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title={`Vendor Profile: ${vendor.name}`}
        subtitle={`Partner ID: ${vendor.id} • Registered ${vendor.joinedDate || "Recently"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Vendors", href: "/admin/vendors" },
          { label: vendor.name },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/vendors">
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                Back to Directory
              </Button>
            </Link>
            {isPending && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => setApproveModalOpen(true)}
              >
                Authorize & Approve Vendor
              </Button>
            )}
          </div>
        }
      />

      {/* PENDING APPROVAL ALERT BANNER */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-2 border-amber-400 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm mt-0.5">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
                <span className="text-xs font-bold text-slate-700">
                  New Vendor Registration Under Review
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                Awaiting Admin Verification & Commission Authorization
              </h2>
              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                This vendor completed registration and added their business details, compliance documents, and fleet. Verify the proofs below and approve the partner to unlock customer booking dispatches.
              </p>
            </div>
          </div>

          <Button
            size="md"
            variant="primary"
            icon={CheckCircle2}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md border-0"
            onClick={() => setApproveModalOpen(true)}
          >
            Authorize & Approve Partner
          </Button>
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Platform Commission</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1">{vendor.commissionRate || 12}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Platform take-rate per trip</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Fleet Enrolled</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {vendor.vehicles?.length || vendor.fleetCount || 0} Vehicles
          </h3>
          <p className="text-[11px] text-emerald-600 mt-1">Submitted in fleet</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Chauffeurs Enrolled</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {vendor.drivers?.length || vendor.driverCount || 0} Drivers
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Commercial drivers</p>
        </Card>
        <Card className="bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase">Account Status</p>
          <div className="mt-1">
            <Badge variant={isPending ? "warning" : "success"} size="md" dot>
              {isPending ? "Pending Review" : "Active Partner"}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isPending ? "Bookings disabled until approval" : "Authorized for bookings"}
          </p>
        </Card>
      </div>

      {/* BUSINESS & FINANCIAL DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information Card */}
        <Card title="Business & Contact Information">
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Business / Trade Name</span>
              <span className="font-bold text-slate-900 text-right">{vendor.companyName || vendor.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Authorized Contact</span>
              <span className="font-bold text-slate-900 text-right">{vendor.contactPerson || vendor.ownerName || vendor.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Email Address</span>
              <a href={`mailto:${vendor.email}`} className="font-bold text-blue-600 hover:underline text-right truncate">
                {vendor.email}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Phone Number</span>
              <a href={`tel:${vendor.phone}`} className="font-bold text-slate-900 hover:text-blue-600 text-right">
                {vendor.phone || "—"}
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Operating Hub / City</span>
              <span className="font-semibold text-slate-800 text-right">{vendor.city || vendor.address || "Primary Hub"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5">
              <span className="text-slate-500 font-medium">Application Date</span>
              <span className="font-mono text-slate-700 text-right">{vendor.joinedDate || "Recently"}</span>
            </div>
          </div>
        </Card>

        {/* Banking & Tax Identity Card */}
        <Card title="Tax & Settlement Details">
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">GSTIN Number</span>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 block">{vendor.gstNumber || "Pending Submission"}</span>
                <span className={`text-[10px] font-semibold ${vendor.gstStatus === "Verified Active" ? "text-emerald-600" : "text-amber-600"}`}>
                  {vendor.gstStatus || "Pending Verification"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">PAN Card Number</span>
              <span className="font-mono font-bold text-slate-900 text-right">{vendor.panNumber || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Settlement Bank</span>
              <span className="font-semibold text-slate-900 text-right">{vendor.bankName || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Account Number</span>
              <span className="font-mono font-semibold text-slate-800 text-right">{vendor.accountNumber || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-1.5">
              <span className="text-slate-500 font-medium">IFSC / Branch</span>
              <span className="font-mono text-slate-700 text-right">
                {vendor.ifsc || "—"} {vendor.branch ? `(${vendor.branch})` : ""}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* COMPLIANCE DOCUMENTS & PROOFS */}
      <Card title="Vendor Compliance Documents & Verification Proofs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Business Registration Proof", sub: "MSME, Trade License or Inc.", url: vendor.businessProofDocumentUrl },
            { label: "GST Certificate", sub: "Form GST REG-06", url: vendor.gstDocumentUrl },
            { label: "PAN Card Document", sub: "Entity / Proprietor PAN", url: vendor.panDocumentUrl },
            { label: "Bank Account Proof", sub: "Cancelled Cheque or Statement", url: vendor.bankProofDocumentUrl },
            { label: "Authorized ID Proof", sub: "Aadhaar, Voter ID or Passport", url: vendor.idProofDocumentUrl },
            { label: "Operating Address Proof", sub: "Electricity / Rent Agreement", url: vendor.addressProofDocumentUrl },
          ].map((doc, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-slate-900">{doc.label}</span>
                  {doc.url ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Not Submitted
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.sub}</p>
              </div>

              {doc.url ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer border border-blue-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Proof Document</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </a>
              ) : (
                <span className="text-[11px] text-slate-400 italic">No document file attached</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* REGISTERED VEHICLES ROSTER */}
      <Card 
        title={`Registered Fleet Vehicles (${vendor.vehicles?.length || 0})`}
        subtitle="Review inspection photos and registration certificates"
      >
        {vendor.vehicles && vendor.vehicles.length > 0 ? (
          <div className="space-y-4">
            {vendor.vehicles.map((v) => {
              const photos = getVehiclePhotos(v);
              return (
                <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <NumberPlate registrationNumber={v.vehicleNumber || v.registrationNumber} />
                          <h4 className="font-extrabold text-sm text-slate-900">{v.model}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {v.vehicleType || v.category || "Commercial Cab"} • {v.seatingCapacity || 5} Seater • {v.fuelType || "Diesel"} • {v.transmission || "Manual"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        ₹{v.dailyRate || 3500}/day
                      </span>
                      <Badge variant={v.status === "AVAILABLE" ? "success" : "warning"} size="sm">
                        {v.status || "AVAILABLE"}
                      </Badge>
                    </div>
                  </div>

                  {/* Vehicle Photos Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                        Vehicle Inspection Photos ({photos.length} angle photos)
                      </span>
                      <span className="text-[10px] text-slate-400">Click photo to zoom</span>
                    </div>

                    {photos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                        {photos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewPhoto(photoUrl)}
                            className="group relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer hover:border-blue-500 transition-all"
                          >
                            <img
                              src={photoUrl}
                              alt={`Vehicle angle ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                            <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1 py-0.2 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No photos uploaded for this vehicle.</p>
                    )}
                  </div>

                  {/* Vehicle Compliance Proofs */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-bold text-slate-600 text-[11px]">Vehicle Compliance Documents:</span>
                    {v.rcDocumentUrl && (
                      <a href={v.rcDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                        <FileText className="w-3.5 h-3.5" /> RC Proof <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {v.insuranceDocumentUrl && (
                      <a href={v.insuranceDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Insurance <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {v.fitnessDocumentUrl && (
                      <a href={v.fitnessDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fitness <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {v.permitDocumentUrl && (
                      <a href={v.permitDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">
                        <FileText className="w-3.5 h-3.5" /> Permit <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {!v.rcDocumentUrl && !v.insuranceDocumentUrl && !v.fitnessDocumentUrl && !v.permitDocumentUrl && (
                      <span className="text-slate-400 italic text-[11px]">No documents attached</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No vehicles registered yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">The vendor has not enrolled any fleet vehicles into their profile.</p>
          </div>
        )}
      </Card>

      {/* REGISTERED CHAUFFEURS ROSTER */}
      <Card 
        title={`Associated Chauffeurs (${vendor.drivers?.length || 0})`}
        subtitle="Driver licenses and commercial certifications"
      >
        {vendor.drivers && vendor.drivers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.drivers.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between text-xs shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs">
                      {d.name?.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{d.name}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{d.phone}</p>
                    </div>
                  </div>
                  <div className="pt-1.5 space-y-0.5 text-slate-600 text-[11px]">
                    <p>License: <strong className="font-mono text-slate-900">{d.licenseNumber || "—"}</strong></p>
                    <p>Experience: <strong className="text-slate-900">{d.experienceYears || "—"} Years</strong></p>
                    {d.licenseDocumentUrl && (
                      <a href={d.licenseDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold mt-1">
                        <FileText className="w-3 h-3" /> View License Document <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                <Badge variant={d.status === "AVAILABLE" ? "success" : "warning"} size="sm">
                  {d.status || "AVAILABLE"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No chauffeurs enrolled yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">The vendor has not enrolled any dedicated chauffeurs into their fleet.</p>
          </div>
        )}
      </Card>

      {/* APPROVE VENDOR MODAL */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Authorize & Approve Vendor"
        subtitle={`Enable customer bookings for ${vendor.name}`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setApproveModalOpen(false)}
              disabled={approving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              isLoading={approving}
              onClick={handleApprove}
            >
              Confirm & Activate Partner
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <strong className="text-blue-950 font-bold">Account Verification Summary</strong>
            </div>
            <p className="text-blue-900 leading-relaxed text-[11px]">
              Authorizing this vendor partner will grant them full access to receive customer trip allocations and dispatch booking requests across GrabRentals.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-800">
              Platform Take-Rate / Commission Rate (%)
            </label>
            <Input
              type="number"
              min={1}
              max={50}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="12"
            />
            <p className="text-[11px] text-slate-500">
              Default platform commission is 12%. This can be adjusted at any time.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-700">
            <p><strong>Vendor:</strong> {vendor.name} ({vendor.email})</p>
            <p><strong>Vehicles Registered:</strong> {vendor.vehicles?.length || 0}</p>
            <p><strong>Chauffeurs Registered:</strong> {vendor.drivers?.length || 0}</p>
          </div>
        </div>
      </Modal>

      {/* FULL PHOTO LIGHTBOX MODAL */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Vehicle Inspection Proof"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
