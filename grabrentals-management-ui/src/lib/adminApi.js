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

      const data = response.data.data;
      if (data) {
        this.logSecurityEvent({
          userId: data.email || String(id),
          userName: data.name || "User",
          userRole: data.role || "MEMBER",
          event: "USER_STATUS_CHANGE",
          status: newStatus === "BLOCKED" ? "WARNING" : "SUCCESS",
          details: `Account status updated to ${newStatus}`,
        });
      }

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

  async updateUser(id, updateData) {
    try {
      let response;
      try {
        response = await axiosClient.put(`/api/admin/users/${id}`, updateData);
      } catch (err) {
        if (err.response?.status === 405) {
          response = await axiosClient.patch(`/api/admin/users/${id}`, updateData);
        } else {
          throw err;
        }
      }
      const updated = response.data?.data;

      if (updated && typeof window !== "undefined") {
        try {
          const cached = this.getCachedUsers();
          const next = cached.map((u) => (u.id === id ? { ...u, ...updated } : u));
          localStorage.setItem(DB_USERS_CACHE_KEY, JSON.stringify(next));

          this.logSecurityEvent({
            userId: updated.email || String(id),
            userName: updated.name || "User",
            userRole: updated.role || "MEMBER",
            event: "USER_UPDATED",
            status: "SUCCESS",
            details: `Updated details for ${updated.name} (${updated.email})`,
          });
        } catch {}
      }

      return {
        success: true,
        source: "backend",
        message: response.data?.message || "User updated successfully",
        data: updated,
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    }
  },

  async deleteUser(id) {
    try {
      const response = await axiosClient.delete(`/api/admin/users/${id}`);

      if (typeof window !== "undefined") {
        try {
          const cached = this.getCachedUsers();
          const next = cached.filter((u) => u.id !== id);
          localStorage.setItem(DB_USERS_CACHE_KEY, JSON.stringify(next));

          this.logSecurityEvent({
            userId: String(id),
            userName: "User",
            userRole: "MEMBER",
            event: "USER_DELETED",
            status: "WARNING",
            details: `Admin deleted user account (${id})`,
          });
        } catch {}
      }

      return {
        success: true,
        source: "backend",
        message: response.data?.message || "User deleted successfully",
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

  async createUser(userData) {
    try {
      const { role, name, email, phone, password, businessName, hubLocation } = userData;
      let endpoint = "/api/admin/users/vendor";
      let payload = {
        name,
        email,
        phone,
        password,
        businessName: businessName || `${name} Travels`,
        status: "ACTIVE",
      };

      if (role === "OPERATIONS") {
        endpoint = "/api/admin/users/operations";
        payload = {
          name,
          email,
          phone,
          password,
          hubLocation: hubLocation || businessName || "Central Dispatch Hub",
        };
      } else if (role === "CUSTOMER") {
        endpoint = "/api/auth/register/customer";
        payload = {
          name,
          email,
          phone,
          password,
        };
      }

      let response;
      try {
        response = await axiosClient.post(endpoint, payload);
      } catch (err) {
        if (endpoint === "/api/admin/users/vendor" && (err.response?.status === 404 || err.response?.status === 405)) {
          response = await axiosClient.post("/api/admin/users/fleet", payload);
        } else {
          throw err;
        }
      }
      const created = response.data?.data;

      if (created && typeof window !== "undefined") {
        try {
          const cached = this.getCachedUsers();
          const updated = [created, ...cached.filter((u) => u.id !== created.id)];
          localStorage.setItem(DB_USERS_CACHE_KEY, JSON.stringify(updated));

          this.logSecurityEvent({
            userId: created.email || email,
            userName: created.name || name,
            userRole: created.role || role,
            event: "USER_PROVISIONED",
            status: "SUCCESS",
            details: `Provisioned new ${created.role || role} account for ${created.name || name} (${created.email || email})`,
          });
        } catch {}
      }

      return {
        success: true,
        source: "backend",
        message: response.data?.message || "User created successfully",
        data: created,
      };
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

  async getAuditLogs(category) {
    try {
      const response = await axiosClient.get("/api/admin/audit-logs", {
        params: category ? { category } : {},
      });
      return {
        success: true,
        source: "backend",
        data: response.data?.data || [],
      };
    } catch (err) {
      console.error("Backend error for getAuditLogs:", err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
        data: [],
      };
    }
  },

  async getSecurityAuditLogs() {
    try {
      const response = await axiosClient.get("/api/admin/audit-logs", {
        params: { category: "SECURITY" },
      });
      return {
        success: true,
        source: "backend",
        data: response.data?.data || [],
      };
    } catch (err) {
      console.error("Backend error for getSecurityAuditLogs:", err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
        data: [],
      };
    }
  },

  async getActivityLogs() {
    try {
      const response = await axiosClient.get("/api/admin/audit-logs", {
        params: { category: "ACTIVITY" },
      });
      return {
        success: true,
        source: "backend",
        data: response.data?.data || [],
      };
    } catch (err) {
      console.error("Backend error for getActivityLogs:", err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
        data: [],
      };
    }
  },

  async logSecurityEvent(entry) {
    try {
      const payload = {
        category: "SECURITY",
        event: entry.event || "SECURITY_ACTION",
        userId: entry.userId,
        userName: entry.userName,
        userRole: entry.userRole,
        ipAddress: entry.ipAddress || (typeof window !== "undefined" ? window.location.hostname : "127.0.0.1"),
        device: entry.device || (typeof navigator !== "undefined" ? navigator.userAgent : "Browser Client"),
        status: entry.status || "SUCCESS",
        details: entry.details,
      };
      const response = await axiosClient.post("/api/admin/audit-logs", payload);
      return response.data?.data;
    } catch (err) {
      console.error("Failed to record security event in backend:", err);
      return null;
    }
  },

  async logActivityEvent(entry) {
    try {
      const payload = {
        category: "ACTIVITY",
        event: entry.actionCode || entry.event || "PLATFORM_ACTION",
        userId: entry.operatorId || entry.userId,
        userName: entry.operatorName || entry.userName,
        userRole: entry.operatorRole || entry.userRole,
        module: entry.module,
        targetEntity: entry.targetEntity,
        ipAddress: entry.ipAddress || (typeof window !== "undefined" ? window.location.hostname : "127.0.0.1"),
        device: entry.device || (typeof navigator !== "undefined" ? navigator.userAgent : "Browser Client"),
        status: entry.status || "SUCCESS",
        details: entry.details,
      };
      const response = await axiosClient.post("/api/admin/audit-logs", payload);
      return response.data?.data;
    } catch (err) {
      console.error("Failed to record activity event in backend:", err);
      return null;
    }
  },
};
