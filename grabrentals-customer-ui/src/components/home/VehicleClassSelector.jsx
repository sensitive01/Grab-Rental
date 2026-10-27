"use client";

import { useState } from "react";
import Image from "next/image";

export const VEHICLE_CLASSES = [
  {
    slug: "hatchback",
    name: "Hatchback",
    seats: "4+DRIVER",
    ac: "AC",
    image: "/images/cars/spresso-clean.jpg",
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
    seats: "6 TO 8+DRIVER",
    ac: "AC",
    image: "/images/fleet/suv.jpg",
    link: "/fleet/suv",
  },
  {
    slug: "urbania",
    name: "Urbania",
    seats: "9 TO 16+DRIVER",
    ac: "AC",
    image: "/images/fleet/urbania.jpg",
    link: "/vans",
  },
  {
    slug: "tempo",
    name: "Tempo Traveller",
    seats: "9 TO 21+DRIVER",
    ac: "AC & NON-AC",
    image: "/images/fleet/tempo_traveller.jpg",
    link: "/vans",
  },
  {
    slug: "bus",
    name: "Bus",
    seats: "35 TO 65 + DRIVER",
    ac: "AC & NON-AC",
    image: "/images/fleet/bus.jpg",
    link: "/buses",
  },
];

export default function VehicleClassSelector({ onSelect, defaultSelected = null }) {
  const [selectedSlug, setSelectedSlug] = useState(defaultSelected);

  const handleSelect = (vehicle) => {
    setSelectedSlug(vehicle.slug);
    if (onSelect) {
      onSelect(vehicle);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4.5">
      {VEHICLE_CLASSES.map((fleet) => {
        const isSelected = selectedSlug === fleet.slug;

        return (
          <div
            key={fleet.slug}
            onClick={() => handleSelect(fleet)}
            className="bg-white rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center relative cursor-pointer transition-all duration-200 select-none group border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Vehicle Image Container */}
            <div className="w-full aspect-[16/10] relative mb-3 rounded-xl overflow-hidden bg-[#f8f9fa] border border-slate-100 flex items-center justify-center p-1.5">
              <Image
                src={fleet.image}
                alt={fleet.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Vehicle Title */}
            <h3 className="text-sm sm:text-base font-bold mb-2.5 text-slate-900 transition-colors">
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
