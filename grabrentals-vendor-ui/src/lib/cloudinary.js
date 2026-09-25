import { axiosClient } from "./axiosClient";

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pkou5g9a",
  vehiclesPreset: process.env.NEXT_PUBLIC_CLOUDINARY_VEHICLES_PRESET || "grabrentals_vehicles",
  driversPreset: process.env.NEXT_PUBLIC_CLOUDINARY_DRIVERS_PRESET || "grabrentals_drivers",
};

/**
 * Uploads a file (vehicle photo, RC copy, or driver document/photo)
 * through the Spring Boot API, associating it with the dedicated upload preset.
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
    const targetUrl = endpoint || (isDriver ? "/api/fleet/drivers/upload" : "/api/fleet/vehicles/upload");
    const preset = customPreset || (isDriver ? CLOUDINARY_CONFIG.driversPreset : CLOUDINARY_CONFIG.vehiclesPreset);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (preset) {
      formData.append("preset", preset);
    }

    const res = await axiosClient.post(targetUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data?.success && res.data?.data?.url) {
      return res.data.data.url;
    }

    throw new Error(res.data?.message || "Failed to upload file to Cloudinary");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    const serverMessage = error.response?.data?.message || error.message;
    throw new Error(serverMessage);
  }
}
