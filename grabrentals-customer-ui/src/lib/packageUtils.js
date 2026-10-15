import { axiosClient } from "./axiosClient";
import { customerApi } from "./customerApi";

export const DEFAULT_LOCAL_PACKAGES = [
  {
    value: "4hr-40km",
    hours: 4,
    km: 40,
    extraHourRate: 20,
    extraKmRate: 15,
    label: "4 hours 40 km (Additional: 20 per hour / 15 per km)",
  },
  {
    value: "8hr-80km",
    hours: 8,
    km: 80,
    extraHourRate: 20,
    extraKmRate: 15,
    label: "8 hours 80 km (Additional: 20 per hour / 15 per km)",
  },
  {
    value: "12hr-120km",
    hours: 12,
    km: 120,
    extraHourRate: 20,
    extraKmRate: 15,
    label: "12 hours 120 km (Additional: 20 per hour / 15 per km)",
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

  const fetcher = (customerApi && typeof customerApi.getTariffs === "function")
    ? customerApi.getTariffs()
    : axiosClient.get("/api/vehicles/tariffs").then((res) => res.data);

  fetchPromise = fetcher
    .then((res) => {
      const tariffs = res?.data || res || [];
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

      // Only show packages actually configured in Admin / Database

      // Overlay tariffs configured in Admin
      localTariffs.forEach((t) => {
        const hours = t.packageHours || 8;
        const km = t.packageKm || t.baseIncludedKm || (hours * 10);
        const val = `${hours}hr-${km}km`;

        const exHr = parseFloat(t.extraHourRate || t.hourlyWeekdayDayRate || 20);
        const exKm = parseFloat(t.extraKmRate || t.weekdayDayRate || 15);

        packageMap.set(val, {
          value: val,
          hours,
          km,
          extraHourRate: exHr,
          extraKmRate: exKm,
          label: `${hours} hours ${km} km (Additional: ${Math.round(exHr)} per hour / ${Math.round(exKm)} per km)`,
        });
      });

      const list = Array.from(packageMap.values()).sort((a, b) => a.hours - b.hours || a.km - b.km);
      cachedPackages = list;
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
