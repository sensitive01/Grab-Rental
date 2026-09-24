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
  Car
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rental_access_token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    fetchProfile(token);
  }, []);

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
        if (response.status === 401) {
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
    } catch (err) {
      setErrorMessage(err.message || "Failed to update account details");
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-slate-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Loading Account Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-grow">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Booking
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Account Management
          </span>
        </div>

        {/* Welcome Toast for First-Time Users */}
        {isWelcome && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-300">Welcome to Grab Rentals!</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Your phone number is verified. Complete your profile below to personalize your trip receipts and chauffeured ride bookings.
              </p>
            </div>
          </div>
        )}

        {/* Overview Header Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/50 border border-slate-800/80 backdrop-blur-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              {name ? name.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {name || "Customer"}
                </h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1 text-slate-300 font-mono">
                  <Phone className="w-3 h-3 text-amber-400" /> {phone}
                </span>
                {memberSince && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" /> Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Car className="w-4 h-4" /> Book a Chauffeur
          </Link>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">Personal Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your contact details for invoices, trip updates, and driver pickups.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-500">Invoices and booking confirmations are sent here.</span>
              </div>

              {/* Phone (Read Only / Verified) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Registered Mobile</span>
                  <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value={phone}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Alternate / Emergency Contact
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="+91 98112 23344"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Current City
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Default Address */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Default Residential / Pickup Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 1204, Imperial Tower, Bandra West, Mumbai - 400050"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Account Settings"}</span>
              </button>
            </div>
          </div>
        </form>

      </main>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070A0F] text-slate-100 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
