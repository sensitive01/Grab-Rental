"use client";

import { useState, useEffect, useMemo } from "react";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
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
  IndianRupee,
  Calendar,
  Sun,
  Moon,
  PlusCircle,
  Sparkles,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Calculator,
  Users,
  Flame,
  Check,
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
  { value: "26", label: "26 Seater (Mini Bus)" },
  { value: "35", label: "35 Seater (Coach)" },
];

const CATEGORY_DEFAULT_RATES = {
  Hatchback: { weekdayDay: "11.00", weekdayNight: "12.50", weekendDay: "12.50", weekendNight: "14.00", baseFare: "2800.00", baseKm: "250" },
  Sedan: { weekdayDay: "12.50", weekdayNight: "14.00", weekendDay: "14.00", weekendNight: "15.50", baseFare: "3200.00", baseKm: "250" },
  SUV: { weekdayDay: "16.00", weekdayNight: "18.00", weekendDay: "18.00", weekendNight: "20.00", baseFare: "4500.00", baseKm: "250" },
  Innova: { weekdayDay: "18.50", weekdayNight: "20.00", weekendDay: "20.50", weekendNight: "22.00", baseFare: "5200.00", baseKm: "250" },
  Innovacrysta: { weekdayDay: "20.00", weekdayNight: "22.00", weekendDay: "22.00", weekendNight: "24.00", baseFare: "5500.00", baseKm: "250" },
  innovahycross: { weekdayDay: "22.00", weekdayNight: "24.00", weekendDay: "24.00", weekendNight: "26.00", baseFare: "6000.00", baseKm: "250" },
  Tempo: { weekdayDay: "26.00", weekdayNight: "28.00", weekendDay: "28.00", weekendNight: "30.00", baseFare: "7000.00", baseKm: "250" },
  urbania: { weekdayDay: "28.00", weekdayNight: "30.00", weekendDay: "30.00", weekendNight: "32.00", baseFare: "7500.00", baseKm: "250" },
  Bus: { weekdayDay: "40.00", weekdayNight: "45.00", weekendDay: "45.00", weekendNight: "50.00", baseFare: "11250.00", baseKm: "250" },
  Benz: { weekdayDay: "55.00", weekdayNight: "65.00", weekendDay: "65.00", weekendNight: "75.00", baseFare: "15000.00", baseKm: "250" },
};

export default function AdminPricingPage() {
  const [tariffs, setTariffs] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, WEEKDAY, WEEKEND, SEASONAL
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Active form state
  const [formData, setFormData] = useState({
    category: "Sedan",
    modelName: "Dzire",
    seatingCapacity: "4",
    tariffType: "STANDARD",   // STANDARD | SEASONAL
    seasonal: false,
    seasonName: "",
    startDate: "",
    endDate: "",
    weekdayDayRate: "12.00",
    weekdayNightRate: "13.50",
    weekendDayRate: "13.50",
    weekendNightRate: "15.00",
    baseFare: "3000.00",
    baseIncludedKm: "250",
  });

  // Simulator State
  const [simCategory, setSimCategory] = useState("Sedan");
  const [simModel, setSimModel] = useState("Dzire");
  const [simDate, setSimDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [simTime, setSimTime] = useState("10:00 AM");
  const [simType, setSimType] = useState("WEEKDAY"); // WEEKDAY | WEEKEND | SEASONAL
  const [simDistance, setSimDistance] = useState("350");
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [tariffRes, modelRes] = await Promise.all([
        adminApi.getTariffs(),
        adminApi.getModelConfigs(),
      ]);

      if (tariffRes.data) setTariffs(tariffRes.data);
      if (modelRes.data) setModels(modelRes.data);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to load tariffs or vehicle models" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter available model names based on selected category in form
  const availableModelsForForm = useMemo(() => {
    const matched = models.filter(
      (m) => m.category?.toLowerCase() === formData.category?.toLowerCase()
    );
    if (matched.length > 0) return matched.map((m) => m.modelName);
    if (formData.category === "Sedan") return ["Dzire", "Etios", "Aura"];
    if (formData.category === "Hatchback") return ["WagonR", "Swift"];
    if (formData.category === "SUV") return ["Ertiga", "Carens", "Xylo"];
    return ["Standard Fleet"];
  }, [models, formData.category]);

  // Models that actually have pricing set, filtered by simulator category
  const simAvailableModels = useMemo(() => {
    const priced = tariffs
      .filter((t) => t.category?.toLowerCase() === simCategory?.toLowerCase())
      .map((t) => t.modelName)
      .filter(Boolean);
    return [...new Set(priced)];
  }, [tariffs, simCategory]);

  function handleOpenCreate(type = "STANDARD") {
    setEditingItem(null);
    const isSeasonal = type === "SEASONAL";
    const initialCategory = models[0]?.category || "Hatchback";
    const initialModel = models[0]?.modelName || "WagonR";
    const initialSeats = models[0]?.seatingCapacity || "4";
    const rates = CATEGORY_DEFAULT_RATES[initialCategory] || CATEGORY_DEFAULT_RATES.Hatchback;

    setFormData({
      category: initialCategory,
      modelName: initialModel,
      seatingCapacity: initialSeats,
      tariffType: isSeasonal ? "SEASONAL" : "STANDARD",
      seasonal: isSeasonal,
      seasonName: isSeasonal ? "Festival Surge" : "",
      startDate: isSeasonal ? new Date().toISOString().split("T")[0] : "",
      endDate: isSeasonal ? new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] : "",
      weekdayDayRate: rates.weekdayDay,
      weekdayNightRate: rates.weekdayNight,
      weekendDayRate: rates.weekendDay,
      weekendNightRate: rates.weekendNight,
      baseFare: rates.baseFare,
      baseIncludedKm: rates.baseKm,
    });
    setIsModalOpen(true);
  }

  function handleStartEdit(item) {
    setEditingItem(item);
    const isSeasonal = Boolean(item.seasonal || item.tariffType === "SEASONAL");
    const type = isSeasonal ? "SEASONAL" : "STANDARD";
    setFormData({
      id: item.id,
      category: item.category || "Sedan",
      modelName: item.modelName || "",
      seatingCapacity: item.seatingCapacity || "4",
      tariffType: type,
      seasonal: isSeasonal,
      seasonName: item.seasonName || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      weekdayDayRate: String(item.weekdayDayRate || "12.00"),
      weekdayNightRate: String(item.weekdayNightRate || "13.50"),
      weekendDayRate: String(item.weekendDayRate || "13.50"),
      weekendNightRate: String(item.weekendNightRate || "15.00"),
      baseFare: String(item.baseFare || "3000.00"),
      baseIncludedKm: String(item.baseIncludedKm || "250"),
    });
    setIsModalOpen(true);
  }

  async function handleSaveTariff(e) {
    e.preventDefault();
    if (!formData.category || !formData.modelName || !formData.seatingCapacity) {
      setToast({ type: "error", message: "Please choose Category, Model, and Seater" });
      return;
    }

    if (formData.tariffType === "SEASONAL" && (!formData.startDate || !formData.endDate)) {
      setToast({ type: "error", message: "Please specify From Date and To Date for seasonal pricing" });
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.saveTariff({
        ...formData,
        weekdayDayRate: parseFloat(formData.weekdayDayRate),
        weekdayNightRate: parseFloat(formData.weekdayNightRate),
        weekendDayRate: parseFloat(formData.weekendDayRate),
        weekendNightRate: parseFloat(formData.weekendNightRate),
        baseFare: parseFloat(formData.baseFare || 0),
        baseIncludedKm: parseInt(formData.baseIncludedKm || 250, 10),
      });

      setToast({
        type: "success",
        message: editingItem
          ? `Tariff for ${formData.modelName} updated successfully`
          : `Tariff rules for ${formData.modelName} created successfully`,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save tariff rule" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Are you sure you want to delete tariff for ${item.modelName} (${item.seatingCapacity} Seater)?`)) {
      return;
    }
    try {
      await adminApi.deleteTariff(item.id);
      setToast({ type: "success", message: "Tariff deleted successfully" });
      loadData();
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete tariff" });
    }
  }

  // Live Simulator Run
  async function runSimulation() {
    setSimLoading(true);
    try {
      const res = await adminApi.calculateRate({
        category: simCategory,
        model: simModel,
        seatingCapacity: "4",
        date: simDate,
        time: simTime,
      });
      if (res.data) {
        setSimResult(res.data);
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Simulator check failed" });
    } finally {
      setSimLoading(false);
    }
  }

  // Filtered Tariffs
  const filteredTariffs = useMemo(() => {
    return tariffs.filter((t) => {
      const isSeasonal = Boolean(t.seasonal || t.tariffType === "SEASONAL");
      const matchType =
        activeTab === "ALL" ||
        (activeTab === "STANDARD" && !isSeasonal) ||
        (activeTab === "SEASONAL" && isSeasonal);

      const matchSearch =
        !search.trim() ||
        t.category?.toLowerCase().includes(search.toLowerCase()) ||
        t.modelName?.toLowerCase().includes(search.toLowerCase()) ||
        t.seasonName?.toLowerCase().includes(search.toLowerCase());

      return matchType && matchSearch;
    });
  }, [tariffs, activeTab, search]);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Vehicle Tariff & Dynamic Pricing Matrix"
          subtitle="Configure weekday vs weekend and day vs night 1km rates, plus date-range seasonal peak surge pricing"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Pricing Matrix" },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenCreate("STANDARD")}
            variant="outline"
            className="text-xs gap-1.5 shadow-xs border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            + Standard Tariff
          </Button>
          <Button
            onClick={() => handleOpenCreate("SEASONAL")}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            + Seasonal Tariff
          </Button>
        </div>
      </div>

      {/* LIVE RATE SIMULATOR CARD */}
      <Card className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-0 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold tracking-wide text-white">Live Customer Pricing Engine Test</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Real-Time Matrix Check
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Pick a car model, date, and pickup time to simulate the exact ₹/km rate and customer fare.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto">
            <select
              value={simCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setSimCategory(cat);
                const firstPriced = tariffs
                  .find((t) => t.category?.toLowerCase() === cat.toLowerCase())
                  ?.modelName;
                setSimModel(firstPriced || "");
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>

            <select
              value={simModel}
              onChange={(e) => setSimModel(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              {simAvailableModels.length === 0 ? (
                <option value="" className="bg-slate-900">No pricing added yet</option>
              ) : (
                simAvailableModels.map((m) => (
                  <option key={m} value={m} className="bg-slate-900">{m}</option>
                ))
              )}
            </select>

            {/* Tariff Type */}
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              <option value="WEEKDAY" className="bg-slate-900">🏢 Weekday</option>
              <option value="WEEKEND" className="bg-slate-900">🌴 Weekend</option>
              <option value="SEASONAL" className="bg-slate-900">✨ Seasonal</option>
            </select>

            <input
              type="date"
              value={simDate}
              onChange={(e) => setSimDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            />

            <select
              value={simTime}
              onChange={(e) => setSimTime(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-950/70 border border-blue-800 text-white focus:outline-none"
            >
              <option value="10:00 AM" className="bg-slate-900">☀️ Day (10:00 AM)</option>
              <option value="11:30 PM" className="bg-slate-900">🌙 Night (11:30 PM)</option>
            </select>
          </div>

          <Button
            size="sm"
            onClick={runSimulation}
            disabled={simLoading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs whitespace-nowrap"
          >
            {simLoading ? "Checking..." : "Calculate Live Rate"}
          </Button>
        </div>

        {/* Simulator Results banner if active */}
        {simResult && (
          <div className="mt-4 pt-3 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-blue-300">
                Rule Applied:{" "}
                <strong className={simResult.isSeasonal ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                  {simResult.isSeasonal ? `★ ${simResult.seasonName || "Seasonal Surge"}` : "Standard Tariff"}
                </strong>
              </span>
              <span>•</span>
              <span className="text-blue-200">
                Type: <strong>{simResult.dayType}</strong> ({simResult.timeSlot})
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-blue-300 text-[11px]">1 KM Rate:</span>
                <span className="text-base font-extrabold text-amber-400 ml-1.5">
                  ₹{parseFloat(simResult.ratePerKm).toFixed(2)} / KM
                </span>
              </div>
              <div className="bg-blue-800/50 px-3 py-1 rounded-lg">
                <span className="text-blue-200 text-[11px]">Est. 300 KM Trip: </span>
                <strong className="text-white">
                  ₹{(parseFloat(simResult.ratePerKm) * 300).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto">
          {[
            { id: "ALL", label: `All (${tariffs.length})` },
            { id: "STANDARD", label: `Standard (${tariffs.filter((t) => t.tariffType !== "SEASONAL" && !t.seasonal).length})` },
            { id: "SEASONAL", label: `✨ Seasonal (${tariffs.filter((t) => t.tariffType === "SEASONAL" || t.seasonal).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Model, Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TARIFF TABLE */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingAnimation message="Loading pricing matrix..." />
        </div>
      ) : filteredTariffs.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border border-dashed border-slate-300">
          <IndianRupee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No tariff rules found</p>
          <p className="text-xs text-slate-400 mt-1">
            Click &quot;+ Standard Tariff&quot; or &quot;+ Seasonal Peak Tariff&quot; to define your 1 KM rates.
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-slate-200 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category / Model</TableHead>
                <TableHead>Seating</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Season / Date Range</TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> WD Day
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> WD Night
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> WE Day
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> WE Night
                  </span>
                </TableHead>
                <TableHead className="text-center">Base Fare</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTariffs.map((t) => (
                <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Category / Model */}
                  <TableCell>
                    <div className="font-bold text-slate-900 text-sm">{t.modelName}</div>
                    <Badge variant={t.seasonal ? "warning" : "primary"} size="sm" className="mt-0.5">
                      {t.category}
                    </Badge>
                  </TableCell>

                  {/* Seating */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Users className="w-3 h-3 text-blue-500" />
                      {t.seatingCapacity}+D
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {t.seasonal ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                        <Flame className="w-3 h-3 text-amber-600" />
                        Seasonal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" />
                        Standard
                      </span>
                    )}
                  </TableCell>

                  {/* Season / Date Range */}
                  <TableCell>
                    {t.seasonal ? (
                      <div className="text-[11px] text-amber-900">
                        <span className="font-semibold block">{t.seasonName || "Seasonal Surge"}</span>
                        <span className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {t.startDate} → {t.endDate}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Year-Round</span>
                    )}
                  </TableCell>

                  {/* WD Day */}
                  <TableCell className="text-center">
                    <span className="font-extrabold text-sm text-slate-900">
                      ₹{parseFloat(t.weekdayDayRate || 0).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400">/km</span>
                  </TableCell>

                  {/* WD Night */}
                  <TableCell className="text-center">
                    <span className="font-extrabold text-sm text-indigo-700">
                      ₹{parseFloat(t.weekdayNightRate || 0).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400">/km</span>
                  </TableCell>

                  {/* WE Day */}
                  <TableCell className="text-center">
                    <span className="font-extrabold text-sm text-emerald-700">
                      ₹{parseFloat(t.weekendDayRate || 0).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400">/km</span>
                  </TableCell>

                  {/* WE Night */}
                  <TableCell className="text-center">
                    <span className="font-extrabold text-sm text-purple-700">
                      ₹{parseFloat(t.weekendNightRate || 0).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-400">/km</span>
                  </TableCell>

                  {/* Base Fare */}
                  <TableCell className="text-center">
                    <span className="text-xs font-semibold text-slate-700">₹{t.baseFare || "0"}</span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(t)}
                        className="text-xs gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 h-7 px-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Tariff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CREATE / EDIT TARIFF MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? `Edit Tariff: ${formData.modelName}`
            : formData.seasonal
            ? "Create Seasonal Peak Tariff (From/To Date)"
            : "Create Standard Vehicle Tariff"
        }
        size="lg"
      >
        <form onSubmit={handleSaveTariff} className="space-y-4">
          {/* STEP 1: CATEGORY, MODEL, SEATER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Vehicle Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  const matchedModel = models.find((m) => m.category === cat);
                  const firstModel = matchedModel?.modelName || (cat === "SUV" ? "Ertiga" : cat === "Hatchback" ? "WagonR" : cat === "Benz" ? "E-Class Executive" : "Dzire");
                  const seat = matchedModel?.seatingCapacity || (cat === "SUV" ? "7" : "4");
                  const rates = CATEGORY_DEFAULT_RATES[cat] || CATEGORY_DEFAULT_RATES.Sedan;

                  setFormData((prev) => ({
                    ...prev,
                    category: cat,
                    modelName: firstModel,
                    seatingCapacity: seat,
                    ...(!editingItem ? {
                      weekdayDayRate: rates.weekdayDay,
                      weekdayNightRate: rates.weekdayNight,
                      weekendDayRate: rates.weekendDay,
                      weekendNightRate: rates.weekendNight,
                      baseFare: rates.baseFare,
                      baseIncludedKm: rates.baseKm,
                    } : {})
                  }));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Car Model <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.modelName}
                onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer text-slate-900"
                required
              >
                <option value="">-- Choose Car Model --</option>
                {availableModelsForForm.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Seating Capacity <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.seatingCapacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, seatingCapacity: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SEATING_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 2: TARIFF TYPE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              4. Tariff Type <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[
                { value: "STANDARD", label: "🏢 Standard Tariff", desc: "Year-Round Weekday & Weekend Pricing", color: "blue" },
                { value: "SEASONAL", label: "✨ Seasonal Peak Tariff", desc: "Festival / Holiday Surge Date Range", color: "amber" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      tariffType: opt.value,
                      seasonal: opt.value === "SEASONAL",
                    }))
                  }
                  className={`flex-1 py-2 px-3 rounded-xl border-2 text-center transition-all ${
                    formData.tariffType === opt.value
                      ? opt.color === "blue"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Seasonal date fields */}
            {formData.tariffType === "SEASONAL" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Season Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Peak Season"
                    value={formData.seasonName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seasonName: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    From Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    To Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 5: RATE FIELDS */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              5. Set Price per 1 KM (₹ / KM)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WEEKDAY rates */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-blue-900 block border-b border-blue-100 pb-1">
                  🏢 Weekday (Mon – Fri)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Day Price (₹/KM)
                    </label>
                    <input
                      type="number" step="0.10" min="0"
                      value={formData.weekdayDayRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weekdayDayRate: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-500" /> Night Price (₹/KM)
                    </label>
                    <input
                      type="number" step="0.10" min="0"
                      value={formData.weekdayNightRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weekdayNightRate: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* WEEKEND rates */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-indigo-900 block border-b border-indigo-100 pb-1">
                  🌴 Weekend (Sat – Sun)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Day Price (₹/KM)
                    </label>
                    <input
                      type="number" step="0.10" min="0"
                      value={formData.weekendDayRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weekendDayRate: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-500" /> Night Price (₹/KM)
                    </label>
                    <input
                      type="number" step="0.10" min="0"
                      value={formData.weekendNightRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weekendNightRate: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EXTRA BASE COMPONENTS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Base Min Fare (₹)</label>
              <input
                type="number"
                value={formData.baseFare}
                onChange={(e) => setFormData((prev) => ({ ...prev, baseFare: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Included KM</label>
              <input
                type="number"
                value={formData.baseIncludedKm}
                onChange={(e) => setFormData((prev) => ({ ...prev, baseIncludedKm: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Saving Tariff..." : editingItem ? "Update Tariff Rules" : "Save Tariff Rules"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
