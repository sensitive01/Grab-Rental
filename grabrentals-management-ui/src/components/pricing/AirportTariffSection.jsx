"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
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
  TableCell,
} from "@/components/ui/Table";
import {
  Plane,
  PlusCircle,
  Sparkles,
  Search,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Tag,
  SlidersHorizontal,
  Flame,
} from "lucide-react";

const CATEGORIES = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Innova",
  "Innovacrysta",
  "innovahycross",
  "Tempo",
  "urbania",
  "Bus",
  "Benz",
];

const SEATING_OPTIONS = [
  { value: "4", label: "4 Seater + Driver" },
  { value: "6", label: "6 Seater + Driver" },
  { value: "7", label: "7 Seater + Driver" },
  { value: "8", label: "8 Seater" },
  { value: "12", label: "12 Seater" },
  { value: "18", label: "18 Seater" },
  { value: "26", label: "26 Seater" },
];

const AIRPORTS = [
  "Kempegowda International Airport (BLR), Bengaluru",
  "Chennai International Airport (MAA), Chennai",
  "Coimbatore International Airport (CJB), Coimbatore",
  "Madurai Airport (IXM), Madurai",
  "Tiruchirappalli International Airport (TRZ), Trichy",
  "Salem Airport (SXV), Salem",
  "Tuticorin Airport (TCR), Thoothukudi",
  "Cochin International Airport (COK), Kochi",
  "Calicut International Airport (CCJ), Kozhikode",
  "Trivandrum International Airport (TRV), Thiruvananthapuram",
  "Rajiv Gandhi International Airport (HYD), Hyderabad",
  "Mangalore International Airport (IXE), Mangaluru",
  "Goa International Airport (GOI / GOX), Goa",
  "Chhatrapati Shivaji Maharaj Airport (BOM), Mumbai",
  "Indira Gandhi International Airport (DEL), New Delhi",
  "ALL",
];

const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function AirportTariffSection({ onUpdateCount, onEditItem }) {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("ALL"); // ALL, CITY_TO_AIRPORT, AIRPORT_TO_CITY, BOTH
  const [pricingTypeFilter, setPricingTypeFilter] = useState("ALL"); // ALL, REGULAR, SEASONAL
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const initialForm = {
    tripDirection: "BOTH", // CITY_TO_AIRPORT, AIRPORT_TO_CITY, BOTH
    pricingType: "REGULAR", // REGULAR, SEASONAL
    title: "",
    state: "Tamil Nadu",
    city: "Chennai",
    airportName: "Chennai International Airport (MAA), Chennai",
    minKm: 0,
    maxKm: 35,
    category: "Sedan",
    modelName: "ALL",
    seatingCapacity: "4",
    fuelType: "ALL",
    customerFare: "",
    vendorFare: "",
    extraKmRate: "14",
    vendorExtraKmRate: "11",
    daysOfWeek: "ALL", // ALL or comma-separated
    timeSlotType: "ALL_DAY", // ALL_DAY, DAY, NIGHT, CUSTOM
    timeRangeStart: "",
    timeRangeEnd: "",
    expiryType: "NEVER", // NEVER, FIXED_DAYS
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    tollIncluded: false,
    discountPercentage: "0",
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchTariffs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAirportTariffs();
      setTariffs(Array.isArray(data) ? data : []);
      if (onUpdateCount) onUpdateCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error("Failed to load airport tariffs:", err);
      showToast("Failed to load airport tariffs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      tripDirection: item.tripDirection || "BOTH",
      pricingType: item.pricingType || "REGULAR",
      title: item.title || "",
      state: item.state || "Tamil Nadu",
      city: item.city || "Chennai",
      airportName: item.airportName || "ALL",
      minKm: item.minKm ?? 0,
      maxKm: item.maxKm ?? 35,
      category: item.category || "Sedan",
      modelName: item.modelName || "ALL",
      seatingCapacity: item.seatingCapacity || "4",
      fuelType: item.fuelType || "ALL",
      customerFare: item.customerFare != null ? String(item.customerFare) : "",
      vendorFare: item.vendorFare != null ? String(item.vendorFare) : "",
      extraKmRate: item.extraKmRate != null ? String(item.extraKmRate) : "0",
      vendorExtraKmRate: item.vendorExtraKmRate != null ? String(item.vendorExtraKmRate) : "0",
      daysOfWeek: item.daysOfWeek || "ALL",
      timeSlotType: item.timeSlotType || "ALL_DAY",
      timeRangeStart: item.timeRangeStart || "",
      timeRangeEnd: item.timeRangeEnd || "",
      expiryType: item.expiryType || "NEVER",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      status: item.status || "ACTIVE",
      tollIncluded: Boolean(item.tollIncluded),
      discountPercentage: item.discountPercentage != null ? String(item.discountPercentage) : "0",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.customerFare || parseFloat(formData.customerFare) <= 0) {
      showToast("Please enter a valid Customer Fare", "error");
      return;
    }
    if (formData.maxKm == null || parseInt(formData.maxKm, 10) <= 0) {
      showToast("Please enter a valid Maximum KM", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        tripDirection: formData.tripDirection,
        pricingType: formData.pricingType,
        title: formData.title || `${formData.city} ${formData.category} (${formData.minKm}-${formData.maxKm} km)`,
        state: formData.state,
        city: formData.city,
        airportName: formData.airportName,
        minKm: parseInt(formData.minKm || 0, 10),
        maxKm: parseInt(formData.maxKm, 10),
        category: formData.category,
        modelName: formData.modelName || "ALL",
        seatingCapacity: formData.seatingCapacity || "4",
        fuelType: formData.fuelType || "ALL",
        customerFare: parseFloat(formData.customerFare),
        vendorFare: formData.vendorFare ? parseFloat(formData.vendorFare) : parseFloat(formData.customerFare) * 0.75,
        extraKmRate: parseFloat(formData.extraKmRate || 0),
        vendorExtraKmRate: parseFloat(formData.vendorExtraKmRate || 0),
        daysOfWeek: formData.daysOfWeek || "ALL",
        timeSlotType: formData.timeSlotType || "ALL_DAY",
        timeRangeStart: formData.timeRangeStart || null,
        timeRangeEnd: formData.timeRangeEnd || null,
        expiryType: formData.expiryType || "NEVER",
        startDate: formData.expiryType === "FIXED_DAYS" && formData.startDate ? formData.startDate : null,
        endDate: formData.expiryType === "FIXED_DAYS" && formData.endDate ? formData.endDate : null,
        status: formData.status || "ACTIVE",
        tollIncluded: Boolean(formData.tollIncluded),
        discountPercentage: parseFloat(formData.discountPercentage || 0),
      };

      await adminApi.saveAirportTariff(payload);
      showToast(editingItem ? "Airport charge rule updated" : "New Airport charge rule added", "success");
      setIsModalOpen(false);
      fetchTariffs();
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.response?.data?.message || err.message || "Failed to save airport tariff", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await adminApi.deleteAirportTariff(itemToDelete.id);
      showToast("Airport charge rule deleted", "success");
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchTariffs();
    } catch (err) {
      showToast("Failed to delete airport tariff", "error");
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await adminApi.toggleAirportTariffStatus(item.id, nextStatus);
      showToast(`Rule marked as ${nextStatus}`, "success");
      fetchTariffs();
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };


  const filteredTariffs = useMemo(() => {
    return tariffs.filter((t) => {
      // Direction
      if (directionFilter !== "ALL" && t.tripDirection !== directionFilter && t.tripDirection !== "BOTH") {
        return false;
      }
      // Pricing Type
      if (pricingTypeFilter !== "ALL" && (t.pricingType || "REGULAR").toUpperCase() !== pricingTypeFilter) {
        return false;
      }
      // Category
      if (categoryFilter !== "ALL" && (t.category || "").toUpperCase() !== categoryFilter.toUpperCase()) {
        return false;
      }
      // Status
      if (statusFilter !== "ALL" && (t.status || "ACTIVE").toUpperCase() !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCity = (t.city || "").toLowerCase().includes(q);
        const matchesAirport = (t.airportName || "").toLowerCase().includes(q);
        const matchesCategory = (t.category || "").toLowerCase().includes(q);
        const matchesTitle = (t.title || "").toLowerCase().includes(q);
        if (!matchesCity && !matchesAirport && !matchesCategory && !matchesTitle) {
          return false;
        }
      }
      return true;
    });
  }, [tariffs, directionFilter, pricingTypeFilter, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* ACTION BAR & STATS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Airport Distance Slab Rules</h3>
              <p className="text-xs text-slate-500">
                Configure distance ranges (e.g. 0-30 km, 30-55 km) with flat fares for Airport Pickups & Drops
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search City, Airport, Car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
          />
        </div>

        {/* Direction Filter */}
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">✈️ All Directions</option>
          <option value="CITY_TO_AIRPORT">City ➔ Airport (Drop)</option>
          <option value="AIRPORT_TO_CITY">Airport ➔ City (Pickup)</option>
          <option value="BOTH">Both Directions</option>
        </select>

        {/* Pricing Type Filter */}
        <select
          value={pricingTypeFilter}
          onChange={(e) => setPricingTypeFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">🏷️ All Rate Types</option>
          <option value="REGULAR">Regular Rate</option>
          <option value="SEASONAL">Seasonal Price</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">🚗 All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">⚡ All Statuses</option>
          <option value="ACTIVE">Active Rules</option>
          <option value="INACTIVE">Inactive Rules</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <Card className="p-12 text-center">
          <LoadingAnimation message="Loading Airport Distance Slabs..." />
        </Card>
      ) : filteredTariffs.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200">
          <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Airport Distance Slabs Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {tariffs.length === 0
              ? 'You haven\'t added any airport distance slab rules yet. Click "+ Standard Tariff" or "+ Seasonal Surge" above to configure airport pricing.'
              : "No rules match your selected filters. Try resetting the filters."}
          </p>
          {tariffs.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setDirectionFilter("ALL");
                  setPricingTypeFilter("ALL");
                  setCategoryFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="text-[11px] font-bold">Direction</TableHead>
                <TableHead className="text-[11px] font-bold">Location (City & State)</TableHead>
                <TableHead className="text-[11px] font-bold">Vehicle</TableHead>
                <TableHead className="text-[11px] font-bold">KM Range</TableHead>
                <TableHead className="text-[11px] font-bold">Fares (Customer / Vendor)</TableHead>
                <TableHead className="text-[11px] font-bold">Schedule & Time</TableHead>
                <TableHead className="text-[11px] font-bold">Validity</TableHead>
                <TableHead className="text-[11px] font-bold text-center">Status</TableHead>
                <TableHead className="text-[11px] font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTariffs.map((item) => {
                const isDrop = item.tripDirection === "CITY_TO_AIRPORT";
                const isPickup = item.tripDirection === "AIRPORT_TO_CITY";
                const isBoth = item.tripDirection === "BOTH";
                const isSeasonal = (item.pricingType || "REGULAR").toUpperCase() === "SEASONAL";
                const isActive = (item.status || "ACTIVE").toUpperCase() === "ACTIVE";

                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Direction */}
                    <TableCell>
                      {isDrop && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          City <ArrowRight className="w-3 h-3" /> Airport
                        </span>
                      )}
                      {isPickup && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Airport <ArrowRight className="w-3 h-3" /> City
                        </span>
                      )}
                      {isBoth && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Plane className="w-3 h-3" /> Both Directions
                        </span>
                      )}
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{item.city || "ALL"}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {item.state || "Tamil Nadu"}
                      </div>
                    </TableCell>

                    {/* Vehicle */}
                    <TableCell>
                      <div className="font-bold text-xs text-slate-900">{item.category}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.seatingCapacity} Seater • {item.fuelType || "ALL"}
                      </div>
                    </TableCell>

                    {/* KM Range */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {item.minKm} - {item.maxKm} KM
                      </span>
                    </TableCell>

                    {/* Fares */}
                    <TableCell>
                      <div className="text-xs font-black text-emerald-700">
                        {formatINR(item.customerFare)}{" "}
                        <span className="text-[10px] font-semibold text-slate-400">cust</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {formatINR(item.vendorFare || item.customerFare * 0.75)} vend • +{formatINR(item.extraKmRate)}/km
                      </div>
                    </TableCell>

                    {/* Schedule & Time */}
                    <TableCell>
                      <div className="text-[11px] font-bold text-slate-700">
                        {item.daysOfWeek === "ALL" ? "All 7 Days" : item.daysOfWeek}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {item.timeSlotType === "ALL_DAY"
                          ? "24 Hours"
                          : item.timeSlotType === "DAY"
                          ? "Day (06:00 - 22:00)"
                          : item.timeSlotType === "NIGHT"
                          ? "Night (22:00 - 06:00)"
                          : `${item.timeRangeStart || "00:00"} - ${item.timeRangeEnd || "23:59"}`}
                      </div>
                    </TableCell>

                    {/* Validity & Rate Type */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isSeasonal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            <Flame className="w-3 h-3 text-rose-500" /> Seasonal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Regular
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          {item.expiryType === "NEVER" ? "Never Expires" : `${item.startDate || ""} to ${item.endDate || ""}`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Toggle */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (onEditItem) {
                              onEditItem(item);
                            } else {
                              handleOpenEdit(item);
                            }
                          }}
                          className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteConfirmOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Airport Distance Slab Rule" : "Create Airport Distance Slab Rule"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* STEP 1: TRIP DIRECTION & PRICING TYPE */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-blue-600" />
              1. Trip Direction & Rate Type
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "CITY_TO_AIRPORT", label: "City ➔ Airport", desc: "Airport Drop" },
                { value: "AIRPORT_TO_CITY", label: "Airport ➔ City", desc: "Airport Pickup" },
                { value: "BOTH", label: "Both Directions", desc: "Uniform Rate" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, tripDirection: opt.value }))}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    formData.tripDirection === opt.value
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-xs ring-1 ring-blue-500"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              {[
                { value: "REGULAR", label: "Standard Regular Rate", desc: "Year-round base price" },
                { value: "SEASONAL", label: "Seasonal Surge Price", desc: "Festival / peak period price" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, pricingType: opt.value }))}
                  className={`py-1.5 px-3 rounded-lg border text-center transition-all ${
                    formData.pricingType === opt.value
                      ? "border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-xs ring-1 ring-amber-500"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs block">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: LOCATION & AIRPORT */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              2. Location & Airport
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="e.g. Tamil Nadu, Karnataka"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Chennai, Bangalore"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Airport</label>
                <input
                  type="text"
                  list="airports-list"
                  value={formData.airportName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, airportName: e.target.value }))}
                  placeholder="e.g. Chennai Airport (MAA)"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
                <datalist id="airports-list">
                  {AIRPORTS.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* STEP 3: DISTANCE RANGE (KM SLAB) & VEHICLE */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              3. Distance Slab (KM Range) & Vehicle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Min KM</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minKm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minKm: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Max KM <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxKm}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxKm: e.target.value }))}
                  placeholder="e.g. 35"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Seats</label>
                <select
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, seatingCapacity: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  {SEATING_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 4: FARES & CHARGES */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
            <label className="text-[11px] font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              4. Fares & Extra KM Charges
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-emerald-800 mb-1">
                  Customer Fare (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1299"
                  value={formData.customerFare}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      customerFare: val,
                      vendorFare: prev.vendorFare || (val ? String(Math.round(parseFloat(val) * 0.75)) : ""),
                    }));
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-emerald-300 bg-white font-black text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Vendor Payout (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 950"
                  value={formData.vendorFare}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendorFare: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Extra KM Rate (₹/km)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 14"
                  value={formData.extraKmRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, extraKmRate: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Vendor Extra KM (₹/km)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 11"
                  value={formData.vendorExtraKmRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vendorExtraKmRate: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: SCHEDULE (DAYS & TIME) & EXPIRY */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="text-[11px] font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              5. Days, Time Slot & Expiry
            </label>

            {/* Days Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-700">Days of Week</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, daysOfWeek: "ALL" }))}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    All Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, daysOfWeek: "MON,TUE,WED,THU,FRI" }))}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, daysOfWeek: "SAT,SUN" }))}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Weekends
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {DAYS_OF_WEEK.map((d) => {
                  const isAll = formData.daysOfWeek === "ALL";
                  const isSelected = isAll || formData.daysOfWeek.split(",").includes(d);

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        if (isAll) {
                          setFormData((prev) => ({ ...prev, daysOfWeek: d }));
                        } else {
                          const current = formData.daysOfWeek ? formData.daysOfWeek.split(",") : [];
                          const updated = current.includes(d) ? current.filter((x) => x !== d) : [...current, d];
                          setFormData((prev) => ({
                            ...prev,
                            daysOfWeek: updated.length === 7 || updated.length === 0 ? "ALL" : updated.join(","),
                          }));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slot & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={formData.timeSlotType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, timeSlotType: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ALL_DAY">All Day (24 Hours)</option>
                  <option value="DAY">Day Hours (06:00 to 22:00)</option>
                  <option value="NIGHT">Night Hours (22:00 to 06:00)</option>
                  <option value="CUSTOM">Custom Time Range</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Expiry / Validity</label>
                <select
                  value={formData.expiryType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiryType: e.target.value }))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="NEVER">Never Expires (Permanent)</option>
                  <option value="FIXED_DAYS">Fixed Date Range</option>
                </select>
              </div>
            </div>

            {formData.timeSlotType === "CUSTOM" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.timeRangeStart}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeRangeStart: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.timeRangeEnd}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeRangeEnd: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}

            {formData.expiryType === "FIXED_DAYS" && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STATUS TOGGLE */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-xs font-bold text-slate-800">Rule Status</span>
              <p className="text-[10px] text-slate-500">Enable or disable this airport charge rule</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                }))
              }
              className={`text-xs font-black px-3 py-1.5 rounded-full border transition-all ${
                formData.status === "ACTIVE"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-slate-200 text-slate-600 border-slate-300"
              }`}
            >
              {formData.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saving ? "Saving..." : editingItem ? "Update Airport Rule" : "Save Airport Rule"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Airport Charge Rule?"
        description="Are you sure you want to delete this airport distance slab? This action cannot be undone."
      />

      {/* TOAST */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />
      )}
    </div>
  );
}
