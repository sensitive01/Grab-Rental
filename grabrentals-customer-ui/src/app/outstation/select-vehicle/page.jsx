import SearchSummaryBar from "@/components/booking/SearchSummaryBar";
import VehicleFilterSidebar from "@/components/booking/VehicleFilterSidebar";
import VehicleCard from "@/components/booking/VehicleCard";

const MOCK_VEHICLES = [
  {
    id: "v1",
    name: "Sedan (Dzire/Etios)",
    categoryBadge: "Most Economical",
    rating: "4.7",
    reviewCount: "14.2k",
    price: 3850,
    originalPrice: 4400,
    advanceAmount: 770,
    inclusions: [
      "Driver speaks Hindi/English/Kannada", 
      "275 km included, extra ₹13.5/km", 
      "Tolls & state permits pre-paid", 
      "Chauffeur allowance & fuel included", 
      "Free cancellation up to 6 hrs"
    ],
    ctaText: "SELECT CAB →",
    image: "/images/fleet/sedan.jpg"
  },
  {
    id: "v2",
    name: "Toyota Innova Crysta",
    topBadge: "Recommended for 4-6 Travelers",
    categoryBadge: "Executive SUV",
    rating: "4.9",
    reviewCount: "32.8k",
    tags: ["Type-C Fast Charger", "Bottled Water", "Live GPS Track"],
    price: 5950,
    originalPrice: 6800,
    isRecommended: true,
    inclusions: [
      "Captain seats, dual AC",
      "Certified for 36 hairpin Nilgiri ghats",
      "275 km included, tolls/permits paid",
      "Zero advance option (pay driver at end)",
      "Free cancellation up to 6 hrs"
    ],
    ctaText: "SELECT CRYSTA ✓",
    image: "/images/fleet/suv.jpg"
  },
  {
    id: "v3",
    name: "Maruti Ertiga",
    categoryBadge: "Family 6-Seater",
    rating: "4.6",
    reviewCount: "8.1k",
    price: 4750,
    originalPrice: 5200,
    inclusions: [
      "Clean sanitized upholstery",
      "Luggage carrier included",
      "275 km included, tolls/permits paid",
      "Free cancellation up to 6 hrs"
    ],
    ctaText: "SELECT CAB →",
    image: "/images/fleet/suv.jpg"
  },
  {
    id: "v4",
    name: "Force Urbania / Tempo Traveller",
    categoryBadge: "Ideal for Groups",
    rating: "4.9",
    reviewCount: "5.4k",
    price: 8900,
    originalPrice: 9800,
    inclusions: [
      "Reclining 1x1 seats, individual AC vents",
      "₹741 per passenger equivalent",
      "275 km included, tolls/permits paid",
      "Free cancellation up to 6 hrs"
    ],
    ctaText: "SELECT TEMPO →",
    image: "/images/fleet/tempo.jpg"
  },
  {
    id: "v5",
    name: "26-Seater Mini Coach",
    categoryBadge: "Wedding & Corporate",
    rating: "4.8",
    reviewCount: "2.2k",
    price: 16500,
    originalPrice: 18500,
    inclusions: [
      "Air Suspension Executive Bus",
      "2 experienced highway drivers + conductor",
      "275 km included, tolls/permits paid",
      "Free cancellation up to 6 hrs"
    ],
    ctaText: "SELECT COACH →",
    image: "/images/fleet/bus.jpg"
  }
];

export default function SelectVehiclePage() {
  return (
    <main className="w-full">
      <SearchSummaryBar />

      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <VehicleFilterSidebar />

        {/* Right Vehicle Results Feed */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center justify-between pb-2">
            <h1 className="text-lg font-extrabold text-slate-900">
              5 Fleet Classes Available <span className="text-brand-emerald-dark text-sm font-bold ml-2">[Instant Confirmation]</span>
            </h1>
            
            <select className="text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-amber/20 shadow-sm cursor-pointer">
              <option>Sort: Popularity</option>
              <option>Sort: Price Lowest</option>
              <option>Sort: Rating</option>
            </select>
          </div>

          {/* Render Mock Vehicles */}
          {MOCK_VEHICLES.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </main>
  );
}
