"use client";

import { useState, useRef } from "react";
import BookingWidget from "@/components/home/BookingWidget";
import VehicleClassSelector from "@/components/home/VehicleClassSelector";
import InPageBanner from "@/components/banner/InPageBanner";
import QuickEnquirySection from "@/components/common/QuickEnquirySection";
import {
  CheckCircle,
  ShieldCheck,
  MapPin,
  Star,
  FileText,
  UserCheck,
  BadgeCheck,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ArrowRight,
  User,
  CreditCard,
  Car,
  PhoneCall
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  // Corridors Carousel Scroll Ref
  const corridorsRef = useRef(null);
  const scrollCorridors = (direction) => {
    if (corridorsRef.current) {
      corridorsRef.current.scrollBy({
        left: direction === "left" ? -340 : 340,
        behavior: "smooth"
      });
    }
  };

  // FAQ Accordion State (multiple can be opened/closed)
  const [openFaqs, setOpenFaqs] = useState({});
  const toggleFaq = (index) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const corridors = [
    {
      route: "Bangalore ➔ Mysore",
      price: "₹1,850",
      dist: "145 km",
      image: "/images/routes/mysore.jpg",
      slug: "bangalore-mysore"
    },
    {
      route: "Delhi NCR ➔ Agra",
      price: "₹2,299",
      dist: "230 km",
      image: "/images/routes/agra.jpg",
      slug: "delhi-agra"
    },
    {
      route: "Mumbai ➔ Pune",
      price: "₹1,999",
      dist: "150 km",
      image: "/images/routes/pune.jpg",
      slug: "mumbai-pune"
    },
    {
      route: "Delhi ➔ Jaipur",
      price: "₹2,750",
      dist: "280 km",
      image: "/images/routes/jaipur.jpg",
      slug: "delhi-jaipur"
    },
    {
      route: "Chennai ➔ Pondy",
      price: "₹2,100",
      dist: "155 km",
      image: "/images/routes/pondy.jpg",
      slug: "chennai-pondy"
    },
    {
      route: "Bangalore ➔ Ooty",
      price: "₹4,100",
      dist: "275 km",
      image: "/images/routes/ooty.jpg",
      slug: "bangalore-ooty"
    },
  ];

  const faqs = [
    {
      q: "What is included in the rental fare?",
      a: "All our fares are 100% transparent and all-inclusive. It covers vehicle rental, fuel, driver allowance, highway tolls, state entry permits, and GST with zero hidden surcharges."
    },
    {
      q: "Is there any cancellation charge?",
      a: "Zero cancellation fees apply when cancelled up to 6 hours before scheduled trip departure. Instant reversals are initiated directly to your original payment method (UPI / Card)."
    },
    {
      q: "Do you provide airport pickup and drop?",
      a: "Yes! We operate 24/7 dedicated airport transfers across all major domestic and international airports in India with flight tracking and 100% on-time chauffeur arrival guarantee."
    },
    {
      q: "Are your drivers verified?",
      a: "Every Grab Rentals chauffeur goes through a mandatory 3-tier vetting process: police background clearing, valid commercial driving badge, and a minimum of 8+ years verified highway driving record."
    },
    {
      q: "Can I get a GST invoice for corporate travel?",
      a: "Yes, automated GST-compliant tax invoices with your business name and GSTIN are automatically generated and emailed immediately upon trip completion for seamless input tax credits."
    },
    {
      q: "Do you provide outstation night travel?",
      a: "Yes, outstation cabs are fully operational 24/7 for day and night trips. Night travel features scheduled driver rest verifications and continuous live GPS operations desk tracking."
    }
  ];

  return (
    <main className="flex flex-col bg-slate-50">

      {/* 1. Hero Section */}
      <section className="text-white pt-6 sm:pt-8 md:pt-12 pb-28 sm:pb-36 md:pb-44 px-3 sm:px-4 lg:px-8 relative overflow-hidden flex flex-col items-center bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/30 to-slate-950/80"></div>

        <div className="max-w-7xl w-full relative z-10 flex flex-col items-center text-center mt-1 sm:mt-2 md:mt-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#0082fe] border border-blue-400/40 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white mb-3 sm:mb-5 shadow-lg shadow-blue-900/30">
            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> {t("hero_badge") || "Grab Rentals - India’s first ISO travel company"}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-3 sm:mb-5 drop-shadow-2xl">
            <span className="block md:whitespace-nowrap">{t("hero_title_1") || "India's Most Trusted Cab Rental Service"}</span>
            <span className="text-brand-orange drop-shadow-lg block mt-1 sm:mt-2">{t("hero_title_2") || "Car, Van & Bus Rentals"}</span>
          </h1>

          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-3xl mx-auto font-medium drop-shadow-md px-2">
            {t("hero_subtitle") || "Transparent billing, expert verified drivers, and pristine AC vehicles for Outstation, Local & Airport transit across 2,000+ Indian cities."}
          </p>
        </div>
      </section>

      {/* Floating Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-20 sm:-mt-24 md:-mt-32 lg:-mt-36">
        <BookingWidget />
      </section>

      {/* 2. Key Metric Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 md:mt-28 mb-12 sm:mb-16 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            {
              stat: "2,000+",
              label: t("stat_cities_served") || "Cities & Towns Served",
              icon: <MapPin className="text-sky-500 w-5 h-5 sm:w-6 sm:h-6" />,
              bg: "bg-sky-50"
            },
            {
              stat: "99.4%",
              label: t("stat_on_time_departure") || "On-Time Departure Rate",
              icon: <CheckCircle className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />,
              bg: "bg-emerald-50"
            },
            {
              stat: "4.9 / 5.0",
              label: t("stat_reviews") || "(10,00,000+ Reviews)",
              icon: <Star className="text-[#0082fe] fill-[#0082fe] w-5 h-5 sm:w-6 sm:h-6" />,
              bg: "bg-blue-50"
            },
            {
              stat: "35-Point",
              label: t("stat_sanitized_inspection") || "Sanitized Fleet Inspection",
              icon: <ShieldCheck className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6" />,
              bg: "bg-emerald-50"
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col items-center text-center gap-2 sm:gap-3 hover:shadow-md transition-shadow">
              <div className={`${item.bg} p-2.5 sm:p-3 rounded-full flex items-center justify-center`}>
                {item.icon}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{item.stat}</h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Choose Your Travel Class (Vehicle Cards Auto-Scroll Marquee) */}
      <section className="bg-orange-600 py-12 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 sm:mb-3">
            {t("choose_travel_class") || "Choose Your Travel Class"}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 font-medium max-w-2xl mx-auto">
            {t("choose_travel_class_sub") || "Experience our premium fleet tailored for every need—from executive sedans to luxury coaches."}
          </p>
        </div>

        <VehicleClassSelector />
      </section>

      {/* Dynamic In-Page Promotional Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <InPageBanner page="HOME" />
      </div>

      {/* 4. Have Custom Travel Requirements? (Quick Enquiry Section) */}
      <QuickEnquirySection />

      {/* 
      // 4. Popular Outstation Corridors (Commented out)
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {t("popular_outstation_corridors") || "Popular Outstation Corridors"}
            </h2>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCorridors("left")}
                  className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCorridors("right")}
                  className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={corridorsRef}
            className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto no-scrollbar pb-2 sm:pb-0"
          >
            {corridors.map((corridor, i) => (
              <div
                key={i}
                className="min-w-[240px] sm:min-w-0 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col shrink-0 select-none cursor-default"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                  <Image
                    src={corridor.image}
                    alt={corridor.route}
                    fill
                    sizes="(max-width: 768px) 240px, 200px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3.5 flex flex-col justify-between flex-grow">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 mb-2 leading-tight">
                    {corridor.route}
                  </h4>
                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-100">
                    <span className="text-slate-500">{corridor.dist}</span>
                    <span className="text-emerald-600 font-extrabold">{corridor.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* 5. The Standard of Excellence (5 Circular Icon Pillars) */}
      <section className="py-12 sm:py-20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              {t("standard_of_excellence") || "The Standard of Excellence"}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl mx-auto">
              What makes Grab Rentals the preferred choice for thousands of travelers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              {
                title: t("vp_billing_title") || "Transparent Billing",
                desc: t("vp_billing_desc") || "Automated GST invoicing with zero hidden fees.",
                icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />,
                bg: "bg-white"
              },
              {
                title: t("vp_chauffeurs_title") || "Expert Chauffeurs",
                desc: t("vp_chauffeurs_desc") || "Experience and Verified Drivers",
                icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />,
                bg: "bg-white"
              },
              {
                title: t("vp_sanitization_title") || "35-Point Sanitization",
                desc: t("vp_sanitization_desc") || "Complimentary Water & Tissue inside pristine cabs.",
                icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />,
                bg: "bg-white"
              },
              {
                title: t("vp_cancellation_title") || "Zero Cancellation Stress",
                desc: t("vp_cancellation_desc") || "Instant UPI/Card Reversal on early cancellations.",
                icon: <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />,
                bg: "bg-white"
              },
              {
                title: t("all_india_coverage") || "All-India Coverage",
                desc: t("all_india_coverage_desc") || "Reliable service across 2,000+ Indian cities.",
                icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />,
                bg: "bg-white"
              },
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center text-center p-2 sm:p-0">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${prop.bg} rounded-full shadow-md flex items-center justify-center mb-3 sm:mb-4`}>
                  {prop.icon}
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white mb-1 sm:mb-1.5">{prop.title}</h4>
                <p className="text-[11px] sm:text-xs font-medium text-white/85 leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Corporate Travel Solutions (Wide Banner Card) */}
      <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-gradient-to-r from-blue-50/70 via-slate-50 to-[#0B1220] grid grid-cols-1 lg:grid-cols-12">

            {/* Left Content (Col 1-5) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white/70 backdrop-blur-xs">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Corporate Travel Solutions
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                  Reliable, scalable and cost-effective mobility for businesses of all sizes.
                </p>

                <ul className="space-y-2.5 mb-8 text-xs sm:text-sm font-semibold text-slate-700">
                  {[
                    "Employee Transportation",
                    "Client & Executive Travel",
                    "Event & Conference Transport",
                    "Custom Corporate Packages",
                    "GST Invoicing & Dedicated Support"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href="/corporate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>KNOW MORE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Center Image (Col 6-8) */}
            <div className="lg:col-span-4 relative min-h-[260px] sm:min-h-[300px] lg:min-h-full">
              <Image
                src="/images/corporate-travel-banner.jpg"
                alt="Corporate Business Travel Chauffeur"
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0B1220]/90 hidden lg:block"></div>
            </div>

            {/* Right Dark Perks (Col 9-12) */}
            <div className="lg:col-span-3 bg-[#0B1220] p-6 sm:p-8 flex flex-col justify-center space-y-5 text-white border-t lg:border-t-0 lg:border-l border-slate-800">
              {[
                { icon: <User className="w-4 h-4 text-amber-400" />, text: "Dedicated Account Manager" },
                { icon: <CreditCard className="w-4 h-4 text-emerald-400" />, text: "Customized Billing" },
                { icon: <Car className="w-4 h-4 text-sky-400" />, text: "Priority Fleet Allocation" },
                { icon: <PhoneCall className="w-4 h-4 text-amber-400" />, text: "24/7 Support" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-200">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. What Our Customers Say (Testimonials) */}
      <section className="py-12 sm:py-20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-white font-medium">
              Trusted by over 1,20,000+ travelers across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                avatar: "/images/avatars/rakesh.jpg",
                rating: 5,
                text: "Excellent service! Very professional driver and clean vehicle. On-time and smooth journey from Bangalore to Mysore.",
                author: "Rakesh M.",
                location: "Bangalore"
              },
              {
                avatar: "/images/avatars/priya.jpg",
                rating: 5,
                text: "Booked an Innova for our family trip. Vehicle was clean, driver was polite and very experienced. Highly recommend!",
                author: "Priya S.",
                location: "Chennai"
              },
              {
                avatar: "/images/avatars/arun.jpg",
                rating: 5,
                text: "Best rental service for corporate travel. Transparent billing and great support team. Our go-to travel partner.",
                author: "Arun K.",
                location: "Hyderabad"
              }
            ].map((review, idx) => (
              <div
                key={idx}
                className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mb-6">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-300 shrink-0">
                    <Image
                      src={review.avatar}
                      alt={review.author}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-slate-900">{review.author}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (2-Column Accordion) */}
      <section className="py-12 sm:py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <Link
              href="/support"
              className="text-xs sm:text-sm font-extrabold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              <span>View All FAQs</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-start">
            {faqs.map((faq, index) => {
              const isOpen = !!openFaqs[index];
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? (
                        <Minus className="w-4 h-4 text-brand-orange" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* First-time Visitor & Targeted Promo Popups are handled dynamically by BannerPopupManager in AppShell */}
    </main>
  );
}
