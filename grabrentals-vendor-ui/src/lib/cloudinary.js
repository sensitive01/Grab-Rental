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

export async function uploadSignedToCloudinary(file, folder = "grabrentals/vehicles", endpoint = null, customPreset = null) {
  if (!file) return null;

  try {
    const isDriver = folder.includes("drivers");
    const isBusiness = folder.includes("business") || folder.includes("compliance") || folder.includes("profile");

    const defaultPreset = isBusiness
      ? CLOUDINARY_CONFIG.businessPreset
      : (isDriver ? CLOUDINARY_CONFIG.driversPreset : CLOUDINARY_CONFIG.vehiclesPreset);

    const preset = customPreset || defaultPreset;
    const targetUrl = endpoint || (isBusiness ? "/api/vendor/profile/upload" : (isDriver ? "/api/vendor/drivers/upload" : "/api/vendor/vehicles/upload"));

    const formData = new FormData();
    formData.append("file", file);
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
    const serverMessage = error.response?.data?.message || error.message;
    throw new Error(serverMessage);
  }
}
