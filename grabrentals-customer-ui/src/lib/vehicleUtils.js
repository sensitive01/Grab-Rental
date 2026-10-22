import { customerApi } from "./customerApi";

let adminModelsCache = [];
let fetchPromise = null;

export function setAdminVehicleModels(models) {
  if (Array.isArray(models)) {
    adminModelsCache = models;
  }
}

export async function fetchAndCacheAdminVehicleModels() {
  if (adminModelsCache.length > 0) return adminModelsCache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = customerApi.getVehicleModels()
    .then((res) => {
      if (res?.success && Array.isArray(res.data)) {
        adminModelsCache = res.data;
        return adminModelsCache;
      }
      return [];
    })
    .catch((err) => {
      console.warn("Could not load admin vehicle models:", err);
      return [];
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Resolves vehicle model name and verified fleet image thumbnail
 * prioritizing admin-configured models (VehicleModelConfig) uploaded in Admin.
 */
export function resolveCarModelAndImage(booking, modelsList = adminModelsCache) {
  if (!booking) {
    return {
      modelName: "WagonR",
      carImage: "/images/cars/wagon_r.jpg",
      categoryLabel: "HATCHBACK • AC"
    };
  }

  // 1. Determine Model Name & Image from booking attributes or specialInstructions
  let modelName = booking.vehicleModel || booking.assignedVehicle?.model;
  let carImage = booking.vehicleImage || booking.assignedVehicle?.image || booking.assignedVehicle?.imageUrl;

  if (booking.specialInstructions) {
    if (!modelName) {
      const match = booking.specialInstructions.match(/Vehicle:\s*([^|]+)/i);
      if (match && match[1]?.trim() && !match[1].trim().toLowerCase().includes("fleet")) {
        modelName = match[1].trim();
      }
    }
    if (!carImage) {
      const imgMatch = booking.specialInstructions.match(/Image:\s*([^|]+)/i);
      if (imgMatch && imgMatch[1]?.trim() && (imgMatch[1].trim().startsWith("http") || imgMatch[1].trim().startsWith("/"))) {
        carImage = imgMatch[1].trim();
      }
    }
  }

  const category = (booking.vehicleCategory || "").toUpperCase();
  const models = Array.isArray(modelsList) && modelsList.length > 0 ? modelsList : adminModelsCache;

  // 2. Match with admin-configured Vehicle Models (from Admin > Vehicle Models)
  if (models && models.length > 0) {
    let matchedConfig = null;
    if (modelName) {
      const mLower = modelName.toLowerCase();
      matchedConfig = models.find((m) =>
        m.active !== false && (
          m.modelName?.toLowerCase() === mLower ||
          mLower.includes(m.modelName?.toLowerCase()) ||
          m.modelName?.toLowerCase().includes(mLower)
        )
      );
    }
    if (!matchedConfig && category) {
      matchedConfig = models.find((m) =>
        m.active !== false && m.category?.toUpperCase() === category
      );
    }

    if (matchedConfig) {
      if (!modelName) {
        modelName = matchedConfig.modelName;
      }
      if (!carImage && matchedConfig.commonPhotoUrl) {
        carImage = matchedConfig.commonPhotoUrl;
      }
    }
  }

  // 3. Fallback defaults if not matched yet
  if (!modelName) {
    if (category.includes("HATCHBACK")) {
      modelName = "WagonR";
    } else if (category.includes("SEDAN")) {
      modelName = "Dzire";
    } else if (category.includes("SUV_6") || category.includes("ERTIGA")) {
      modelName = "Ertiga";
    } else if (category.includes("SUV_7") || category.includes("INNOVA")) {
      modelName = "Innova Crysta";
    } else if (category.includes("TEMPO")) {
      modelName = "Force Tempo Traveller";
    } else if (category.includes("BUS")) {
      modelName = "Luxury Mini Bus";
    } else {
      modelName = `${category ? category.replace(/_/g, " ") : "Sedan"} Cab`;
    }
  }

  // 4. Fallback photo if no admin uploaded photo is present
  if (!carImage || typeof carImage !== "string" || carImage.includes("blob:")) {
    const titleLower = modelName.toLowerCase();
    const catLower = category.toLowerCase();

    if (titleLower.includes("innova") || titleLower.includes("crysta") || titleLower.includes("hycross") || catLower.includes("suv_7")) {
      carImage = "/images/cars/innova.jpg";
    } else if (titleLower.includes("ertiga") || titleLower.includes("carens") || titleLower.includes("rumion") || catLower.includes("suv_6")) {
      carImage = "/images/cars/ertiga.jpg";
    } else if (titleLower.includes("s-presso") || titleLower.includes("spresso")) {
      carImage = "/images/cars/spresso-clean.jpg";
    } else if (titleLower.includes("wagon") || titleLower.includes("celerio") || titleLower.includes("tiago") || titleLower.includes("alto") || catLower.includes("hatchback")) {
      carImage = "/images/cars/wagon_r.jpg";
    } else {
      carImage = "/images/cars/dzire.jpg";
    }
  }

  const categoryLabel = booking.vehicleType || `${(category || "Outstation").replace(/_/g, " ")} • AC`;

  return { modelName, carImage, categoryLabel };
}

/**
 * Formats vehicle title: displays the exact model name configured in Admin.
 * If rawTitle is provided, it returns it directly as configured.
 */
export function formatVehicleSavaariTitle(rawTitle = "", category = "", vehicleType = "") {
  // Return exact name configured in Admin if present:
  if (rawTitle && typeof rawTitle === "string" && rawTitle.trim()) {
    return rawTitle.replace(/\s+or\s+Equivalent$/i, "").trim();
  }

  /*
  // --- PREVIOUS HARDCODED LOGIC (Preserved as comment) ---
  let cleaned = (rawTitle || "").replace(/\s+or\s+(Equivalent|Similar)/i, "").trim();
  const lower = cleaned.toLowerCase();

  // If specific model is identified in the title, present that model name with "or Similar"
  if (lower.includes("wagon") || lower.includes("wagonr") || lower.includes("wagon-r")) {
    return "WagonR or Similar";
  }
  if (lower.includes("swift")) {
    return "Swift or Similar";
  }
  if (lower.includes("celerio")) {
    return "Celerio or Similar";
  }
  if (lower.includes("tiago")) {
    return "Tiago or Similar";
  }
  if (lower.includes("alto")) {
    return "Alto or Similar";
  }
  if (lower.includes("dzire")) {
    return "Dzire or Similar";
  }
  if (lower.includes("etios")) {
    return "Etios or Similar";
  }
  if (lower.includes("aura")) {
    return "Aura or Similar";
  }
  if (lower.includes("amaze")) {
    return "Amaze or Similar";
  }
  if (lower.includes("hycross")) {
    return "Innova Hycross or Similar";
  }
  if (lower.includes("crysta")) {
    return "Innova Crysta or Similar";
  }
  if (lower.includes("innova")) {
    return "Innova or Similar";
  }
  if (lower.includes("ertiga") || lower.includes("ertica")) {
    return "Ertiga or Similar";
  }
  if (lower.includes("carens")) {
    return "Carens or Similar";
  }
  if (lower.includes("rumion")) {
    return "Rumion or Similar";
  }
  if (lower.includes("xylo")) {
    return "Xylo or Similar";
  }
  if (lower.includes("urbania")) {
    return "Force Urbania or Similar";
  }
  if (lower.includes("tempo") || lower.includes("traveller")) {
    return "Tempo Traveller or Similar";
  }
  if (lower.includes("bus")) {
    return "Mini Bus or Coach";
  }

  // If cleaned is an actual model name (not just generic "Hatchback", "Sedan", "SUV", "Vehicle", "Standard Fleet")
  const genericTerms = ["hatchback", "sedan", "suv", "vehicle", "standard fleet", "fleet", "car", "cab"];
  if (cleaned && !genericTerms.includes(lower)) {
    return `${cleaned} or Similar`;
  }
  */

  // Fallback to Category-level bundled titles if no title provided
  const combined = `${rawTitle || ""} ${category || ""} ${vehicleType || ""}`.toLowerCase();
  if (combined.includes("hycross") || combined.includes("crysta") || combined.includes("innova")) {
    return "Crysta, Hycross or Similar";
  }
  if (combined.includes("ertiga") || combined.includes("xylo") || combined.includes("carens") || combined.includes("suv")) {
    return "Ertiga, Xylo or Similar";
  }
  if (combined.includes("wagon") || combined.includes("swift") || combined.includes("hatchback")) {
    return "WagonR, Swift or Similar";
  }
  if (combined.includes("dzire") || combined.includes("etios") || combined.includes("sedan")) {
    return "Dzire, Etios, or Similar";
  }
  if (combined.includes("urbania") || combined.includes("tempo") || combined.includes("traveller") || combined.includes("van")) {
    return "Urbania, Tempo Traveller or Similar";
  }
  if (combined.includes("bus")) {
    return "Mini Bus, Coach or Similar";
  }

  return category || vehicleType || "Fleet Vehicle";
}
