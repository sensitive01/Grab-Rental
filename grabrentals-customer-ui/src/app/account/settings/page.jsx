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
        document.documentElement?.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update account details");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.documentElement?.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setIsSaving(false);
    }
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
                Your phone number is verified. Complete your profile below to personalize your trip receipts and chauffeured ride bookings.
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
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Personal Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact details for invoices, trip updates, and driver pickups.
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
              <div className="space-y-2">
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

              {/* Default Address */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Default Residential / Pickup Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 1204, Imperial Tower, Bandra West, Mumbai - 400050"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0082fe]/20 focus:border-[#0082fe] focus:bg-white transition-all resize-none shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#0082fe] hover:bg-[#0072de] active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-[#0082fe] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
