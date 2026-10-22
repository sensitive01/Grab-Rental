import axios from "axios";
import { axiosClient } from "./axiosClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pkou5g9a",
  vehiclesPreset: process.env.NEXT_PUBLIC_CLOUDINARY_VEHICLES_PRESET || "grabrentals_vehicles",
  driversPreset: process.env.NEXT_PUBLIC_CLOUDINARY_DRIVERS_PRESET || "grabrentals_drivers",
  businessPreset: process.env.NEXT_PUBLIC_CLOUDINARY_BUSINESS_PRESET || "grabrentals_business",
};

/**
 * Uploads a file (vehicle photo, RC copy, driver document/photo, or business/compliance proof)
 * through the server upload gateway, associating it with the dedicated upload preset.
 *
 * @param {File} file - The file to upload
 * @param {string} folder - Target folder in Cloudinary
 * @param {string} [endpoint] - Custom API endpoint (optional)
 * @param {string} [customPreset] - Custom upload preset override (optional)
 * @returns {Promise<string>} The secure Cloudinary HTTPS URL
 */

/**
 * Compresses an image client-side if it exceeds 800KB.
 * Uses native HTML5 canvas — zero external dependencies.
 */
async function compressImageIfNeeded(file, maxDimension = 1920, quality = 0.8) {
  if (typeof window === "undefined" || !file || !file.type?.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // Already small enough, no compression needed
  if (file.size <= 800 * 1024) {
    return file;
  }

  try {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // Scale down if larger than maxDimension while keeping aspect ratio
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const newName = file.name.replace(/\.[^/.]+$/, ".jpg");
                const compressedFile = new File([blob], newName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.warn("Client-side image compression skipped:", err);
    return file;
  }
}

export async function uploadSignedToCloudinary(file, folder = "grabrentals/vehicles", endpoint = null, customPreset = null) {
  if (!file) return null;

  try {
    // Automatically compress large image files before sending to server/CDN
    const processedFile = await compressImageIfNeeded(file);

    const isDriver = folder.includes("drivers");
    const isBusiness = folder.includes("business") || folder.includes("compliance") || folder.includes("profile");

    const defaultPreset = isBusiness
      ? CLOUDINARY_CONFIG.businessPreset
      : (isDriver ? CLOUDINARY_CONFIG.driversPreset : CLOUDINARY_CONFIG.vehiclesPreset);

    const preset = customPreset || defaultPreset;
    const targetUrl = endpoint || (isBusiness ? "/api/vendor/profile/upload" : (isDriver ? "/api/vendor/drivers/upload" : "/api/vendor/vehicles/upload"));

    const formData = new FormData();
    formData.append("file", processedFile);
    formData.append("folder", folder);
    if (preset) {
      formData.append("preset", preset);
    }

    try {
      const res = await axiosClient.post(targetUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success && res.data?.data?.url) {
        return res.data.data.url;
      }
    } catch (primaryErr) {
      // If primary request failed (e.g. 401 from stale token), attempt unauthenticated gateway upload
      try {
        const publicRes = await axios.post(`${API_BASE_URL}${targetUrl}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 25000,
        });
        if (publicRes.data?.success && publicRes.data?.data?.url) {
          return publicRes.data.data.url;
        }
      } catch (publicErr) {
        // If custom profile endpoint is still restarting, gracefully route through fleet upload with preset
        if (isBusiness && targetUrl === "/api/vendor/profile/upload") {
          const fallbackRes = await axios.post(`${API_BASE_URL}/api/vendor/vehicles/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 25000,
          });
          if (fallbackRes.data?.success && fallbackRes.data?.data?.url) {
            return fallbackRes.data.data.url;
          }
        }
      }
      throw primaryErr;
    }

    throw new Error("Failed to upload file");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error.response?.status === 413) {
      throw new Error("File size exceeds server limit (1MB). Please select a file smaller than 1MB.");
    }
    const serverMessage = error.response?.data?.message || error.message;
    throw new Error(serverMessage || "Failed to upload file");
  }
}
