export const FLEET_MODELS = [
  {
    id: "wagon_r",
    title: "Wagon R, Swift",
    subtitle: "or similar",
    rating: 4.8,
    reviewCount: "8.4k",
    seating: "4 seater AC Cab",
    seats: 4,
    bags: "2 Bags",
    image: "/images/cars/wagon_r.jpg",
    driverAllowanceIncluded: true,
    includedKms: 347,
    postLimitRate: 18,
    category: "HATCHBACK",
    fuelOptions: [
      { id: "cng", name: "CNG", default: true },
      { id: "diesel", name: "Diesel", default: false }
    ],
    pricing: {
      discountPercent: 12,
      originalPrice: 4600,
      discountedPrice: 4061,
      chargesAndTaxes: 1486,
      advanceAmount: 850
    },
    luggageCarrierOption: {
      available: true,
      price: 149,
      label: "Cab with Luggage Carrier"
    },
    inclusions: [
      "Base fare for 347 kms",
      "Chauffeur allowance & night charges",
      "Interstate toll & permits prepaid",
      "GST & regulatory service cess",
      "Free cancellation up to 1 hour prior to pickup"
    ],
    exclusions: [
      "Parking fees at airports or railway stations (if applicable)",
      "Additional kilometers beyond 347 kms @ ₹18/km",
      "Additional waiting charges beyond 45 mins"
    ]
  },
  {
    id: "dzire",
    title: "Dzire, Etios",
    subtitle: "or similar",
    rating: 4.8,
    reviewCount: "19.6k",
    seating: "4 seater AC Cab",
    seats: 4,
    bags: "3 Bags",
    image: "/images/cars/dzire.jpg",
    driverAllowanceIncluded: true,
    includedKms: 347,
    postLimitRate: 18,
    category: "SEDAN",
    fuelOptions: [
      { id: "cng", name: "CNG", default: true },
      { id: "diesel", name: "Diesel", default: false }
    ],
    pricing: {
      discountPercent: 12,
      originalPrice: 4747,
      discountedPrice: 4168,
      chargesAndTaxes: 1492,
      advanceAmount: 900
    },
    luggageCarrierOption: {
      available: true,
      price: 149,
      label: "Cab with Luggage Carrier"
    },
    inclusions: [
      "Base fare for 347 kms",
      "Dedicated commercial chauffeur allowance",
      "Tolls & border entry permits",
      "5% GST included",
      "Free cancellation up to 1 hour prior to pickup"
    ],
    exclusions: [
      "Airport / monument parking fees",
      "Additional kilometers beyond 347 kms @ ₹18/km",
      "Multiple drop detours not specified in route"
    ]
  },
  {
    id: "ertiga",
    title: "Ertiga",
    subtitle: "or similar",
    rating: 4.8,
    reviewCount: "12.3k",
    seating: "6 seater AC Cab",
    seats: 6,
    bags: "3 Bags",
    image: "/images/cars/ertiga.jpg",
    driverAllowanceIncluded: true,
    includedKms: 347,
    postLimitRate: 18,
    category: "SUV_6",
    fuelOptions: [
      { id: "cng", name: "CNG", default: true },
      { id: "diesel", name: "Diesel", default: false }
    ],
    pricing: {
      discountPercent: 16,
      originalPrice: 6477,
      discountedPrice: 5436,
      chargesAndTaxes: 1857,
      advanceAmount: 1100
    },
    luggageCarrierOption: {
      available: true,
      price: 199,
      label: "Cab with Luggage Carrier"
    },
    inclusions: [
      "Spacious 3-row seating for up to 6 passengers",
      "Chauffeur allowance & night charges included",
      "Tolls, state taxes & permits prepaid",
      "5% GST included",
      "Free cancellation up to 1 hour prior to pickup"
    ],
    exclusions: [
      "Municipal parking charges (if applicable)",
      "Kilometers beyond 347 kms @ ₹18/km"
    ]
  },
  {
    id: "innova_crysta",
    title: "Innova Crysta",
    subtitle: "or similar",
    rating: 4.9,
    reviewCount: "28.5k",
    seating: "7 seater Premium SUV",
    seats: 7,
    bags: "5 Bags",
    image: "/images/cars/innova.jpg",
    driverAllowanceIncluded: true,
    includedKms: 347,
    postLimitRate: 23,
    category: "SUV_7",
    fuelOptions: [
      { id: "diesel", name: "Diesel", default: true }
    ],
    pricing: {
      discountPercent: 15,
      originalPrice: 7999,
      discountedPrice: 6799,
      chargesAndTaxes: 2120,
      advanceAmount: 1400
    },
    luggageCarrierOption: {
      available: true,
      price: 199,
      label: "Cab with Rooftop Luggage Carrier"
    },
    inclusions: [
      "Executive comfort with Captain Seats & dual-blower AC",
      "Hill-terrain & Ghat certified chauffeur",
      "Tolls & all inter-state entry taxes included",
      "Driver night charges & food allowance included",
      "Free cancellation up to 1 hour prior to pickup"
    ],
    exclusions: [
      "Airport/mall parking fees",
      "Extra distance beyond 347 kms @ ₹23/km"
    ]
  }
];

export const CATEGORY_DEFAULTS = {
  HATCHBACK: "/images/cars/wagon_r.jpg",
  SEDAN: "/images/cars/dzire.jpg",
  SUV_6: "/images/cars/ertiga.jpg",
  SUV_7: "/images/cars/innova.jpg",
  TEMPO: "/images/fleet/tempo.jpg"
};

export function getCarVisual(car) {
  if (car?.imageUrl) return car.imageUrl;
  if (car?.image) return car.image;
  return CATEGORY_DEFAULTS[car?.vehicleType || car?.category] || "/images/cars/dzire.jpg";
}
