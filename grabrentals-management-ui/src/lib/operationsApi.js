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
    await simulateLatency();
    const activeTrips = bookings.filter((b) => ["EN_ROUTE", "ASSIGNED"].includes(b.status)).length;
    const pendingAllocations = bookings.filter((b) => b.status === "PENDING_ALLOCATION").length;
    const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE").length;
    const availableDrivers = drivers.filter((d) => d.status === "AVAILABLE").length;
    const completedToday = bookings.filter((b) => b.status === "COMPLETED").length;

    return createApiResponse({
      activeTrips,
      pendingAllocations,
      availableVehicles,
      totalVehicles: vehicles.length,
      availableDrivers,
      totalDrivers: drivers.length,
      completedToday,
      onTimeDispatchRate: 98.4,
    });
  },

  async getBookings(statusFilter = "ALL") {
    await simulateLatency();
    if (statusFilter === "ALL") return createApiResponse(bookings);
    return createApiResponse(bookings.filter((b) => b.status === statusFilter));
  },

  async getBookingById(id) {
    await simulateLatency();
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw new Error("Booking not found");
    return createApiResponse(booking);
  },

  async getVehicles(status = "ALL") {
    await simulateLatency();
    if (status === "ALL") return createApiResponse(vehicles);
    return createApiResponse(vehicles.filter((v) => v.status === status));
  },

  async getDrivers(status = "ALL") {
    await simulateLatency();
    if (status === "ALL") return createApiResponse(drivers);
    return createApiResponse(drivers.filter((d) => d.status === status));
  },

  async assignVehicleAndDriver(bookingId, vehicleId, driverId) {
    await simulateLatency();
    const bIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bIndex === -1) throw new Error("Booking not found");

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

    bookings[bIndex].status = "ASSIGNED";
    return createApiResponse(bookings[bIndex], "Vehicle and driver assigned successfully");
  },

  async updateTripStatus(bookingId, newStatus, milestoneText = "") {
    await simulateLatency();
    const bIndex = bookings.findIndex((b) => b.id === bookingId);
    if (bIndex === -1) throw new Error("Booking not found");

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
