// Distance-based scoring system with linear interpolation
// Each entry: [maxDistanceKm, score]
const SCORING_TABLE: [number, number][] = [
  [1, 4000],
  [20, 3800],
  [50, 3500],
  [100, 3200],
  [200, 3000],
  [400, 2000],
  [600, 1000],
  [1000, 500],
  [2000, 200],
  [5000, 50],
  [10000, 10],
  [20000, 0],
];

export function calculateScore(distanceKm: number): number {
  if (distanceKm <= 0) return 4000;
  if (distanceKm >= SCORING_TABLE[SCORING_TABLE.length - 1][0]) return 0;

  for (let i = 0; i < SCORING_TABLE.length; i++) {
    if (distanceKm <= SCORING_TABLE[i][0]) {
      if (i === 0) {
        // Linear interpolation from 4000 (0 km) to first entry
        const ratio = distanceKm / SCORING_TABLE[0][0];
        return Math.round(4000 - ratio * (4000 - SCORING_TABLE[0][1]));
      }
      const [prevDist, prevScore] = SCORING_TABLE[i - 1];
      const [currDist, currScore] = SCORING_TABLE[i];
      const ratio = (distanceKm - prevDist) / (currDist - prevDist);
      return Math.round(prevScore - ratio * (prevScore - currScore));
    }
  }

  return 0;
}

// Haversine formula to calculate distance between two points
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export const WIN_SCORE = 10000;
