"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  Calendar,
  Sparkles,
  Car,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Star,
  X
} from "lucide-react";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "true";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [memberSince, setMemberSince] = useState("");

  // Saved Addresses State (Home, Office, Other, etc.)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    tag: "Home",
    customTag: "",
    addressLine: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    let timer;
    const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
    if (!token) {
      timer = setTimeout(() => {
        router.push("/login");
      }, 0);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    fetchProfile(token);
    fetchAddresses(token);
  }, [router]);

  const fetchProfile = async (token) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401 || response.status === 404) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("rental_access_token");
            localStorage.removeItem("rental_user");
          }
          router.push("/login");
          return;
        }
        throw new Error(result.message || "Failed to load profile details");
      }

      const user = result.data;
      setName(user.name && user.name !== "Customer" ? user.name : "");
      setEmail(user.email && !user.email.endsWith("@grabrentals.guest") ? user.email : "");
      setPhone(user.phone || "");
      setAlternatePhone(user.alternatePhone || "");
      setCity(user.city || "");
      setAddress(user.address || "");
      if (user.addresses && Array.isArray(user.addresses)) {
        setSavedAddresses(user.addresses);
      }
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        setMemberSince(date.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
      }
    } catch (err) {
      setErrorMessage(err.message || "Unable to fetch account profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/addresses`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && result.success && Array.isArray(result.data)) {
        setSavedAddresses(result.data);
      }
    } catch (err) {
      console.error("Unable to load saved addresses:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          alternatePhone: alternatePhone.trim(),
          city: city.trim(),
          address: address.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 401 || response.status === 404) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("rental_access_token");
            localStorage.removeItem("rental_user");
          }
          router.push("/login?error=" + encodeURIComponent("Your session has expired or account was removed. Please verify your phone number."));
          return;
        }
        throw new Error(result.message || "Failed to update profile");
      }

      // Update local storage user details
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("rental_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = result.data.name;
          parsed.email = result.data.email;
          localStorage.setItem("rental_user", JSON.stringify(parsed));
        }
      }

      setSuccessMessage("Personal details updated successfully!");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update account details");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Address Modal Helpers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      tag: "Home",
      customTag: "",
      addressLine: "",
      area: "",
      city: city || "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: savedAddresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    const isStandard = ["Home", "Office"].includes(addr.tag);
    setAddressForm({
      tag: isStandard ? addr.tag : "Other",
      customTag: isStandard ? "" : addr.tag,
      addressLine: addr.addressLine || "",
      area: addr.area || "",
      city: addr.city || city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      landmark: addr.landmark || "",
      isDefault: Boolean(addr.isDefault),
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);
    setErrorMessage("");
    setSuccessMessage("");

    const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    const finalTag = addressForm.tag === "Other" && addressForm.customTag.trim()
      ? addressForm.customTag.trim()
      : addressForm.tag;

    const payload = {
      tag: finalTag,
      addressLine: addressForm.addressLine.trim(),
      area: addressForm.area.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.trim(),
      landmark: addressForm.landmark.trim(),
      isDefault: addressForm.isDefault,
    };

    try {
      const url = editingAddressId
        ? `${API_BASE_URL}/api/customer/addresses/${editingAddressId}`
        : `${API_BASE_URL}/api/customer/addresses`;
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save address");
      }

      if (payload.isDefault) {
        setAddress(payload.addressLine);
        if (payload.city) setCity(payload.city);
      }

      await fetchAddresses(token);
      setIsAddressModalOpen(false);
      setSuccessMessage(editingAddressId ? "Address updated successfully!" : "New address added successfully!");
    } catch (err) {
      setErrorMessage(err.message || "Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to delete address");
      await fetchAddresses(token);
      setSuccessMessage("Address deleted successfully!");
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/addresses/${id}/default`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to set default address");
      if (result.data) {
        setAddress(result.data.addressLine);
        if (result.data.city) setCity(result.data.city);
      }
      await fetchAddresses(token);
      setSuccessMessage("Default pickup address updated!");
    } catch (err) {
      setErrorMessage(err.message || "Failed to set default address");
    }
  };

  const getTagIcon = (tag = "") => {
    const lower = tag.toLowerCase();
    if (lower.includes("home")) return <Home className="w-4 h-4 text-emerald-600" />;
    if (lower.includes("office") || lower.includes("work")) return <Briefcase className="w-4 h-4 text-blue-600" />;
    return <MapPin className="w-4 h-4 text-amber-600" />;
  };

  const getTagBadgeClass = (tag = "") => {
    const lower = tag.toLowerCase();
    if (lower.includes("home")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (lower.includes("office") || lower.includes("work")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0082fe] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading Account Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#0082fe] selection:text-white flex flex-col justify-between">
      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-grow">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0082fe] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Booking
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account Management
          </span>
        </div>

        {/* Welcome Toast for First-Time Users */}
        {isWelcome && (
          <div className="mb-8 p-4 rounded-xl bg-blue-50/90 border border-blue-200 flex items-start gap-3 shadow-2xs">
            <Sparkles className="w-5 h-5 text-[#0082fe] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Welcome to Grab Rentals!</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Your phone number is verified. Complete your profile and saved addresses below for faster bookings and instant pickup.
              </p>
            </div>
          </div>
        )}

        {/* Overview Header Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0082fe] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20">
              {name ? name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {name || "Customer"}
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-slate-700 font-mono font-medium">
                  <Phone className="w-3 h-3 text-[#0082fe]" /> {phone}
                </span>
                {memberSince && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" /> Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-[#0082fe] hover:bg-[#0072de] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Car className="w-4 h-4" /> Book a Cab
          </Link>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div 
            id="feedback-alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3 shadow-2xs animate-in fade-in duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div 
            id="feedback-alert"
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-2xs animate-in fade-in duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="flex-1">{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: Personal Details Form */}
        <form onSubmit={handleSave} className="space-y-6 mb-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Personal Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details for invoices, trip updates, and driver communication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
                <span className="text-[11px] text-slate-500">Invoices and booking confirmations are sent here.</span>
              </div>

              {/* Phone (Read Only / Verified) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Registered Mobile</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value={phone}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed select-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Alternate / Emergency Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="+91 98112 23344"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Current City
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Personal Details"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* SECTION 2: Multiple Saved Addresses (Home, Office, Other) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Saved Addresses</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0082fe] border border-blue-200">
                  {savedAddresses.length} {savedAddresses.length === 1 ? "Address" : "Addresses"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Save multiple addresses like Home, Office, or Airport for rapid 1-click booking.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="px-4 py-2.5 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Quick Address Previews or Empty State */}
          {savedAddresses.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0082fe] flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No saved addresses yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add your Home, Office, or frequent pickup addresses so you never have to re-enter them during checkout.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      tag: "Home",
                      customTag: "",
                      addressLine: address || "",
                      city: city || "",
                      pincode: "",
                      landmark: "",
                      isDefault: true,
                    });
                    setIsAddressModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#0082fe] text-slate-700 hover:text-[#0082fe] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-600" /> + Add Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      tag: "Office",
                      customTag: "",
                      addressLine: "",
                      city: city || "",
                      pincode: "",
                      landmark: "",
                      isDefault: false,
                    });
                    setIsAddressModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#0082fe] text-slate-700 hover:text-[#0082fe] text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> + Add Office
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                    addr.isDefault
                      ? "border-[#0082fe] bg-blue-50/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Header: Tag + Default Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${getTagBadgeClass(addr.tag)}`}>
                          {getTagIcon(addr.tag)}
                          <span>{addr.tag}</span>
                        </span>

                        {addr.isDefault && (
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0082fe] flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#0082fe]" /> Default Pickup
                          </span>
                        )}
                      </div>

                      {/* Action icons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          title="Edit address"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0082fe] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          title="Delete address"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Address Text */}
                    <p className="text-sm font-semibold text-slate-800 leading-snug mt-2">
                      {addr.addressLine}
                    </p>

                    {/* Secondary details */}
                    <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                      <p>
                        {[addr.area, addr.city, addr.state, addr.pincode ? `PIN: ${addr.pincode}` : null].filter(Boolean).join(" • ")}
                      </p>
                      {addr.landmark && (
                        <p className="text-[11px] text-slate-400">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  {!addr.isDefault && (
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs font-bold text-[#0082fe] hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3" /> Set as Default Pickup
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* MODAL: ADD / EDIT ADDRESS */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0082fe] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide complete address for door-to-door pickup.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSaveAddress} className="space-y-4 pt-4">
              
              {/* Address Tag Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Address Tag
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: "Home", label: "Home", icon: Home },
                    { key: "Office", label: "Office", icon: Briefcase },
                    { key: "Other", label: "Other", icon: MapPin },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, tag: key })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        addressForm.tag === key
                          ? "bg-[#0082fe] text-white border-[#0082fe] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {addressForm.tag === "Other" && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={addressForm.customTag}
                      onChange={(e) => setAddressForm({ ...addressForm, customTag: e.target.value })}
                      placeholder="e.g. Airport Villa, Friend's Place"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Building number / street name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Building number / street name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Green Heights / House #24, 10th Main Road"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Area, City, State, Pincode in 4 columns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.area}
                    onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                    placeholder="e.g. Indiranagar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })}
                    placeholder="e.g. 560038"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Landmark (Nearby prominent place / junction)
                </label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  placeholder="e.g. Opposite Metro Station, Near Apollo Pharmacy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Set as Default Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0082fe] focus:ring-[#0082fe] border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Set as my default pickup address
                  </span>
                </label>
              </div>

              {/* Modal CTA Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress || !addressForm.addressLine.trim() || !addressForm.city.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingAddress ? "Saving..." : "Save Address"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-[#0082fe] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
