import { axiosClient } from "./axiosClient";

export function normalizeBooking(b) {
  if (!b) return null;
  const total = Number(b.totalFare || 0);
  const advance = Number(b.advancePaid || 0);
  const vendorNet = b.vendorPayout != null ? Number(b.vendorPayout) : (b.vendorNet != null ? Number(b.vendorNet) : Math.round(total * 0.90));
  const due = Number(b.dueAmount != null ? b.dueAmount : vendorNet);
  const platformFee = Math.max(0, Math.round(total - vendorNet));

  let pickupDateStr = "";
  if (b.pickupDateTime) {
    try {
      const dt = new Date(b.pickupDateTime);
      pickupDateStr = dt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      pickupDateStr = String(b.pickupDateTime);
    }
  }

  let uiStatus = "Pending";
  const st = String(b.status || "").toUpperCase();
  if (st === "CONFIRMED") uiStatus = "Confirmed";
  else if (st === "ON_THE_WAY" || st === "IN_TRANSIT") uiStatus = "Active";
  else if (st === "COMPLETED") uiStatus = "Completed";
  else if (st === "CANCELLED" || st === "REASSIGN_REQUIRED") uiStatus = "Cancelled";
  else if (st === "ASSIGNED_TO_VENDOR") uiStatus = "Assigned";
  else if (st === "PENDING_ALLOCATION") uiStatus = "Pending";

  const pickup = b.pickupAddress ? `${b.pickupAddress}, ${b.pickupCity || ""}` : (b.pickupCity || "Pickup Location");
  const drop = b.dropAddress ? `${b.dropAddress}, ${b.dropCity || ""}` : (b.dropCity || "Destination");

  const spec = b.specialInstructions || "";

  // Parse Customer Selected Add-ons
  const hasExpressway = /Expressway Fastag/i.test(spec);
  const expresswayFee = Number(spec.match(/Expressway Fastag[^)]*₹(\d+)/i)?.[1]) || (hasExpressway ? 415 : 0);

  const hasLanguageChauffeur = /Language Chauffeur/i.test(spec);
  const chauffeurLanguage = (spec.match(/Language Chauffeur\s*\(([^)]+)\)/i)?.[1]?.trim()) || "English";
  const languageChauffeurFee = Number(spec.match(/Language Chauffeur[^)]*₹(\d+)/i)?.[1]) || (hasLanguageChauffeur ? 199 : 0);

  const hasLuggageCarrier = /Luggage Carrier/i.test(spec);
  const luggageCarrierFee = Number(spec.match(/Luggage Carrier[^)]*₹(\d+)/i)?.[1]) || (hasLuggageCarrier ? 249 : 0);

  const hasLessThan3Years = /Less than 3 years/i.test(spec);
  const lessThan3YearsFee = Number(spec.match(/Less than 3 years[^)]*₹(\d+)/i)?.[1]) || (hasLessThan3Years ? 299 : 0);

  const isPetFriendly = Boolean(
    b.isPetFriendly ||
    /🐾\s*Pet Friendly Cab/i.test(spec) ||
    /Pet Fee:/i.test(spec)
  );
  const petType = b.petType || (spec.match(/Pet Friendly Cab\s*\(([^×,)]+)/i)?.[1]?.trim()) || "Pet";
  const petCount = b.petCount || Number(spec.match(/([0-9]+)\s*,\s*Pet Fee/i)?.[1]) || 1;
  const petCharge = b.petCharge != null && Number(b.petCharge) > 0 
    ? Number(b.petCharge) 
    : (Number(spec.match(/Pet Fee:\s*₹?([0-9.]+)/i)?.[1]) || (isPetFriendly ? 350 : 0));

  const intermediateStops = b.stops || (spec.match(/Intermediate Stops:\s*([^|]+)/i)?.[1]?.trim()) || null;

  const addons = [];
  if (hasExpressway) {
    addons.push({
      id: "expressway",
      name: "Expressway FASTag Included",
      price: expresswayFee,
      emoji: "🛣️",
      desc: "Prepaid express highway fastag pass"
    });
  }
  if (hasLanguageChauffeur) {
    addons.push({
      id: "language_chauffeur",
      name: `Language Chauffeur (${chauffeurLanguage})`,
      price: languageChauffeurFee,
      emoji: "🗣️",
      desc: `Chauffeur fluent in ${chauffeurLanguage}`
    });
  }
  if (hasLuggageCarrier) {
    addons.push({
      id: "luggage_carrier",
      name: "Luggage / Roof Top Carrier",
      price: luggageCarrierFee,
      emoji: "🧳",
      desc: "Mounted carrier for extra luggage"
    });
  }
  if (hasLessThan3Years) {
    addons.push({
      id: "less_than_3_years",
      name: "Guaranteed Car < 3 Years Old",
      price: lessThan3YearsFee,
      emoji: "✨",
      desc: "Top condition latest model vehicle"
    });
  }
  if (isPetFriendly) {
    addons.push({
      id: "pet_friendly",
      name: `Pet Friendly Cab (${petType} × ${petCount})`,
      price: petCharge,
      emoji: "🐾",
      desc: "Seat protector & pet sanitation included"
    });
  }

  const addonsTotal = addons.reduce((sum, item) => sum + (item.price || 0), 0);

  return {
    id: b.bookingReference || b.id,
    rawId: b.id,
    reference: b.bookingReference || b.id,
    bookingReference: b.bookingReference || b.id,
    customer: {
      name: b.passengerName || b.customerName || "Customer",
      phone: b.passengerPhone || b.customerPhone || "N/A",
      email: b.customerEmail || ""
    },
    pickup: pickup.replace(/^[,\s]+|[,\s]+$/g, ""),
    drop: drop.replace(/^[,\s]+|[,\s]+$/g, ""),
    pickupCity: b.pickupCity,
    dropCity: b.dropCity,
    stops: b.stops || null,
    pickupDateTime: b.pickupDateTime,
    pickupDate: pickupDateStr || "Scheduled",
    tripType: b.tripType || "Outstation Trip",
    vehicleType: b.vehicleModel ? `${b.vehicleCategory || "Cab"} (${b.vehicleModel})` : (b.vehicleCategory || "Sedan/SUV"),
    vehicleId: b.vehicleId,
    vehicleNumber: b.vehicleNumber || "Assigned by Fleet",
    driverId: b.driverId,
    driverName: b.driverName || "Assigned Chauffeur",
    driverPhone: b.driverPhone || "N/A",
    passengers: b.passengerCount || 4,
    distanceKm: (() => {
      if (b.distanceKm != null && !isNaN(Number(b.distanceKm)) && Number(b.distanceKm) > 0) {
        return Math.round(Number(b.distanceKm));
      }
      if (b.specialInstructions) {
        const m = b.specialInstructions.match(/Distance:\s*(\d+(\.\d+)?)\s*km/i);
        if (m) return Math.round(parseFloat(m[1]));
      }
      if (b.actualKm != null && Number(b.actualKm) > 0) return Math.round(Number(b.actualKm));
      return 250;
    })(),
    customerRouteKm: (() => {
      if (b.distanceKm != null && !isNaN(Number(b.distanceKm)) && Number(b.distanceKm) > 0) {
        return Math.round(Number(b.distanceKm));
      }
      if (b.specialInstructions) {
        const m = b.specialInstructions.match(/Distance:\s*(\d+(\.\d+)?)\s*km/i);
        if (m) return Math.round(parseFloat(m[1]));
      }
      if (b.actualKm != null && Number(b.actualKm) > 0) return Math.round(Number(b.actualKm));
      return null;
    })(),
    packageKm: (() => {
      if (b.specialInstructions) {
        const mPkg = b.specialInstructions.match(/Package:\s*(\d+)\s*(?:km|kms)/i);
        if (mPkg) return parseInt(mPkg[1], 10);
      }
      if (b.distanceKm != null && !isNaN(Number(b.distanceKm)) && Number(b.distanceKm) > 0) {
        return Math.round(Number(b.distanceKm));
      }
      if (b.specialInstructions) {
        const m = b.specialInstructions.match(/Distance:\s*(\d+(\.\d+)?)\s*km/i);
        if (m) return Math.round(parseFloat(m[1]));
      }
      return 250;
    })(),
    estimatedAmount: total,
    totalFare: total,
    advancePaid: advance,
    dueAmount: due,
    platformFee: platformFee,
    vendorNet: vendorNet,
    vendorPayout: vendorNet,
    status: uiStatus,
    rawStatus: st,
    paymentStatus: b.paymentStatus || (advance > 0 ? "Prepaid Advance" : "Pending"),
    rideOtp: b.rideOtp,
    specialInstructions: b.specialInstructions,
    vendorDeclineReason: b.vendorDeclineReason,
    startKm: b.startKm != null ? Number(b.startKm) : null,
    endKm: b.endKm != null ? Number(b.endKm) : null,
    actualKm: b.actualKm != null ? Number(b.actualKm) : null,
    extraKm: b.extraKm != null ? Number(b.extraKm) : 0,
    extraKmRate: (() => {
      if (b.extraKmRate != null && !isNaN(Number(b.extraKmRate))) return Number(b.extraKmRate);
      if (b.specialInstructions) {
        const mRate = b.specialInstructions.match(/Rate:\s*₹?(\d+(\.\d+)?)/i);
        if (mRate) return parseFloat(mRate[1]);
      }
      return 14;
    })(),
    extraKmCharge: b.extraKmCharge != null ? Number(b.extraKmCharge) : 0,
    tollCharges: b.tollCharges != null ? Number(b.tollCharges) : 0,
    permitCharges: b.permitCharges != null ? Number(b.permitCharges) : 0,
    parkingCharges: b.parkingCharges != null ? Number(b.parkingCharges) : 0,
    driverAllowanceCharges: b.driverAllowanceCharges != null ? Number(b.driverAllowanceCharges) : 0,
    otherCharges: b.otherCharges != null ? Number(b.otherCharges) : 0,
    otherChargesNotes: b.otherChargesNotes || "",
    tripClosingNotes: b.tripClosingNotes || "",
    finalGst: b.finalGst != null ? Number(b.finalGst) : null,
    finalTotalFare: b.finalTotalFare != null ? Number(b.finalTotalFare) : null,
    invoiceNumber: b.invoiceNumber || (b.bookingReference ? `INV-${b.bookingReference.replace(/[^A-Za-z0-9]/g, "")}` : null),
    tripCompletedAt: b.tripCompletedAt || null,
    tripClosedBy: b.tripClosedBy || null,
    createdAt: b.createdAt,
    addons: addons,
    addonsTotal: addonsTotal,
    hasAddons: addons.length > 0,
    isPetFriendly: isPetFriendly,
    petType: petType,
    petCount: petCount,
    petCharge: petCharge,
    intermediateStops: intermediateStops
  };
}

function logApiError(msg, err) {
  if (err?.response?.status !== 401) {
    console.error(msg, err);
  }
}

export const vendorApi = {
  // --- Dashboard ---
  getDashboard: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/dashboard");
      return res.data?.data || null;
    } catch (err) {
      logApiError("vendorApi.getDashboard error:", err);
      throw err;
    }
  },

  // --- Profile ---
  getProfile: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/profile");
      return res.data?.data || null;
    } catch (err) {
      logApiError("vendorApi.getProfile error:", err);
      throw err;
    }
  },

  updateProfile: async (payload) => {
    try {
      const res = await axiosClient.put("/api/vendor/profile", payload);
      const data = res.data?.data;
      if (data?.accessToken || data?.token) {
        const freshToken = data.accessToken || data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("grabrentals_vendor_token", freshToken);
          const raw = localStorage.getItem("grabrentals_vendor_session");
          if (raw) {
            try {
              const session = JSON.parse(raw);
              session.token = freshToken;
              if (payload?.email) session.email = payload.email;
              if (payload?.name) session.name = payload.name;
              localStorage.setItem("grabrentals_vendor_session", JSON.stringify(session));
            } catch (ignored) {}
          }
        }
      }
      return data || null;
    } catch (err) {
      console.warn("vendorApi.updateProfile notice:", err?.response?.data?.message || err.message || err);
      throw err;
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      const res = await axiosClient.put("/api/vendor/change-password", {
        currentPassword: currentPassword ? String(currentPassword).trim() : undefined,
        newPassword: String(newPassword).trim(),
      });
      return res.data;
    } catch (err) {
      console.warn("vendorApi.changePassword notice:", err?.response?.data || err?.message);
      throw err;
    }
  },

  // --- Vehicles ---
  getVehicles: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/vehicles");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      logApiError("vendorApi.getVehicles error:", err);
      return [];
    }
  },

  getVehicleById: async (id) => {
    try {
      const res = await axiosClient.get(`/api/vendor/vehicles/${id}`);
      return res.data?.data || null;
    } catch (err) {
      logApiError(`vendorApi.getVehicleById(${id}) error:`, err);
      throw err;
    }
  },

  checkPlateAvailability: async (plate) => {
    try {
      const res = await axiosClient.get(`/api/vehicles/check-plate?plate=${encodeURIComponent(plate)}`);
      return res.data?.data || null;
    } catch (err) {
      console.warn("vendorApi.checkPlateAvailability error:", err);
      return null;
    }
  },

  createVehicle: async (data) => {
    try {
      const res = await axiosClient.post("/api/vendor/vehicles", data);
      return res.data?.data || null;
    } catch (err) {
      console.warn("vendorApi.createVehicle notice:", err?.response?.data || err?.message);
      throw err;
    }
  },

  updateVehicle: async (id, data) => {
    try {
      const res = await axiosClient.put(`/api/vendor/vehicles/${id}`, data);
      return res.data?.data || null;
    } catch (err) {
      logApiError(`vendorApi.updateVehicle(${id}) error:`, err);
      throw err;
    }
  },

  updateVehicleStatus: async (id, status) => {
    try {
      const res = await axiosClient.patch(`/api/vendor/vehicles/${id}/status?status=${status}`);
      return res.data?.data || null;
    } catch (err) {
      logApiError(`vendorApi.updateVehicleStatus(${id}) error:`, err);
      throw err;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const res = await axiosClient.delete(`/api/vendor/vehicles/${id}`);
      return res.data;
    } catch (err) {
      logApiError(`vendorApi.deleteVehicle(${id}) error:`, err);
      throw err;
    }
  },

  // --- Drivers ---
  getDrivers: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/drivers");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      logApiError("vendorApi.getDrivers error:", err);
      return [];
    }
  },

  getDriverById: async (id) => {
    try {
      const res = await axiosClient.get(`/api/vendor/drivers/${id}`);
      return res.data?.data || null;
    } catch (err) {
      logApiError(`vendorApi.getDriverById(${id}) error:`, err);
      throw err;
    }
  },

  createDriver: async (data) => {
    try {
      const res = await axiosClient.post("/api/vendor/drivers", data);
      return res.data?.data || null;
    } catch (err) {
      console.warn("vendorApi.createDriver notice:", err?.response?.data || err?.message);
      throw err;
    }
  },

  updateDriver: async (id, data) => {
    try {
      const res = await axiosClient.put(`/api/vendor/drivers/${id}`, data);
      return res.data?.data || null;
    } catch (err) {
      logApiError(`vendorApi.updateDriver(${id}) error:`, err);
      throw err;
    }
  },

  deleteDriver: async (id) => {
    try {
      const res = await axiosClient.delete(`/api/vendor/drivers/${id}`);
      return res.data;
    } catch (err) {
      logApiError(`vendorApi.deleteDriver(${id}) error:`, err);
      throw err;
    }
  },

  // --- Bookings ---
  getBookings: async (status) => {
    try {
      const url = status ? `/api/vendor/bookings?status=${status}` : "/api/vendor/bookings";
      const res = await axiosClient.get(url);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      return list.map(normalizeBooking);
    } catch (err) {
      logApiError("vendorApi.getBookings error:", err);
      return [];
    }
  },

  getBookingRequests: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/bookings/requests");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      return list.map(normalizeBooking);
    } catch (err) {
      logApiError("vendorApi.getBookingRequests error:", err);
      return [];
    }
  },

  getBookingById: async (idOrRef) => {
    try {
      const res = await axiosClient.get(`/api/vendor/bookings/${idOrRef}`);
      return normalizeBooking(res.data?.data);
    } catch (err) {
      logApiError(`vendorApi.getBookingById(${idOrRef}) error:`, err);
      // Fallback: look up in list
      try {
        const all = await vendorApi.getBookings();
        const found = all.find(b => b.id === idOrRef || b.rawId === idOrRef || b.bookingReference === idOrRef);
        if (found) return found;
      } catch (inner) {
        logApiError("Fallback lookup failed:", inner);
      }
      throw err;
    }
  },

  acceptBooking: async (bookingId, driverId = null) => {
    try {
      const payload = driverId ? { driverId } : {};
      const res = await axiosClient.post(`/api/vendor/bookings/${bookingId}/accept`, payload);
      return normalizeBooking(res.data?.data);
    } catch (err) {
      logApiError(`vendorApi.acceptBooking(${bookingId}) error:`, err);
      throw err;
    }
  },

  declineBooking: async (bookingId, reason) => {
    try {
      const res = await axiosClient.post(`/api/vendor/bookings/${bookingId}/decline`, { reason: reason || "Vehicle unavailable" });
      return normalizeBooking(res.data?.data);
    } catch (err) {
      logApiError(`vendorApi.declineBooking(${bookingId}) error:`, err);
      throw err;
    }
  },

  completeTrip: async (idOrRef, tripClosingData) => {
    try {
      const res = await axiosClient.post(`/api/vendor/bookings/${idOrRef}/complete-trip`, tripClosingData);
      return normalizeBooking(res.data?.data);
    } catch (err) {
      logApiError(`vendorApi.completeTrip(${idOrRef}) error:`, err);
      throw err;
    }
  },

  // --- Dynamic Documents Generator ---
  getDocuments: async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        vendorApi.getVehicles(),
        vendorApi.getDrivers()
      ]);

      let onboarding = null;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("grabrentals_vendor_onboarding");
          if (raw) onboarding = JSON.parse(raw);
        } catch (ignored) {}
      }

      const docs = [];
      let docIdx = 1;

      vehiclesRes.forEach(v => {
        // 1. Vehicle Registration Certificate (RC)
        if (v.rcDocumentUrl || v.vehicleNumber || onboarding?.rcDocument) {
          docs.push({
            id: `DOC-RC-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "Vehicle Registration Certificate (RC)",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Vehicle RC",
            expiryDate: v.rcExpiry || onboarding?.rcExpiry || "2029-01-01",
            daysRemaining: 1800,
            status: "Verified",
            fileUrl: v.rcDocumentUrl || onboarding?.rcDocument || null,
            fileSize: "2.4 MB PDF"
          });
        }

        // 2. Commercial Comprehensive Insurance
        if (v.insuranceDocumentUrl || v.insuranceExpiry || onboarding?.insuranceDocument) {
          const expiryDate = v.insuranceExpiry || onboarding?.insuranceExpiry || "2029-01-01";
          const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
          docs.push({
            id: `DOC-INS-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "Commercial Comprehensive Insurance",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Insurance",
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
            fileUrl: v.insuranceDocumentUrl || onboarding?.insuranceDocument || null,
            fileSize: "1.8 MB PDF"
          });
        }

        // 3. Vehicle Fitness Certificate (FC)
        if (v.fitnessDocumentUrl || v.fitnessExpiry || onboarding?.fitnessDocument) {
          const expiryDate = v.fitnessExpiry || onboarding?.fitnessExpiry || "2029-01-01";
          const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
          docs.push({
            id: `DOC-FC-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "Vehicle Fitness Certificate (FC)",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Fitness (FC)",
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
            fileUrl: v.fitnessDocumentUrl || onboarding?.fitnessDocument || null,
            fileSize: "1.5 MB PDF"
          });
        }

        // 4. All India Tourist Permit (AITP)
        if (v.permitDocumentUrl || v.permitExpiry || onboarding?.permitDocument) {
          const expiryDate = v.permitExpiry || onboarding?.permitExpiry || "2029-01-01";
          const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
          docs.push({
            id: `DOC-PER-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "All India Tourist Permit (AITP)",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Permit",
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
            fileUrl: v.permitDocumentUrl || onboarding?.permitDocument || null,
            fileSize: "1.2 MB PDF"
          });
        }
      });

      // 5. Commercial Chauffeur Driving License
      driversRes.forEach(d => {
        const expiryDate = d.licenseExpiry || onboarding?.driverLicenseExpiry || "2029-01-01";
        const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
        docs.push({
          id: `DOC-LIC-${d.id ? d.id.slice(0, 6) : docIdx++}`,
          name: "Commercial Chauffeur Driving License",
          target: `Driver: ${d.name} (${d.licenseNumber || "Commercial"})`,
          type: "Driver License",
          expiryDate: expiryDate,
          daysRemaining: daysRemaining,
          status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
          fileUrl: d.licenseDocumentUrl || onboarding?.driverLicenseDocument || null,
          fileSize: "980 KB JPG"
        });
      });

      return docs;
    } catch (err) {
      console.warn("vendorApi.getDocuments notice:", err);
      return [];
    }
  },

  // --- Dynamic Notifications Generator ---
  getNotifications: async () => {
    try {
      const [requests, bookings] = await Promise.all([
        vendorApi.getBookingRequests(),
        vendorApi.getBookings()
      ]);

      const notifs = [];

      requests.forEach((req, idx) => {
        notifs.push({
          id: `NOTIF-REQ-${req.id || idx}`,
          title: `New Booking Request: ${req.pickupCity || "Pickup"} ➔ ${req.dropCity || "Destination"}`,
          message: `Booking #${req.bookingReference} for ₹${req.totalFare?.toLocaleString("en-IN")} requires your confirmation.`,
          category: "booking",
          time: "Just now",
          read: false,
          actionUrl: "/vendor/bookings/requests"
        });
      });

      bookings.slice(0, 3).forEach((b, idx) => {
        if (b.status === "Active") {
          notifs.push({
            id: `NOTIF-ACT-${b.id || idx}`,
            title: `Trip Active: ${b.pickupCity} ➔ ${b.dropCity}`,
            message: `Chauffeur ${b.driverName} is on trip #${b.bookingReference} aboard ${b.vehicleNumber}.`,
            category: "trip",
            time: "In progress",
            read: true,
            actionUrl: "/vendor/trips/active"
          });
        } else if (b.status === "Confirmed") {
          notifs.push({
            id: `NOTIF-CNF-${b.id || idx}`,
            title: `Confirmed Booking #${b.bookingReference}`,
            message: `Scheduled pickup on ${b.pickupDate}. OTP: ${b.rideOtp || "Pending dispatch"}.`,
            category: "booking",
            time: "Today",
            read: false,
            actionUrl: `/vendor/bookings/${b.id}`
          });
        }
      });

      return notifs;
    } catch (err) {
      logApiError("vendorApi.getNotifications error:", err);
      return [];
    }
  }
};
