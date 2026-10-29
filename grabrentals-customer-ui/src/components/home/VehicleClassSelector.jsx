import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export const VEHICLE_CLASSES = [
  {
    slug: "hatchback",
    name: "Hatchback",
    seats: "4+DRIVER",
    ac: "AC",
    image: "/images/cars/wagon_r_white.jpg",
    link: "/fleet/hatchback",
  },
  {
    slug: "sedan",
    name: "Sedan",
    seats: "4+DRIVER",
    ac: "AC",
    image: "/images/cars/dzire.jpg",
    link: "/fleet/sedan",
  },
  {
    slug: "suv",
    name: "Suv",
    seats: "5+DRIVER",
    ac: "AC",
    image: "/images/fleet/suv_electric.jpg",
    link: "/fleet/suv",
  },
  {
    slug: "crysta",
    name: "Innova Crysta",
    seats: "6 TO 7+DRIVER",
    ac: "AC",
    image: "/images/fleet/crysta.jpg",
    link: "/fleet/crysta",
  },
  {
    slug: "innovahycross",
    name: "Innova Hycross",
    seats: "6 TO 7+DRIVER",
    ac: "AC",
    image: "/images/fleet/hycross.jpg",
    link: "/fleet/innovahycross",
  },
  {
    slug: "urbania",
    name: "Urbania",
    seats: "9 TO 16+DRIVER",
    ac: "AC",
    image: "/images/fleet/urbania.jpg",
    link: "/fleet/urbania",
  },
  {
    slug: "tempo",
    name: "Tempo Traveller",
    seats: "9 TO 21+DRIVER",
    ac: "AC & NON-AC",
    image: "/images/fleet/tempo_traveller.jpg",
    link: "/fleet/tempo",
  },
  {
    slug: "bus",
    name: "Bus",
    seats: "35 TO 65 + DRIVER",
    ac: "AC & NON-AC",
    image: "/images/fleet/bus.jpg",
    link: "/fleet/bus",
  },
];

// Repeat items so each track half is wide enough to cover large viewports seamlessly
const TRACK_ITEMS = [...VEHICLE_CLASSES, ...VEHICLE_CLASSES];

export default function VehicleClassSelector({ onSelect, defaultSelected = null }) {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState(defaultSelected);

  const handleSelect = (vehicle) => {
    setSelectedSlug(vehicle.slug);
    if (onSelect) {
      onSelect(vehicle);
    }
  };

  const renderCard = (fleet, key) => {
    const isSelected = selectedSlug === fleet.slug;

    return (
      <Link
        key={key}
        href={fleet.link || "#"}
        onClick={(e) => {
          if (onSelect) {
            e.preventDefault();
            handleSelect(fleet);
          }
        }}
        className={`w-[185px] sm:w-[210px] shrink-0 bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center relative cursor-pointer select-none transition-all duration-300 group/card border shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-400/40"
            : "border-slate-200/90 hover:border-slate-300"
        }`}
      >
        {/* Vehicle Image Container */}
        <div className="w-full aspect-[16/10] relative mb-3 rounded-xl overflow-hidden bg-[#f8f9fa] border border-slate-100 flex items-center justify-center p-1.5">
          <Image
            src={fleet.image}
            alt={fleet.name}
            fill
            sizes="210px"
            className="object-contain p-1 group-hover/card:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Vehicle Title */}
        <h3 className="text-sm sm:text-base font-bold mb-2.5 text-slate-900 group-hover/card:text-blue-600 transition-colors">
          {fleet.name}
        </h3>

        {/* Badges / Specs (Without Amount) */}
        <div className="flex flex-col gap-1.5 items-center justify-center mt-auto w-full">
          {/* Seating / Driver Badge */}
          <div className="w-full text-center py-1.5 px-2 rounded-lg text-[10.5px] sm:text-xs font-bold uppercase tracking-wider bg-[#EEF2F7] border border-[#DCE4EE] text-slate-700 truncate shadow-2xs">
            {fleet.seats}
          </div>

          {/* AC / Non-AC Badge */}
          <div className="w-full text-center py-1.5 px-2 rounded-lg text-[10.5px] sm:text-xs font-bold uppercase tracking-wider bg-blue-50 border border-blue-200 text-blue-900 truncate shadow-2xs">
            {fleet.ac}
          </div>

          {/* Direct Instant Book Button */}
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/book?cab=${fleet.slug}&service=outstation`);
            }}
            className="w-full mt-0.5 text-center py-1.5 px-2 rounded-lg text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider bg-slate-900 hover:bg-orange-600 text-white transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="relative w-full overflow-hidden marquee-container py-2">
      {/* Edge Gradient Fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-orange-600 via-orange-600/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-orange-600 via-orange-600/80 to-transparent z-10" />

      {/* Infinite Auto-Scroll Track */}
      <div className="animate-marquee-infinite">
        {/* Track Half A */}
        <div className="flex items-center gap-3.5 sm:gap-4.5 pr-3.5 sm:pr-4.5 shrink-0">
          {TRACK_ITEMS.map((fleet, index) => renderCard(fleet, `track-a-${fleet.slug}-${index}`))}
        </div>

        {/* Track Half B (Exact Clone for Seamless Infinite Loop) */}
        <div className="flex items-center gap-3.5 sm:gap-4.5 pr-3.5 sm:pr-4.5 shrink-0" aria-hidden="true">
          {TRACK_ITEMS.map((fleet, index) => renderCard(fleet, `track-b-${fleet.slug}-${index}`))}
        </div>
      </div>


    </div>
  );
}

