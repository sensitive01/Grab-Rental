"use client";

import { Building, TrendingUp, CheckCircle, Headphones } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function CorporatePage() {
  const { t } = useLanguage();

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
          <div className="inline-flex items-center gap-2 bg-brand-navy-dark/80 backdrop-blur-md border border-slate-700/50 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-brand-amber mb-3 sm:mb-5 shadow-xl">
            <Building className="w-3 h-3 text-brand-amber" /> {t("corporate_hero_badge")}
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
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{t("request_callback") || "Request a Corporate Callback"}</h3>
                <p className="text-sm text-slate-500 mb-6">Fill this form and our B2B team will contact you within 2 hours.</p>
                
                <form className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">{t("company_name") || "Company Name"}</label>
                        <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">{t("contact_person") || "Contact Person"}</label>
                            <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">{t("mobile_number") || "Phone Number"}</label>
                            <input type="tel" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">{t("corporate_email") || "Corporate Email"}</label>
                        <input type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-amber/20 focus:border-brand-amber outline-none" />
                    </div>
                    <button type="button" className="w-full bg-brand-navy hover:bg-brand-navy-dark text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                        {t("submit_request") || "Submit Request"}
                    </button>
                </form>
            </div>

        </div>
      </section>
    </main>
  );
}
