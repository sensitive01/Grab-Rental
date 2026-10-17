"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import axiosClient from "@/lib/axiosClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { formatINR } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/Table";
import {
  UserCheck,
  PlusCircle,
  Search,
  Trash2,
  Edit3,
  Sun,
  Moon,
  Clock,
  Car,
  MapPin,
  RefreshCw,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  Sparkles,
} from "lucide-react";
import { STATES_AND_CITIES, ALL_INDIAN_STATES } from "@/lib/locations";

export default function DriverAllowancePage() {
  const [allowances, setAllowances] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRule, setDeletingRule] = useState(null);

  // Form State
  const [formModelName, setFormModelName] = useState("ALL");
  const [formState, setFormState] = useState("All States");
  const [formCity, setFormCity] = useState("All Cities");
  const [customCity, setCustomCity] = useState("");
  const [formShift, setFormShift] = useState("ALL"); // "ALL" | "DAY" | "NIGHT"
  const [formAllowanceType, setFormAllowanceType] = useState("FLAT"); // "FLAT" | "PERCENTAGE"
  const [formAllowanceValue, setFormAllowanceValue] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActive, setFormActive] = useState(true);

  // Fetch initial data
  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [allowanceRes, modelsRes] = await Promise.all([
        adminApi.getDriverAllowances(),
        axiosClient.get("/api/admin/models").catch(() => ({ data: { data: [] } }))
      ]);

      if (allowanceRes?.success && Array.isArray(allowanceRes.data)) {
        setAllowances(allowanceRes.data);
      }

      if (modelsRes?.data?.data && Array.isArray(modelsRes.data.data)) {
        setVehicleModels(modelsRes.data.data);
      }
    } catch (err) {
      console.error("Error loading driver allowances:", err);
      setToast({ type: "error", message: "Failed to load driver allowance rules" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Allowances
  const filteredAllowances = useMemo(() => {
    return allowances.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        item.modelName?.toLowerCase().includes(query) ||
        item.city?.toLowerCase().includes(query) ||
        item.state?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query);

      const matchShift =
        shiftFilter === "ALL" ||
        item.shiftType?.toUpperCase() === shiftFilter;

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.active) ||
        (statusFilter === "INACTIVE" && !item.active);

      return matchSearch && matchShift && matchStatus;
    });
  }, [allowances, searchQuery, shiftFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = allowances.length;
    const active = allowances.filter((a) => a.active).length;
    const flat = allowances.filter((a) => a.allowanceType === "FLAT").length;
    const pct = allowances.filter((a) => a.allowanceType === "PERCENTAGE").length;
    return { total, active, flat, pct };
  }, [allowances]);

  // Available cities computed based on selected state
  const availableCities = useMemo(() => {
    if (formState && formState !== "All States" && STATES_AND_CITIES[formState]) {
      return ["All Cities", ...STATES_AND_CITIES[formState]];
    }
    // If "All States", gather all unique cities sorted
    const allCitiesSet = new Set();
    Object.values(STATES_AND_CITIES).forEach((list) => {
      if (Array.isArray(list)) list.forEach((c) => allCitiesSet.add(c));
    });
    return ["All Cities", ...Array.from(allCitiesSet).sort()];
  }, [formState]);

  const handleStateChange = (newState) => {
    setFormState(newState);
    if (newState !== "All States" && STATES_AND_CITIES[newState]) {
      if (formCity !== "All Cities" && formCity !== "CUSTOM" && !STATES_AND_CITIES[newState].includes(formCity)) {
        setFormCity("All Cities");
      }
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormModelName("ALL");
    setFormState("All States");
    setFormCity("All Cities");
    setCustomCity("");
    setFormShift("ALL");
    setFormAllowanceType("FLAT");
    setFormAllowanceValue("500");
    setFormDescription("");
    setFormActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormModelName(rule.modelName || "ALL");
    const matchedState = rule.state || "All States";
    setFormState(matchedState);

    const stateCities = (matchedState !== "All States" && STATES_AND_CITIES[matchedState]) 
      ? STATES_AND_CITIES[matchedState] 
      : [];
    const isStandardCity = stateCities.includes(rule.city) || (!rule.city || rule.city.toUpperCase() === "ALL");
    
    if (!rule.city || rule.city.toUpperCase() === "ALL") {
      setFormCity("All Cities");
      setCustomCity("");
    } else if (isStandardCity) {
      setFormCity(rule.city);
      setCustomCity("");
    } else {
      setFormCity("CUSTOM");
      setCustomCity(rule.city || "");
    }

    setFormShift(rule.shiftType || "ALL");
    setFormAllowanceType(rule.allowanceType || "FLAT");
    setFormAllowanceValue(String(rule.allowanceValue || 0));
    setFormDescription(rule.description || "");
    setFormActive(rule.active !== false);
    setIsModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalCity = formCity === "CUSTOM" 
        ? (customCity.trim() || "ALL") 
        : (formCity === "All Cities" ? "ALL" : formCity);

      const finalState = formState === "All States" ? "ALL" : formState;
      const parsedVal = Math.max(0, parseFloat(formAllowanceValue) || 0);

      const payload = {
        modelName: formModelName.trim() || "ALL",
        state: finalState,
        city: finalCity,
        shiftType: formShift,
        allowanceType: formAllowanceType,
        allowanceValue: parsedVal,
        description: formDescription.trim(),
        active: formActive
      };

      if (editingRule?.id) {
        const res = await adminApi.updateDriverAllowance(editingRule.id, payload);
        if (res.success) {
          setToast({ type: "success", message: "Driver allowance rule updated successfully!" });
        }
      } else {
        const res = await adminApi.createDriverAllowance(payload);
        if (res.success) {
          setToast({ type: "success", message: "Driver allowance rule created successfully!" });
        }
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Error saving rule:", err);
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save driver allowance rule" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (rule) => {
    try {
      await adminApi.toggleDriverAllowanceStatus(rule.id);
      setAllowances((prev) =>
        prev.map((a) => (a.id === rule.id ? { ...a, active: !a.active } : a))
      );
      setToast({
        type: "success",
        message: `Rule ${rule.active ? "disabled" : "activated"} successfully!`
      });
    } catch (err) {
      console.error("Failed to toggle rule status:", err);
      setToast({ type: "error", message: "Failed to update rule status" });
    }
  };

  // Delete Rule
  const handleDeleteConfirm = async () => {
    if (!deletingRule?.id) return;
    try {
      await adminApi.deleteDriverAllowance(deletingRule.id);
      setToast({ type: "success", message: "Driver allowance rule deleted successfully" });
      setAllowances((prev) => prev.filter((a) => a.id !== deletingRule.id));
      setIsDeleteOpen(false);
      setDeletingRule(null);
    } catch (err) {
      console.error("Failed to delete rule:", err);
      setToast({ type: "error", message: "Failed to delete driver allowance rule" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Driver Allowance Management"
        subtitle="Configure dynamic day and night driver allowances per vehicle model, state, and city (Flat amount ₹ or % Rate)."
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Driver Allowance" }
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              loading={refreshing}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="rounded-xl bg-[#0082fe] hover:bg-[#006ed6] text-white font-bold cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Driver Allowance
            </Button>
          </div>
        }
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Rules</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all locations & models</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Rules</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</p>
          <p className="text-[10px] text-emerald-600/80 mt-0.5">Currently applied to quotes</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">₹ Flat Rate Rules</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.flat}</p>
          <p className="text-[10px] text-blue-600/80 mt-0.5">Fixed allowance amount per trip</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">% Rate Rules</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.pct}</p>
          <p className="text-[10px] text-purple-600/80 mt-0.5">% calculated on base fare</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by car model, city, state, or notes..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0082fe] transition"
            />
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shift:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
              {[
                { id: "ALL", label: "All Shifts" },
                { id: "DAY", label: "☀️ Day" },
                { id: "NIGHT", label: "🌙 Night" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShiftFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                    shiftFilter === s.id
                      ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold ml-1">
              {[
                { id: "ALL", label: "All Status" },
                { id: "ACTIVE", label: "Active" },
                { id: "INACTIVE", label: "Inactive" }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                    statusFilter === st.id
                      ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Rules Table */}
      <Card className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs bg-white">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <LoadingAnimation />
            <p className="text-xs text-slate-400 font-bold mt-2">Loading driver allowance rules...</p>
          </div>
        ) : filteredAllowances.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No driver allowance rules found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchQuery || shiftFilter !== "ALL" || statusFilter !== "ALL"
                  ? "No rules match your active filters. Try resetting search or filter criteria."
                  : "No custom driver allowance rules configured yet. Click the button below to add your first rule."}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="rounded-xl bg-[#0082fe] hover:bg-[#006ed6] text-white font-bold cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Driver Allowance
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-xs font-black uppercase text-slate-600">Car Model</TableHead>
                  <TableHead className="text-xs font-black uppercase text-slate-600">Location (State & City)</TableHead>
                  <TableHead className="text-xs font-black uppercase text-slate-600">Applicable Shift</TableHead>
                  <TableHead className="text-xs font-black uppercase text-slate-600">Allowance</TableHead>
                  <TableHead className="text-xs font-black uppercase text-slate-600">Notes / Scope</TableHead>
                  <TableHead className="text-xs font-black uppercase text-slate-600 text-center">Status</TableHead>
                  <TableHead className="text-xs font-black uppercase text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredAllowances.map((rule) => {
                  const isAllModel = !rule.modelName || rule.modelName.toUpperCase() === "ALL";
                  const isAllCity = !rule.city || rule.city.toUpperCase() === "ALL";
                  const isAllState = !rule.state || rule.state.toUpperCase() === "ALL";

                  return (
                    <TableRow key={rule.id} className="hover:bg-slate-50/60 transition">
                      {/* Car Model */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAllModel ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                          }`}>
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-900">
                              {isAllModel ? "All Car Models" : rule.modelName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {isAllModel ? "Applies to any fleet model" : "Specific Model Rule"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">
                              {isAllCity ? "All Cities" : rule.city}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              {isAllState ? "All States" : rule.state}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Shift */}
                      <TableCell className="py-3.5">
                        {rule.shiftType === "DAY" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <Sun className="w-3 h-3 text-amber-600" />
                            Day (06:00 – 22:00)
                          </span>
                        ) : rule.shiftType === "NIGHT" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80">
                            <Moon className="w-3 h-3 text-indigo-600" />
                            Night (22:00 – 06:00)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                            <Clock className="w-3 h-3 text-slate-500" />
                            All Day (24 Hours)
                          </span>
                        )}
                      </TableCell>

                      {/* Allowance */}
                      <TableCell className="py-3.5">
                        {rule.allowanceType === "FLAT" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-900 border border-blue-200">
                            <span>₹{Number(rule.allowanceValue).toLocaleString()}</span>
                            <span className="text-[10px] font-normal text-blue-600 uppercase">Flat</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-purple-50 text-purple-900 border border-purple-200">
                            <span>{rule.allowanceValue}%</span>
                            <span className="text-[10px] font-normal text-purple-600 uppercase">of Base</span>
                          </span>
                        )}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="py-3.5 text-xs text-slate-500 max-w-[200px] truncate">
                        {rule.description || "—"}
                      </TableCell>

                      {/* Status Toggle */}
                      <TableCell className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(rule)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                            rule.active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${rule.active ? "bg-emerald-600" : "bg-slate-400"}`} />
                          {rule.active ? "Active" : "Inactive"}
                        </button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rule)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit Rule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingRule(rule);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ===================== ADD / EDIT MODAL ===================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? "Edit Driver Allowance Rule" : "Add Driver Allowance Rule"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
          {/* Car Model Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Car Model *
            </label>
            <select
              value={formModelName}
              onChange={(e) => setFormModelName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#0082fe] focus:bg-white transition cursor-pointer"
              required
            >
              <option value="ALL">⭐ All Car Models (Global / Fallback)</option>
              {vehicleModels.map((m) => (
                <option key={m.id || m.modelName} value={m.modelName}>
                  🚗 {m.modelName} {m.category ? `(${m.category})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Choose a specific vehicle model (e.g. Maruti WagonR) or apply to all models.
            </p>
          </div>

          {/* State & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State *
              </label>
              <select
                value={formState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#0082fe] focus:bg-white transition cursor-pointer"
              >
                <option value="All States">⭐ All States (National)</option>
                {ALL_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City *
              </label>
              <select
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#0082fe] focus:bg-white transition cursor-pointer"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c === "All Cities" 
                      ? (formState && formState !== "All States" ? `⭐ All Cities in ${formState}` : "⭐ All Cities (Across India)")
                      : c}
                  </option>
                ))}
                <option value="CUSTOM">✍️ Enter Custom City...</option>
              </select>
            </div>
          </div>

          {/* Custom City input if chosen */}
          {formCity === "CUSTOM" && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Custom City Name *
              </label>
              <input
                type="text"
                required
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="e.g. Tiruppur, Erode, Vellore, Thanjavur"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#0082fe] transition shadow-2xs"
              />
            </div>
          )}

          {/* Shift Selection (Day / Night / All) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Applicable Shift (Day / Night) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ALL", label: "🕒 All Shifts", desc: "24 Hours (Day & Night)" },
                { id: "DAY", label: "☀️ Day Shift", desc: "06:00 AM – 10:00 PM" },
                { id: "NIGHT", label: "🌙 Night Shift", desc: "10:00 PM – 06:00 AM" }
              ].map((shift) => (
                <button
                  type="button"
                  key={shift.id}
                  onClick={() => setFormShift(shift.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    formShift === shift.id
                      ? "border-[#0082fe] bg-blue-50/70 text-blue-900 font-extrabold"
                      : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs">{shift.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{shift.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Allowance Calculation Type & Value */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Allowance Calculation Type *
              </label>
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFormAllowanceType("FLAT")}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    formAllowanceType === "FLAT"
                      ? "bg-white text-blue-700 shadow-2xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ₹ Flat Amount
                </button>
                <button
                  type="button"
                  onClick={() => setFormAllowanceType("PERCENTAGE")}
                  className={`px-3 py-1 rounded-md transition cursor-pointer ${
                    formAllowanceType === "PERCENTAGE"
                      ? "bg-white text-purple-700 shadow-2xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  % Rate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {formAllowanceType === "FLAT" ? "Fixed Allowance Amount (₹) *" : "Allowance Rate (%) *"}
              </label>
              <input
                type="number"
                step={formAllowanceType === "FLAT" ? "1" : "0.01"}
                min="0"
                max={formAllowanceType === "FLAT" ? "10000" : "100"}
                required
                value={formAllowanceValue}
                onChange={(e) => setFormAllowanceValue(e.target.value)}
                placeholder={formAllowanceType === "FLAT" ? "e.g. 500" : "e.g. 10.00"}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:border-[#0082fe] transition shadow-2xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {formAllowanceType === "FLAT"
                  ? `Active: Fixed allowance of ₹${formAllowanceValue || 0} will be applied.`
                  : `Active: ${formAllowanceValue || 0}% allowance calculated dynamically on the ride base fare.`}
              </p>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Notes / Scope Description (Optional)
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Madurai Outstation Chauffeur Batta"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:border-[#0082fe] focus:bg-white transition"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-bold text-slate-800 text-xs">Rule Status</p>
              <p className="text-[11px] text-slate-400">Activate this rule immediately for customer bookings</p>
            </div>
            <button
              type="button"
              onClick={() => setFormActive(!formActive)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                formActive ? "bg-[#0082fe]" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  formActive ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              className="rounded-xl bg-[#0082fe] hover:bg-[#006ed6] text-white font-bold cursor-pointer"
            >
              {editingRule ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingRule(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver Allowance Rule"
        message={`Are you sure you want to permanently delete the driver allowance rule for ${
          deletingRule?.modelName || "this model"
        } in ${deletingRule?.city || "all cities"}? This action cannot be undone.`}
        confirmText="Yes, Delete Rule"
        variant="danger"
      />
    </div>
  );
}
