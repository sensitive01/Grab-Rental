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
    case "ASSIGNED_TO_VENDOR":
    case "DISPATCHED":
    case "ON_THE_WAY":
    case "IN_TRANSIT":
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

export async function printDocumentPdf(bookingIdOrRef, scenario = 2) {
  if (typeof window === "undefined" || !bookingIdOrRef) return;

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const scenarioParam = scenario ? `?scenario=${scenario}` : "";
  const pdfUrl = `${base}/api/public/bookings/${bookingIdOrRef}/document.pdf${scenarioParam}`;

  try {
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error("Could not load PDF document");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    let iframe = document.getElementById("grabrentals-pdf-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "grabrentals-pdf-print-frame";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }

    iframe.src = blobUrl;
    iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            const w = window.open(blobUrl, "_blank");
            if (w) w.focus();
          }
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        }, 300);
    };
  } catch (err) {
    console.warn("Direct PDF print failed, falling back to window.print():", err);
    window.print();
  }
}
