// Curated list of interesting locations around the world
// Each location has coordinates, name, country, and an optional hint

export interface GameLocation {
  lat: number;
  lng: number;
  name: string;
  country: string;
  hint?: string;
}

const WORLD_LOCATIONS: GameLocation[] = [
  { lat: 48.8566, lng: 2.3522, name: "Paris", country: "France", hint: "City of Light" },
  { lat: 40.7128, lng: -74.006, name: "New York City", country: "USA", hint: "The Big Apple" },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo", country: "Japan", hint: "Land of the Rising Sun" },
  { lat: -33.8688, lng: 151.2093, name: "Sydney", country: "Australia", hint: "Famous opera house" },
  { lat: 55.7558, lng: 37.6173, name: "Moscow", country: "Russia", hint: "Red Square" },
  { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro", country: "Brazil", hint: "Christ the Redeemer" },
  { lat: 51.5074, lng: -0.1278, name: "London", country: "UK", hint: "Big Ben" },
  { lat: 41.9028, lng: 12.4964, name: "Rome", country: "Italy", hint: "Eternal City" },
  { lat: 37.7749, lng: -122.4194, name: "San Francisco", country: "USA", hint: "Golden Gate" },
  { lat: 1.3521, lng: 103.8198, name: "Singapore", country: "Singapore", hint: "Lion City" },
  { lat: 25.2048, lng: 55.2708, name: "Dubai", country: "UAE", hint: "Tallest building" },
  { lat: -34.6037, lng: -58.3816, name: "Buenos Aires", country: "Argentina", hint: "Tango capital" },
  { lat: 52.52, lng: 13.405, name: "Berlin", country: "Germany", hint: "Brandenburg Gate" },
  { lat: 39.9042, lng: 116.4074, name: "Beijing", country: "China", hint: "Forbidden City" },
  { lat: 30.0444, lng: 31.2357, name: "Cairo", country: "Egypt", hint: "Pyramids nearby" },
  { lat: 59.9139, lng: 10.7522, name: "Oslo", country: "Norway", hint: "Viking heritage" },
  { lat: 41.0082, lng: 28.9784, name: "Istanbul", country: "Turkey", hint: "Two continents" },
  { lat: 13.7563, lng: 100.5018, name: "Bangkok", country: "Thailand", hint: "Temple of Dawn" },
  { lat: 19.4326, lng: -99.1332, name: "Mexico City", country: "Mexico", hint: "Aztec capital" },
  { lat: -1.2921, lng: 36.8219, name: "Nairobi", country: "Kenya", hint: "Safari gateway" },
  { lat: 34.0522, lng: -118.2437, name: "Los Angeles", country: "USA", hint: "Hollywood" },
  { lat: 60.1699, lng: 24.9384, name: "Helsinki", country: "Finland", hint: "Northern capital" },
  { lat: 35.1796, lng: 136.9066, name: "Nagoya", country: "Japan", hint: "Industrial heart" },
  { lat: 45.4642, lng: 9.19, name: "Milan", country: "Italy", hint: "Fashion capital" },
  { lat: -15.7975, lng: -47.8919, name: "Brasilia", country: "Brazil", hint: "Planned capital" },
  { lat: 47.3769, lng: 8.5417, name: "Zurich", country: "Switzerland", hint: "Banking center" },
  { lat: 50.0755, lng: 14.4378, name: "Prague", country: "Czech Republic", hint: "City of spires" },
  { lat: 37.5665, lng: 126.978, name: "Seoul", country: "South Korea", hint: "K-pop origin" },
  { lat: 64.1466, lng: -21.9426, name: "Reykjavik", country: "Iceland", hint: "Northern lights" },
  { lat: -36.8485, lng: 174.7633, name: "Auckland", country: "New Zealand", hint: "City of Sails" },
  { lat: 22.3193, lng: 114.1694, name: "Hong Kong", country: "China", hint: "Harbor city" },
  { lat: 48.2082, lng: 16.3738, name: "Vienna", country: "Austria", hint: "Music capital" },
  { lat: 33.8938, lng: 35.5018, name: "Beirut", country: "Lebanon", hint: "Phoenix city" },
  { lat: 6.5244, lng: 3.3792, name: "Lagos", country: "Nigeria", hint: "West Africa hub" },
  { lat: 43.7102, lng: 7.262, name: "Nice", country: "France", hint: "French Riviera" },
  { lat: -33.9249, lng: 18.4241, name: "Cape Town", country: "South Africa", hint: "Table Mountain" },
  { lat: 53.3498, lng: -6.2603, name: "Dublin", country: "Ireland", hint: "Guinness home" },
  { lat: 40.4168, lng: -3.7038, name: "Madrid", country: "Spain", hint: "Royal Palace" },
  { lat: 59.3293, lng: 18.0686, name: "Stockholm", country: "Sweden", hint: "Nobel Prize" },
  { lat: 38.7223, lng: -9.1393, name: "Lisbon", country: "Portugal", hint: "City of hills" },
  { lat: 14.5995, lng: 120.9842, name: "Manila", country: "Philippines", hint: "Pearl of Orient" },
  { lat: 47.4979, lng: 19.0402, name: "Budapest", country: "Hungary", hint: "Danube pearl" },
  { lat: 55.6761, lng: 12.5683, name: "Copenhagen", country: "Denmark", hint: "Little Mermaid" },
  { lat: 44.4268, lng: 26.1025, name: "Bucharest", country: "Romania", hint: "Little Paris" },
  { lat: 31.2304, lng: 121.4737, name: "Shanghai", country: "China", hint: "The Bund" },
  { lat: 28.6139, lng: 77.209, name: "New Delhi", country: "India", hint: "India Gate" },
  { lat: 12.9716, lng: 77.5946, name: "Bangalore", country: "India", hint: "Silicon Valley of India" },
  { lat: -6.2088, lng: 106.8456, name: "Jakarta", country: "Indonesia", hint: "Thousand islands" },
  { lat: 3.139, lng: 101.6869, name: "Kuala Lumpur", country: "Malaysia", hint: "Petronas Towers" },
  { lat: 43.2965, lng: 5.3698, name: "Marseille", country: "France", hint: "Port city" },
  { lat: 45.764, lng: 4.8357, name: "Lyon", country: "France", hint: "Culinary capital" },
  { lat: 21.0278, lng: 105.8342, name: "Hanoi", country: "Vietnam", hint: "36 streets" },
  { lat: 41.3874, lng: 2.1686, name: "Barcelona", country: "Spain", hint: "Sagrada Familia" },
  { lat: 51.9244, lng: 4.4777, name: "Rotterdam", country: "Netherlands", hint: "Modern architecture" },
  { lat: 35.6892, lng: 51.389, name: "Tehran", country: "Iran", hint: "Azadi Tower" },
  { lat: 4.711, lng: -74.0721, name: "Bogota", country: "Colombia", hint: "Emerald capital" },
  { lat: -12.0464, lng: -77.0428, name: "Lima", country: "Peru", hint: "City of Kings" },
  { lat: -4.4419, lng: 15.2663, name: "Kinshasa", country: "DR Congo", hint: "Congo River" },
  { lat: 36.2048, lng: 138.2529, name: "Nagano", country: "Japan", hint: "1998 Olympics" },
  { lat: 49.2827, lng: -123.1207, name: "Vancouver", country: "Canada", hint: "Pacific gateway" },
  { lat: 45.5017, lng: -73.5673, name: "Montreal", country: "Canada", hint: "French Canada" },
  { lat: 56.9496, lng: 24.1052, name: "Riga", country: "Latvia", hint: "Art Nouveau" },
  { lat: 50.4501, lng: 30.5234, name: "Kyiv", country: "Ukraine", hint: "Golden domes" },
  { lat: 42.6977, lng: 23.3219, name: "Sofia", country: "Bulgaria", hint: "Rose Valley" },
  { lat: 46.2044, lng: 6.1432, name: "Geneva", country: "Switzerland", hint: "UN city" },
  { lat: -13.1631, lng: -72.545, name: "Machu Picchu", country: "Peru", hint: "Lost city of Incas" },
  { lat: 27.1751, lng: 78.0421, name: "Agra", country: "India", hint: "Taj Mahal" },
  { lat: 62.0397, lng: 129.7422, name: "Yakutsk", country: "Russia", hint: "Coldest city" },
  { lat: -41.2865, lng: 174.7762, name: "Wellington", country: "New Zealand", hint: "Windy city" },
  { lat: 61.2181, lng: -149.9003, name: "Anchorage", country: "USA", hint: "Last frontier" },
];

const EUROPE_LOCATIONS = WORLD_LOCATIONS.filter((l) =>
  ["France", "UK", "Germany", "Italy", "Spain", "Portugal", "Netherlands",
   "Czech Republic", "Austria", "Sweden", "Norway", "Denmark", "Finland",
   "Ireland", "Hungary", "Romania", "Bulgaria", "Switzerland", "Latvia",
   "Ukraine", "Turkey", "Iceland"].includes(l.country)
);

const ASIA_LOCATIONS = WORLD_LOCATIONS.filter((l) =>
  ["Japan", "China", "South Korea", "India", "Thailand", "Singapore",
   "Malaysia", "Vietnam", "Philippines", "Indonesia", "Iran", "UAE",
   "Lebanon"].includes(l.country)
);

const AMERICAS_LOCATIONS = WORLD_LOCATIONS.filter((l) =>
  ["USA", "Canada", "Brazil", "Argentina", "Mexico", "Colombia", "Peru"].includes(l.country)
);

export type Region = "world" | "europe" | "asia" | "americas";

const REGION_MAP: Record<Region, GameLocation[]> = {
  world: WORLD_LOCATIONS,
  europe: EUROPE_LOCATIONS,
  asia: ASIA_LOCATIONS,
  americas: AMERICAS_LOCATIONS,
};

// Track used locations to avoid repeats within a game
const usedLocations = new Map<string, Set<number>>(); // roomId -> set of used indices

export function getRandomLocation(region: Region = "world", roomId?: string): GameLocation {
  const locations = REGION_MAP[region] || WORLD_LOCATIONS;

  if (roomId) {
    if (!usedLocations.has(roomId)) {
      usedLocations.set(roomId, new Set());
    }
    const used = usedLocations.get(roomId)!;

    // Reset if all locations have been used
    if (used.size >= locations.length) {
      used.clear();
    }

    let index: number;
    do {
      index = Math.floor(Math.random() * locations.length);
    } while (used.has(index));

    used.add(index);
    return locations[index];
  }

  return locations[Math.floor(Math.random() * locations.length)];
}

export function clearRoomLocations(roomId: string): void {
  usedLocations.delete(roomId);
}

export const REGIONS: { value: Region; label: string }[] = [
  { value: "world", label: "🌍 World" },
  { value: "europe", label: "🇪🇺 Europe" },
  { value: "asia", label: "🌏 Asia" },
  { value: "americas", label: "🌎 Americas" },
];
