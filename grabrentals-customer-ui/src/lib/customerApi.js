import { axiosClient } from "./axiosClient";
import { formatLocalDateTime } from "./dateTimeUtils";

export const customerApi = {
  /**
   * Search available vehicles and live fares for outstation trips
   * @param {Object} params - { from, to, tripType, pickupDate, pickupTime }
   */
  async searchVehicles(params = {}) {
    const res = await axiosClient.get("/api/vehicles/search", {
      params: {
        from: params.from,
        fromCity: params.fromCity,
        to: params.to,
        stops: params.stops,
        tripType: params.tripType,
        pickupDate: params.pickupDate,
        pickupTime: params.pickupTime,
        returnDate: params.returnDate,
        tripDays: params.tripDays,
        serviceType: params.serviceType,
        distanceKm: params.distanceKm,
      },
    });
    return res.data;
  },

  /**
   * Get authenticated customer profile (name, phone, email)
   */
  async getProfile(config = {}) {
    const res = await axiosClient.get("/api/customer/profile", config);
    return res.data;
  },

  /**
   * Get customer saved addresses (Home, Office, Other)
   */
  async getAddresses(config = {}) {
    const res = await axiosClient.get("/api/customer/addresses", config);
    return res.data;
  },

  /**
   * Add a new saved address
   * @param {Object} data - { tag, addressLine, city, pincode, landmark, isDefault }
   */
  async addAddress(data) {
    const res = await axiosClient.post("/api/customer/addresses", data);
    return res.data;
  },

  /**
   * Update an existing address
   * @param {string} id 
   * @param {Object} data 
   */
  async updateAddress(id, data) {
    const res = await axiosClient.put(`/api/customer/addresses/${id}`, data);
    return res.data;
  },

  /**
   * Delete an existing address
   * @param {string} id 
   */
  async deleteAddress(id) {
    const res = await axiosClient.delete(`/api/customer/addresses/${id}`);
    return res.data;
  },

  /**
   * Set address as primary default
   * @param {string} id 
   */
  async setDefaultAddress(id) {
    const res = await axiosClient.put(`/api/customer/addresses/${id}/default`);
    return res.data;
  },

  /**
   * Get active vehicle models configured in admin
   */
  async getVehicleModels() {
    const res = await axiosClient.get("/api/vehicles/models");
    return res.data;
  },

  /**
   * Get public tariffs configured in admin (including local packages)
   */
  async getTariffs() {
    const res = await axiosClient.get("/api/vehicles/tariffs");
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
      ...data,
      tripType: data.tripType || "ONE_WAY",
      pickupCity: data.pickupCity || data.from || "Bangalore",
      dropCity: data.dropCity || data.to || "Mysore",
      stops: data.stops || null,
      pickupAddress: data.pickupAddress || data.fromAddress || "Bangalore City Center",
      dropAddress: data.dropAddress || data.toAddress || "Mysore City Center",
      pickupDateTime: data.pickupDateTime || `${formatLocalDateTime(new Date(Date.now() + 3600000))}:00`,
      returnDateTime: data.returnDateTime || null,
      vehicleCategory: data.vehicleCategory || data.carType || "SEDAN",
      passengerCount: data.passengerCount || 1,
      passengerName: data.passengerName || data.name || "",
      passengerPhone: data.passengerPhone || data.phone || "",
      totalFare: Number(data.totalFare || data.fare || 1500),
      advancePaid: Number(data.advancePaid || data.advance || 0),
      paymentStatus: data.paymentStatus || "PENDING",
      paymentMethod: data.paymentMethod || null,
      paymentProofUrl: data.paymentProofUrl || null,
      paymentUtrNumber: data.paymentUtrNumber || null,
      specialInstructions: data.specialInstructions || "",
    });
    return res.data;
  },

  /**
   * Fetch active business UPI configuration
   */
  async getUpiConfig() {
    const res = await axiosClient.get("/api/upi/config");
    return res.data;
  },

  /**
   * Upload customer payment receipt screenshot
   * @param {File} file
   */
  async uploadPaymentProof(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosClient.post("/api/upi/upload-proof", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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

  /**
   * Submit custom customer enquiry (Name, Phone, Requirements)
   * @param {Object} data - { name, phone, requirements, sourcePage }
   */
  async submitEnquiry(data) {
    const res = await axiosClient.post("/api/enquiries", data);
    return res.data;
  },
};

export default customerApi;
