// Comprehensive Indian Cities Catalog with Geolocation Coordinates for Automatic KM Detection

export const INDIAN_CITIES = [
  // Top Metros & South India Hubs (Popular)
  { name: "Bangalore", state: "Karnataka", aliases: ["Bengaluru", "BLR"], lat: 12.9716, lng: 77.5946, popular: true },
  { name: "Coimbatore", state: "Tamil Nadu", aliases: ["CJB", "Kovai"], lat: 11.0168, lng: 76.9558, popular: true },
  { name: "Chennai", state: "Tamil Nadu", aliases: ["Madras", "MAA"], lat: 13.0827, lng: 80.2707, popular: true },
  { name: "Hyderabad", state: "Telangana", aliases: ["HYD", "Secunderabad"], lat: 17.3850, lng: 78.4867, popular: true },
  { name: "Mysore", state: "Karnataka", aliases: ["Mysuru", "MYQ"], lat: 12.2958, lng: 76.6394, popular: true },
  { name: "Ooty", state: "Tamil Nadu", aliases: ["Udhagamandalam"], lat: 11.4102, lng: 76.6950, popular: true },
  { name: "Mumbai", state: "Maharashtra", aliases: ["Bombay", "BOM"], lat: 19.0760, lng: 72.8777, popular: true },
  { name: "Pune", state: "Maharashtra", aliases: ["PNQ", "Poona"], lat: 18.5204, lng: 73.8567, popular: true },
  { name: "Delhi", state: "NCR", aliases: ["New Delhi", "DEL"], lat: 28.6139, lng: 77.2090, popular: true },
  { name: "Kochi", state: "Kerala", aliases: ["Cochin", "COK", "Ernakulam"], lat: 9.9312, lng: 76.2673, popular: true },
  { name: "Goa", state: "Goa", aliases: ["Panaji", "GOI", "Madgaon", "Vasco"], lat: 15.2993, lng: 74.1240, popular: true },
  { name: "Jaipur", state: "Rajasthan", aliases: ["JAI", "Pink City"], lat: 26.9124, lng: 75.7873, popular: true },

  // Tamil Nadu
  { name: "Madurai", state: "Tamil Nadu", aliases: ["IXM"], lat: 9.9252, lng: 78.1198, popular: true },
  { name: "Salem", state: "Tamil Nadu", aliases: ["SXV"], lat: 11.6643, lng: 78.1460, popular: true },
  { name: "Tiruchirappalli", state: "Tamil Nadu", aliases: ["Trichy", "TRZ"], lat: 10.7905, lng: 78.7047 },
  { name: "Pondicherry", state: "Puducherry", aliases: ["Puducherry", "PNY"], lat: 11.9416, lng: 79.8083, popular: true },
  { name: "Kodaikanal", state: "Tamil Nadu", aliases: ["Kodai"], lat: 10.2381, lng: 77.4892 },
  { name: "Tirunelveli", state: "Tamil Nadu", lat: 8.7139, lng: 77.7567 },
  { name: "Tirupur", state: "Tamil Nadu", lat: 11.1085, lng: 77.3411 },
  { name: "Erode", state: "Tamil Nadu", lat: 11.3410, lng: 77.7172 },
  { name: "Vellore", state: "Tamil Nadu", lat: 12.9165, lng: 79.1325 },
  { name: "Thanjavur", state: "Tamil Nadu", aliases: ["Tanjore"], lat: 10.7870, lng: 79.1378 },
  { name: "Rameswaram", state: "Tamil Nadu", aliases: ["Rameshwaram"], lat: 9.2876, lng: 79.3129 },
  { name: "Kanyakumari", state: "Tamil Nadu", aliases: ["Cape Comorin"], lat: 8.0883, lng: 77.5385 },
  { name: "Dindigul", state: "Tamil Nadu", lat: 10.3673, lng: 77.9803 },
  { name: "Hosur", state: "Tamil Nadu", lat: 12.7409, lng: 77.8253 },
  { name: "Karur", state: "Tamil Nadu", lat: 10.9601, lng: 78.0766 },
  { name: "Nagercoil", state: "Tamil Nadu", lat: 8.1833, lng: 77.4119 },
  { name: "Yercaud", state: "Tamil Nadu", lat: 11.7753, lng: 78.2093 },
  { name: "Coonoor", state: "Tamil Nadu", lat: 11.3530, lng: 76.7959 },
  { name: "Pollachi", state: "Tamil Nadu", lat: 10.6609, lng: 77.0048 },

  // Karnataka
  { name: "Mangalore", state: "Karnataka", aliases: ["Mangaluru", "IXE"], lat: 12.9141, lng: 74.8560 },
  { name: "Chikmagalur", state: "Karnataka", aliases: ["Chikkamagaluru"], lat: 13.3161, lng: 75.7720 },
  { name: "Coorg", state: "Karnataka", aliases: ["Madikeri", "Kodagu"], lat: 12.4244, lng: 75.7382 },
  { name: "Hubli", state: "Karnataka", aliases: ["Hubballi", "Dharwad", "HBX"], lat: 15.3647, lng: 75.1240 },
  { name: "Belgaum", state: "Karnataka", aliases: ["Belagavi", "IXG"], lat: 15.8497, lng: 74.4977 },
  { name: "Hampi", state: "Karnataka", aliases: ["Hospet"], lat: 15.3350, lng: 76.4600 },
  { name: "Shimoga", state: "Karnataka", aliases: ["Shivamogga"], lat: 13.9299, lng: 75.5681 },
  { name: "Udupi", state: "Karnataka", aliases: ["Manipal"], lat: 13.3409, lng: 74.7421 },
  { name: "Gokarna", state: "Karnataka", lat: 14.5479, lng: 74.3188 },
  { name: "Dandeli", state: "Karnataka", lat: 15.2458, lng: 74.6231 },
  { name: "Hassan", state: "Karnataka", lat: 13.0033, lng: 76.1004 },
  { name: "Tumkur", state: "Karnataka", aliases: ["Tumakuru"], lat: 13.3392, lng: 77.1017 },
  { name: "Davangere", state: "Karnataka", lat: 14.4644, lng: 75.9218 },
  { name: "Gulbarga", state: "Karnataka", aliases: ["Kalaburagi"], lat: 17.3297, lng: 76.8343 },
  { name: "Bellary", state: "Karnataka", aliases: ["Ballari"], lat: 15.1394, lng: 76.9214 },
  { name: "Sakleshpur", state: "Karnataka", lat: 12.9438, lng: 75.7877 },
  { name: "Kabini", state: "Karnataka", lat: 11.9567, lng: 76.3533 },
  { name: "Bandipur", state: "Karnataka", lat: 11.6667, lng: 76.6333 },

  // Kerala
  { name: "Thiruvananthapuram", state: "Kerala", aliases: ["Trivandrum", "TRV"], lat: 8.5241, lng: 76.9366 },
  { name: "Kozhikode", state: "Kerala", aliases: ["Calicut", "CCJ"], lat: 11.2588, lng: 75.7804 },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595 },
  { name: "Wayanad", state: "Kerala", aliases: ["Kalpetta"], lat: 11.6854, lng: 76.1320 },
  { name: "Alappuzha", state: "Kerala", aliases: ["Alleppey"], lat: 9.4981, lng: 76.3388 },
  { name: "Thrissur", state: "Kerala", aliases: ["Trichur"], lat: 10.5276, lng: 76.2144 },
  { name: "Kollam", state: "Kerala", aliases: ["Quilon"], lat: 8.8932, lng: 76.6141 },
  { name: "Kannur", state: "Kerala", aliases: ["CNN"], lat: 11.8745, lng: 75.3704 },
  { name: "Palakkad", state: "Kerala", aliases: ["Palghat"], lat: 10.7867, lng: 76.6548 },
  { name: "Kottayam", state: "Kerala", lat: 9.5916, lng: 76.5222 },
  { name: "Varkala", state: "Kerala", lat: 8.7379, lng: 76.7163 },
  { name: "Thekkady", state: "Kerala", aliases: ["Periyar"], lat: 9.6031, lng: 77.1615 },

  // Andhra Pradesh & Telangana
  { name: "Visakhapatnam", state: "Andhra Pradesh", aliases: ["Vizag", "VTZ"], lat: 17.6868, lng: 83.2185 },
  { name: "Vijayawada", state: "Andhra Pradesh", aliases: ["VGA"], lat: 16.5062, lng: 80.6480 },
  { name: "Tirupati", state: "Andhra Pradesh", aliases: ["TIR"], lat: 13.6288, lng: 79.4192, popular: true },
  { name: "Guntur", state: "Andhra Pradesh", lat: 16.3067, lng: 80.4365 },
  { name: "Nellore", state: "Andhra Pradesh", lat: 14.4426, lng: 79.9865 },
  { name: "Kurnool", state: "Andhra Pradesh", lat: 15.8281, lng: 78.0373 },
  { name: "Rajahmundry", state: "Andhra Pradesh", aliases: ["RJA"], lat: 17.0005, lng: 81.8040 },
  { name: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941 },
  { name: "Nizamabad", state: "Telangana", lat: 18.6725, lng: 78.0941 },
  { name: "Karimnagar", state: "Telangana", lat: 18.4386, lng: 79.1288 },

  // Maharashtra & Gujarat
  { name: "Nagpur", state: "Maharashtra", aliases: ["NAG"], lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", aliases: ["Nasik"], lat: 19.9975, lng: 73.7898 },
  { name: "Aurangabad", state: "Maharashtra", aliases: ["Chhatrapati Sambhajinagar", "IXU"], lat: 19.8762, lng: 75.3433 },
  { name: "Shirdi", state: "Maharashtra", aliases: ["SAG"], lat: 19.7668, lng: 74.4762 },
  { name: "Mahabaleshwar", state: "Maharashtra", aliases: ["Panchgani"], lat: 17.9307, lng: 73.6477 },
  { name: "Lonavala", state: "Maharashtra", aliases: ["Khandala"], lat: 18.7557, lng: 73.4091 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.7050, lng: 74.2433 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6599, lng: 75.9064 },
  { name: "Ahmedabad", state: "Gujarat", aliases: ["AMD"], lat: 23.0225, lng: 72.5714 },
  { name: "Surat", state: "Gujarat", aliases: ["STV"], lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", aliases: ["Baroda", "BDQ"], lat: 22.3072, lng: 73.1812 },
  { name: "Rajkot", state: "Gujarat", aliases: ["RAJ"], lat: 22.3039, lng: 70.8022 },

  // North India & Rajasthan
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
  { name: "Gurgaon", state: "Haryana", aliases: ["Gurugram"], lat: 28.4595, lng: 77.0266 },
  { name: "Chandigarh", state: "Punjab/Haryana", aliases: ["IXC"], lat: 30.7333, lng: 76.7794 },
  { name: "Amritsar", state: "Punjab", aliases: ["ATQ"], lat: 31.6340, lng: 74.8723 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573 },
  { name: "Agra", state: "Uttar Pradesh", aliases: ["AGR"], lat: 27.1767, lng: 78.0081 },
  { name: "Lucknow", state: "Uttar Pradesh", aliases: ["LKO"], lat: 26.8467, lng: 80.9462 },
  { name: "Varanasi", state: "Uttar Pradesh", aliases: ["Banaras", "Kashi", "VNS"], lat: 25.3176, lng: 82.9739 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Mathura", state: "Uttar Pradesh", aliases: ["Vrindavan"], lat: 27.4924, lng: 77.6737 },
  { name: "Dehradun", state: "Uttarakhand", aliases: ["DED"], lat: 30.3165, lng: 78.0322 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0644 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3919, lng: 79.4542 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Manali", state: "Himachal Pradesh", aliases: ["Kullu"], lat: 32.2432, lng: 77.1892 },
  { name: "Dharamshala", state: "Himachal Pradesh", aliases: ["Dharamsala", "McLeod Ganj"], lat: 32.2190, lng: 76.3234 },
  { name: "Udaipur", state: "Rajasthan", aliases: ["UDR"], lat: 24.5854, lng: 73.7125 },
  { name: "Jodhpur", state: "Rajasthan", aliases: ["JDH"], lat: 26.2389, lng: 73.0243 },
  { name: "Ajmer", state: "Rajasthan", aliases: ["Pushkar"], lat: 26.4499, lng: 74.6399 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083 },

  // East & Central India
  { name: "Kolkata", state: "West Bengal", aliases: ["Calcutta", "CCU"], lat: 22.5726, lng: 88.3639 },
  { name: "Darjeeling", state: "West Bengal", lat: 27.0410, lng: 88.2663 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953 },
  { name: "Bhubaneswar", state: "Odisha", aliases: ["BBI"], lat: 20.2961, lng: 85.8245 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312 },
  { name: "Patna", state: "Bihar", aliases: ["PAT"], lat: 25.5941, lng: 85.1376 },
  { name: "Ranchi", state: "Jharkhand", aliases: ["IXR"], lat: 23.3441, lng: 85.3096 },
  { name: "Guwahati", state: "Assam", aliases: ["GAU"], lat: 26.1445, lng: 91.7362 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933 },
  { name: "Indore", state: "Madhya Pradesh", aliases: ["IDR"], lat: 22.7196, lng: 75.8577 },
  { name: "Bhopal", state: "Madhya Pradesh", aliases: ["BHO"], lat: 23.2599, lng: 77.4126 },
  { name: "Gwalior", state: "Madhya Pradesh", aliases: ["GWL"], lat: 26.2183, lng: 78.1828 },
  { name: "Raipur", state: "Chhattisgarh", aliases: ["RPR"], lat: 21.2514, lng: 81.6296 }
];

const STORAGE_KEY = "grabrentals_custom_cities";

// Known Highway Road Distances (in km) for popular pairs
const HIGHWAY_DISTANCE_OVERRIDES = {
  "bangalore-coimbatore": 365,
  "bangalore-chennai": 347,
  "bangalore-mysore": 145,
  "bangalore-hyderabad": 575,
  "bangalore-ooty": 275,
  "bangalore-pondicherry": 315,
  "bangalore-salem": 200,
  "bangalore-madurai": 435,
  "bangalore-trichy": 330,
  "bangalore-kochi": 540,
  "bangalore-coorg": 250,
  "bangalore-chikmagalur": 245,
  "salem-coimbatore": 165,
  "salem-madurai": 235,
  "mysore-ooty": 125,
  "coimbatore-ooty": 85,
  "chennai-coimbatore": 505,
  "chennai-madurai": 460,
  "chennai-pondicherry": 150,
  "chennai-salem": 340,
  "mumbai-pune": 155,
  "mumbai-nashik": 165,
  "delhi-jaipur": 280,
  "delhi-agra": 235,
  "agra-jaipur": 240,
  "kochi-trivandrum": 205
};

/**
 * Get stored custom user-added cities from localStorage
 */
export function getCustomCities() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Add a new custom city and save to localStorage
 */
export function saveCustomCity(cityName, stateName = "India") {
  if (!cityName || typeof window === "undefined") return null;
  const cleanName = cityName.trim();
  if (!cleanName) return null;

  try {
    const current = getCustomCities();
    const exists = current.some((c) => c.name.toLowerCase() === cleanName.toLowerCase()) ||
                   INDIAN_CITIES.some((c) => c.name.toLowerCase() === cleanName.toLowerCase());
    
    if (!exists) {
      const newCity = {
        name: cleanName,
        state: stateName || "India",
        custom: true
      };
      const updated = [newCity, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newCity;
    }
  } catch (err) {
    console.warn("Could not save custom city:", err);
  }
  return null;
}

/**
 * Get all available cities (default + custom)
 */
export function getAllCities() {
  const custom = getCustomCities();
  return [...custom, ...INDIAN_CITIES];
}

/**
 * Search and filter cities based on query text
 */
export function searchCities(query = "") {
  const all = getAllCities();
  const q = (query || "").trim().toLowerCase();

  if (!q) {
    return all.filter((c) => c.popular || c.custom).slice(0, 10);
  }

  return all
    .filter((city) => {
      const nameMatch = city.name.toLowerCase().includes(q);
      const stateMatch = city.state.toLowerCase().includes(q);
      const aliasMatch = city.aliases && city.aliases.some((a) => a.toLowerCase().includes(q));
      return nameMatch || stateMatch || aliasMatch;
    })
    .slice(0, 10);
}

/**
 * Find city coordinates by name or alias
 */
export function findCityCoordinates(cityName) {
  if (!cityName) return null;
  const clean = cityName.toLowerCase().split(",")[0].replace(/\(.*?\)/g, "").trim();
  const all = getAllCities();

  const match = all.find((c) => 
    c.name.toLowerCase() === clean ||
    (c.aliases && c.aliases.some((a) => a.toLowerCase() === clean))
  );

  if (match && match.lat && match.lng) {
    return { lat: match.lat, lng: match.lng };
  }

  // Fallback: partial match
  const partial = all.find((c) =>
    clean.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(clean)
  );
  if (partial && partial.lat && partial.lng) {
    return { lat: partial.lat, lng: partial.lng };
  }

  return null;
}

/**
 * Great-circle distance using Haversine formula (km)
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate driving road distance between two cities (in km)
 */
export function getSegmentDistance(fromCity, toCity) {
  if (!fromCity || !toCity) return 0;
  const c1 = fromCity.toLowerCase().split(",")[0].replace(/\(.*?\)/g, "").trim();
  const c2 = toCity.toLowerCase().split(",")[0].replace(/\(.*?\)/g, "").trim();

  if (c1 === c2) return 25; // Local city trip

  // Check known highway override
  const key1 = `${c1}-${c2}`;
  const key2 = `${c2}-${c1}`;
  if (HIGHWAY_DISTANCE_OVERRIDES[key1]) return HIGHWAY_DISTANCE_OVERRIDES[key1];
  if (HIGHWAY_DISTANCE_OVERRIDES[key2]) return HIGHWAY_DISTANCE_OVERRIDES[key2];

  // Try GPS coordinates
  const coords1 = findCityCoordinates(fromCity);
  const coords2 = findCityCoordinates(toCity);

  if (coords1 && coords2) {
    const directKm = haversineDistanceKm(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
    // Indian highway road winding factor is typically 1.25x - 1.30x of air distance
    const roadKm = Math.round(directKm * 1.28);
    return Math.max(roadKm, 40);
  }

  // Generic fallback if unknown town
  return 220;
}

/**
 * Automatic Route Distance Detection (including stops & round trip)
 */
export function detectRouteDistance(from, to, stops = [], tripType = "one-way") {
  if (!from || !to) {
    return { distanceKm: 0, durationHours: 0, isDetected: false };
  }

  const points = [from];
  if (stops) {
    const list = Array.isArray(stops) ? stops : stops.split(/[|,]/);
    list.forEach((s) => {
      if (s && s.trim()) points.push(s.trim());
    });
  }
  points.push(to);

  let oneWayKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    oneWayKm += getSegmentDistance(points[i], points[i + 1]);
  }

  const isRound = (tripType || "").toLowerCase().includes("round");
  const totalKm = isRound ? oneWayKm * 2 : oneWayKm;
  // Estimate driving duration assuming ~55 km/h average outstation highway speed
  const hours = Math.round((totalKm / 55) * 10) / 10;

  return {
    distanceKm: totalKm,
    oneWayKm,
    durationHours: hours,
    isDetected: true
  };
}

/**
 * Format city display text as "City, State"
 */
export function formatCityLabel(city) {
  if (!city) return "";
  if (typeof city === "string") return city;
  return `${city.name}, ${city.state}`;
}
