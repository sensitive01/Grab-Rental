"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { ShieldCheck, Plus, User, Phone, Mail } from "lucide-react";

export default function AdminOperationsUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Trip Allocations Specialist",
    city: "Chennai Hub",
    shiftsAssigned: "Morning Shift (06:00 - 14:30)",
  });
  const [toast, setToast] = useState(null);

  async function loadUsers() {
    try {
      const res = await adminApi.getOperationsUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    try {
      await adminApi.createOperationsUser(formData);
      setToast({ type: "success", message: `Operations staff account created for ${formData.name}` });
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Trip Allocations Specialist",
        city: "Chennai Hub",
        shiftsAssigned: "Morning Shift (06:00 - 14:30)",
      });
      loadUsers();
    } catch {
      setToast({ type: "error", message: "Failed to create user" });
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
        title="Operations Staff Directory"
        subtitle="Manage dispatch officers, trip allocation specialists, and shift permissions"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Operations Staff" }]}
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Operations User
          </Button>
        }
      />

      <Card noPadding>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role Title</TableHead>
              <TableHead>Hub / Location</TableHead>
              <TableHead>Assigned Duty Shift</TableHead>
              <TableHead>Last Sign-In</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Loading operations users...
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-800">{u.role}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{u.city}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 font-medium">{u.shiftsAssigned}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-mono">{u.lastLogin}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">{u.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Operations Dispatch User"
        subtitle="Provision portal access credentials for operations dispatcher"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Ramesh V."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Corporate Work Email"
            type="email"
            required
            placeholder="e.g. ramesh.ops@grabrentals.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Mobile Phone"
            placeholder="+91 98400 12345"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Role & Assignment"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: "Senior Operations Dispatcher", label: "Senior Operations Dispatcher" },
              { value: "Trip Allocations Specialist", label: "Trip Allocations Specialist" },
              { value: "Night Fleet Coordinator", label: "Night Fleet Coordinator" },
            ]}
          />
          <Select
            label="Primary Hub"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            options={[
              { value: "Chennai Hub", label: "Chennai Hub" },
              { value: "Bangalore Hub", label: "Bangalore Hub" },
              { value: "Coimbatore Hub", label: "Coimbatore Hub" },
              { value: "Kochi Hub", label: "Kochi Hub" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
