"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  Trash2, 
  Plus, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Car,
  Armchair,
  Check,
  X,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

export const EXTERIOR_SLOTS = [
  { id: "front", label: "Front View", subtitle: "Front bumper, grille & plate", required: true },
  { id: "back", label: "Back View", subtitle: "Rear boot, glass & taillights", required: true },
  { id: "left", label: "Left Side", subtitle: "Full left side profile", required: true },
  { id: "right", label: "Right Side", subtitle: "Full right side profile", required: true },
  { id: "luggage", label: "Luggage Carrier", subtitle: "Roof rack or carrier (optional)", required: false },
];

export const INTERIOR_SLOTS = [
  { id: "frontSeats", label: "Front Seats", subtitle: "Driver & co-passenger seats", required: true },
  { id: "backSeats", label: "Back Seats", subtitle: "Rear passenger cabin & legroom", required: true },
  { id: "handle", label: "Handle & Steering", subtitle: "Steering wheel & dashboard", required: true },
];

export default function MultipleVehiclePhotoUploader({
  photos = [],
  photoSlots = {},
  onChange,
  onSlotsChange,
  className = ""
}) {
  // Normalize slots from photoSlots prop or photos array
  const [slots, setSlots] = useState(() => {
    const initial = {
      front: photoSlots.front || photos[0] || "",
      back: photoSlots.back || photos[1] || "",
      left: photoSlots.left || photos[2] || "",
      right: photoSlots.right || photos[3] || "",
      luggage: photoSlots.luggage || photos[7] || "",
      frontSeats: photoSlots.frontSeats || photos[4] || "",
      backSeats: photoSlots.backSeats || photos[5] || "",
      handle: photoSlots.handle || photos[6] || "",
    };
    return initial;
  });

  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRefs = useRef({});

  // Sync when parent updates photoSlots
  const currentSlots = {
    front: photoSlots.front !== undefined ? photoSlots.front : slots.front,
    back: photoSlots.back !== undefined ? photoSlots.back : slots.back,
    left: photoSlots.left !== undefined ? photoSlots.left : slots.left,
    right: photoSlots.right !== undefined ? photoSlots.right : slots.right,
    luggage: photoSlots.luggage !== undefined ? photoSlots.luggage : slots.luggage,
    frontSeats: photoSlots.frontSeats !== undefined ? photoSlots.frontSeats : slots.frontSeats,
    backSeats: photoSlots.backSeats !== undefined ? photoSlots.backSeats : slots.backSeats,
    handle: photoSlots.handle !== undefined ? photoSlots.handle : slots.handle,
  };

  const isAnyUploading = Boolean(uploadingSlot);

  const handleSlotUpload = async (slotId, file) => {
    if (!file) return;

    setUploadingSlot(slotId);
    try {
      const url = await uploadSignedToCloudinary(file, "grabrentals/vehicles", null, "grabrentals_vehicles");
      if (url) {
        const nextSlots = { ...currentSlots, [slotId]: url };
        setSlots(nextSlots);
        
        // Build clean ordered photos array (front view is cover/first)
        const orderedPhotos = [
          nextSlots.front,
          nextSlots.back,
          nextSlots.left,
          nextSlots.right,
          nextSlots.frontSeats,
          nextSlots.backSeats,
          nextSlots.handle,
          nextSlots.luggage,
        ].filter(Boolean);

        if (onChange) onChange(orderedPhotos, nextSlots);
        if (onSlotsChange) onSlotsChange(nextSlots);
      }
    } catch (err) {
      console.error(`Failed to upload ${slotId} vehicle photo:`, err);
      alert("Failed to upload photo. Please check your network and try again.");
    } finally {
      setUploadingSlot(null);
      if (fileInputRefs.current[slotId]) {
        fileInputRefs.current[slotId].value = "";
      }
    }
  };

  const handleRemoveSlot = (slotId) => {
    const nextSlots = { ...currentSlots, [slotId]: "" };
    setSlots(nextSlots);

    const orderedPhotos = [
      nextSlots.front,
      nextSlots.back,
      nextSlots.left,
      nextSlots.right,
      nextSlots.frontSeats,
      nextSlots.backSeats,
      nextSlots.handle,
      nextSlots.luggage,
    ].filter(Boolean);

    if (onChange) onChange(orderedPhotos, nextSlots);
    if (onSlotsChange) onSlotsChange(nextSlots);
  };

  // Counts
  const exteriorCompulsoryCount = EXTERIOR_SLOTS.filter(s => s.required && currentSlots[s.id]).length;
  const interiorCompulsoryCount = INTERIOR_SLOTS.filter(s => s.required && currentSlots[s.id]).length;
  const totalCompulsoryDone = exteriorCompulsoryCount + interiorCompulsoryCount;
  const allCompulsoryDone = totalCompulsoryDone === 7;

  const renderSlotCard = (slot, index) => {
    const imgUrl = currentSlots[slot.id];
    const isThisUploading = uploadingSlot === slot.id;
    const isOtherUploading = isAnyUploading && !isThisUploading;

    return (
      <div 
        key={slot.id}
        className={cn(
          "relative group rounded-2xl border transition-all overflow-hidden flex flex-col justify-between",
          imgUrl 
            ? "border-emerald-300 bg-slate-900 shadow-xs" 
            : slot.required 
              ? "border-slate-300 bg-white hover:border-amber-500 hover:shadow-xs" 
              : "border-slate-200 bg-slate-50/70 hover:border-slate-300",
          isOtherUploading && "opacity-55 pointer-events-none"
        )}
        style={{ minHeight: "180px" }}
      >
        <input
          ref={(el) => (fileInputRefs.current[slot.id] = el)}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple={false}
          disabled={isAnyUploading}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleSlotUpload(slot.id, file);
          }}
        />

        {imgUrl ? (
          /* Uploaded Photo State */
          <>
            <img 
              src={imgUrl} 
              alt={slot.label} 
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-black/60 pointer-events-none" />

            {/* Top Bar with Slot Name & Status */}
            <div className="relative z-10 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-md bg-white/20 backdrop-blur-xs text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap">
                  <Check className="w-2.5 h-2.5 stroke-[3]" /> Proof Added
                </span>
              </div>
              <span className="text-xs font-bold text-white drop-shadow-md block leading-tight">
                {slot.label}
              </span>
            </div>

            {/* Actions: Icon-Only (View, Change, Delete) */}
            <div className="relative z-10 p-2 mt-auto flex items-center justify-center gap-2 bg-black/50 backdrop-blur-xs rounded-xl mx-2.5 mb-2.5 border border-white/10">
              <button
                type="button"
                onClick={() => setPreviewImage(imgUrl)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="View full-size photo proof"
                aria-label="View photo proof"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                disabled={isAnyUploading}
                onClick={() => fileInputRefs.current[slot.id]?.click()}
                className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs disabled:opacity-50"
                title="Change photo proof"
                aria-label="Change photo proof"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                disabled={isAnyUploading}
                onClick={() => handleRemoveSlot(slot.id)}
                className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs disabled:opacity-50"
                title="Delete photo proof"
                aria-label="Delete photo proof"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </>
        ) : (
          /* Empty / Upload Slot State */
          <div 
            onClick={() => {
              if (!isAnyUploading) {
                fileInputRefs.current[slot.id]?.click();
              }
            }}
            className={cn(
              "p-3.5 h-full flex flex-col justify-between select-none transition-colors",
              isAnyUploading ? "cursor-not-allowed" : "cursor-pointer"
            )}
          >
            {/* Top: Slot Number, Requirement Badge & Full Label */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                {slot.required ? (
                  <span className="inline-flex items-center justify-center font-bold text-rose-600 bg-rose-50 border border-rose-200/90 w-5 h-5 rounded-full text-xs shrink-0">
                    *
                  </span>
                ) : (
                  <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    Optional
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  {slot.label}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight" title={slot.subtitle}>
                  {slot.subtitle}
                </span>
              </div>
            </div>

            {/* Center: Upload Trigger Box */}
            <div className="py-3 flex flex-col items-center justify-center">
              {isThisUploading ? (
                <div className="flex flex-col items-center gap-1.5 text-amber-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[11px] font-bold animate-pulse">Uploading Proof...</span>
                </div>
              ) : isOtherUploading ? (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-[11px] font-medium">Wait for upload...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600 group-hover:text-amber-700 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-amber-400 group-hover:bg-amber-50 flex items-center justify-center shadow-2xs transition-colors">
                    <Plus className="w-4 h-4 text-amber-600 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold">Add Photo</span>
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div className="text-[10px] text-slate-400 text-center">
              JPG, PNG or WEBP
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Header & Status Overview */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Vehicle Inspection Photos
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Clear visual verification helps customers book with 100% confidence.
          </p>
        </div>

        {/* Global Compulsory Progress Pill */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 transition-colors",
            allCompulsoryDone
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-amber-50 text-amber-800 border-amber-300"
          )}>
            {allCompulsoryDone ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All 7 Photos Added *
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {totalCompulsoryDone}/7 Photos Added *
              </>
            )}
          </span>
        </div>
      </div>

      {/* Informative Guidance Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black mt-0.5 shadow-2xs">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-amber-950 space-y-0.5">
          <p className="font-extrabold text-amber-950">
            Upload Angle Proofs One by One
          </p>
          <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
            Please select each angle slot below to upload photo proofs individually. Only one file is uploaded at a time to ensure maximum clarity and verification.
          </p>
        </div>
      </div>

      {/* SECTION 1: EXTERIOR PHOTOS */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              1. Exterior Photos (5 Angles)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className={cn(
              "font-bold px-2.5 py-0.5 rounded-full border",
              exteriorCompulsoryCount === 4
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-amber-100 text-amber-800 border-amber-300"
            )}>
              {exteriorCompulsoryCount}/4 *
            </span>
            <span className="text-slate-400 font-medium">
              • Luggage carrier is optional
            </span>
          </div>
        </div>

        {/* Responsive Grid with proper widths to prevent clipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {EXTERIOR_SLOTS.map((slot, idx) => renderSlotCard(slot, idx))}
        </div>
      </div>

      {/* SECTION 2: INTERIOR PHOTOS */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              2. Interior Photos (3 Angles)
            </span>
          </div>
          <span className={cn(
            "text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
            interiorCompulsoryCount === 3
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-amber-100 text-amber-800 border-amber-300"
          )}>
            {interiorCompulsoryCount}/3 *
          </span>
        </div>

        {/* Responsive Grid for 3 Interior slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {INTERIOR_SLOTS.map((slot, idx) => renderSlotCard(slot, idx))}
        </div>
      </div>

      {/* Full-size Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Vehicle Inspection Proof Preview" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
