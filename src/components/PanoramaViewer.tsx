"use client";

import { useEffect, useRef } from "react";

interface PanoramaViewerProps {
  lat: number;
  lng: number;
  allowMove?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function PanoramaViewer({ lat, lng, allowMove = true }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<any>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initPanorama();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}`;
      script.async = true;
      script.defer = true;
      script.onload = initPanorama;
      document.head.appendChild(script);
    };

    const initPanorama = () => {
      if (!containerRef.current) return;

      const panoOptions = {
        position: { lat, lng },
        addressControl: false,
        showRoadLabels: false,
        panControl: false,
        zoomControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        linksControl: allowMove,
        clickToGo: allowMove,
        visible: true,
      };

      panoRef.current = new window.google.maps.StreetViewPanorama(containerRef.current, panoOptions);

      // Mutation observer to hide UI elements that might appear later
      const observer = new MutationObserver(() => {
        const elementsToHide = [
          ".gm-style-cc", // Copyright info
          ".gmnoprint",    // Buttons and info
          "a[href*='maps.google.com']", // Google logo link
          ".gm-iv-address", // Address info
        ];
        
        elementsToHide.forEach(selector => {
          const els = containerRef.current?.querySelectorAll(selector);
          els?.forEach((el: any) => {
            el.style.display = "none";
          });
        });
      });

      observer.observe(containerRef.current, { childList: true, subtree: true });
    };

    loadGoogleMaps();
  }, [lat, lng, allowMove]);

  return (
    <div className="relative h-full w-full bg-slate-900">
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-white/5"></div>
      
      {/* Overlay to block context menu and common UI leaks */}
      <div 
        className="absolute inset-0 z-20" 
        onContextMenu={(e) => e.preventDefault()}
        style={{ pointerEvents: 'none' }}
      ></div>
      
      {/* Custom CSS to hide even more stuff */}
      <style jsx global>{`
        .gm-style-cc, .gmnoprint, .gm-iv-address, .gm-svpc {
          display: none !important;
        }
        .gm-style > div:nth-child(2) {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
