// Currency Formatter for Indian Rupee (INR)
export function formatINR(amount) {
  if (amount === undefined || amount === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

// Standard Date & Time Formatter
export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Status Badges Colors & Styles
export function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "available":
    case "completed":
    case "confirmed":
    case "active":
    case "verified":
    case "paid":
    case "resolved":
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "pending":
    case "booked":
    case "en route":
    case "in progress":
    case "assigned":
    case "processing":
    case "expiring soon":
    case "open":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "on trip":
    case "trip started":
    case "arrived":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "maintenance":
    case "cancelled":
    case "rejected":
    case "expired":
    case "failed":
    case "inactive":
    case "blocked":
      return "bg-rose-50 text-rose-700 border-rose-200";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
