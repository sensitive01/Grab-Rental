"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Send, PhoneCall, CheckCircle2, Clock, ShieldCheck, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { customerApi } from "@/lib/customerApi";

export default function QuickEnquirySection() {
  const pathname = usePathname();
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/40 border-t border-slate-200/80 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-1/4 -mt-12 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-12 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Value Props & Direct Call */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-brand-primary text-xs font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Custom Travel & Corporate Rentals</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Have Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Travel Requirements?</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Planning a multi-city outstation tour, airport bulk transfers, wedding logistics, or need an hourly corporate chauffeur? Let us know your requirements and we will send a tailored quote within minutes.
              </p>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Instant Response</h4>
                  <p className="text-[11px] text-slate-500">Dedicated desk reply within 15 mins</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Transparent Pricing</h4>
                  <p className="text-[11px] text-slate-500">No hidden charges or toll surprises</p>
                </div>
              </div>
            </div>

            {/* Direct Helpline Assistance */}
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-600">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-slate-400 text-[11px] font-medium">Need immediate booking assistance?</span>
                <a
                  href="tel:+919071100200"
                  className="font-bold text-slate-900 hover:text-brand-primary transition-colors text-sm"
                >
                  +91 90711 00200
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 p-6 sm:p-8 relative">
              
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Send an Enquiry</h3>
                    <p className="text-xs text-slate-500">Fill in your basic details and trip requirement.</p>
                  </div>

                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        required
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Requirements (Text Area) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Requirements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="requirements"
                      rows={3}
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="Tell us pickup location, destination, dates, car preference (e.g. Innova Crysta, Sedan, Tempo Traveller), or any special requests..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-brand-primary to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Enquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400 pt-1">
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
