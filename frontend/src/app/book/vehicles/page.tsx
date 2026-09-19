import TopNavigation from "@/components/TopNavigation/TopNavigation";
import Footer from "@/components/Footer/Footer";
import FleetFilters from "@/components/Search/FleetFilters";
import VehicleCard, { Vehicle } from "@/components/Search/VehicleCard";
import { MapPin, Calendar, Users, ChevronRight, Edit2, AlertTriangle } from "lucide-react";

// Mock Data
const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    name: "Suzuki Dzire",
    category: "Executive Sedan",
    badge: "Most Economical",
    seats: 4,
    luggage: 2,
    hasAC: true,
    price: 3850,
    originalPrice: 4250,
    inclusions: ["275 km included", "Tolls & state permits pre-paid", "Driver allowance included", "Free cancellation up to 6 hrs"]
  },
  {
    id: "v2",
    name: "Toyota Innova Crysta",
    category: "Premium SUV",
    badge: "Top Recommendation for Ghats",
    seats: 6,
    luggage: 4,
    hasAC: true,
    price: 5950,
    originalPrice: 6600,
    inclusions: ["275 km included", "Tolls & state permits pre-paid", "Driver allowance included", "Free cancellation up to 6 hrs"]
  },
  {
    id: "v3",
    name: "Maruti Ertiga",
    category: "SUV",
    badge: null,
    seats: 6,
    luggage: 3,
    hasAC: true,
    price: 4500,
    originalPrice: 5000,
    inclusions: ["275 km included", "Tolls & state permits pre-paid", "Driver allowance included", "Free cancellation up to 6 hrs"]
  },
  {
    id: "v4",
    name: "Force Urbania",
    category: "Luxury Tempo Traveller",
    badge: "Wedding & Corporate",
    seats: 12,
    luggage: 8,
    hasAC: true,
    price: 8500,
    originalPrice: 9400,
    inclusions: ["275 km included", "Tolls & state permits pre-paid", "Driver allowance included", "Free cancellation up to 6 hrs"]
  },
  {
    id: "v5",
    name: "Volvo B11R AC Coach",
    category: "Luxury Coach",
    badge: "Large Groups",
    seats: 26,
    luggage: 15,
    hasAC: true,
    price: 18500,
    originalPrice: 20500,
    inclusions: ["275 km included", "Tolls & state permits pre-paid", "Driver allowance included", "Free cancellation up to 6 hrs"]
  }
];

export default function VehiclesSearchPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <TopNavigation />

      {/* Sticky Search Summary & Breadcrumbs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex flex-col gap-2">
            {/* Route Chip */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-sm font-bold">
                Bangalore <ChevronRight className="w-4 h-4 text-slate-400" /> Ooty
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
                (One Way • 275 km included)
              </span>
              <button className="text-brand-sky hover:text-brand-navy p-1.5 rounded-md hover:bg-slate-100 transition-colors ml-2">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Date, Time, Passengers */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Oct 24, 2026</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 4 Passengers</span>
            </div>
          </div>

          {/* Checkout Progress */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-brand-amber border-b-2 border-brand-amber pb-1">1. Select Vehicle</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-400">2. Trip Details</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-400">3. Review & Pay</span>
          </div>
        </div>
      </div>

      {/* Route Alert Banner */}
      <div className="bg-orange-50 border-b border-orange-100 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs font-bold text-orange-800">
          <AlertTriangle className="w-4 h-4 text-brand-amber" />
          <span>Mysore Expressway <ChevronRight className="w-3 h-3 inline" /> Bandipur Tiger Reserve <ChevronRight className="w-3 h-3 inline" /> Nilgiri Ghats (36 Hairpin Bends) | Tolls Pre-Included | Ghat-Certified Drivers</span>
        </div>
      </div>

      {/* Main Content: Two-Column Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Sidebar Filters */}
        <FleetFilters />

        {/* Right Vehicle Results Feed */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between pb-2">
            <h1 className="text-lg font-bold text-slate-900">5 Fleet Classes Available <span className="text-brand-emerald text-sm font-semibold ml-2">[Instant Confirmation]</span></h1>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Sort By:</span>
              <select className="text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-amber/20">
                <option>Popularity</option>
                <option>Price: Low to High</option>
                <option>Rating</option>
              </select>
            </div>
          </div>

          {/* Render Mock Vehicles */}
          {MOCK_VEHICLES.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
