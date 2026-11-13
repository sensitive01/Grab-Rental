// Class name merger utility
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

// Unified Customer Booking Add-ons Extractor
export function extractBookingAddons(booking) {
  if (!booking) return [];
  if (Array.isArray(booking.addons) && booking.addons.length > 0) {
    return booking.addons;
  }
  const list = [];
  const spec = `${booking.specialInstructions || ""} ${booking.notes || ""}`;

  // 1. Language Chauffeur
  if (/language chauffeur|language/i.test(spec)) {
    const m = spec.match(/Language Chauffeur\s*\(([^)]+)\)(?:\s*\([?₹](\d+)\))?/i);
    let lang = "English";
    let fee = 199;
    if (m) {
      if (m[1]) lang = m[1].trim();
      if (m[2]) fee = Number(m[2]);
    }
    list.push({
      id: "language_chauffeur",
      name: `Language Chauffeur (${lang})`,
      description: `Dedicated ${lang}-fluent professional chauffeur`,
      sacCode: "9966",
      packageQty: "1 Duty",
      price: fee,
      emoji: "🗣️",
    });
  }

  // 2. Luggage / Rooftop Carrier
  if (/luggage carrier|roof top carrier|carrier added/i.test(spec)) {
    const m = spec.match(/Luggage Carrier Added\s*\([?₹](\d+)\)/i);
    let fee = 249;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "luggage_carrier",
      name: "Luggage / Roof Top Carrier",
      description: "Secure rooftop luggage rack & weatherproof tarpaulin",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: fee,
      emoji: "🧳",
    });
  }

  // 3. Guaranteed Car < 3 Years
  if (/car < 3 years|vehicle < 3 years|new car guarantee/i.test(spec)) {
    const m = spec.match(/Car < 3 Years\s*\([?₹](\d+)\)/i);
    let fee = 299;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "new_car_guarantee",
      name: "Guaranteed Car < 3 Years Old",
      description: "Pristine, late-model vehicle (model year 2023 or newer)",
      sacCode: "9966",
      packageQty: "1 Vehicle",
      price: fee,
      emoji: "✨",
    });
  }

  // 4. Expressway FASTag Pass
  if (/fastag pass|expressway fastag/i.test(spec)) {
    const m = spec.match(/Expressway FASTag Pass\s*\([?₹](\d+)\)/i);
    let fee = 415;
    if (m && m[1]) fee = Number(m[1]);
    list.push({
      id: "fastag_pass",
      name: "Expressway FASTag Included",
      description: "Prepaid electronic highway toll plaza pass",
      sacCode: "9966",
      packageQty: "Unlimited",
      price: fee,
      emoji: "🛣️",
    });
  }

  // 5. Pet Friendly Accommodation
  const isPet = Boolean(booking.isPetFriendly) || /pet friendly cab|pet fee/i.test(spec);
  if (isPet) {
    const pType = booking.petType || "Pet";
    const pCount = booking.petCount || 1;
    const pCharge = Number(booking.petCharge || 0);
    list.push({
      id: "pet_friendly",
      name: `Pet Friendly Accommodation (${pType} × ${pCount})`,
      description: "Cabin seat protector & pet sanitization package",
      sacCode: "9966",
      packageQty: "1 Surcharge",
      price: pCharge,
      emoji: "🐾",
    });
  }

  return list;
}
