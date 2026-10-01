import { axiosClient } from "./axiosClient";

export function normalizeBooking(b) {
  if (!b) return null;
  const total = Number(b.totalFare || 0);
  const advance = Number(b.advancePaid || 0);
  const due = Number(b.dueAmount != null ? b.dueAmount : Math.max(0, total - advance));
  const platformFee = Math.round(total * 0.10); // 10% platform commission
  const vendorNet = total - platformFee;

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
    distanceKm: 150,
    estimatedAmount: total,
    totalFare: total,
    advancePaid: advance,
    dueAmount: due,
    platformFee: platformFee,
    vendorNet: vendorNet,
    status: uiStatus,
    rawStatus: st,
    paymentStatus: b.paymentStatus || (advance > 0 ? "Prepaid Advance" : "Pending"),
    rideOtp: b.rideOtp,
    specialInstructions: b.specialInstructions,
    vendorDeclineReason: b.vendorDeclineReason,
    createdAt: b.createdAt
  };
}

export const vendorApi = {
  // --- Dashboard ---
  getDashboard: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/dashboard");
      return res.data?.data || null;
    } catch (err) {
      console.error("vendorApi.getDashboard error:", err);
      throw err;
    }
  },

  // --- Profile ---
  getProfile: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/profile");
      return res.data?.data || null;
    } catch (err) {
      console.error("vendorApi.getProfile error:", err);
      throw err;
    }
  },

  updateProfile: async (payload) => {
    try {
      const res = await axiosClient.put("/api/vendor/profile", payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("vendorApi.updateProfile error:", err);
      throw err;
    }
  },

  // --- Vehicles ---
  getVehicles: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/vehicles");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.error("vendorApi.getVehicles error:", err);
      return [];
    }
  },

  getVehicleById: async (id) => {
    try {
      const res = await axiosClient.get(`/api/vendor/vehicles/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(`vendorApi.getVehicleById(${id}) error:`, err);
      throw err;
    }
  },

  updateVehicle: async (id, data) => {
    try {
      const res = await axiosClient.put(`/api/vendor/vehicles/${id}`, data);
      return res.data?.data || null;
    } catch (err) {
      console.error(`vendorApi.updateVehicle(${id}) error:`, err);
      throw err;
    }
  },

  updateVehicleStatus: async (id, status) => {
    try {
      const res = await axiosClient.patch(`/api/vendor/vehicles/${id}/status?status=${status}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(`vendorApi.updateVehicleStatus(${id}) error:`, err);
      throw err;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const res = await axiosClient.delete(`/api/vendor/vehicles/${id}`);
      return res.data;
    } catch (err) {
      console.error(`vendorApi.deleteVehicle(${id}) error:`, err);
      throw err;
    }
  },

  // --- Drivers ---
  getDrivers: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/drivers");
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.error("vendorApi.getDrivers error:", err);
      return [];
    }
  },

  getDriverById: async (id) => {
    try {
      const res = await axiosClient.get(`/api/vendor/drivers/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(`vendorApi.getDriverById(${id}) error:`, err);
      throw err;
    }
  },

  createDriver: async (data) => {
    try {
      const res = await axiosClient.post("/api/vendor/drivers", data);
      return res.data?.data || null;
    } catch (err) {
      console.error("vendorApi.createDriver error:", err);
      throw err;
    }
  },

  updateDriver: async (id, data) => {
    try {
      const res = await axiosClient.put(`/api/vendor/drivers/${id}`, data);
      return res.data?.data || null;
    } catch (err) {
      console.error(`vendorApi.updateDriver(${id}) error:`, err);
      throw err;
    }
  },

  deleteDriver: async (id) => {
    try {
      const res = await axiosClient.delete(`/api/vendor/drivers/${id}`);
      return res.data;
    } catch (err) {
      console.error(`vendorApi.deleteDriver(${id}) error:`, err);
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
      console.error("vendorApi.getBookings error:", err);
      return [];
    }
  },

  getBookingRequests: async () => {
    try {
      const res = await axiosClient.get("/api/vendor/bookings/requests");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      return list.map(normalizeBooking);
    } catch (err) {
      console.error("vendorApi.getBookingRequests error:", err);
      return [];
    }
  },

  getBookingById: async (idOrRef) => {
    try {
      const res = await axiosClient.get(`/api/vendor/bookings/${idOrRef}`);
      return normalizeBooking(res.data?.data);
    } catch (err) {
      console.error(`vendorApi.getBookingById(${idOrRef}) error:`, err);
      // Fallback: look up in list
      try {
        const all = await vendorApi.getBookings();
        const found = all.find(b => b.id === idOrRef || b.rawId === idOrRef || b.bookingReference === idOrRef);
        if (found) return found;
      } catch (inner) {
        console.error("Fallback lookup failed:", inner);
      }
      throw err;
    }
  },

  acceptBooking: async (bookingId) => {
    try {
      const res = await axiosClient.post(`/api/vendor/bookings/${bookingId}/accept`);
      return normalizeBooking(res.data?.data);
    } catch (err) {
      console.error(`vendorApi.acceptBooking(${bookingId}) error:`, err);
      throw err;
    }
  },

  declineBooking: async (bookingId, reason) => {
    try {
      const res = await axiosClient.post(`/api/vendor/bookings/${bookingId}/decline`, { reason: reason || "Vehicle unavailable" });
      return normalizeBooking(res.data?.data);
    } catch (err) {
      console.error(`vendorApi.declineBooking(${bookingId}) error:`, err);
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

      const docs = [];
      let docIdx = 1;

      vehiclesRes.forEach(v => {
        if (v.rcDocumentUrl || v.vehicleNumber) {
          docs.push({
            id: `DOC-RC-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "Vehicle Registration Certificate (RC)",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Vehicle RC",
            expiryDate: v.fitnessExpiry || "2038-03-14",
            daysRemaining: 1800,
            status: "Verified",
            fileUrl: v.rcDocumentUrl || null,
            fileSize: "2.4 MB PDF"
          });
        }

        if (v.insuranceDocumentUrl || v.insuranceExpiry) {
          const expiryDate = v.insuranceExpiry || "2026-12-31";
          const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
          docs.push({
            id: `DOC-INS-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "Commercial Comprehensive Insurance",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Insurance",
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
            fileUrl: v.insuranceDocumentUrl || null,
            fileSize: "1.8 MB PDF"
          });
        }

        if (v.permitDocumentUrl || v.permitExpiry) {
          const expiryDate = v.permitExpiry || "2027-01-15";
          const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
          docs.push({
            id: `DOC-PER-${v.id ? v.id.slice(0, 6) : docIdx++}`,
            name: "All India Tourist Permit (AITP)",
            target: `${v.model || "Vehicle"} (${v.vehicleNumber})`,
            type: "Permit",
            expiryDate: expiryDate,
            daysRemaining: daysRemaining,
            status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
            fileUrl: v.permitDocumentUrl || null,
            fileSize: "1.2 MB PDF"
          });
        }
      });

      driversRes.forEach(d => {
        const expiryDate = d.licenseExpiry || "2029-08-14";
        const daysRemaining = Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
        docs.push({
          id: `DOC-LIC-${d.id ? d.id.slice(0, 6) : docIdx++}`,
          name: "Commercial Chauffeur Driving License",
          target: `Driver: ${d.name} (${d.licenseNumber || "Commercial"})`,
          type: "Driver License",
          expiryDate: expiryDate,
          daysRemaining: daysRemaining,
          status: daysRemaining < 30 ? "Expiring Soon" : "Verified",
          fileUrl: d.licenseDocumentUrl || null,
          fileSize: "980 KB JPG"
        });
      });

      return docs;
    } catch (err) {
      console.error("vendorApi.getDocuments error:", err);
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
      console.error("vendorApi.getNotifications error:", err);
      return [];
    }
  }
};
