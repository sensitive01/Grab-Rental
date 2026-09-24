"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { KeyRound, Shield } from "lucide-react";

export default function AdminChangePasswordPage() {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [toast, setToast] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      setToast({ type: "warning", message: "Please fill in all password fields" });
      return;
    }
    if (newPass !== confirmPass) {
      setToast({ type: "error", message: "New passwords do not match" });
      return;
    }
    setToast({ type: "success", message: "Admin master password rotated successfully" });
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  }

  return (
    <div className="space-y-6 max-w-xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Rotate Master Admin Password"
        subtitle="Ensure highest security standards for root administrative access"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Change Password" },
        ]}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />
          <Input
            label="New Administrator Password"
            type="password"
            required
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            helperText="Requires at least 10 characters with numbers and special symbols."
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={KeyRound}>
              Rotate Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
