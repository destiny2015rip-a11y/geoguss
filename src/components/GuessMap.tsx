"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void;
  disabled?: boolean;
}

function MapClickHandler({ onClick, disabled }: { onClick: (e: any) => void; disabled?: boolean }) {
  useMapEvents({
    click: (e) => {
      if (!disabled) onClick(e);
    },
  });
  return null;
}

export default function GuessMap({ onGuess, disabled }: GuessMapProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const handleClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setMarker({ lat, lng });
  };

  const handleSubmit = () => {
    if (marker) {
      onGuess(marker.lat, marker.lng);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2 p-2">
      <div className="relative flex-grow overflow-hidden rounded-lg border border-white/10 shadow-inner">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          className="h-full w-full bg-slate-800"
          style={{ cursor: disabled ? 'default' : 'crosshair' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {marker && <Marker position={[marker.lat, marker.lng]} />}
          <MapClickHandler onClick={handleClick} disabled={disabled} />
        </MapContainer>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!marker || disabled}
        className="w-full rounded-lg bg-blue-600 py-2 font-bold text-white transition-all hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400"
      >
        CONFIRM GUESS
      </button>
    </div>
  );
}
