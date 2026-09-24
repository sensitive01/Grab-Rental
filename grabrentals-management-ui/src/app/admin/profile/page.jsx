"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { getCurrentUser } from "@/lib/auth";
import { Shield, User, Mail, Save } from "lucide-react";

export default function AdminProfilePage() {
  const user = getCurrentUser() || {
    name: "System Administrator",
    email: "admin@grabrentals.com",
    role: "ADMIN",
  };

  const [toast, setToast] = useState(null);

  function handleSave(e) {
    e.preventDefault();
    setToast({ type: "success", message: "Admin profile saved" });
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
        title="Admin Profile Settings"
        subtitle="Manage master system administrator credentials and security profile"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Profile" }]}
      />

      <Card>
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            SA
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-300">
              Super Administrator
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Admin Name" value={user.name} disabled />
            <Input label="System Email" value={user.email} disabled />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>2-Factor Authentication (2FA) enforced on administrator accounts.</span>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
