"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { getCurrentUser } from "@/lib/auth";
import { User, Phone, Mail, Shield, Clock } from "lucide-react";

export default function OperationsProfilePage() {
  const user = getCurrentUser() || {
    name: "Karthik Narayanan",
    email: "ops@grabrentals.com",
    role: "OPERATIONS",
  };

  const [phone, setPhone] = useState("+91 98400 99887");
  const [hub, setHub] = useState("Chennai Central Operations Hub");
  const [toast, setToast] = useState(null);

  function handleSave(e) {
    e.preventDefault();
    setToast({ type: "success", message: "Staff profile details updated successfully" });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Operations Staff Profile"
        subtitle="Manage your dispatcher profile, operational hub, and contact information"
        breadcrumbs={[
          { label: "Operations", href: "/operations/dashboard" },
          { label: "Profile" },
        ]}
      />

      <Card>
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            KN
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
              Senior Operations Dispatcher
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={user.name} disabled />
            <Input label="Email Address" value={user.email} disabled />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Assigned Operations Hub"
              value={hub}
              onChange={(e) => setHub(e.target.value)}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Shift: <strong>Morning Dispatch Shift (06:00 - 14:30 IST)</strong></span>
            </div>
            <span className="text-emerald-600 font-semibold">Active On Duty</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
