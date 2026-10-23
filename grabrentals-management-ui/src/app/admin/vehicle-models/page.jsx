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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { FormattedTextarea } from "@/components/ui/FormattedTextarea";
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
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [photoMode, setPhotoMode] = useState("upload"); // 'upload' or 'url'
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const fileInputRef = useRef(null);

  const [categoryPresets, setCategoryPresets] = useState({});

  // Preset categories from database for modal dropdowns
  const dynamicCategories = useMemo(() => {
    const presetCats = Object.keys(categoryPresets);
    if (presetCats.length > 0) {
      return presetCats;
    }
    const set = new Set();
    models.forEach((m) => {
      if (m.category && m.category.trim()) {
        set.add(m.category.trim());
      }
    });
    return Array.from(set);
  }, [categoryPresets, models]);

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    modelName: "",
    seatingCapacity: "4",
    fuelType: "Diesel",
    description: "",
    commonPhotoUrl: "",
    active: true,
  });

  // Dynamic models available for currently selected category in form dropdown
  const availableModelsForCategory = useMemo(() => {
    if (!formData.category) return [];
    const fromPresets = categoryPresets[formData.category];
    if (fromPresets && Array.isArray(fromPresets) && fromPresets.length > 0) {
      return fromPresets;
    }
    const set = new Set();
    models
      .filter((m) => m.category?.toLowerCase() === formData.category.toLowerCase())
      .forEach((m) => {
        if (m.modelName && m.modelName.trim()) {
          set.add(m.modelName.trim());
        }
      });
    return Array.from(set);
  }, [categoryPresets, models, formData.category]);

  async function loadPresets() {
    try {
      const data = await adminApi.getCategoryPresets();
      if (data && typeof data === "object") {
        setCategoryPresets(data);
      }
    } catch (err) {
      console.warn("Failed to load category presets:", err);
    }
  }

  async function loadModels() {
    try {
      setLoading(true);
      const res = await adminApi.getModelConfigs();
      setModels(res.data || []);
    } catch (err) {
      console.error("Failed to load vehicle models:", err);
      setToast({ type: "error", message: "Failed to load vehicle model configurations" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadModels();
    loadPresets();
  }, []);

  function handleOpenCreate() {
    setEditingItem(null);
    const defaultCat = dynamicCategories[0] || "Sedan";
    const matchingModels = categoryPresets[defaultCat] || [];
    setFormData({
      category: defaultCat,
      modelName: matchingModels[0] || "",
      seatingCapacity: "4",
      fuelType: "Diesel",
      description: "",
      commonPhotoUrl: "",
      active: true,
    });
    setIsCustomCategory(false);
    setIsCustomModel(false);
    setPreviewPhoto("");
    setPhotoMode("upload");
    setIsModalOpen(true);
  }

  function handleStartEdit(item) {
    setEditingItem(item);
    const cat = item.category || dynamicCategories[0] || "";
    const matchingModels = categoryPresets[cat] || [];
    const isKnownModel = matchingModels.includes(item.modelName);
    const isKnownCat = dynamicCategories.includes(cat);

    setFormData({
      id: item.id,
      category: cat,
      modelName: item.modelName || "",
      seatingCapacity: item.seatingCapacity || "4",
      fuelType: item.fuelType || "Diesel",
      description: item.description || "",
      commonPhotoUrl: item.commonPhotoUrl || "",
      active: item.active ?? true,
    });
    setIsCustomCategory(!isKnownCat);
    setIsCustomModel(!isKnownModel && Boolean(item.modelName));
    setPreviewPhoto(item.commonPhotoUrl || "");
    setPhotoMode(item.commonPhotoUrl ? "url" : "upload");
    setIsModalOpen(true);
  }

  function handleDeleteCategory(categoryToDelete) {
    if (!categoryToDelete) return;

    setConfirmDialog({
      title: `Delete Category: "${categoryToDelete}"`,
      message: `Are you sure you want to delete category "${categoryToDelete}" and its models from the database dropdown presets?`,
      confirmText: "Delete Category",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminApi.deleteCategoryPreset(categoryToDelete);
          setToast({ type: "success", message: `Category "${categoryToDelete}" deleted from dropdown presets` });

          await loadPresets();

          const remainingCats = Object.keys(categoryPresets).filter((c) => c !== categoryToDelete);
          const nextCat = remainingCats[0] || "";
          const nextModels = categoryPresets[nextCat] || [];

          setFormData((prev) => ({
            ...prev,
            category: nextCat,
            modelName: nextModels[0] || "",
          }));
        } catch (err) {
          console.error("Failed to delete category preset:", err);
          setToast({ type: "error", message: `Failed to delete category preset: ${err.message}` });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  }

  function handleDeleteModel(currentCategory, modelToDelete) {
    if (!modelToDelete || !currentCategory) return;

    setConfirmDialog({
      title: `Delete Model: "${modelToDelete}"`,
      message: `Are you sure you want to delete model "${modelToDelete}" in category "${currentCategory}" from database dropdown presets?`,
      confirmText: "Delete Model",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminApi.deleteModelPreset(currentCategory, modelToDelete);
          setToast({ type: "success", message: `Model "${modelToDelete}" deleted from dropdown presets` });

          await loadPresets();

          const remainingInCat = (categoryPresets[currentCategory] || []).filter(
            (m) => m.toLowerCase() !== modelToDelete.toLowerCase()
          );

          setFormData((prev) => ({
            ...prev,
            modelName: remainingInCat[0] || "",
          }));
        } catch (err) {
          console.error("Failed to delete model preset:", err);
          setToast({ type: "error", message: `Failed to delete model preset: ${err.message}` });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  }

  const [savingCategory, setSavingCategory] = useState(false);
  const [savingModel, setSavingModel] = useState(false);

  async function handleSaveCategory() {
    const catName = formData.category?.trim();
    if (!catName) {
      setToast({ type: "error", message: "Please enter a category name first" });
      return;
    }

    try {
      setSavingCategory(true);
      await adminApi.addCategoryPreset(
        catName,
        formData.modelName?.trim() || "",
        formData.seatingCapacity || "4",
        formData.fuelType || "Diesel"
      );
      await loadPresets();

      setIsCustomCategory(false);
      setFormData((prev) => ({ ...prev, category: catName }));
      setToast({
        type: "success",
        message: `Category "${catName}" saved to database dropdowns successfully!`,
      });
    } catch (err) {
      console.error("Failed to save category preset:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || `Failed to save category "${catName}" to database`,
      });
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleSaveModel() {
    const modName = formData.modelName?.trim();
    const catName = formData.category?.trim();
    if (!catName) {
      setToast({ type: "error", message: "Please select or enter a category first" });
      return;
    }
    if (!modName) {
      setToast({ type: "error", message: "Please enter a model name first" });
      return;
    }

    try {
      setSavingModel(true);
      await adminApi.addCategoryPreset(
        catName,
        modName,
        formData.seatingCapacity || "4",
        formData.fuelType || "Diesel"
      );
      await loadPresets();

      setIsCustomModel(false);
      setFormData((prev) => ({
        ...prev,
        modelName: modName,
      }));
      setToast({
        type: "success",
        message: `Model "${modName}" added to "${catName}" dropdown in database!`,
      });
    } catch (err) {
      console.error("Failed to save model preset:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || `Failed to save model "${modName}" to database`,
      });
    } finally {
      setSavingModel(false);
    }
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

  function handleDelete(item) {
    setConfirmDialog({
      title: `Delete Model: "${item.modelName}"`,
      message: `Are you sure you want to remove model "${item.modelName} (${item.seatingCapacity} Seater)" from the master catalog?`,
      confirmText: "Delete Model",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminApi.deleteModelConfig(item.id);
          setToast({ type: "success", message: `Model "${item.modelName}" deleted successfully` });
          loadModels();
        } catch (err) {
          setToast({ type: "error", message: "Failed to delete vehicle model" });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  }

  function handleClearAll() {
    setConfirmDialog({
      title: "Remove All Vehicle Models",
      message: "Are you sure you want to remove all vehicle models from the catalog? This will completely clear the master vehicle catalog.",
      confirmText: "Remove All",
      variant: "danger",
      onConfirm: async () => {
        try {
          await adminApi.deleteAllModels();
          setToast({ type: "success", message: "All vehicle models removed" });
          loadModels();
        } catch (err) {
          setToast({ type: "error", message: "Failed to clear vehicle models" });
        } finally {
          setConfirmDialog(null);
        }
      },
    });
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
    return ["ALL", ...dynamicCategories];
  }, [dynamicCategories]);

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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${selectedCategory === cat
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
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${viewMode === "table"
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
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${viewMode === "grid"
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
                    {item.description ? (
                      <div className="text-[11px] text-slate-600 line-clamp-1 max-w-xs font-normal mt-0.5" title={item.description}>
                        {item.description.replace(/[•\*\#\[\]]/g, "").trim()}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-medium">Master Catalog Asset</div>
                    )}
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

                  {item.description && (
                    <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100 line-clamp-2 leading-relaxed" title={item.description}>
                      {item.description.replace(/[•\*\#\[\]]/g, "").trim()}
                    </div>
                  )}
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
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STEP 1: CATEGORY */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                1. Vehicle Category <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {!isCustomCategory && formData.category && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(formData.category)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 cursor-pointer hover:bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                    title={`Delete category "${formData.category}"`}
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Delete Category</span>
                  </button>
                )}
                {!isCustomCategory ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(true);
                      setFormData((prev) => ({ ...prev, category: "", modelName: "" }));
                      setIsCustomModel(true);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    + Add Category
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      const defaultCat = dynamicCategories[0] || "";
                      const matchingModels = categoryPresets[defaultCat] || [];
                      setFormData((prev) => ({
                        ...prev,
                        category: defaultCat,
                        modelName: matchingModels[0] || "",
                      }));
                      setIsCustomModel(false);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    ← Select from Dropdown
                  </button>
                )}
              </div>
            </div>

            {!isCustomCategory ? (
              <select
                value={formData.category}
                onChange={(e) => {
                  if (e.target.value === "__custom_category__") {
                    setIsCustomCategory(true);
                    setFormData((prev) => ({ ...prev, category: "", modelName: "" }));
                    setIsCustomModel(true);
                    return;
                  }
                  const cat = e.target.value;
                  const matchingModels = categoryPresets[cat] || [];
                  setFormData((prev) => ({
                    ...prev,
                    category: cat,
                    modelName: prev.modelName && matchingModels.includes(prev.modelName) ? prev.modelName : (matchingModels[0] || ""),
                  }));
                }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {dynamicCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom_category__">+ Add New Category...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  key="custom-vehicle-category-input"
                  type="text"
                  placeholder="Type new vehicle category (e.g. Luxury, Electric, Convertible)..."
                  value={formData.category || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveCategory();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  disabled={savingCategory || !formData.category?.trim()}
                  onClick={handleSaveCategory}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  title="Save this category to database"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  {savingCategory ? "Saving..." : "Save Category"}
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: MODEL NAME DROPDOWN */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                2. Vehicle Model Name <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {!isCustomModel && formData.modelName && (
                  <button
                    type="button"
                    onClick={() => handleDeleteModel(formData.category, formData.modelName)}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 cursor-pointer hover:bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
                    title={`Delete model "${formData.modelName}"`}
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Delete Model</span>
                  </button>
                )}
                {!isCustomModel ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomModel(true);
                      setFormData((prev) => ({ ...prev, modelName: "" }));
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    + Custom Model
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomModel(false);
                      setFormData((prev) => ({ ...prev, modelName: availableModelsForCategory[0] || "" }));
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    ← Select from Dropdown
                  </button>
                )}
              </div>
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
                <option value="">-- Choose Model for {formData.category || "Category"} --</option>
                {availableModelsForCategory.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
                <option value="__custom__">+ Other / Custom Model...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  key="custom-vehicle-model-input"
                  type="text"
                  placeholder="Type custom vehicle model name..."
                  value={formData.modelName || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, modelName: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveModel();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                  autoFocus={isCustomCategory ? false : true}
                  required
                />
                <button
                  type="button"
                  disabled={savingModel || !formData.modelName?.trim()}
                  onClick={handleSaveModel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  title="Save this model to database"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  {savingModel ? "Saving..." : "Save Model"}
                </button>
              </div>
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

          {/* STEP 4: DESCRIPTION */}
          <div>
            <FormattedTextarea
              label="4. Description"
              value={formData.description || ""}
              onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
              placeholder="Add vehicle model highlights, boot space, luxury amenities, or passenger suitability..."
              rows={3}
            />
          </div>

          {/* STEP 5: UPLOAD COMMON PHOTO (FILE UPLOAD OR URL) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                5. Common Master Photo <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoMode("upload")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${photoMode === "upload" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
                    }`}
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode("url")}
                  className={`px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${photoMode === "url" ? "bg-white text-blue-600 shadow-xs" : "text-slate-600"
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

      {/* CONFIRMATION POPUP DIALOG */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={Boolean(confirmDialog)}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText || "Cancel"}
          variant={confirmDialog.variant || "danger"}
          loading={confirmDialog.loading}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
