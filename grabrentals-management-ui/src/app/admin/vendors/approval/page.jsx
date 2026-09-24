"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { Building2, CheckCircle2, ShieldCheck, XCircle, ArrowLeft } from "lucide-react";

export default function VendorApprovalsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [commissionRate, setCommissionRate] = useState(12);
  const [toast, setToast] = useState(null);

  async function loadPending() {
    try {
      const res = await adminApi.getVendors();
      setVendors(res.data.filter((v) => v.status === "PENDING_APPROVAL"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleApprove() {
    if (!selectedVendor) return;
    try {
      await adminApi.approveVendor(selectedVendor.id, Number(commissionRate));
      setToast({
        type: "success",
        message: `Vendor ${selectedVendor.name} approved with ${commissionRate}% commission!`,
      });
      setSelectedVendor(null);
      loadPending();
    } catch {
      setToast({ type: "error", message: "Failed to approve vendor" });
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Vendor Partner Verification & Onboarding"
        subtitle="Review prospective fleet agencies, GST compliance, and set revenue share"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Vendors", href: "/admin/vendors" },
          { label: "Approvals" },
        ]}
        action={
          <Link href="/admin/vendors">
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              All Vendors
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="py-8 text-center text-slate-500">Loading pending applications...</div>
      ) : vendors.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">All Applications Processed</h3>
          <p className="text-xs text-slate-500 mt-1">There are no pending vendor onboarding reviews.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((v) => (
            <Card key={v.id} className="border-t-4 border-t-amber-500 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{v.name}</h4>
                  <p className="text-xs text-slate-500">{v.city} • Applied on {v.joinedDate}</p>
                </div>
                <Badge variant="warning">Verification Pending</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Contact Person</p>
                  <p className="font-bold text-slate-800">{v.contactPerson}</p>
                  <p className="text-[11px] text-slate-500">{v.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">GSTIN Registration</p>
                  <p className="font-mono font-bold text-slate-800">{v.gstNumber}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Verified Active</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Proposed Fleet Capacity: <strong>{v.fleetCount} Vehicles</strong></span>
                <span>Chauffeurs: <strong>{v.driverCount} Drivers</strong></span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="xs"
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() => {
                    setSelectedVendor(v);
                    setCommissionRate(v.commissionRate || 12);
                  }}
                >
                  Authorize & Set Commission
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Commission Setup Modal */}
      <Modal
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={`Approve ${selectedVendor?.name}`}
        subtitle="Establish commercial contract rate and activate platform booking dispatch"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <span className="font-bold">Verified Documents:</span> GSTIN {selectedVendor?.gstNumber} is valid. Fleet of {selectedVendor?.fleetCount} vehicles ready.
          </div>

          <Input
            label="Platform Commission Fee (%)"
            type="number"
            min="5"
            max="30"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            helperText="Standard platform commission is typically 10% - 15% on each completed booking."
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedVendor(null)}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" onClick={handleApprove}>
              Authorize Active Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
