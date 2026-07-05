"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";

interface RoundResult {
  id: string;
  nickname: string;
  guess: { lat: number; lng: number } | null;
  distance: number;
  points: number;
  totalScore: number;
}

interface RoundResultsProps {
  results: RoundResult[];
  realLocation: { lat: number; lng: number };
  onNextRound?: () => void;
  isHost?: boolean;
}

const GreenIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RedIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RoundResults({ results, realLocation, onNextRound, isHost }: RoundResultsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
    >
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl md:h-[80vh]">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-2xl font-bold">Round Results</h2>
          {isHost && (
            <button
              onClick={onNextRound}
              className="rounded-lg bg-emerald-600 px-6 py-2 font-bold text-white hover:bg-emerald-500"
            >
              NEXT ROUND
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col md:flex-row">
          <div className="h-64 flex-1 border-r border-white/10 md:h-auto">
            <MapContainer
              center={[realLocation.lat, realLocation.lng]}
              zoom={3}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[realLocation.lat, realLocation.lng]} icon={GreenIcon}>
                <Popup>Actual Location</Popup>
              </Marker>
              {results.map((res) => res.guess && (
                <div key={res.id}>
                  <Marker position={[res.guess.lat, res.guess.lng]} icon={RedIcon}>
                    <Popup>{res.nickname}'s Guess</Popup>
                  </Marker>
                  <Polyline 
                    positions={[[res.guess.lat, res.guess.lng], [realLocation.lat, realLocation.lng]]} 
                    color="#475569"
                    dashArray="5, 10"
                  />
                </div>
              ))}
            </MapContainer>
          </div>

          <div className="w-full space-y-4 overflow-y-auto p-4 md:w-80">
            <h3 className="font-semibold text-slate-400 uppercase text-xs tracking-wider">Rankings</h3>
            {results.sort((a, b) => b.points - a.points).map((res) => (
              <div key={res.id} className="rounded-lg bg-white/5 p-4 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{res.nickname}</span>
                  <span className="text-emerald-400 font-bold">+{res.points}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{res.distance.toFixed(1)} km</span>
                  <span>Total: {res.totalScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
