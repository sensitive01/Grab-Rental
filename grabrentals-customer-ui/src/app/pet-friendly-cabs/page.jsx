"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Phone,
  Check,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PetBookingWidget from "@/components/pet-cabs/PetBookingWidget";

export default function PetFriendlyCabsPage() {
  const { t } = useLanguage();
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "Are all pets allowed in Grab Rentals cabs?",
      a: "Yes! We welcome dogs of all breeds and sizes, cats, birds, and small pets. Simply let us know your pet's breed and size so we can assign the most spacious, pet-friendly vehicle and chauffeur."
    },
    {
      q: "Does my pet need to be inside a crate or travel bag?",
      a: "Cats, birds, and small animals should travel in secure carriers. For dogs, carriers are not mandatory; they can comfortably sit on the back seat with a leash or harness. We provide sanitized seat protective covers."
    },
    {
      q: "Can we make frequent rest stops for water and walks?",
      a: "Absolutely! Our chauffeurs are trained and accustomed to pet travel. You can request comfortable bio-breaks, water breaks, and exercise stops along highways anytime without hesitation."
    },
    {
      q: "Which vehicle is best suited for traveling with pets?",
      a: "For small pets, an Executive Sedan (Dzire, Etios) works well. For medium-to-large dogs (Labradors, Golden Retrievers, German Shepherds) or families with multiple pets, we strongly recommend our spacious SUVs like Toyota Innova Crysta or Ertiga."
    },
    {
      q: "Is there any hidden pet surcharge or cleaning fee?",
      a: "No hidden charges! Our pet-friendly cab pricing is transparent. We just request that pets are kept reasonably clean and dry before entering the vehicle to ensure a hygienic journey."
    }
  ];

  return (
    <main className="flex flex-col bg-slate-50 min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative text-white pt-14 pb-24 sm:pt-20 sm:pb-32 md:pt-24 md:pb-40 px-4 sm:px-6 overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 scale-105"
          style={{ backgroundImage: 'url("/images/customer-hero-banner.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-amber-400 mb-4 shadow-lg">
            <span>🐶</span>
            <span>Grab Rentals Pet Mobility</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-xl text-white">
            Travel Anywhere with Your <span className="text-amber-400">Furry Best Friend</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md mb-4">
            Verified pet-loving chauffeurs, spacious AC cabs, and zero refusal. Travel outstation, local, or airport transfers comfortably together.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Questions? Call our Pet Travel Desk:</span>
            <a href="tel:+919071100200" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
              <Phone className="w-3 h-3" /> +91 90711 00200
            </a>
          </div>
        </div>
      </section>

      {/* 2. Floating Interactive Pet Booking Widget */}
      <section className="px-3 sm:px-4 md:px-6 relative z-20 -mt-16 sm:-mt-20 md:-mt-28 lg:-mt-32">
        <PetBookingWidget />
      </section>

      {/* 3. Real Pet Travel Moments Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
              Real Pet Journeys
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              Happy Pets on the Move with Grab Rentals
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Safe, sanitized, and caring journeys curated for both you and your four-legged family members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Dog in Car Window */}
          <div className="group relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-white">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/images/pets/dog-window-trip.jpg"
                alt="Golden Retriever enjoying a highway car journey in a Grab Rentals cab"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md">
                  Scenic Drives
                </span>
                <h3 className="text-sm font-extrabold mt-1 text-white">
                  Spacious Rear Seats for Large Dogs
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5">
                  Clean upholstery with ample legroom to stretch, sit, and gaze out the window.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Cat in Carrier */}
          <div className="group relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-white">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/images/pets/cat-carrier-cab.jpg"
                alt="Cute calm cat inside modern carrier on a safe cab ride"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500 text-white rounded-md">
                  Stress-Free Transit
                </span>
                <h3 className="text-sm font-extrabold mt-1 text-white">
                  Gentle & Quiet Rides for Felines
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5">
                  Smooth acceleration and AC climate control keep cats calm and relaxed.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Dog Highway Break */}
          <div className="group relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-white">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src="/images/pets/dog-highway-break.jpg"
                alt="Beagle enjoying fresh water and bio-break at a green highway rest stop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-md">
                  Highway Bio Breaks
                </span>
                <h3 className="text-sm font-extrabold mt-1 text-white">
                  Water & Stretch Breaks Anytime
                </h3>
                <p className="text-[11px] text-slate-200 mt-0.5">
                  Chauffeurs stop gladly at safe green highway rest areas whenever requested.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Terms and Conditions & Safety Cautions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Terms & Conditions */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0082fe] flex items-center justify-center font-bold text-lg shrink-0">
                <FileText className="w-5 h-5 text-[#0082fe]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0082fe] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                  Policies & Guidelines
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Terms & Conditions
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0082fe] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Accompanying Passenger</h4>
                  <p className="text-xs text-slate-500">
                    At least one responsible adult pet parent or guardian must accompany the pet throughout the journey. Unaccompanied pet transport is not permitted.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0082fe] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Health & Vaccination Status</h4>
                  <p className="text-xs text-slate-500">
                    Pets must be clinically healthy, free from infectious diseases or active infestations (ticks/fleas), and up-to-date with mandatory Rabies and core vaccinations.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0082fe] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Carrier & Leash Requirement</h4>
                  <p className="text-xs text-slate-500">
                    Cats, birds, rabbits, and small animals must remain inside secure, well-ventilated carriers or cages during transit. Dogs must have a collar, leash, or harness.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0082fe] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Vehicle Cleanliness & Hygiene</h4>
                  <p className="text-xs text-slate-500">
                    Pet owners are responsible for their pet's hygiene. In the rare event of excessive soiling, shedding damage, or upholstery contamination, a standard deep-cleaning fee of ₹500 may apply.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0082fe] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Rest Stops & Bio Breaks</h4>
                  <p className="text-xs text-slate-500">
                    Chauffeurs will happily make reasonable stops at safe highway rest areas, pet-friendly fuel plazas, or food courts for hydration and walks upon your request.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#0082fe] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  6
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Tolls, Parking & State Taxes</h4>
                  <p className="text-xs text-slate-500">
                    Standard route tolls, parking charges, and inter-state permits are billed transparently as per actual route requirements, consistent with all Grab Rentals rides.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cautions */}
          <div className="bg-yellow-100/90 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-yellow-300 border-2 border-yellow-500 text-yellow-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6 text-yellow-900 fill-yellow-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-950 bg-yellow-300 border border-yellow-500 px-2.5 py-0.5 rounded-md">
                  Important Precautions
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Safety Cautions
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Pre-Ride Potty Walk (Pee & Poop Before Boarding)</h4>
                  <p className="text-xs text-slate-700">
                    Always take your pet on a 15–20 minute walk to relieve themselves (both pee and poop) just before the cab arrives. An empty bladder and bowel significantly reduce travel stress, motion nausea, and in-cabin accidents.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Carry Pee Pads, Diapers & Poop Bags</h4>
                  <p className="text-xs text-slate-700">
                    Always carry disposable absorbent pee pads or pet diapers (especially recommended for puppies, un-neutered males, senior dogs, or nervous pets), sanitizing pet wipes, and poop scoop bags for responsible cleanup during highway stops.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Alert Driver for Urgent Pee / Poop Breaks</h4>
                  <p className="text-xs text-slate-700">
                    Watch for telltale signs of needing a bio-break: pacing, circling, sudden whining, or frantic sniffing. Alert your chauffeur right away; they will safely pull over at the nearest service road, fuel plaza, or green patch.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Pre-Travel Feeding & Nausea</h4>
                  <p className="text-xs text-slate-700">
                    Avoid giving full meals to your pet 2 to 3 hours before departure. Travelling on a full stomach increases the risk of motion sickness, acid reflux, and vomiting on winding ghats or bumpy stretches.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Never Leave Pets Unattended</h4>
                  <p className="text-xs text-slate-700">
                    Never leave your pet alone inside a parked vehicle during food/tea breaks, even with windows cracked, as vehicle interiors overheat rapidly under direct sunlight.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Window Safety & Head Hanging</h4>
                  <p className="text-xs text-slate-700">
                    Do not let pets hang their heads completely out of windows at highway speeds. Flying dust, insects, gravel, or sudden braking can cause severe eye injuries or accidental falls.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-50/90 border border-yellow-300 shadow-2xs flex gap-3.5 items-start transition-all hover:bg-white hover:border-yellow-400">
                <div className="w-7 h-7 rounded-xl bg-yellow-200 border border-yellow-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-yellow-800 fill-yellow-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">Hydration & Familiar Comforts</h4>
                  <p className="text-xs text-slate-700">
                    Carry fresh water in a spill-proof portable bowl and offer small sips at rest stops rather than a large gulp all at once. Bring along your pet's favorite blanket, mat, or toy to reduce travel anxiety.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Pet Travel FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Everything you need to know about riding with your pets in Grab Rentals cabs.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-amber-700 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? "rotate-180 text-amber-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick CTA Banner */}
          <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-brand-navy-dark text-white rounded-3xl text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-black text-white">Ready for a comfortable trip with your pet?</h3>
              <p className="text-xs text-slate-300 mt-0.5">Book online or speak to our pet mobility team anytime.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Book Online Now
              </button>
              <a
                href="tel:+919071100200"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all"
              >
                Call Hotline
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
