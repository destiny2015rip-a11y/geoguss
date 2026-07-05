import "dotenv/config";
import { db } from "./src/db/index.js";
import { locations } from "./src/db/schema.js";

const DEFAULT_LOCATIONS = [
  { lat: 48.8584, lng: 2.2945, name: "Eiffel Tower, Paris", region: "Europe" },
  { lat: 40.7484, lng: -73.9857, name: "Empire State Building, NY", region: "America" },
  { lat: 51.5007, lng: -0.1246, name: "Big Ben, London", region: "Europe" },
  { lat: 35.6895, lng: 139.6917, name: "Tokyo, Japan", region: "Asia" },
  { lat: -33.8568, lng: 151.2153, name: "Sydney Opera House", region: "Oceania" },
  { lat: 55.7539, lng: 37.6208, name: "Red Square, Moscow", region: "Europe" },
  { lat: 27.1751, lng: 78.0421, name: "Taj Mahal, India", region: "Asia" },
  { lat: -22.9519, lng: -43.2105, name: "Christ the Redeemer, Rio", region: "America" },
  { lat: 41.8902, lng: 12.4922, name: "Colosseum, Rome", region: "Europe" },
  { lat: 37.8199, lng: -122.4783, name: "Golden Gate Bridge, SF", region: "America" },
  { lat: 25.1972, lng: 55.2744, name: "Burj Khalifa, Dubai", region: "Asia" },
  { lat: -34.6037, lng: -58.3816, name: "Obelisco, Buenos Aires", region: "America" },
  { lat: 52.5244, lng: 13.4105, name: "Alexanderplatz, Berlin", region: "Europe" },
  { lat: 1.2834, lng: 103.8607, name: "Marina Bay Sands, Singapore", region: "Asia" },
  { lat: 31.2304, lng: 121.4737, name: "Shanghai, China", region: "Asia" },
  { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA", region: "America" },
  { lat: 43.6426, lng: -79.3871, name: "CN Tower, Toronto", region: "America" },
  { lat: 30.0444, lng: 31.2357, name: "Cairo, Egypt", region: "Africa" },
  { lat: -26.2041, lng: 28.0473, name: "Johannesburg, SA", region: "Africa" },
  { lat: 45.4215, lng: -75.6972, name: "Ottawa, Canada", region: "America" },
];

async function seed() {
  console.log("Seeding locations...");
  for (const loc of DEFAULT_LOCATIONS) {
    await db.insert(locations).values(loc);
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
