"use client";

import { useState } from "react";
import { Building, TrendingUp, CheckCircle, Headphones } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function CorporatePage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    location: "",
    vehicleType: "",
    seatingCapacity: "",
    requirements: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="text-white py-16 sm:py-20 md:py-24 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center mb-4 sm:mb-8 mt-1 sm:mt-2 md:mt-4">
          <div className="inline-flex items-center gap-2 bg-[#0082fe] border border-blue-400/40 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white mb-3 sm:mb-5 shadow-lg shadow-blue-900/30">
            <Building className="w-3 h-3 text-white" /> {t("corporate_hero_badge")}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            {t("corporate_hero_title")}
          </h1>
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            {t("corporate_hero_subtitle")}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Features */}
            <div>
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-md h-56">
                    <img 
                      src="/images/fleet/sedan.jpg" 
                      alt="Corporate Chauffeur Fleet" 
                      className="w-full h-full object-cover"
                    />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-8">{t("why_partner_with_us")}</h2>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shrink-0">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">{t("corp_credit_facility")}</h4>
                            <p className="text-sm text-slate-600 mt-1">{t("corp_credit_desc")}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-emerald-dark flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">{t("corp_chauffeurs")}</h4>
                            <p className="text-sm text-slate-600 mt-1">{t("corp_chauffeurs_desc")}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 text-brand-sky-dark flex items-center justify-center shrink-0">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900">{t("corp_account_desk")}</h4>
                            <p className="text-sm text-slate-600 mt-1">{t("corp_account_desc")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lead Form */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-amber"></div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{t("request_callback") || "Corporate / Events Booking Enquiry"}</h3>
                <p className="text-sm text-slate-500 mb-6">Fill this form and our B2B team will contact you within 2 hours.</p>
                
                {submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-6 text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-lg font-black text-emerald-900">Enquiry Received!</h4>
                    <p className="text-xs font-medium text-emerald-700">
                      Thank you, <strong className="text-emerald-900">{formData.name}</strong>. Our corporate team will reach out to you shortly on <strong className="text-emerald-900">{formData.mobile}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-3 text-xs font-bold text-emerald-800 underline hover:text-emerald-900"
                    >
                      Submit another enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Name</label>
                              <input 
                                type="text" 
                                required
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Mobile Number</label>
                              <input 
                                type="tel" 
                                required
                                placeholder="10-digit mobile number"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" 
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Location</label>
                              <input 
                                type="text" 
                                required
                                placeholder="City or pickup location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Vehicle Type</label>
                              <select 
                                required
                                value={formData.vehicleType}
                                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none bg-white cursor-pointer"
                              >
                                <option value="">Select Vehicle Type</option>
                                <option value="Hatchback">Hatchback</option>
                                <option value="Sedan">Sedan (Dzire, Etios, Aura)</option>
                                <option value="SUV">SUV (Innova Crysta, Hycross)</option>
                                <option value="Urbania">Force Urbania</option>
                                <option value="Tempo Traveller">Tempo Traveller</option>
                                <option value="Bus">Luxury Bus / Coach</option>
                                <option value="Multiple">Multiple / Mixed Fleet</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Seating Capacity</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 4+driver, 6-8, 12, 17, 35-65 seats"
                            value={formData.seatingCapacity}
                            onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" 
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Requirements</label>
                          <textarea 
                            rows={3}
                            placeholder="Trip dates, itinerary, number of vehicles, special requirements..."
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none resize-none" 
                          />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-brand-navy hover:bg-brand-navy-dark text-white font-bold py-3 rounded-lg mt-4 transition-colors cursor-pointer"
                      >
                          {t("submit_request") || "Submit Request"}
                      </button>
                  </form>
                )}
            </div>

        </div>
      </section>
    </main>
  );
}
