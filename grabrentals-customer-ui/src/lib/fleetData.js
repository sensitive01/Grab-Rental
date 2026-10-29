export const FLEET_CATEGORIES = [
  {
    slug: "hatchback",
    name: "Hatchback",
    popularName: "Maruti Wagon R, Celerio, Tata Tiago",
    headline: "Smart, fuel-efficient & affordable city & short outstation travel",
    desc: "Our hatchbacks offer exceptional agility and affordability without compromising on cleanliness or chauffeur professionalism. Perfect for city errands, daily office commutes, and quick airport runs.",
    badge: "MOST ECONOMICAL",
    price: "Starts ₹9.5/km",
    perKmRate: 9.5,
    baseDailyRate: 2000,
    hourlyPackage: "₹1,400 for 8 hrs / 80 km",
    airportFlatRate: "₹799 all-inclusive",
    image: "/images/cars/wagon_r_white.jpg",
    gallery: [
      "/images/cars/wagon_r_white.jpg",
      "/images/cars/wagon_r.jpg"
    ],
    variants: ["Maruti Suzuki WagonR ZXi", "Maruti Celerio VXi", "Tata Tiago XZ+", "Hyundai Grand i10"],
    colors: ["Superior White", "Silky Silver", "Magma Grey"],
    seatingCapacity: 4,
    seatingLabel: "4 Passengers + 1 Chauffeur",
    luggageCapacity: "2 Medium Suitcases + 2 Backpacks",
    engineCc: "998 cc - 1197 cc K-Series",
    transmission: "Manual & AMT Automatic",
    alternateFuel: "Petrol & CNG Clean Fuel",
    registrationType: "Yellow Board Commercial Tourist Permit",
    parkingLocation: "City Hubs, Metro Terminals & Airport Express Zone",
    features: [
      "AC with Rapid Cool Cabin",
      "Power Windows & Central Locking",
      "Dual Airbags & ABS with EBD",
      "Bluetooth Audio & Mobile Mount",
      "Fast USB Phone Charger",
      "Tall-Boy Easy Ingress & Egress",
      "GPS Real-time Tracking & Speed Alert",
      "Clean Seat Covers & Sanitized Interior",
      "Complimentary Water Bottles"
    ],
    idealFor: ["Budget City Travel", "Solo Business Trips", "Couples & Small Families", "Daily Office Commutes"],
    chauffeurStandards: [
      "Experienced & Verified Drivers",
      "English & Local Language Fluent",
      "Uniformed & Courteous",
      "35-Point Sanitization Verified"
    ]
  },
  {
    slug: "sedan",
    name: "Executive Sedan",
    popularName: "Maruti Dzire, Toyota Etios, Hyundai Aura",
    headline: "Comfortable, economical & refined city & outstation travel",
    desc: "Our executive sedans are meticulously maintained, sanitized, and chauffeured by verified professionals. Ideal for business meetings, airport pickups, and family trips.",
    badge: "ECONOMY FAVORITE",
    price: "Starts ₹11/km",
    perKmRate: 11,
    baseDailyRate: 2400,
    hourlyPackage: "₹1,800 for 8 hrs / 80 km",
    airportFlatRate: "₹999 all-inclusive",
    image: "/images/cars/dzire.jpg",
    gallery: [
      "/images/cars/dzire.jpg",
      "/images/cars/ertiga.jpg",
      "/images/cars/wagon_r.jpg"
    ],
    variants: ["Maruti Suzuki Dzire ZXi+", "Toyota Etios Platinum", "Hyundai Aura SX", "Honda Amaze VX"],
    colors: ["Pearl White", "Silky Silver", "Magma Grey", "Midnight Black"],
    seatingCapacity: 4,
    seatingLabel: "4 Passengers + 1 Chauffeur",
    luggageCapacity: "2 Large Suitcases + 2 Duffel Bags",
    engineCc: "1197 cc - 1496 cc Dual VVT",
    transmission: "Automatic & Manual Available",
    alternateFuel: "Petrol & CNG Available",
    registrationType: "Yellow Board Commercial Permit (All-India Tourist Permit)",
    parkingLocation: "Hub Deployments across Airport & City Hubs",
    features: [
      "AC / Dual Climate Control",
      "Airbags & ABS with EBD",
      "Luggage Carrier / Boot 378L",
      "USB Fast Charging (Front & Rear)",
      "Bluetooth Audio & 4 Speakers",
      "GPS Real-time Tracking & SOS Button",
      "Sunroof (on select ZXi+ variants)",
      "360 Camera (Reverse Assist)",
      "Ventilated Cushioned Seats",
      "Complimentary Water Bottles & Tissues"
    ],
    idealFor: ["Corporate Commutes", "Airport Drops & Pickups", "Outstation Weekend Getaways", "Couple & Small Family Travel"],
    chauffeurStandards: [
      "English & Local Language Fluent",
      "Uniformed & Police Verified",
      "Experienced & Verified Drivers",
      "35-Point Pre-Trip Sanitization Checklist Verified"
    ]
  },
  {
    slug: "suv",
    name: "Premium Electric SUV",
    popularName: "Tata Nexon EV, Curvv EV, Creta, Brezza",
    headline: "Eco-friendly, silent, and refined touring with state-of-the-art tech",
    desc: "Experience smooth, silent, and sustainable electric travel. Spacious cabins, instant electric acceleration, and zero emissions make it perfect for conscious city and outstation journeys.",
    badge: "ECO ELECTRIC FAVORITE",
    price: "Starts ₹15/km",
    perKmRate: 15,
    baseDailyRate: 3400,
    hourlyPackage: "₹2,600 for 8 hrs / 80 km",
    airportFlatRate: "₹1,499 all-inclusive",
    image: "/images/fleet/suv_electric.jpg",
    gallery: [
      "/images/fleet/suv_electric.jpg",
      "/images/fleet/suv.jpg"
    ],
    variants: ["Tata Nexon EV Long Range", "Tata Curvv EV", "MG ZS EV", "Hyundai Creta"],
    colors: ["Pristine White", "Empowered Oxide", "Daytona Grey", "Starlight Black"],
    seatingCapacity: 5,
    seatingLabel: "4-5 Passengers + 1 Chauffeur",
    luggageCapacity: "3 Large Suitcases + 2 Hand Luggage",
    engineCc: "Permanent Magnet Synchronous Motor / 40.5 kWh",
    transmission: "Single Speed Automatic",
    alternateFuel: "100% Electric (EV) / Clean Green Mobility",
    registrationType: "Green Board Commercial Electric Tourist Permit",
    parkingLocation: "Hub Deployments with Dedicated Fast Chargers",
    features: [
      "Zero Tailpipe Emissions",
      "Fast DC Charging Supported",
      "Panoramic / Electric Sunroof",
      "Silent Whisper Cabin",
      "Ventilated Front Seats",
      "Dual Air Conditioning",
      "Connected Car Tech & SOS Button",
      "Fast Type-C USB Ports",
      "Complimentary Water Bottles"
    ],
    idealFor: ["Eco-Conscious Commutes", "Airport Transfers", "City Day Rentals", "Weekend Getaways"],
    chauffeurStandards: [
      "EV Driving Certified",
      "Uniformed & Police Verified",
      "Experienced & Verified Drivers",
      "35-Point Sanitization Verified"
    ]
  },
  {
    slug: "crysta",
    name: "Innova Crysta",
    popularName: "Toyota Innova Crysta 2.4 ZX / GX",
    headline: "The Gold Standard of highway comfort and executive family touring",
    desc: "Renowned for unmatched legroom, captain recliner seating, and silky-smooth highway cruising. The top choice for VIP business travel and long outstation road trips.",
    badge: "MOST POPULAR",
    price: "Starts ₹18/km",
    perKmRate: 18,
    baseDailyRate: 4200,
    hourlyPackage: "₹3,200 for 8 hrs / 80 km",
    airportFlatRate: "₹1,899 all-inclusive",
    image: "/images/fleet/crysta.jpg",
    gallery: [
      "/images/fleet/crysta.jpg",
      "/images/cars/innova.jpg"
    ],
    variants: ["Toyota Innova Crysta 2.4 ZX", "Toyota Innova Crysta 2.4 GX", "Toyota Innova Crysta 2.4 VX"],
    colors: ["Super White", "Silver Metallic", "Attitude Black", "Garnet Red"],
    seatingCapacity: 7,
    seatingLabel: "6-7 Passengers + 1 Chauffeur",
    luggageCapacity: "4 Large Suitcases + 3 Hand Luggage",
    engineCc: "2393 cc GD Diesel Intercooled Turbo",
    transmission: "Automatic 6-Speed & Manual 5-Speed",
    alternateFuel: "BS-VI Low-Emission Diesel",
    registrationType: "Yellow Board Commercial Permit (All-India Tourist Permit)",
    parkingLocation: "Dedicated Airport Hub & Prime City Terminals",
    features: [
      "Captain Recliner Seats with Armrests",
      "Triple Zone Chilled Air Conditioning",
      "Rear Roof AC Vents with Fan Controls",
      "Roof Rail Mounts & Luggage Carrier",
      "7 Airbags & Vehicle Stability Control",
      "GPS Telematics & Speed Governor",
      "Fast Type-C Fast Chargers for all rows",
      "Complimentary Water & Refreshments"
    ],
    idealFor: ["Family Vacations", "VIP Corporate Guests", "Hill Station & Ghat Roads", "Intercity Round-Trips"],
    chauffeurStandards: [
      "Experienced & Verified Drivers",
      "Uniformed with ID Badge",
      "Multi-lingual (Tamil, English, Hindi)",
      "Luggage Assistance & Door Service Included"
    ]
  },
  {
    slug: "innovahycross",
    name: "Innova Hycross",
    popularName: "Toyota Innova Hycross Strong Hybrid ZX(O) / VX",
    headline: "Ultra-luxury hybrid grand tourer with ottoman lounge seating & panoramic sunroof",
    desc: "The pinnacle of executive comfort. Silent strong-hybrid propulsion, powered ottoman lounge seats, panoramic sunroof, and modern ADAS safety tech elevate every business and VIP journey.",
    badge: "ULTRA LUXURY HYBRID",
    price: "Starts ₹21/km",
    perKmRate: 21,
    baseDailyRate: 4800,
    hourlyPackage: "₹3,800 for 8 hrs / 80 km",
    airportFlatRate: "₹2,199 all-inclusive",
    image: "/images/fleet/hycross.jpg",
    gallery: [
      "/images/fleet/hycross.jpg"
    ],
    variants: ["Toyota Innova Hycross ZX(O) Hybrid", "Toyota Innova Hycross VX Hybrid", "Toyota Innova Hycross GX"],
    colors: ["Platinum White Pearl", "Blackish Ageha Glass Flake", "Silver Metallic", "Attitude Black"],
    seatingCapacity: 7,
    seatingLabel: "6-7 Passengers + 1 Chauffeur",
    luggageCapacity: "4 Large Suitcases + 3 Hand Luggage",
    engineCc: "1987 cc TNGA Strong Hybrid (Electric + Petrol)",
    transmission: "e-CVT Automatic",
    alternateFuel: "Strong Self-Charging Hybrid Electric",
    registrationType: "Yellow Board Commercial Permit (All-India Tourist Permit)",
    parkingLocation: "Dedicated Airport Hub & Executive Terminal",
    features: [
      "Panoramic Sunroof with Mood Lighting",
      "Powered Ottoman Captain Recliner Lounge Seats",
      "360 Degree Surround View Camera",
      "Toyota Safety Sense (ADAS Level 2)",
      "Multi-Zone Climate Control",
      "JBL 9-Speaker Audio System",
      "Fast USB-C Charging Ports in all rows",
      "Ultra-Silent Cabin Insulation"
    ],
    idealFor: ["Executive VIP Delegation", "Luxury Outstation Touring", "Airport VIP Escorts", "Weddings & Celebrations"],
    chauffeurStandards: [
      "Senior Executive Chauffeur",
      "Uniformed, English Fluent & Hospitality Trained",
      "Experienced & Verified Drivers",
      "35-Point Sanitization Verified"
    ]
  },
  {
    slug: "urbania",
    name: "Force Urbania",
    popularName: "9, 12 & 16 Seater Force Urbania Luxury Van",
    headline: "Next-gen European-styled luxury executive van with standing cabin height",
    desc: "Force Urbania brings airline-style individual recliner seating, sealed whisper-quiet cabin acoustics, panoramic tinted windows, individual AC louvers, and dedicated charging sockets at every seat.",
    badge: "LUXURY EXECUTIVE VAN",
    price: "Starts ₹26/km",
    perKmRate: 26,
    baseDailyRate: 6500,
    hourlyPackage: "₹5,000 for 8 hrs / 80 km",
    airportFlatRate: "₹3,299 all-inclusive",
    image: "/images/fleet/urbania.jpg",
    gallery: [
      "/images/fleet/urbania.jpg",
      "/images/fleet/tempo_traveller.jpg",
      "/images/fleet/tempo.jpg"
    ],
    variants: ["Force Urbania 9+1 Luxury Executive", "Force Urbania 12+1 Short Wheelbase", "Force Urbania 16+1 Long Wheelbase"],
    colors: ["Pristine White", "Royal Champagne Gold", "Silver Metallic"],
    seatingCapacity: 16,
    seatingLabel: "9 to 16 Passengers + 1 Chauffeur",
    luggageCapacity: "12-16 Large Suitcases + Dedicated Rear Cargo Deck",
    engineCc: "2596 cc FM 2.6 CR ED Turbo Diesel",
    transmission: "5-Speed Synchromesh Manual",
    alternateFuel: "BS-VI Low-Emission Diesel",
    registrationType: "Yellow Board Commercial Maxi-Cab Tourist Permit",
    parkingLocation: "Airport Logistic Yard & Prime City Hubs",
    features: [
      "Airline-Style Individual Pushback Recliners",
      "6.5 ft Standing Cabin Clearance Height",
      "Individual Roof AC Vents with Fan Controls",
      "Individual Fast USB Mobile Charging at Each Seat",
      "LED Ambient Mood Lighting & Reading Lamps",
      "High-Fidelity Audio System with Wireless Mic",
      "Panoramic Tinted Glass Windows with Curtains",
      "Electronic Stability Control & Hill Hold Assist",
      "Soft Leaf Parabolic Suspensions for Smooth Ride",
      "Complimentary Mineral Water & Tissue Dispenser"
    ],
    idealFor: ["Corporate VIP Offsites", "Luxury Family Holidays", "Destination Wedding Delegations", "Airport VIP Escorts"],
    chauffeurStandards: [
      "Commercial Maxi-Cab Heavy Passenger Vehicle License",
      "Uniformed, Courteous & English/Local Language Fluent",
      "Experienced & Verified Drivers",
      "35-Point Pre-Trip Sanitization Verified"
    ]
  },
  {
    slug: "tempo",
    name: "Tempo Traveller",
    popularName: "9, 12, 17, 20 & 21+ Seater Force Maharaja Tempo",
    headline: "Royal Maharaja recliner comfort for family pilgrimages, weddings & group tours",
    desc: "Featuring plush 2x1 Maharaja pushback recliner seats, generous head clearance, expansive windows, LCD TV entertainment, and heavy-duty dual air conditioning for groups of 9 to 21+ travelers.",
    badge: "MOST POPULAR FOR GROUPS",
    price: "Starts ₹24/km",
    perKmRate: 24,
    baseDailyRate: 5800,
    hourlyPackage: "₹4,500 for 8 hrs / 80 km",
    airportFlatRate: "₹2,999 all-inclusive",
    image: "/images/fleet/tempo_traveller.jpg",
    gallery: [
      "/images/fleet/tempo_traveller.jpg",
      "/images/fleet/tempo.jpg",
      "/images/fleet/urbania.jpg"
    ],
    variants: ["12-Seater Maharaja 2x1 Recliner", "17-Seater Executive Deluxe", "20-Seater Tourist Coach", "21-26 Seater Maxi Traveller"],
    colors: ["Arctic White", "Royal Champagne Gold", "Silver Metallic"],
    seatingCapacity: 21,
    seatingLabel: "9 to 21 Passengers + 1 Chauffeur",
    luggageCapacity: "15+ Large Suitcases + Dedicated Rear Luggage Deck + Roof Carrier",
    engineCc: "2596 cc FM 2.6 CR ED Turbo Diesel",
    transmission: "5-Speed Synchromesh Manual",
    alternateFuel: "Ultra-Low Emission Diesel",
    registrationType: "Yellow Board Commercial Maxi-Cab Tourist Permit",
    parkingLocation: "Central Fleet Depot & Airport Logistics Yard",
    features: [
      "Maharaja 2x1 Push-Back Recliner Seats with Armrests",
      "Roof Mounted Luggage Carrier & Boot Space",
      "Dual AC with Individual Overhead Louvers",
      "LED TV & Hi-Fi Audio System with Wireless Mic",
      "Recliner Seats with Footrests & Calf Support",
      "Reading Lamps & Individual Mobile Charging Sockets",
      "Air Suspension / Soft Leaf Parabolic Dampers",
      "GPS Speed Governor & Real-time Live Tracking",
      "Wide Center Aisle & Ample Headroom",
      "First-Aid Kit & Fire Extinguisher Equipped"
    ],
    idealFor: ["Pilgrim Circuits & Temple Tours", "Wedding Guest Shuttles", "Corporate Team Outings", "Large Family Sightseeing"],
    chauffeurStandards: [
      "10+ Years Commercial Heavy/Maxi-Cab License",
      "Police Verified & Defensive Driving Certified",
      "Experienced & Verified Drivers",
      "35-Point Sanitization Verified"
    ]
  },
  {
    slug: "bus",
    name: "Luxury Bus",
    popularName: "35 to 65 Seater Volvo, BharatBenz & Scania",
    headline: "Unrivaled long-distance grand touring luxury for large organizations & weddings",
    desc: "Multi-axle air-suspension luxury coaches engineered for utmost passenger serenity. Equipped with ergonomic reclining seating, panoramic view windows, onboard washroom options, and generous under-deck luggage bays.",
    badge: "COACHES & VOLVO",
    price: "Starts ₹45/km",
    perKmRate: 45,
    baseDailyRate: 11500,
    hourlyPackage: "₹8,500 for 8 hrs / 80 km",
    airportFlatRate: "₹5,500 all-inclusive",
    image: "/images/fleet/bus.jpg",
    gallery: [
      "/images/fleet/bus.jpg",
      "/images/vendor/bus.jpg",
      "/images/fleet/tempo_traveller.jpg"
    ],
    variants: ["Volvo 9600 Multi-Axle Intercity Coach", "BharatBenz 35-Seater Luxury AC", "Scania Metrolink HD 45-Seater", "55-65 Seater Tourist Deluxe"],
    colors: ["White & Royal Blue", "Pearl Platinum", "Crimson Red"],
    seatingCapacity: 65,
    seatingLabel: "35 to 65 Executive Recliner Berths/Seats",
    luggageCapacity: "50+ Large Suitcases in Heavy Underbelly Cargo Hold",
    engineCc: "10,800 cc Volvo D11K Euro-6 Turbocharged",
    transmission: "Volvo I-Shift Automated 12-Speed",
    alternateFuel: "BS-VI Diesel / Clean Biofuel Compatible",
    registrationType: "All-India Commercial Stage Carrier / Contract Permit",
    parkingLocation: "Regional Bus Terminal & Suburban Depot",
    features: [
      "Multi-Axle Electronically Controlled Air Suspension",
      "Dual LED TVs with Integrated PA & Audio System",
      "Climate Controlled Chilled AC with Micro-Pollutant Filter",
      "Maharaja Recliner Seats with 140° Tilt & Leg Support",
      "Onboard Clean Washroom (Select Models)",
      "Luggage Carrier Underbelly Hold (over 10,000 Litres)",
      "ADAS Automatic Emergency Braking & Collision Warning",
      "360 Degree Surround Driver Cameras",
      "USB Ports at Every Seat + AC 220V Outlets",
      "Emergency Exits & Automatic Fire Detection Suppression (FDAS)"
    ],
    idealFor: ["Large Corporate Conferences & Offsites", "College & Educational Excursions", "Grand Destination Weddings", "Inter-State Tour Groups"],
    chauffeurStandards: [
      "Two Commercial Heavy-Vehicle Captains for Shift Driving",
      "Experienced & Verified Drivers",
      "Uniformed, Courteous & Trained in Guest Hospitality",
      "Complete Compliance with National Highway Safety Protocols"
    ]
  }
];

export function getFleetBySlug(slug) {
  if (!slug) return FLEET_CATEGORIES[0];
  const normalized = slug.toLowerCase().trim();
  return (
    FLEET_CATEGORIES.find((f) => f.slug === normalized) ||
    FLEET_CATEGORIES.find((f) => normalized.includes(f.slug) || f.slug.includes(normalized)) ||
    FLEET_CATEGORIES[0]
  );
}
