import { axiosClient } from "./axiosClient";

export const DEFAULT_LOCAL_PACKAGES = [
  {
    value: "4hr-40km",
    hours: 4,
    km: 40,
    extraHourRate: 150,
    extraKmRate: 14,
    label: "4 Hours / 40 Kms (Extra: ₹150/hr, ₹14/km)",
  },
  {
    value: "8hr-80km",
    hours: 8,
    km: 80,
    extraHourRate: 150,
    extraKmRate: 14,
    label: "8 Hours / 80 Kms (Extra: ₹150/hr, ₹14/km)",
  },
  {
    value: "12hr-120km",
    hours: 12,
    km: 120,
    extraHourRate: 150,
    extraKmRate: 14,
    label: "12 Hours / 120 Kms (Extra: ₹150/hr, ₹14/km)",
  },
  {
    value: "16hr-160km",
    hours: 16,
    km: 160,
    extraHourRate: 150,
    extraKmRate: 14,
    label: "16 Hours / 160 Kms (Extra: ₹150/hr, ₹14/km)",
  },
  {
    value: "24hr-240km",
    hours: 24,
    km: 240,
    extraHourRate: 150,
    extraKmRate: 14,
    label: "24 Hours / 240 Kms (Extra: ₹150/hr, ₹14/km)",
  },
];

let cachedPackages = null;
let fetchPromise = null;

export function getCachedLocalPackages() {
  return cachedPackages;
}

/**
 * Fetch active local tariffs from backend API and build dynamic package options
 */
export async function fetchLocalPackages(forceRefresh = false) {
  if (!forceRefresh && cachedPackages && cachedPackages.length > 0) return cachedPackages;
  if (!forceRefresh && fetchPromise) return fetchPromise;

  fetchPromise = axiosClient
    .get("/api/vehicles/tariffs")
    .then((res) => {
      const tariffs = res?.data?.data || res?.data || [];
      if (!Array.isArray(tariffs) || tariffs.length === 0) {
        cachedPackages = DEFAULT_LOCAL_PACKAGES;
        return cachedPackages;
      }

      // Filter LOCAL or HOURLY tariffs
      const localTariffs = tariffs.filter((t) => {
        const s = (t.serviceType || "").toUpperCase();
        return s === "LOCAL" || s === "HOURLY";
      });

      if (localTariffs.length === 0) {
        cachedPackages = DEFAULT_LOCAL_PACKAGES;
        return cachedPackages;
      }

      const packageMap = new Map();

      localTariffs.forEach((t) => {
        const hours = t.packageHours || 8;
        const km = t.packageKm || t.baseIncludedKm || hours * 10;
        const val = `${hours}hr-${km}km`;

        const exHr = parseFloat(t.extraHourRate || t.hourlyWeekdayDayRate || 150);
        const exKm = parseFloat(t.extraKmRate || t.weekdayDayRate || 14);

        packageMap.set(val, {
          value: val,
          hours,
          km,
          extraHourRate: exHr,
          extraKmRate: exKm,
          label: `${hours} Hours / ${km} Kms (Extra: ₹${Math.round(exHr)}/hr, ₹${Math.round(exKm)}/km)`,
        });
      });

      const list = Array.from(packageMap.values()).sort((a, b) => a.hours - b.hours || a.km - b.km);
      cachedPackages = list.length > 0 ? list : DEFAULT_LOCAL_PACKAGES;
      return cachedPackages;
    })
    .catch((err) => {
      console.warn("Could not load dynamic tariffs for packages, using defaults:", err);
      cachedPackages = DEFAULT_LOCAL_PACKAGES;
      return cachedPackages;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

/**
 * Parse KM from package string, e.g. "8hr-80km" -> 80
 */
export function parsePackageKm(pkgStr) {
  if (!pkgStr) return 80;
  const match = pkgStr.match(/(\d+)\s*km/i);
  if (match) return parseInt(match[1], 10);
  const lower = pkgStr.toLowerCase();
  if (lower.includes("4hr") || lower.includes("40")) return 40;
  if (lower.includes("12hr") || lower.includes("120")) return 120;
  if (lower.includes("16hr") || lower.includes("160")) return 160;
  if (lower.includes("24hr") || lower.includes("240")) return 240;
  return 80;
}

/**
 * Parse Hours from package string, e.g. "8hr-80km" -> 8
 */
export function parsePackageHours(pkgStr) {
  if (!pkgStr) return 8;
  const match = pkgStr.match(/(\d+)\s*hr/i) || pkgStr.match(/(\d+)\s*hour/i);
  if (match) return parseInt(match[1], 10);
  return 8;
}

/**
 * Format clean package label for UI display, e.g. "8 Hours / 80 Kms"
 */
export function formatPackageLabel(pkgStr) {
  if (!pkgStr) return "8 Hours / 80 Kms";
  const hours = parsePackageHours(pkgStr);
  const km = parsePackageKm(pkgStr);
  return `${hours} Hours / ${km} Kms`;
}
