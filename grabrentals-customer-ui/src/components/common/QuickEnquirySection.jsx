"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { 
  Send, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Loader2,
  MessageCircle 
} from "lucide-react";
import { customerApi } from "@/lib/customerApi";

export default function QuickEnquirySection() {
  const pathname = usePathname();

  // Exclude enquiry section on account management, support, notifications, auth, and active booking checkout pages
  if (
    pathname?.startsWith("/account") ||
    pathname?.startsWith("/support") ||
    pathname?.includes("notifications") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/login") ||
    pathname?.includes("/review-pay") ||
    pathname?.includes("/select-vehicle") ||
    pathname?.includes("/trip-details") ||
    pathname?.includes("/booking/")
  ) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Clean phone input to digits and limit to 10 chars
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.requirements.trim()) {
      setErrorMessage("Please share your travel requirements or destination details.");
      return;
    }

    setLoading(true);

    try {
      await customerApi.submitEnquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        requirements: formData.requirements.trim(),
        sourcePage: pathname || "/",
      });

      setSubmitted(true);
      setFormData({ name: "", phone: "", requirements: "" });
    } catch (err) {
      console.error("Enquiry submission error:", err);
      const msg = err.response?.data?.message || "Failed to submit enquiry. Please call us directly.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border-t border-slate-200/70 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* 1. Left Section: Grab Rentals Graphic Badge */}
          <div className="md:col-span-1 lg:col-span-3 flex justify-center items-center">
            <div className="w-full max-w-[280px] sm:max-w-[300px] lg:max-w-none flex items-center justify-center">
              <img
                src="/images/grab-rentals-badge.jpg"
                alt="Grab Rentals - Explore, Travel, Repeat"
                className="w-full h-auto object-contain hover:scale-102 transition-transform duration-300"
              />
            </div>
          </div>

          {/* 2. Middle Section: Content (Heading, Features & Call / WhatsApp Buttons) */}
          <div className="md:col-span-1 lg:col-span-5 space-y-4">
            <a
              href="tel:+919071100200"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/80 text-slate-800 text-xs font-bold tracking-wide shadow-xs transition-all group cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>
                Ph: (+91) <span className="text-emerald-600 font-extrabold tracking-wider">9071 100 200</span>
              </span>
            </a>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Have Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Travel Requirements?</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Planning a multi-city outstation tour, airport bulk transfers, wedding logistics, or need an hourly corporate chauffeur? Let us know your requirements and we will send a tailored quote within minutes.
              </p>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-xs">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Instant Response</h4>
                  <p className="text-[11px] text-slate-500">Dedicated desk reply in 15 mins</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-xs">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Transparent Pricing</h4>
                  <p className="text-[11px] text-slate-500">No hidden charges or surprises</p>
                </div>
              </div>
            </div>

            {/* Call and WhatsApp Buttons placed right below Instant Response & Transparent Pricing */}
            <div className="pt-1.5">
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="tel:+919071100200"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all group cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span>Call Us</span>
                </a>

                <a
                  href="https://wa.me/919071100200?text=Hi%2C%20I%20have%20an%20enquiry%20regarding%20cab%20rentals%20with%20Grab%20Rentals."
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. Right Section: Enquiry Form */}
          <div className="md:col-span-2 lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-100 p-5 sm:p-6">
              
              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Enquiry Received!</h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                      Thank you! Our travel consultant is reviewing your requirements and will call you on your phone number shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer mt-2"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="text-base font-bold text-slate-900">Send an Enquiry</h3>
                    <p className="text-xs text-slate-500">Fill in your basic details and trip requirement.</p>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name and Phone Number in the Same Line */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="10-digit mobile"
                          required
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requirements (Text Area) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Requirements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="requirements"
                      rows={2.5}
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="Pickup city, destination, dates, preferred vehicle (Innova Crysta, Sedan, Tempo Traveller), etc."
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-blue-100 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-brand-primary to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Enquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400 pt-0.5">
                    🔒 Your details are safe with us. No spam, only direct travel assistance.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
