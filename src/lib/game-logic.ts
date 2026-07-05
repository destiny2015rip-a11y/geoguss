export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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

export function calculateScore(distance: number): number {
  if (distance <= 1) return 4000;
  if (distance <= 20) return interpolate(distance, 1, 20, 4000, 3800);
  if (distance <= 50) return interpolate(distance, 20, 50, 3800, 3500);
  if (distance <= 100) return interpolate(distance, 50, 100, 3500, 3200);
  if (distance <= 200) return interpolate(distance, 100, 200, 3200, 3000);
  if (distance <= 400) return interpolate(distance, 200, 400, 3000, 2000);
  if (distance <= 600) return interpolate(distance, 400, 600, 2000, 1000);
  if (distance <= 1000) return interpolate(distance, 600, 1000, 1000, 500);
  if (distance <= 2000) return interpolate(distance, 1000, 2000, 500, 200);
  if (distance <= 5000) return interpolate(distance, 2000, 5000, 200, 50);
  return 0;
}

function interpolate(val: number, x1: number, x2: number, y1: number, y2: number): number {
  const t = (val - x1) / (x2 - x1);
  return Math.round(y1 + t * (y2 - y1));
}
