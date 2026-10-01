import { axiosClient } from "./axiosClient";
import { simulateLatency, createApiResponse } from "./api";
import {
  initialBookings,
  initialVehicles,
  initialDrivers,
  customerRequests,
  vendorCoordinations,
} from "./mockData";

// In-memory working copies for live updates within session
let bookings = [...initialBookings];
let vehicles = [...initialVehicles];
let drivers = [...initialDrivers];
let requests = [...customerRequests];
let coordinations = [...vendorCoordinations];

export const operationsApi = {
  async getKPIs() {
    try {
      const [resBookings, resVehicles, resDrivers] = await Promise.all([
        axiosClient.get("/api/operations/bookings"),
        axiosClient.get("/api/operations/vehicles").catch(() => ({ data: { success: false } })),
        axiosClient.get("/api/operations/drivers").catch(() => ({ data: { success: false } })),
      ]);
      if (resBookings.data && resBookings.data.success && Array.isArray(resBookings.data.data)) {
        const liveList = resBookings.data.data;
        const activeTrips = liveList.filter((b) =>
          ["CONFIRMED", "ASSIGNED_TO_VENDOR", "ASSIGNED", "ON_THE_WAY", "EN_ROUTE", "IN_TRANSIT"].includes(b.status)
        ).length;
        const pendingAllocations = liveList.filter((b) => ["PENDING_ALLOCATION", "REASSIGN_REQUIRED"].includes(b.status)).length;
        const completedToday = liveList.filter((b) => b.status === "COMPLETED").length;

        const liveVehicles = (resVehicles.data && resVehicles.data.success && Array.isArray(resVehicles.data.data))
          ? resVehicles.data.data
          : [];
        const liveDrivers = (resDrivers.data && resDrivers.data.success && Array.isArray(resDrivers.data.data))
          ? resDrivers.data.data
          : [];

        return createApiResponse({
          activeTrips,
          pendingAllocations,
          availableVehicles: liveVehicles.filter((v) => v.status === "AVAILABLE").length,
          totalVehicles: liveVehicles.length,
          availableDrivers: liveDrivers.filter((d) => d.status === "AVAILABLE").length,
          totalDrivers: liveDrivers.length,
          completedToday,
          onTimeDispatchRate: 100,
        });
      }
    } catch {
      // Fallback
    }
    return createApiResponse({
      activeTrips: 0,
      pendingAllocations: 0,
      availableVehicles: 0,
      totalVehicles: 0,
      availableDrivers: 0,
      totalDrivers: 0,
      completedToday: 0,
      onTimeDispatchRate: 100,
    });
  },

  async getBookings(statusFilter = "ALL") {
    try {
      const params = (statusFilter && statusFilter !== "ALL") ? { status: statusFilter } : {};
      const res = await axiosClient.get("/api/operations/bookings", { params });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        // Map backend BookingResponse to UI shape
        const mapped = res.data.data.map((b) => {
          let dateStr = "Scheduled";
          if (b.pickupDateTime) {
            try {
              const dt = new Date(b.pickupDateTime);
              if (!isNaN(dt.getTime())) {
                dateStr = dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              }
            } catch {}
          }
          const fareAmount = b.totalFare != null ? Number(b.totalFare) : (b.fare != null ? Number(b.fare) : 0);

          return {
            ...b,
            id: b.bookingReference || b.id,
            rawId: b.id,
            customerName: b.customerName || b.passengerName || "Customer",
            customerPhone: b.customerPhone || b.passengerPhone || "",
            pickupLocation: b.pickupAddress || b.pickupCity,
            dropLocation: b.dropAddress || b.dropCity,
            tripType: b.tripType || "ONE_WAY",
            serviceType: (b.tripType || "ONE_WAY").replace(/_/g, " "),
            startDate: dateStr,
            durationDays: 1,
            vehicleCategory: b.vehicleCategory,
            pickupTime: b.pickupDateTime,
            status: b.status,
            fare: fareAmount,
            totalFare: fareAmount,
            advancePaid: b.advancePaid != null ? Number(b.advancePaid) : 0,
            dueAmount: b.dueAmount != null ? Number(b.dueAmount) : 0,
            assignedVehicleNumber: b.vehicleNumber,
            assignedVehicleRegistration: b.vehicleNumber,
            assignedDriverName: b.driverName,
          };
        });
        return createApiResponse(mapped);
      }
    } catch {
      // Backend error or unauthenticated, return empty list
    }
    return createApiResponse([]);
  },

  async getBookingById(id) {
    try {
      const res = await axiosClient.get(`/api/operations/bookings/${id}`);
      if (res.data && res.data.success && res.data.data) {
        const b = res.data.data;
        let dateStr = "Scheduled";
        if (b.pickupDateTime) {
          try {
            const dt = new Date(b.pickupDateTime);
            if (!isNaN(dt.getTime())) {
              dateStr = dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            }
          } catch {}
        }
        const fareAmount = b.totalFare != null ? Number(b.totalFare) : (b.fare != null ? Number(b.fare) : 0);

        return createApiResponse({
          ...b,
          id: b.bookingReference || b.id,
          rawId: b.id,
          customerName: b.customerName || b.passengerName,
          customerPhone: b.customerPhone || b.passengerPhone,
          pickupLocation: b.pickupAddress || b.pickupCity,
          dropLocation: b.dropAddress || b.dropCity,
          tripType: b.tripType || "ONE_WAY",
          serviceType: (b.tripType || "ONE_WAY").replace(/_/g, " "),
          startDate: dateStr,
          durationDays: 1,
          pickupTime: b.pickupDateTime,
          fare: fareAmount,
          totalFare: fareAmount,
          advancePaid: b.advancePaid != null ? Number(b.advancePaid) : 0,
          dueAmount: b.dueAmount != null ? Number(b.dueAmount) : 0,
          assignedVehicleNumber: b.vehicleNumber,
          assignedVehicleRegistration: b.vehicleNumber,
          assignedDriverName: b.driverName,
        });
      }
    } catch {
      // Fallback
    }
    await simulateLatency();
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found");
    return createApiResponse(booking);
  },

  async getVehicles(status = "ALL") {
    try {
      const endpoint = status === "AVAILABLE" ? "/api/operations/vehicles/available" : "/api/operations/vehicles";
      const res = await axiosClient.get(endpoint);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((v) => ({
          ...v,
          registrationNumber: v.vehicleNumber,
          category: v.vehicleType,
          status: v.status || "AVAILABLE",
        }));
        if (status !== "ALL" && status !== "AVAILABLE") {
          return createApiResponse(mapped.filter((v) => v.status === status));
        }
        return createApiResponse(mapped);
      }
    } catch {
      // Backend error or unauthenticated, return empty list
    }
    return createApiResponse([]);
  },

  async getDrivers(status = "ALL") {
    try {
      const endpoint = status === "AVAILABLE" ? "/api/operations/drivers/available" : "/api/operations/drivers";
      const res = await axiosClient.get(endpoint);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((d) => ({
          ...d,
          id: d.id,
          name: d.name,
          phone: d.phone || "",
          badgeNumber: d.badgeNumber || d.licenseNumber || "N/A",
          licenseNumber: d.licenseNumber || "N/A",
          vendorName: d.vendorName || "Independent",
          status: d.status || "AVAILABLE",
          rating: d.rating ? Number(d.rating) : 5.0,
          tripsCompleted: d.totalTrips ?? d.tripsCompleted ?? 0,
          experienceYears: d.experienceYears ?? 0,
          badgeValidTill: d.licenseExpiry || "N/A",
          currentLocation: d.currentLocation || d.address || "Base Depot",
          languages: d.languages || ["Tamil", "English"],
        }));
        if (status !== "ALL" && status !== "AVAILABLE") {
          return createApiResponse(mapped.filter((d) => d.status === status));
        }
        return createApiResponse(mapped);
      }
    } catch {
      // Fallback
    }
    return createApiResponse([]);
  },

  async assignVehicleAndDriver(bookingId, vehicleId, driverId) {
    try {
      const targetId = bookingId;
      const res = await axiosClient.post(`/api/operations/bookings/${targetId}/assign`, {
        vehicleId,
        driverId,
      });
      if (res.data && res.data.success) {
        return createApiResponse(res.data.data, "Vehicle and driver assigned and forwarded to vendor");
      }
    } catch {
      // Fallback
    }
    await simulateLatency();
    const bIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bIndex !== -1) {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      const driver = drivers.find((d) => d.id === driverId);

      if (vehicle) {
        vehicle.status = "ON_DUTY";
        bookings[bIndex].assignedVehicleId = vehicle.id;
        bookings[bIndex].assignedVehicleNumber = vehicle.registrationNumber;
      }

      if (driver) {
        driver.status = "ON_DUTY";
        bookings[bIndex].assignedDriverId = driver.id;
        bookings[bIndex].assignedDriverName = driver.name;
      }

      bookings[bIndex].status = "ASSIGNED_TO_VENDOR";
      return createApiResponse(bookings[bIndex], "Vehicle and driver assigned successfully");
    }
    throw new Error("Booking not found");
  },

  async updateTripStatus(bookingId, newStatus, milestoneText = "") {
    try {
      let backendStatus = newStatus;
      if (newStatus === "EN_ROUTE") backendStatus = "IN_TRANSIT";
      const res = await axiosClient.patch(`/api/operations/bookings/${bookingId}/status`, {
        status: backendStatus,
        milestoneText,
      });
      if (res.data && res.data.success) {
        return createApiResponse(res.data.data, `Trip status updated to ${newStatus}`);
      }
    } catch (err) {
      console.warn("Backend status update error, using fallback update:", err);
    }

    await simulateLatency();
    const bIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bIndex !== -1) {
      bookings[bIndex].status = newStatus;
      if (milestoneText) {
        bookings[bIndex].tripMilestone = milestoneText;
      }

      // Release vehicle and driver if completed or cancelled
      if (["COMPLETED", "CANCELLED"].includes(newStatus)) {
        const vId = bookings[bIndex].assignedVehicleId;
        const dId = bookings[bIndex].assignedDriverId;
        if (vId) {
          const v = vehicles.find((item) => item.id === vId);
          if (v) v.status = "AVAILABLE";
        }
        if (dId) {
          const d = drivers.find((item) => item.id === dId);
          if (d) d.status = "AVAILABLE";
        }
      }

      return createApiResponse(bookings[bIndex], `Trip status updated to ${newStatus}`);
    }
    return createApiResponse({ id: bookingId, status: newStatus }, `Trip status updated to ${newStatus}`);
  },

  async getCustomerRequests() {
    await simulateLatency();
    return createApiResponse(requests);
  },

  async updateCustomerRequest(id, newStatus) {
    await simulateLatency();
    const req = requests.find((r) => r.id === id);
    if (req) req.status = newStatus;
    return createApiResponse(req, "Request status updated");
  },

  async getVendorCoordinations() {
    await simulateLatency();
    return createApiResponse(coordinations);
  },

  async addVendorCoordination(newCoord) {
    await simulateLatency();
    const record = {
      id: `VCOORD-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newCoord,
      status: "OPEN",
      updatedAt: new Date().toISOString(),
    };
    coordinations.unshift(record);
    return createApiResponse(record, "Coordination log created");
  },
};
