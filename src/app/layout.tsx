import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoArena — Multiplayer Geo Guessing Game",
  description: "Challenge your friends in this multiplayer geography guessing game! Create rooms, guess locations, and race to 10,000 points.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="bg-dark text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
