"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  Plus, 
  Star, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadSignedToCloudinary } from "@/lib/cloudinary";

export default function MultipleVehiclePhotoUploader({
  photos = [],
  onChange,
  maxPhotos = 8,
  label = "Vehicle Photos (Exterior & Interior)",
  subtitle = "Upload multiple photos (front, rear, side profile, dashboard, and passenger seats).",
  className = ""
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = maxPhotos - photos.length;
    if (availableSlots <= 0) {
      alert(`You can upload a maximum of ${maxPhotos} photos.`);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setUploading(true);
    const newUploadedUrls = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(`Uploading ${i + 1} of ${filesToUpload.length}: ${file.name.slice(0, 20)}...`);
        const url = await uploadSignedToCloudinary(file, "grabrentals/vehicles", null, "grabrentals_vehicles");
        if (url) {
          newUploadedUrls.push(url);
        }
      }

      if (newUploadedUrls.length > 0) {
        const updated = [...photos, ...newUploadedUrls];
        if (onChange) onChange(updated);
      }
    } catch (err) {
      console.error("Failed to upload vehicle photos:", err);
      alert("Failed to upload one or more photos. Please try again with valid image files.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (indexToRemove) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    if (onChange) onChange(updated);
  };

  const setAsCover = (indexToCover) => {
    if (indexToCover === 0) return;
    const target = photos[indexToCover];
    const remaining = photos.filter((_, idx) => idx !== indexToCover);
    const updated = [target, ...remaining];
    if (onChange) onChange(updated);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-amber-600" />
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-medium normal-case">
            ({photos.length}/{maxPhotos} Photos Attached)
          </span>
        </label>
        
        {photos.length > 0 && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Multiple Photos Active
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-500">
        {subtitle}
      </p>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Gallery Grid of Uploaded Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs transition-all hover:border-amber-400"
          >
            <img
              src={url}
              alt={`Vehicle Photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

            {/* Cover Photo Badge or 'Set Cover' button */}
            {idx === 0 ? (
              <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                <Star className="w-2.5 h-2.5 fill-slate-950" /> Cover Photo
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAsCover(idx)}
                title="Make this the primary cover photo"
                className="absolute top-2 left-2 text-[9px] font-bold bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 px-1.5 py-0.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                Set Cover
              </button>
            )}

            {/* Remove / Delete Button */}
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              title="Delete Photo"
              className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Bottom Caption / Index */}
            <span className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-slate-300">
              Photo #{idx + 1}
            </span>
          </div>
        ))}

        {/* Upload Slot / Add Another Photo Button */}
        {photos.length < maxPhotos && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer",
              uploading
                ? "border-amber-300 bg-amber-50/50 cursor-wait"
                : "border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 bg-slate-50/60"
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 text-amber-700">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[10px] font-bold leading-tight max-w-[120px] truncate">
                  {uploadProgress || "Uploading..."}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-600 group-hover:text-amber-700">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  <Plus className="w-4 h-4 text-amber-600 stroke-[3]" />
                </div>
                <span className="text-xs font-black text-slate-800">
                  {photos.length === 0 ? "Upload Photos" : "+ Add More"}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  Select multiple files
                </span>
              </div>
            )}
          </button>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
          <span>{uploadProgress || "Processing multiple vehicle photos..."}</span>
        </div>
      )}
    </div>
  );
}
