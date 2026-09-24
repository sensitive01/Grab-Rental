"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Car, 
  ChevronRight, 
  ShieldCheck, 
  ThumbsUp, 
  Heart, 
  Award, 
  Calendar, 
  MapPin,
  Sparkles,
  Filter
} from "lucide-react";

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("submitted"); // "submitted" | "pending" | "community"

  const [submittedReviews, setSubmittedReviews] = useState([
    {
      id: "rev-1",
      bookingId: "GR-76521",
      chauffeurName: "Suresh Gowda",
      vehicle: "Toyota Camry Hybrid (KA 04 E 8820)",
      route: "Bengaluru Airport (BLR) ➔ Whitefield Tech Park",
      date: "18 Sep 2026",
      rating: 5,
      tags: ["Punctual & On-Time", "Spotless & Clean Car", "Smooth Highway Driving"],
      comment: "Outstanding experience! Chauffeur Suresh reached Terminal 2 15 minutes before landing. The hybrid Camry was immaculately clean with complimentary packaged water. Smooth driving throughout peak traffic.",
      tip: 100,
      verified: true
    },
    {
      id: "rev-2",
      bookingId: "GR-71940",
      chauffeurName: "Vikram Rathore",
      vehicle: "Toyota Innova Crysta (KA 01 MJ 4521)",
      route: "Bengaluru ➔ Coorg Luxury Outstation (3 Days)",
      date: "04 Sep 2026",
      rating: 5,
      tags: ["Knowledgeable Route Guide", "Polite & Professional", "Excellent AC & Comfort"],
      comment: "Booked an Innova Crysta for a family getaway to Coorg. Vikram was extremely courteous, drove with high discipline on ghat roads, and recommended scenic viewpoint stops. Will book again!",
      tip: 250,
      verified: true
    },
    {
      id: "rev-3",
      bookingId: "GR-68210",
      chauffeurName: "Anand M",
      vehicle: "Maruti Ertiga Hybrid (KA 05 MN 3311)",
      route: "Koramangala ➔ Electronic City (Local Rental 8h)",
      date: "22 Aug 2026",
      rating: 4,
      tags: ["Punctual & On-Time", "Polite & Professional"],
      comment: "Very punctual chauffeur and well maintained car. Handled our multi-stop corporate client meetings efficiently across South Bangalore.",
      tip: 50,
      verified: true
    }
  ]);

  const pendingTrips = [
    {
      id: "p1",
      bookingId: "GR-79104",
      chauffeurName: "Ramesh Kumar",
      chauffeurRating: "4.9 ★",
      vehicle: "Toyota Innova Crysta (KA 03 EQ 9012)",
      route: "Bengaluru ➔ Mysuru Royal Palace Tour",
      date: "Yesterday, 20 Sep 2026",
      fare: "₹4,890",
      status: "Completed",
      rateUrl: "/account/bookings/GR-79104/rate"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customer Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Reviews & Ratings
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                VIP Patron
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage feedback for your chauffeur-driven journeys, rate recent trips, and browse verified traveler experiences.
            </p>
          </div>

          {/* Rate Pending Shortcut */}
          {pendingTrips.length > 0 && (
            <Link
              href={pendingTrips[0].rateUrl}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              Rate Recent Trip
            </Link>
          )}
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Reviews Given</span>
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{submittedReviews.length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">100% Verified Trips</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Avg Rating Given</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">4.8 ★</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Top Reviewer Status</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Ratings</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{pendingTrips.length}</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Trip finished yesterday</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Gratuity Tipped</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹400</p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Direct Chauffeur Bonus</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200">
          <button
            onClick={() => setActiveTab("submitted")}
            className={`pb-3.5 px-4 text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-b-2 ${
              activeTab === "submitted"
                ? "border-amber-500 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Award className="w-4 h-4" />
            My Submitted Reviews ({submittedReviews.length})
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3.5 px-4 text-xs sm:text-sm font-black transition-all flex items-center gap-2 border-b-2 relative ${
              activeTab === "pending"
                ? "border-amber-500 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending Reviews
            {pendingTrips.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* TAB 1: SUBMITTED REVIEWS */}
        {activeTab === "submitted" && (
          <div className="space-y-4">
            {submittedReviews.map((rev) => (
              <div 
                key={rev.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4 transition-all hover:border-amber-300"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        #{rev.bookingId}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {rev.date}
                      </span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Verified Ride
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {rev.route}
                    </p>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= rev.rating 
                            ? "text-amber-500 fill-amber-500" 
                            : "text-slate-200 fill-slate-100"
                        }`} 
                      />
                    ))}
                    <span className="text-xs font-black text-slate-800 ml-1.5">{rev.rating}.0</span>
                  </div>
                </div>

                {/* Chauffeur Info Pill */}
                <div className="flex items-center gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                    {rev.chauffeurName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-900">Chauffeur: {rev.chauffeurName}</p>
                    <p className="text-slate-500 flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-400" /> {rev.vehicle}
                    </p>
                  </div>
                  {rev.tip > 0 && (
                    <div className="ml-auto text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100 flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" /> ₹{rev.tip} Tip Given
                    </div>
                  )}
                </div>

                {/* Feedback Comment */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {/* Appreciation Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rev.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <Link 
                    href={`/account/bookings/${rev.bookingId}`}
                    className="font-bold text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1"
                  >
                    View Trip Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-[11px] text-slate-400">Feedback shared with Chauffeur Safety Board</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PENDING REVIEWS */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingTrips.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-black text-slate-900">All Caught Up!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have reviewed all completed chauffeur journeys. Your feedback maintains our high standard of hospitality.
                </p>
              </div>
            ) : (
              pendingTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className="bg-white rounded-3xl border-2 border-amber-200/80 p-6 sm:p-7 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          #{trip.bookingId}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{trip.date}</span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Trip {trip.status}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        {trip.route}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-slate-400 font-medium">Final Fare</p>
                      <p className="text-lg font-black text-slate-900">{trip.fare}</p>
                    </div>
                  </div>

                  {/* Chauffeur Details */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-amber-400 font-black text-base flex items-center justify-center shrink-0">
                      {trip.chauffeurName.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900">{trip.chauffeurName}</p>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                          {trip.chauffeurRating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{trip.vehicle}</p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-slate-600">
                      How was your chauffeur's punctuality, car cleanliness, and driving quality?
                    </p>
                    <Link
                      href={trip.rateUrl}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0"
                    >
                      <Star className="w-4 h-4 fill-slate-950" /> Rate & Review Trip
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
