"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { Toast } from "@/components/ui/Toast";
import { Sliders, Save, Shield } from "lucide-react";

const SETTING_TABS = [
  { id: "general", label: "General & Branding" },
  { id: "booking", label: "Booking & Dispatch SLA" },
  { id: "tax", label: "GST & Invoicing" },
  { id: "security", label: "Security & Sessions" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);

  function handleSave(e) {
    e.preventDefault();
    setToast({ type: "success", message: "Platform configuration updated successfully" });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Platform Configuration Settings"
        subtitle="Global system settings, booking SLA windows, GST tax rules, and session controls"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Settings" }]}
      />

      <Card noPadding>
        <div className="p-4 border-b border-slate-100">
          <Tabs tabs={SETTING_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {activeTab === "general" && (
            <div className="space-y-4">
              <Input label="Platform Brand Name" defaultValue="Grab Rentals India" />
              <Input label="Support Email" defaultValue="support@grabrentals.com" />
              <Input label="Operations Control Room Phone" defaultValue="+91 98409 91199" />
              <Select
                label="Base Operating Currency"
                defaultValue="INR"
                options={[{ value: "INR", label: "INR (Indian Rupee - ₹)" }]}
              />
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-4">
              <Input
                label="Minimum Advance Booking Window (Hours)"
                type="number"
                defaultValue="3"
                helperText="Customers cannot book trips starting sooner than this threshold."
              />
              <Input
                label="Driver Allocation SLA Deadline (Hours before trip)"
                type="number"
                defaultValue="2"
                helperText="Alerts Operations dispatcher if vehicle is not assigned by this deadline."
              />
              <Input
                label="Default Cancellation Window with Zero Penalty (Hours)"
                type="number"
                defaultValue="12"
              />
            </div>
          )}

          {activeTab === "tax" && (
            <div className="space-y-4">
              <Input label="Registered Entity Legal Name" defaultValue="Grab Rentals Private Limited" />
              <Input label="Corporate GSTIN" defaultValue="33AAACG9912K1Z5" />
              <Input
                label="GST on Commercial Passenger Transport (%)"
                type="number"
                defaultValue="5"
                helperText="Standard Indian GST on chauffeur-driven passenger transport is 5% (without ITC)."
              />
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <Input
                label="Session Inactivity Timeout (Minutes)"
                type="number"
                defaultValue="60"
              />
              <Input
                label="Maximum Login Attempts Before Lockout"
                type="number"
                defaultValue="5"
              />
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>JWT tokens signed with RS256 algorithm and rotating keys.</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
