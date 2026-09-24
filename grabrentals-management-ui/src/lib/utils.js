import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString, includeTime = false) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
    return new Intl.DateTimeFormat("en-IN", options).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusStyle(status) {
  const norm = String(status || "").toUpperCase();
  switch (norm) {
    case "CONFIRMED":
    case "ACTIVE":
    case "APPROVED":
    case "COMPLETED":
    case "AVAILABLE":
    case "PAID":
    case "SUCCESS":
    case "ON_DUTY":
    case "RESOLVED":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        label: norm.replace("_", " "),
      };
    case "PENDING":
    case "PENDING_ALLOCATION":
    case "PENDING_APPROVAL":
    case "IN_REVIEW":
    case "PROCESSING":
    case "EN_ROUTE":
    case "STARTED":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        label: norm.replace("_", " "),
      };
    case "CANCELLED":
    case "REJECTED":
    case "FAILED":
    case "SUSPENDED":
    case "OVERDUE":
    case "MAINTENANCE":
    case "CRITICAL":
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
        label: norm.replace("_", " "),
      };
    case "ASSIGNED":
    case "DISPATCHED":
    case "ARRIVED":
    case "IN_PROGRESS":
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        label: norm.replace("_", " "),
      };
    case "RESCHEDULED":
    case "REFUNDED":
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        dot: "bg-purple-500",
        label: norm.replace("_", " "),
      };
    default:
      return {
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
        label: norm || "UNKNOWN",
      };
  }
}
