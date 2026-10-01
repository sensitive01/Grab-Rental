import { axiosClient } from "./axiosClient";

export const customerApi = {
  /**
   * Search available vehicles and live fares for outstation trips
   * @param {Object} params - { from, to, tripType, pickupDate, pickupTime }
   */
  async searchVehicles(params = {}) {
    const res = await axiosClient.get("/api/vehicles/search", {
      params: {
        from: params.from,
        to: params.to,
        stops: params.stops,
        tripType: params.tripType,
        pickupDate: params.pickupDate,
        pickupTime: params.pickupTime,
      },
    });
    return res.data;
  },

  /**
   * Get public booking details by reference number (e.g. GR-2026-XXXXX)
   * @param {string} reference
   */
  async getPublicBooking(reference) {
    const res = await axiosClient.get(`/api/vehicles/booking/${reference}`);
    return res.data;
  },
  /**
   * Create a new booking from checkout/review page
   * @param {Object} data 
   */
  async createBooking(data) {
    const res = await axiosClient.post("/api/customer/bookings", {
      tripType: data.tripType || "ONE_WAY",
      pickupCity: data.pickupCity || data.from || "Bangalore",
      dropCity: data.dropCity || data.to || "Mysore",
      stops: data.stops || null,
      pickupAddress: data.pickupAddress || data.fromAddress || "Bangalore City Center",
      dropAddress: data.dropAddress || data.toAddress || "Mysore City Center",
      pickupDateTime: data.pickupDateTime || new Date(Date.now() + 3600000).toISOString(),
      returnDateTime: data.returnDateTime || null,
      vehicleCategory: data.vehicleCategory || data.carType || "SEDAN",
      passengerCount: data.passengerCount || 1,
      passengerName: data.passengerName || data.name || "",
      passengerPhone: data.passengerPhone || data.phone || "",
      totalFare: Number(data.totalFare || data.fare || 1500),
      advancePaid: Number(data.advancePaid || data.advance || 0),
      paymentStatus: data.paymentStatus || "PENDING",
      specialInstructions: data.specialInstructions || "",
    });
    return res.data;
  },

  /**
   * Get all bookings of the logged-in customer
   */
  async getBookings() {
    const res = await axiosClient.get("/api/customer/bookings");
    return res.data;
  },

  /**
   * Get detailed booking by ID (UUID or reference)
   * @param {string} id 
   */
  async getBookingById(id) {
    const res = await axiosClient.get(`/api/customer/bookings/${id}`);
    return res.data;
  },

  /**
   * Cancel customer booking
   * @param {string} id 
   */
  async cancelBooking(id) {
    const res = await axiosClient.post(`/api/customer/bookings/${id}/cancel`);
    return res.data;
  },
};
