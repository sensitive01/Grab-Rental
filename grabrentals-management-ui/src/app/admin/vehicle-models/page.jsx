"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { adminApi } from "@/lib/adminApi";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/Table";
import {
  Car,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Users,
  Fuel,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  Sparkles,
  UploadCloud,
  Check,
  Upload,
  Link as LinkIcon,
  X,
  AlertCircle,
  LayoutList,
  LayoutGrid
} from "lucide-react";

// Predefined category to model recommendations matching vendor onboarding
const CATEGORY_MODEL_PRESETS = {
  Sedan: ["Dzire", "Etios", "Aura", "Amaze", "Verna", "Ciaz"],
  Hatchback: ["WagonR", "Swift", "Tiago", "i20", "Baleno"],
  SUV: ["Ertiga", "Carens", "Xylo", "Marazzo", "Scorpio", "Bolero"],
  Innova: ["Innova (Standard 6+1)", "Innova (Standard 7+1)"],
  Innovacrysta: ["Innova Crysta (6+1)", "Innova Crysta (7+1)"],
  innovahycross: ["Innova Hycross (7+1)", "Innova Hycross (8+1)"],
  Tempo: ["Tempo Traveller 12+1", "Tempo Traveller 13+1", "Tempo Traveller 17+1"],
  urbania: ["Force Urbania 10+1", "Force Urbania 12+1", "Force Urbania 16+1"],
  Bus: ["26 Seater Mini Bus", "35 Seater Luxury Coach", "45 Seater AC Bus"],
  Benz: ["E-Class Executive", "C-Class Luxury", "S-Class First Class"],
};

const SEATING_PRESETS = [
  { value: "4", label: "4 Seater + Driver" },
  { value: "6", label: "6 Seater + Driver" },
  { value: "7", label: "7 Seater + Driver" },
  { value: "8", label: "8 Seater" },
  { value: "10", label: "10 Seater" },
  { value: "12", label: "12 Seater (Tempo / Urbania)" },
  { value: "16", label: "16 Seater" },
  { value: "18", label: "18 Seater" },
  { value: "26", label: "26 Seater (Mini Bus)" },
  { value: "35", label: "35 Seater (Coach)" },
  { value: "45", label: "45 Seater (Bus)" },
];

export default function AdminVehicleModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [photoMode, setPhotoMode] = useState("upload"); // 'upload' or 'url'
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "Sedan",
    modelName: "Dzire",
    seatingCapacity: "4",
    fuelType: "Diesel",
    commonPhotoUrl: "",
    active: true,
  });

  async function loadModels() {
    try {
      setLoading(true);
      const res = await adminApi.getModelConfigs();
      if (res.data) {
        setModels(res.data);
      }
    } catch (err) {
      console.error("Failed to load vehicle models:", err);
      setToast({ type: "error", message: "Failed to load vehicle model configurations" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModels();
  }, []);

  function handleOpenCreate() {
    setEditingItem(null);
    const defaultCat = "Sedan";
    const defaultModels = CATEGORY_MODEL_PRESETS[defaultCat] || [];
    setFormData({
      category: defaultCat,
      modelName: defaultModels[0] || "",
      seatingCapacity: "4",
      fuelType: "Diesel",
      commonPhotoUrl: "",
      active: true,
    });
    setIsCustomModel(false);
    setPreviewPhoto("");
    setPhotoMode("upload");
    setIsModalOpen(true);
  }

  function handleStartEdit(item) {
    setEditingItem(item);
    const cat = item.category || "Sedan";
    const presets = CATEGORY_MODEL_PRESETS[cat] || [];
    const isPreset = presets.includes(item.modelName);

    setFormData({
      id: item.id,
      category: cat,
      modelName: item.modelName || "",
      seatingCapacity: item.seatingCapacity || "4",
      fuelType: item.fuelType || "Diesel",
      commonPhotoUrl: item.commonPhotoUrl || "",
      active: item.active ?? true,
    });
    setIsCustomModel(!isPreset && Boolean(item.modelName));
    setPreviewPhoto(item.commonPhotoUrl || "");
    setPhotoMode(item.commonPhotoUrl ? "url" : "upload");
    setIsModalOpen(true);
  }

  // Handle Local File Upload with Cloudinary + Local Base64 fallback
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Please select an image file (PNG, JPG, WEBP)" });
      return;
    }

    setUploadingPhoto(true);

    // 1. Immediately create a local data URL preview so user sees it instantly
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      setPreviewPhoto(dataUrl);

      // 2. Upload to backend
      try {
        const uploadRes = await adminApi.uploadModelPhoto(file);
        if (uploadRes?.data?.url) {
          setFormData((prev) => ({ ...prev, commonPhotoUrl: uploadRes.data.url }));
          setPreviewPhoto(uploadRes.data.url);
          setToast({ type: "success", message: `Photo "${file.name}" uploaded successfully!` });
        } else {
          // If server didn't return url, use the local dataUrl
          setFormData((prev) => ({ ...prev, commonPhotoUrl: dataUrl }));
        }
      } catch (err) {
        console.warn("Server upload fallback to local base64:", err.message);
        setFormData((prev) => ({ ...prev, commonPhotoUrl: dataUrl }));
        setToast({ type: "success", message: `Photo loaded locally for "${file.name}"` });
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.category || !formData.modelName || !formData.seatingCapacity) {
      setToast({ type: "error", message: "Please fill all required fields (Category, Model, Seater)" });
      return;
    }

    const finalPhoto = formData.commonPhotoUrl || previewPhoto;
    if (!finalPhoto) {
      setToast({ type: "error", message: "Please upload or provide a common photo for this vehicle model" });
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.saveModelConfig({
        ...formData,
        commonPhotoUrl: finalPhoto,
      });
      setToast({
        type: "success",
        message: editingItem
          ? `Updated model "${formData.modelName}" successfully`
          : `Created new model "${formData.modelName}" with common photo!`,
      });
      setIsModalOpen(false);
      loadModels();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Failed to save vehicle model" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Are you sure you want to remove model "${item.modelName} (${item.seatingCapacity} Seater)"?`)) {
      return;
    }

    try {
      await adminApi.deleteModelConfig(item.id);
      setToast({ type: "success", message: `Model "${item.modelName}" deleted successfully` });
      loadModels();
    } catch (err) {
      setToast({ type: "error", message: "Failed to delete vehicle model" });
    }
  }

  async function handleClearAll() {
    if (!confirm("Are you sure you want to remove all vehicle models from the catalog?")) {
      return;
    }

    try {
      await adminApi.deleteAllModels();
      setToast({ type: "success", message: "All vehicle models removed" });
      loadModels();
    } catch (err) {
      setToast({ type: "error", message: "Failed to clear vehicle models" });
    }
  }

  // Filtered models
  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchCat = selectedCategory === "ALL" || m.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !search.trim() ||
        m.modelName?.toLowerCase().includes(search.toLowerCase()) ||
        m.category?.toLowerCase().includes(search.toLowerCase()) ||
        m.seatingCapacity?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [models, selectedCategory, search]);

  const categories = useMemo(() => {
    const list = Object.keys(CATEGORY_MODEL_PRESETS);
    return ["ALL", ...list];
  }, []);

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Vehicle Models & Catalog"
          subtitle="Configure master models, seating capacities, and upload standard common photos for customer bookings"
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Platform Vehicles", href: "/admin/vehicles" },
            { label: "Models & Common Photos" },
          ]}
        />
        <div className="flex items-center gap-2">
          {models.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove All Cars
            </Button>
          )}
          <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm text-xs">
            <PlusCircle className="w-4 h-4" />
            Add Vehicle Model & Photo
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Dzire, Etios, Ertiga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                  viewMode === "table"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Models List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingAnimation message="Loading vehicle models catalog..." />
        </div>
      ) : filteredModels.length === 0 ? (
        <Card className="p-16 text-center text-slate-500 border-2 border-dashed border-slate-300 bg-white">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Vehicle Models in Catalog</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Your catalog is currently empty. Click the button below to add a vehicle model with your own uploaded photo.
          </p>
          <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs mx-auto shadow-sm">
            <PlusCircle className="w-4 h-4" />
            Add First Vehicle Model & Upload Photo
          </Button>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="p-0 overflow-hidden border border-slate-200 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Common Photo</TableHead>
                <TableHead>Vehicle Model</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Seating Capacity</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Booking Visibility</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Photo Column */}
                  <TableCell>
                    <div className="w-24 h-16 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                      {item.commonPhotoUrl ? (
                        <img
                          src={item.commonPhotoUrl}
                          alt={item.modelName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Car className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </TableCell>

                  {/* Vehicle Model Column */}
                  <TableCell>
                    <div className="font-bold text-slate-900 text-sm">{item.modelName}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Master Catalog Asset</div>
                  </TableCell>

                  {/* Category Column */}
                  <TableCell>
                    <Badge variant="primary" size="sm" className="font-semibold shadow-xs">
                      {item.category}
                    </Badge>
                  </TableCell>

                  {/* Seating Capacity Column */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {item.seatingCapacity} Seater + Driver
                    </span>
                  </TableCell>

                  {/* Fuel Type Column */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      {item.fuelType || "Diesel"}
                    </span>
                  </TableCell>

                  {/* Booking Visibility Column */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <Check className="w-3 h-3 stroke-[2.5]" /> Live in Customer Booking
                    </span>
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right pr-6">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(item)}
                        className="text-xs gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 h-8"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit & Photo
                      </Button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Model"
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
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredModels.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-44 w-full bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 border-b border-slate-100">
                  {item.commonPhotoUrl ? (
                    <img
                      src={item.commonPhotoUrl}
                      alt={item.modelName}
                      className="max-h-36 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <Car className="w-12 h-12 mb-1" />
                      <span className="text-[11px]">No Photo</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <Badge variant="primary" size="sm" className="font-semibold shadow-xs">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3" /> Common Photo
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.modelName}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="font-medium text-slate-700">{item.category}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {item.seatingCapacity} Seater
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <Fuel className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fuel: <strong className="text-slate-800">{item.fuelType || "Diesel"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartEdit(item)}
                  className="w-full text-xs gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit & Photo
                </Button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Model"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Model: ${editingItem.modelName}` : "Add Vehicle Model & Upload Common Photo"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: CATEGORY */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Vehicle Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                const cat = e.target.value;
                const presets = CATEGORY_MODEL_PRESETS[cat] || [];
                setFormData((prev) => ({
                  ...prev,
                  category: cat,
                  modelName: prev.modelName || (presets[0] || ""),
                }));
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {Object.keys(CATEGORY_MODEL_PRESETS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: MODEL NAME DROPDOWN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                2. Vehicle Model Name <span className="text-rose-500">*</span>
              </label>
              {!isCustomModel ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModel(true);
                    setFormData((prev) => ({ ...prev, modelName: "" }));
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  + Custom Model
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModel(false);
                    const presets = CATEGORY_MODEL_PRESETS[formData.category] || [];
                    setFormData((prev) => ({ ...prev, modelName: presets[0] || "" }));
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  ← Select from Dropdown
                </button>
              )}
            </div>

            {!isCustomModel ? (
              <select
                value={formData.modelName}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setIsCustomModel(true);
                    setFormData((prev) => ({ ...prev, modelName: "" }));
                  } else {
                    setFormData((prev) => ({ ...prev, modelName: e.target.value }));
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 cursor-pointer"
                required
              >
                <option value="">-- Choose Model for {formData.category} --</option>
                {(CATEGORY_MODEL_PRESETS[formData.category] || []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
                <option value="__custom__">+ Other / Custom Model...</option>
              </select>
            ) : (
              <input
                key="custom-vehicle-model-input"
                type="text"
                placeholder="Type custom vehicle model name..."
                value={formData.modelName || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                autoFocus
                required
              />
            )}
          </div>

          {/* STEP 3: SEATING CAPACITY & FUEL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Seating Capacity <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.seatingCapacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, seatingCapacity: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {SEATING_PRESETS.map((seat) => (
                  <option key={seat.value} value={seat.value}>
                    {seat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fuel Type
              </label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData((prev) => ({ ...prev, fuelType: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="Petrol + CNG">Petrol + CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* STEP 4: UPLOAD COMMON PHOTO (FILE UPLOAD OR URL) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                4. Common Master Photo <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoMode("upload")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                    photoMode === "upload" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                  }`}
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode("url")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${
                    photoMode === "url" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                  }`}
                >
                  <LinkIcon className="w-3 h-3" /> Image URL
                </button>
              </div>
            </div>

            {/* Permanent hidden file input */}
            <input
              key="common-photo-file-picker"
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Box or URL input */}
            {photoMode === "upload" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 block">
                  {uploadingPhoto ? "Uploading image..." : "Click to select and upload vehicle photo"}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Supports PNG, JPG, WEBP (transparent cutout recommended)
                </span>
              </div>
            ) : (
              <div>
                <input
                  key="common-photo-url-field"
                  type="text"
                  placeholder="https://... or /images/cars/dzire.jpg"
                  value={formData.commonPhotoUrl || ""}
                  onChange={(e) => {
                    const val = e.target.value || "";
                    setFormData((prev) => ({ ...prev, commonPhotoUrl: val }));
                    setPreviewPhoto(val);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>
            )}

            {/* Live Cutout Preview */}
            {previewPhoto && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1.5 overflow-hidden shadow-xs">
                    <img
                      src={previewPhoto}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Common Photo Preview</span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> Ready for customer booking
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPhoto("");
                    setFormData((prev) => ({ ...prev, commonPhotoUrl: "" }));
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? "Saving..." : editingItem ? "Update Model" : "Save Vehicle Model"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
