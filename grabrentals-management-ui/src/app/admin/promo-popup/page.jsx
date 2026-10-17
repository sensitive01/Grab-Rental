"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/adminApi";
import {
  UploadCloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  Trash2,
  Sparkles,
  Info,
  X,
  Phone,
} from "lucide-react";

export default function PromoPopupAdminPage() {
  const [config, setConfig] = useState({
    imageUrl: "/images/promo/grab-welcome-poster-blue.jpg",
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPopupConfig();
  }, []);

  async function fetchPopupConfig() {
    setLoading(true);
    try {
      const res = await adminApi.getPromoPopup();
      if (res?.success && res?.data) {
        setConfig(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch promo popup config from server:", err);
      // Keep initial default
    } finally {
      setLoading(false);
    }
  }

  async function handleFileProcess(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Please select an image file (PNG, JPG, JPEG, WEBP)" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: "error", message: "Image size must be less than 10MB" });
      return;
    }

    setUploading(true);

    // 1. Instant local preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result;

      try {
        const uploadRes = await adminApi.uploadPromoPopupImage(file);
        if (uploadRes?.success && uploadRes?.data) {
          setConfig(uploadRes.data);
          setToast({ type: "success", message: "Promo popup image uploaded successfully!" });
        } else {
          // If server returned another format, save local data URL
          await adminApi.updatePromoPopup({ imageUrl: dataUrl, active: true });
          setConfig({ imageUrl: dataUrl, active: true });
          setToast({ type: "success", message: "Promo image updated!" });
        }
      } catch (err) {
        console.warn("Upload failed, attempting data URL sync:", err);
        try {
          await adminApi.updatePromoPopup({ imageUrl: dataUrl, active: true });
          setConfig({ imageUrl: dataUrl, active: true });
          setToast({ type: "success", message: "Promo image saved successfully!" });
        } catch (innerErr) {
          setConfig((prev) => ({ ...prev, imageUrl: dataUrl }));
          setToast({ type: "error", message: err.response?.data?.message || "Failed to upload image to server" });
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  }

  async function handleToggleStatus() {
    setSaving(true);
    try {
      const res = await adminApi.togglePromoPopupStatus();
      if (res?.success && res?.data) {
        setConfig(res.data);
        setToast({
          type: "success",
          message: res.data.active ? "Promo popup is now ACTIVE on customer website" : "Promo popup is now HIDDEN from visitors",
        });
      } else {
        const newActive = !config.active;
        await adminApi.updatePromoPopup({ active: newActive });
        setConfig((prev) => ({ ...prev, active: newActive }));
        setToast({
          type: "success",
          message: newActive ? "Promo popup enabled" : "Promo popup disabled",
        });
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to update popup status" });
    } finally {
      setSaving(false);
    }
  }

  async function handleResetToDefault() {
    if (!confirm("Reset promo popup image back to default poster?")) return;
    setSaving(true);
    try {
      const res = await adminApi.resetPromoPopup();
      if (res?.success && res?.data) {
        setConfig(res.data);
        setToast({ type: "success", message: "Reset to default promotional poster" });
      }
    } catch (err) {
      setToast({ type: "error", message: "Failed to reset image" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <PageHeader
        title="Welcome Promo Popup"
        subtitle="Upload and manage the promotional popup image displayed to visitors on the customer homepage"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Promo Popup" },
        ]}
      />

      {/* Main Grid: Upload & Settings on Left, Live Customer Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Status & Visibility Card */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Popup Visibility
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Turn the homepage promotional popup on or off
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={saving || loading}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.active ? "bg-amber-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.active ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold">
              {config.active ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active — Shown to first-time website visitors
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  <XCircle className="w-3.5 h-3.5" />
                  Disabled — Hidden from all website visitors
                </span>
              )}
            </div>
          </Card>

          {/* Upload Image Card */}
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                  Upload Popup Image
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your promo flyer/poster. The popup will display this image directly.
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? "border-amber-500 bg-amber-50/60 scale-[1.01]"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileProcess(e.target.files?.[0])}
                />

                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  {uploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {uploading ? "Uploading Image..." : "Click to select or drag & drop image here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, JPEG, WEBP (Max: 10MB)
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={uploading}
                  className="mt-2 pointer-events-none"
                >
                  Browse Image
                </Button>
              </div>

              {/* Instructions Banner */}
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Tips for best appearance:</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Square (1:1) or 4:5 aspect ratio posters look best. Keep text, logo, and phone numbers clear inside the flyer graphics.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={saving || uploading}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset to Default Poster
                </button>

                {config.imageUrl && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Replace Image
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Modal Simulation */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              Live Website Popup Preview
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Interactive Simulation
            </span>
          </div>

          {/* Device Mockup Canvas */}
          <div className="relative rounded-3xl bg-slate-900/90 p-4 sm:p-6 flex items-center justify-center min-h-[460px] overflow-hidden shadow-2xl border border-slate-800">
            {/* Background Blur Backdrop Simulation */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

            {/* Popup Modal Box (2-Column Layout matching Website) */}
            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200 group">
              {/* Floating Close Button */}
              <div className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/65 text-white flex items-center justify-center shadow-md">
                <X className="w-3.5 h-3.5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {/* Left Side: Uploaded Poster Image */}
                <div className="relative bg-gradient-to-b from-sky-50/30 via-slate-50 to-white flex items-center justify-center p-3 border-b sm:border-b-0 sm:border-r border-slate-100">
                  <div className="relative w-full aspect-square drop-shadow-sm rounded-xl overflow-hidden flex items-center justify-center">
                    {config.imageUrl ? (
                      <img
                        src={config.imageUrl}
                        alt="Promo Popup Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="p-4 text-center text-slate-400">
                        <UploadCloud className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <p className="text-[10px] font-bold">No Image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Details & Actions */}
                <div className="p-4 sm:p-5 flex flex-col justify-center text-center sm:text-left bg-white">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Grab Rentals
                  </h4>

                  <p className="text-xs font-bold text-amber-600 mt-0.5">
                    Your 365 Days Travel Partner
                  </p>

                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    For your comfort in every happy mile
                  </p>

                  <div className="my-3 border-t border-slate-200 border-dashed"></div>

                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      24/7 Helpline &amp; Instant Booking
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      Ph: (+91) 9071 100 200
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500 text-white font-bold text-[11px] shadow-xs">
                      <Phone className="w-3 h-3" />
                      <span>Call Now</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 text-white font-bold text-[11px] shadow-xs">
                      <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500 font-medium">
            This popup displays centered on the screen with a dark backdrop and close button when visitors first land on Grab Rentals.
          </p>
        </div>
      </div>
    </div>
  );
}
