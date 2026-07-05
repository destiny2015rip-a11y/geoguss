"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type L from "leaflet";

interface LeafletModule {
  map: typeof L.map;
  tileLayer: typeof L.tileLayer;
  layerGroup: typeof L.layerGroup;
  divIcon: typeof L.divIcon;
  marker: typeof L.marker;
  polyline: typeof L.polyline;
  latLngBounds: typeof L.latLngBounds;
}

interface MarkerData {
  lat: number;
  lng: number;
  color?: string;
  label?: string;
  popup?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onClick?: (lat: number, lng: number) => void;
  selectedPoint?: { lat: number; lng: number } | null;
  markers?: MarkerData[];
  showTarget?: { lat: number; lng: number; label?: string } | null;
  lines?: Array<{ from: [number, number]; to: [number, number]; color: string }>;
  interactive?: boolean;
  className?: string;
}

const PLAYER_COLORS = [
  "#6c5ce7", "#00cec9", "#ff7675", "#fdcb6e",
  "#a29bfe", "#55efc4", "#fab1a0", "#74b9ff",
  "#e17055", "#00b894",
];

export default function MapView({
  center = [20, 0],
  zoom = 2,
  onClick,
  selectedPoint,
  markers = [],
  showTarget,
  lines = [],
  interactive = true,
  className = "",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load leaflet dynamically
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    const loadLeaflet = async () => {
      if (w.L) {
        leafletRef.current = w.L as unknown as LeafletModule;
        setLeafletLoaded(true);
        return;
      }
      // Load script
      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
      leafletRef.current = w.L as unknown as LeafletModule;
      setLeafletLoaded(true);
    };
    loadLeaflet();
  }, []);

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
    [onClick]
  );

  // Init map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstance.current || !leafletRef.current) return;

    const Lf = leafletRef.current;
    const map = Lf.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    Lf.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    markerLayer.current = Lf.layerGroup().addTo(map);

    if (interactive) {
      map.on("click", handleMapClick);
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded]);

  // Update click handler
  useEffect(() => {
    if (!mapInstance.current || !interactive) return;
    const map = mapInstance.current;
    map.off("click");
    map.on("click", handleMapClick);
  }, [handleMapClick, interactive]);

  // Update selected point marker
  useEffect(() => {
    if (!mapInstance.current || !leafletLoaded || !leafletRef.current) return;
    const Lf = leafletRef.current;

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedPoint) {
      const icon = Lf.divIcon({
        html: `<div style="width:24px;height:24px;background:#6c5ce7;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: "",
      });
      selectedMarkerRef.current = Lf.marker([selectedPoint.lat, selectedPoint.lng], { icon }).addTo(
        mapInstance.current
      );
    }
  }, [selectedPoint, leafletLoaded]);

  // Update extra markers, target, lines
  useEffect(() => {
    if (!markerLayer.current || !leafletLoaded || !leafletRef.current) return;
    const Lf = leafletRef.current;
    markerLayer.current.clearLayers();

    markers.forEach((m) => {
      const color = m.color || "#6c5ce7";
      const icon = Lf.divIcon({
        html: `<div style="position:relative;">
          <div style="width:20px;height:20px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
          ${m.label ? `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:1px 6px;border-radius:4px;font-size:10px;white-space:nowrap;font-weight:bold;">${m.label}</div>` : ""}
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: "",
      });
      const mkr = Lf.marker([m.lat, m.lng], { icon });
      if (m.popup) {
        mkr.bindPopup(m.popup);
      }
      markerLayer.current!.addLayer(mkr);
    });

    if (showTarget) {
      const targetIcon = Lf.divIcon({
        html: `<div style="position:relative;">
          <div style="width:28px;height:28px;background:#ff7675;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(255,118,117,0.6);display:flex;align-items:center;justify-content:center;">
            <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
          </div>
          ${showTarget.label ? `<div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:rgba(255,118,117,0.9);color:white;padding:2px 8px;border-radius:4px;font-size:11px;white-space:nowrap;font-weight:bold;">${showTarget.label}</div>` : ""}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: "",
      });
      markerLayer.current.addLayer(Lf.marker([showTarget.lat, showTarget.lng], { icon: targetIcon }));
    }

    lines.forEach((line) => {
      const polyline = Lf.polyline([line.from, line.to], {
        color: line.color,
        weight: 2,
        dashArray: "6, 6",
        opacity: 0.7,
      });
      markerLayer.current!.addLayer(polyline);
    });

    // Auto-fit bounds
    if (mapInstance.current && (markers.length > 0 || showTarget)) {
      const allPoints: [number, number][] = markers.map((m) => [m.lat, m.lng]);
      if (showTarget) allPoints.push([showTarget.lat, showTarget.lng]);
      if (allPoints.length > 1) {
        const bounds = Lf.latLngBounds(allPoints);
        mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
      } else if (allPoints.length === 1) {
        mapInstance.current.setView(allPoints[0], 6);
      }
    }
  }, [markers, showTarget, lines, leafletLoaded]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: "200px" }}
    />
  );
}

export { PLAYER_COLORS };
