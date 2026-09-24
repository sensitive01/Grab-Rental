import { simulateLatency, createApiResponse } from "./api";
import axiosClient from "./axiosClient";
import {
  initialVendors,
  initialVehicles,
  initialDrivers,
  initialBookings,
  pricingMatrix,
  refundRequests,
  complaintsList,
  auditLogs,
  platformLocations,
  platformServices,
  initialReviews,
} from "./mockData";

let vendors = [...initialVendors];
let pricing = [...pricingMatrix];
let refunds = [...refundRequests];
let complaints = [...complaintsList];
let logs = [...auditLogs];

const DB_USERS_CACHE_KEY = "grabrentals_db_users_cache";

export const adminApi = {
  getCachedUsers() {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(DB_USERS_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // === ALL USERS DIRECTORY CONNECTED DIRECTLY TO POSTGRESQL BACKEND VIA AXIOS ===
  async getAllUsers() {
    try {
      const response = await axiosClient.get("/api/admin/users");
      const json = response.data;

      if (json.success && Array.isArray(json.data)) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(DB_USERS_CACHE_KEY, JSON.stringify(json.data));
          } catch {}
        }
        return {
          success: true,
          source: "backend",
          url: `${axiosClient.defaults.baseURL}/api/admin/users`,
          message: "Users retrieved from Spring Boot PostgreSQL backend (Axios)",
          data: json.data,
        };
      }
      throw new Error(json.message || "Invalid response format from database");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error("Backend database request failed for getAllUsers:", msg);
      const cached = this.getCachedUsers();
      if (cached.length > 0) {
        return {
          success: true,
          source: "cache",
          data: cached,
          error: msg,
        };
      }
      return {
        success: false,
        source: "backend",
        url: `${axiosClient.defaults.baseURL}/api/admin/users`,
        error: msg,
        data: [],
      };
    }
  },

  async updateUserStatus(id, newStatus) {
    try {
      const response = await axiosClient.patch(`/api/admin/users/${id}/status`, {
        status: newStatus,
      });

      return {
        success: true,
        source: "backend",
        message: "User status updated in PostgreSQL database (Axios)",
        data: response.data.data,
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
  },

  async getUserById(id) {
    try {
      const response = await axiosClient.get(`/api/admin/users/${id}`);
      return { success: true, source: "backend", data: response.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
  },

  // === PLATFORM GOVERNANCE METRICS & MODULES ===
  async getKPIs() {
    await simulateLatency();
    const totalRevenue = initialBookings.reduce(
      (acc, curr) => acc + (curr.status !== "CANCELLED" ? curr.fare : 0),
      0
    );
    const activeVendors = vendors.filter((v) => v.status === "APPROVED").length;
    const pendingVendorApprovals = vendors.filter((v) => v.status === "PENDING_APPROVAL").length;
    const totalFleet = initialVehicles.length;
    const pendingRefunds = refunds.filter((r) => r.status === "PROCESSING").length;

    const usersRes = await this.getAllUsers();
    const liveUsers = usersRes.success && Array.isArray(usersRes.data) ? usersRes.data : [];
    const dbCustomerCount = liveUsers.filter((u) => u.role === "CUSTOMER").length;

    return createApiResponse({
      totalRevenue: totalRevenue + 342000,
      activeBookings: initialBookings.filter((b) => ["ASSIGNED", "EN_ROUTE"].includes(b.status)).length,
      totalCustomers: dbCustomerCount,
      activeVendors,
      pendingVendorApprovals,
      totalFleet,
      pendingRefunds,
      growthRateMoM: "+18.2%",
    });
  },

  async getCustomers() {
    const res = await this.getAllUsers();
    if (res.success && Array.isArray(res.data)) {
      const dbCusts = res.data
        .filter((u) => u.role === "CUSTOMER")
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "—",
          city: "India",
          totalBookings: 0,
          totalSpent: 0,
          status: u.status,
          joinedDate: u.createdAt ? u.createdAt.slice(0, 10) : "2025-01-01",
        }));
      return createApiResponse(dbCusts);
    }
    return createApiResponse([]);
  },

  async getCustomerById(id) {
    const userRes = await this.getUserById(id);
    if (!userRes.success || !userRes.data) throw new Error("Customer not found in database");
    const cust = userRes.data;
    const custBookings = initialBookings.filter((b) => b.customerEmail === cust.email);
    return createApiResponse({
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone || "—",
      city: "India",
      status: cust.status,
      joinedDate: cust.createdAt ? cust.createdAt.slice(0, 10) : "2025-01-01",
      bookings: custBookings,
    });
  },

  async toggleCustomerStatus(id) {
    const userRes = await this.getUserById(id);
    if (!userRes.success || !userRes.data) throw new Error("Customer not found");
    const nextStatus = userRes.data.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const updateRes = await this.updateUserStatus(id, nextStatus);
    return createApiResponse(updateRes.data, "Customer status updated in database");
  },

  async getVendors() {
    await simulateLatency();
    return createApiResponse(vendors);
  },

  async getVendorById(id) {
    await simulateLatency();
    const vendor = vendors.find((v) => v.id === id);
    if (!vendor) throw new Error("Vendor not found");
    const vendorVehicles = initialVehicles.filter((v) => v.vendorId === id);
    const vendorDrivers = initialDrivers.filter((d) => d.vendorId === id);
    return createApiResponse({ ...vendor, vehicles: vendorVehicles, drivers: vendorDrivers });
  },

  async approveVendor(id, commissionRate = 12) {
    await simulateLatency();
    const vendor = vendors.find((v) => v.id === id);
    if (vendor) {
      vendor.status = "APPROVED";
      vendor.commissionRate = commissionRate;
    }
    return createApiResponse(vendor, "Vendor approved successfully");
  },

  async getOperationsUsers() {
    const res = await this.getAllUsers();
    if (res.success && Array.isArray(res.data)) {
      const opsStaff = res.data
        .filter((u) => u.role === "OPERATIONS")
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || "—",
          role: "Operations Dispatcher",
          city: u.businessName || "Primary Hub",
          status: u.status,
          shiftsAssigned: "Standard Shift (08:00 - 17:00)",
          lastLogin: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active",
        }));
      return createApiResponse(opsStaff);
    }
    return createApiResponse([]);
  },

  async createOperationsUser(data) {
    try {
      const response = await axiosClient.post("/api/admin/users/operations", {
        name: data.name,
        email: data.email,
        phone: data.phone || "+91 98000 00000",
        password: data.password || "Operations@123",
      });

      return createApiResponse(response.data.data, "Operations staff user created in PostgreSQL database (Axios)");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
  },

  async getRefunds() {
    await simulateLatency();
    return createApiResponse(refunds);
  },

  async processRefund(id, approvedRefund, reason) {
    await simulateLatency();
    const ref = refunds.find((r) => r.id === id);
    if (ref) {
      ref.status = "COMPLETED";
      ref.approvedRefund = approvedRefund;
      ref.resolutionNotes = reason;
      ref.processedAt = new Date().toISOString();
    }
    return createApiResponse(ref, "Refund authorized and processed");
  },

  async getPricing() {
    await simulateLatency();
    return createApiResponse(pricing);
  },

  async updatePricing(category, updatedData) {
    await simulateLatency();
    const idx = pricing.findIndex((p) => p.category === category);
    if (idx !== -1) {
      pricing[idx] = { ...pricing[idx], ...updatedData };
    }
    return createApiResponse(pricing[idx], "Pricing matrix updated");
  },

  async getLocations() {
    await simulateLatency();
    return createApiResponse(platformLocations);
  },

  async getServices() {
    await simulateLatency();
    return createApiResponse(platformServices);
  },

  async getReviews() {
    await simulateLatency();
    return createApiResponse(initialReviews);
  },

  async getComplaints() {
    await simulateLatency();
    return createApiResponse(complaints);
  },

  async updateComplaint(id, newStatus) {
    await simulateLatency();
    const c = complaints.find((item) => item.id === id);
    if (c) c.status = newStatus;
    return createApiResponse(c, "Complaint ticket updated");
  },

  async getAuditLogs() {
    await simulateLatency();
    return createApiResponse(logs);
  },
};
