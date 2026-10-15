"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableHeader,
  Pagination,
  SearchInput,
} from "@/components/ui/Table";
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Percent,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minRideAmount: "",
    usageLimit: "",
    validUntil: "",
    active: true,
  });

  const loadCoupons = async () => {
    try {
      const res = await adminApi.getAllCoupons();
      if (res?.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
      setToast({ type: "error", message: "Failed to load coupons from backend." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchCoupons() {
      try {
        const res = await adminApi.getAllCoupons();
        if (isMounted) {
          if (res?.success && Array.isArray(res.data)) {
            setCoupons(res.data);
          } else {
            setCoupons([]);
          }
        }
      } catch (err) {
        console.error("Failed to load coupons:", err);
        if (isMounted) {
          setToast({ type: "error", message: "Failed to load coupons from backend." });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchCoupons();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "10",
      maxDiscountAmount: "250",
      minRideAmount: "1000",
      usageLimit: "500",
      validUntil: "",
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || "",
      title: c.title || "",
      description: c.description || "",
      discountType: c.discountType || "PERCENTAGE",
      discountValue: c.discountValue ? String(c.discountValue) : "",
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : "",
      minRideAmount: c.minRideAmount ? String(c.minRideAmount) : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      validUntil: c.validUntil ? c.validUntil.slice(0, 16) : "",
      active: c.active !== false,
    });
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      setToast({ type: "error", message: "Coupon code is required" });
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setToast({ type: "error", message: "Valid discount value is required" });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim() || null,
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        minRideAmount: formData.minRideAmount ? Number(formData.minRideAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        validUntil: formData.validUntil ? `${formData.validUntil}:00` : null,
        active: formData.active,
      };

      if (editingCoupon) {
        await adminApi.updateCoupon(editingCoupon.id, payload);
        setToast({ type: "success", message: `Coupon "${payload.code}" updated successfully.` });
      } else {
        await adminApi.createCoupon(payload);
        setToast({ type: "success", message: `Coupon "${payload.code}" created successfully.` });
      }
      setModalOpen(false);
      await loadCoupons();
    } catch (err) {
      console.error("Save coupon error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to save coupon code.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await adminApi.toggleCouponStatus(id);
      if (res?.success) {
        setToast({ type: "success", message: "Coupon status toggled." });
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle coupon status:", err);
      setToast({ type: "error", message: "Failed to update coupon status." });
    }
  };

  const handleDeleteCoupon = async () => {
    if (!deleteConfirm) return;
    try {
      await adminApi.deleteCoupon(deleteConfirm.id);
      setToast({ type: "success", message: `Coupon "${deleteConfirm.code}" deleted.` });
      setDeleteConfirm(null);
      await loadCoupons();
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      setToast({ type: "error", message: "Failed to delete coupon." });
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const filteredAndSortedCoupons = useMemo(() => {
    let result = [...coupons];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.code?.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [coupons, search, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedCoupons.length / pageSize) || 1;
  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedCoupons.slice(start, start + pageSize);
  }, [filteredAndSortedCoupons, currentPage, pageSize]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.active).length;
    const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    return { total, active, totalUsed };
  }, [coupons]);

  return (
    <div className="space-y-6 max-w-7xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title="Promotional Coupons & Offers"
          subtitle="Create, configure and manage promo codes with discounts, usage limits, and expiry dates"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Coupons & Offers" },
          ]}
        />
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2 shadow-sm shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Coupons</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.total}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Offers</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.active}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-white border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Redemptions</p>
            <h3 className="text-2xl font-black text-slate-900">{stats.totalUsed} rides</h3>
          </div>
        </Card>
      </div>

      {/* Table Section */}
      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setCurrentPage(1);
              }}
              placeholder="Search coupon code or title..."
            />
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {filteredAndSortedCoupons.length} coupon(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  label="Coupon Code"
                  sortKey="code"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <TableHead>Discount</TableHead>
                <TableHead>Min Ride</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    Loading promotional coupons from database...
                  </TableCell>
                </TableRow>
              ) : paginatedCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No coupons found. Click &quot;Create New Coupon&quot; to add your first promo offer.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCoupons.map((c) => (
                  <TableRow key={c.id}>
                    {/* Code & Title */}
                    <TableCell>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-black text-xs tracking-wider">
                          <Ticket className="w-3 h-3 text-amber-400" />
                          <span>{c.code}</span>
                        </div>
                        {c.title && (
                          <p className="text-xs font-bold text-slate-800 mt-1">{c.title}</p>
                        )}
                        {c.description && (
                          <p className="text-[11px] text-slate-400 font-medium">{c.description}</p>
                        )}
                      </div>
                    </TableCell>

                    {/* Discount */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                        {c.discountType === "PERCENTAGE" ? (
                          <>
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-black">
                              {c.discountValue}% OFF
                            </span>
                            {c.maxDiscountAmount && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                (Max ₹{Number(c.maxDiscountAmount).toLocaleString()})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-black">
                            ₹{Number(c.discountValue).toLocaleString()} FLAT OFF
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Min Ride */}
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">
                        {c.minRideAmount ? `₹${Number(c.minRideAmount).toLocaleString()}` : "None"}
                      </span>
                    </TableCell>

                    {/* Usage */}
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900">
                          {c.usedCount || 0}
                          {c.usageLimit ? ` / ${c.usageLimit}` : " (Unlimited)"}
                        </span>
                        {c.usageLimit && (
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((c.usedCount || 0) / c.usageLimit) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Validity */}
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-600">
                        {c.validUntil
                          ? new Date(c.validUntil).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No Expiry"}
                      </span>
                    </TableCell>

                    {/* Status Toggle */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold cursor-pointer transition ${
                          c.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {c.active ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                          </>
                        )}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(c)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredAndSortedCoupons.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Promotional Coupon"}
      >
        <form onSubmit={handleSaveCoupon} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="E.g. SUMMER20, FESTIVE"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 uppercase focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g. Summer Special Offer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description (Shown to Customers)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="E.g. Get 10% off up to ₹250 on outstation journeys"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
              >
                <option value="PERCENTAGE">Percentage (%) Discount</option>
                <option value="FLAT">Flat Amount (₹) Discount</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discount Value ({formData.discountType === "PERCENTAGE" ? "%" : "₹"}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
                placeholder={formData.discountType === "PERCENTAGE" ? "10" : "200"}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formData.discountType === "PERCENTAGE" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Discount Cap (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscountAmount: e.target.value })
                  }
                  placeholder="E.g. 250 (Optional cap)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Ride Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minRideAmount}
                onChange={(e) =>
                  setFormData({ ...formData, minRideAmount: e.target.value })
                }
                placeholder="E.g. 1000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Usage Limit (Total times)
              </label>
              <input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimit: e.target.value })
                }
                placeholder="E.g. 500 (Blank for unlimited)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Expiry Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                Active immediately (available for customers to redeem)
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {saving ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon Code"
        message={`Are you sure you want to permanently delete the coupon code "${deleteConfirm?.code}"? Customers will no longer be able to use it.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
