"use client";

import { useState, useEffect, useRef, Suspense } from "react";
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
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { getCurrentUser, setAuthSession } from "@/lib/auth";
import LocationPickerModal from "@/components/booking/LocationPickerModal";

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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
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
    latitude: null,
    longitude: null,
    isDefault: false,
  });

  // Security & Reset PIN Modal State
  const [isPinConfigured, setIsPinConfigured] = useState(false);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [showPinDigits, setShowPinDigits] = useState(false);
  const [pinModalError, setPinModalError] = useState("");
  const newPinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const fetchProfile = async (token) => {
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
      if (typeof user.passwordSet === "boolean") {
        setIsPinConfigured(user.passwordSet);
      } else {
        const localUser = getCurrentUser();
        setIsPinConfigured(Boolean(localUser?.passwordSet));
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

    timer = setTimeout(() => {
      fetchProfile(token);
      fetchAddresses(token);
    }, 0);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [router]);

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
    setMapCoords(null);
    setAddressForm({
      tag: "Home",
      customTag: "",
      addressLine: "",
      area: "",
      city: city || "",
      state: "",
      pincode: "",
      landmark: "",
      latitude: null,
      longitude: null,
      isDefault: savedAddresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    if (addr.latitude != null && addr.longitude != null) {
      setMapCoords({ lat: Number(addr.latitude), lng: Number(addr.longitude) });
    } else {
      setMapCoords(null);
    }
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
      latitude: addr.latitude != null ? Number(addr.latitude) : null,
      longitude: addr.longitude != null ? Number(addr.longitude) : null,
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
      latitude: addressForm.latitude,
      longitude: addressForm.longitude,
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

  // PIN Reset Handlers
  const handleOpenResetPin = () => {
    setNewPin(["", "", "", "", "", ""]);
    setConfirmPin(["", "", "", "", "", ""]);
    setShowPinDigits(false);
    setPinModalError("");
    setIsResetPinOpen(true);
    setTimeout(() => {
      newPinRefs.current[0]?.focus();
    }, 150);
  };

  const handleCloseResetPin = () => {
    setIsResetPinOpen(false);
    setPinModalError("");
  };

  const handlePinDigitChange = (index, value, isConfirm = false) => {
    const cleanDigit = value.replace(/[^0-9]/g, "").slice(-1);
    const targetState = isConfirm ? [...confirmPin] : [...newPin];
    const targetRefs = isConfirm ? confirmPinRefs : newPinRefs;

    targetState[index] = cleanDigit;

    if (isConfirm) {
      setConfirmPin(targetState);
    } else {
      setNewPin(targetState);
    }

    if (cleanDigit && index < 5) {
      targetRefs.current[index + 1]?.focus();
    } else if (cleanDigit && index === 5 && !isConfirm) {
      confirmPinRefs.current[0]?.focus();
    }
  };

  const handlePinKeyDown = (index, e, isConfirm = false) => {
    const targetState = isConfirm ? confirmPin : newPin;
    const targetRefs = isConfirm ? confirmPinRefs : newPinRefs;

    if (e.key === "Backspace") {
      if (!targetState[index] && index > 0) {
        targetRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePinPaste = (e, isConfirm = false) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

    const digits = pasteData.split("");
    const targetState = isConfirm ? [...confirmPin] : [...newPin];
    const targetRefs = isConfirm ? confirmPinRefs : newPinRefs;

    digits.forEach((d, i) => {
      if (i < 6) targetState[i] = d;
    });

    if (isConfirm) {
      setConfirmPin(targetState);
    } else {
      setNewPin(targetState);
    }

    const focusIdx = Math.min(digits.length, 5);
    targetRefs.current[focusIdx]?.focus();
  };

  const handleResetPinSubmit = async (e) => {
    if (e) e.preventDefault();
    setPinModalError("");

    const pinStr = newPin.join("");
    const confirmPinStr = confirmPin.join("");

    if (pinStr.length !== 6) {
      setPinModalError("Please enter all 6 numeric digits for your new PIN.");
      return;
    }

    if (confirmPinStr.length !== 6) {
      setPinModalError("Please confirm your new 6-digit PIN.");
      return;
    }

    if (pinStr !== confirmPinStr) {
      setPinModalError("The confirmation PIN does not match. Please verify and re-enter.");
      return;
    }

    setIsResettingPin(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/customer/pin/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ pin: pinStr })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update login PIN. Please try again.");
      }

      // Update session local storage
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.passwordSet = true;
        setAuthSession(token, currentUser);
      }
      setIsPinConfigured(true);

      setIsResetPinOpen(false);
      setSuccessMessage("Your 6-digit login PIN has been updated successfully! You can use it on your next sign in.");
      
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setPinModalError(err.message || "An unexpected error occurred while saving your PIN.");
    } finally {
      setIsResettingPin(false);
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

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenResetPin}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
            >
              <KeyRound className="w-4 h-4 text-[#0082fe]" /> Reset Login PIN
            </button>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-[#0082fe] hover:bg-[#0072de] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <Car className="w-4 h-4" /> Book a Cab
            </Link>
          </div>
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

        {/* SECTION 2: Security & Login PIN */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Security & Login PIN</h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                  isPinConfigured
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isPinConfigured ? "6-Digit PIN Active" : "PIN Setup Recommended"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Use your 6-digit login PIN to quickly sign in from any browser without waiting for an SMS verification OTP.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenResetPin}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <KeyRound className="w-4 h-4 text-[#0082fe]" />
              <span>{isPinConfigured ? "Reset Login PIN" : "Set Up Login PIN"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0082fe] flex items-center justify-center shrink-0 border border-blue-100">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Login PIN Status</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Secured
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sign in with mobile number + PIN anytime. Never share your PIN with anyone.
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="font-mono text-sm tracking-widest text-slate-700 font-bold bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    ••••••
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenResetPin}
                    className="text-xs font-bold text-[#0082fe] hover:underline cursor-pointer"
                  >
                    Reset PIN →
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SMS OTP Backup</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  If you ever forget your login PIN, you can securely sign in using a one-time SMS verification code sent to your registered number.
                </p>
                <div className="mt-3 text-xs font-mono font-medium text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0082fe]" /> {phone || "Registered phone"}
                </div>
              </div>
            </div>
          </div>
        </div>

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

                        {addr.latitude != null && addr.longitude != null && (
                          <span
                            title={`GPS: ${Number(addr.latitude).toFixed(4)}°N, ${Number(addr.longitude).toFixed(4)}°E`}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1"
                          >
                            <MapPin className="w-2.5 h-2.5" /> Map Pinned
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
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Building number / street name *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0082fe] hover:text-[#006ed6] hover:underline cursor-pointer group whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0082fe] group-hover:scale-110 transition-transform" />
                    <span>Choose from Map</span>
                  </button>
                </div>
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

      {/* Interactive Map Location Picker Modal */}
      {isMapModalOpen && (
        <LocationPickerModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          allowTargetSwitch={false}
          allowStops={false}
          title="Choose Address on Map"
          subtitle="Search place, pin on map, or use GPS to set your address"
          initialValue={addressForm.addressLine || addressForm.city || city || "Bangalore, Karnataka"}
          pickupValue={addressForm.addressLine || addressForm.city || city || ""}
          initialPickupCoords={mapCoords}
          onSelect={(selectedLocation, coords, target, allValues, details) => {
            if (coords) setMapCoords(coords);
            setAddressForm((prev) => {
              const newArea = details?.area || prev.area;
              const newCity = details?.city || prev.city;
              const newState = (details?.state && details.state !== "India") ? details.state : prev.state;
              const newPincode = details?.pincode || prev.pincode;

              const chosenStreet = selectedLocation || details?.fullAddress || "";
              const hasExistingHouseNumber = /^(flat|apt|house|villa|#|\d+[\w\s,-]*)/i.test(prev.addressLine.trim());
              let newAddressLine = chosenStreet;
              if (prev.addressLine && hasExistingHouseNumber && !chosenStreet.toLowerCase().includes(prev.addressLine.toLowerCase().trim())) {
                newAddressLine = `${prev.addressLine.trim()}, ${chosenStreet}`;
              } else {
                newAddressLine = chosenStreet || prev.addressLine;
              }

              const chosenLat = coords?.lat != null ? Number(coords.lat) : details?.lat != null ? Number(details.lat) : prev.latitude;
              const chosenLng = coords?.lng != null ? Number(coords.lng) : details?.lng != null ? Number(details.lng) : prev.longitude;

              return {
                ...prev,
                addressLine: newAddressLine,
                area: newArea,
                city: newCity,
                state: newState,
                pincode: newPincode,
                latitude: chosenLat,
                longitude: chosenLng,
              };
            });
            setIsMapModalOpen(false);
          }}
        />
      )}

      {/* MODAL: RESET LOGIN PIN */}
      {isResetPinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0082fe] flex items-center justify-center border border-blue-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Reset Login PIN
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set a new 6-digit PIN for your account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseResetPin}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in Modal */}
            {pinModalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="font-semibold">{pinModalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleResetPinSubmit} className="space-y-5 pt-4">
              
              {/* Row 1: New PIN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#0082fe]" />
                    <span>Enter New 6-Digit PIN</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPinDigits(!showPinDigits)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showPinDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#0082fe]" />}
                    <span>{showPinDigits ? "Hide" : "Show"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={(e) => handlePinPaste(e, false)}>
                  {newPin.map((digit, index) => (
                    <input
                      key={`new-pin-${index}`}
                      ref={(el) => (newPinRefs.current[index] = el)}
                      type={showPinDigits ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinDigitChange(index, e.target.value, false)}
                      onKeyDown={(e) => handlePinKeyDown(index, e, false)}
                      className="w-10 h-12 sm:w-12 sm:h-13 text-center text-xl sm:text-2xl font-black rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0082fe] focus:ring-2 focus:ring-blue-100 transition-all text-slate-900"
                    />
                  ))}
                </div>
              </div>

              {/* Row 2: Confirm New PIN */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Confirm New 6-Digit PIN</span>
                </label>

                <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={(e) => handlePinPaste(e, true)}>
                  {confirmPin.map((digit, index) => (
                    <input
                      key={`confirm-pin-${index}`}
                      ref={(el) => (confirmPinRefs.current[index] = el)}
                      type={showPinDigits ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinDigitChange(index, e.target.value, true)}
                      onKeyDown={(e) => handlePinKeyDown(index, e, true)}
                      className="w-10 h-12 sm:w-12 sm:h-13 text-center text-xl sm:text-2xl font-black rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-900"
                    />
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your new PIN will take effect immediately for all future logins.</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseResetPin}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPin || newPin.join("").length !== 6 || confirmPin.join("").length !== 6}
                  className="px-5 py-2.5 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isResettingPin ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save New PIN</span>
                    </>
                  )}
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
