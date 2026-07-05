"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PLAYER_COLORS } from "./MapView";
import type { Player, RoundData, Guess } from "@/lib/types";
import { WIN_SCORE } from "@/lib/scoring";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

interface RoundResultsProps {
  round: RoundData;
  guesses: Guess[];
  players: Player[];
  isHost: boolean;
  roomId: string;
  playerId: string;
  onNextRound: () => void;
}

export default function RoundResults({
  round,
  guesses,
  players,
  isHost,
  roomId,
  playerId,
  onNextRound,
}: RoundResultsProps) {
  const [loading, setLoading] = useState(false);

  const connectedPlayers = players.filter((p) => p.isConnected);

  // Build results sorted by score (this round)
  const results = guesses
    .filter((g) => g.score !== undefined)
    .map((g) => {
      const player = players.find((p) => p.id === g.playerId);
      return {
        ...g,
        playerName: player?.name || "Unknown",
        totalScore: player?.totalScore || 0,
      };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const handleNextRound = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/next-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (data.finished) {
        // Will be handled by parent polling
      }
      onNextRound();
    } finally {
      setLoading(false);
    }
  };

  // Prepare map data
  const playerColorMap = new Map<string, string>();
  connectedPlayers.forEach((p, i) => {
    playerColorMap.set(p.id, PLAYER_COLORS[i % PLAYER_COLORS.length]);
  });

  const mapMarkers = results
    .filter((r) => r.lat !== undefined && r.lng !== undefined)
    .map((r) => ({
      lat: r.lat!,
      lng: r.lng!,
      color: playerColorMap.get(r.playerId) || "#6c5ce7",
      label: r.playerName,
    }));

  const mapLines = results
    .filter((r) => r.lat !== undefined && r.lng !== undefined && round.targetLat !== undefined)
    .map((r) => ({
      from: [r.lat!, r.lng!] as [number, number],
      to: [round.targetLat!, round.targetLng!] as [number, number],
      color: playerColorMap.get(r.playerId) || "#6c5ce7",
    }));

  const targetMarker =
    round.targetLat !== undefined
      ? {
          lat: round.targetLat,
          lng: round.targetLng!,
          label: `📍 ${round.locationName}, ${round.locationCountry}`,
        }
      : null;

  // Check if someone reached WIN_SCORE
  const potentialWinner = connectedPlayers.find((p) => p.totalScore >= WIN_SCORE);

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">
            <span className="text-primary">Geo</span>
            <span className="text-accent">Arena</span>
          </h1>
        </div>
        <span className="text-gray-400">Round {round.roundNumber} Results</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map showing all guesses */}
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <MapView
            markers={mapMarkers}
            showTarget={targetMarker}
            lines={mapLines}
            interactive={false}
          />
        </div>

        {/* Results panel */}
        <div className="md:w-1/2 overflow-y-auto p-4 md:p-6">
          {/* Location reveal */}
          {round.locationName && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-4 text-center">
              <p className="text-sm text-gray-400 mb-1">The answer was</p>
              <h2 className="text-2xl font-bold text-white">
                📍 {round.locationName}, {round.locationCountry}
              </h2>
              {round.locationHint && (
                <p className="text-gray-400 text-sm mt-1">Hint: {round.locationHint}</p>
              )}
            </div>
          )}

          {/* Player results */}
          <div className="space-y-2 mb-4">
            {results.map((r, idx) => (
              <div
                key={r.playerId}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  r.playerId === playerId
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-dark-card border border-dark-border"
                }`}
              >
                <div className="text-lg font-bold text-gray-400 w-6 text-center">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                </div>
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: playerColorMap.get(r.playerId) || "#6c5ce7" }}
                >
                  {r.playerName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.playerName}</p>
                  <p className="text-xs text-gray-400">
                    {r.distance !== undefined ? formatDist(r.distance) : "No guess"} away
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-accent">+{r.score}</p>
                  <p className="text-xs text-gray-400">Total: {r.totalScore}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Scoreboard progress */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-4">
            <h3 className="text-sm text-gray-400 mb-3">Race to {WIN_SCORE.toLocaleString()}</h3>
            <div className="space-y-2">
              {connectedPlayers
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-xs w-20 truncate" style={{ color: PLAYER_COLORS[i % PLAYER_COLORS.length] }}>
                      {p.name}
                    </span>
                    <div className="flex-1 h-3 bg-dark-lighter rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (p.totalScore / WIN_SCORE) * 100)}%`,
                          background: `linear-gradient(90deg, ${PLAYER_COLORS[i % PLAYER_COLORS.length]}, ${PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length]})`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold w-14 text-right">{p.totalScore}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Potential winner alert */}
          {potentialWinner && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4 text-center">
              <p className="text-warning font-bold text-lg">
                🏆 {potentialWinner.name} has reached {WIN_SCORE.toLocaleString()} points!
              </p>
            </div>
          )}

          {/* Next round button */}
          {isHost ? (
            <button
              onClick={handleNextRound}
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Loading..." : potentialWinner ? "🏆 See Final Results" : "▶ Next Round"}
            </button>
          ) : (
            <div className="text-center text-gray-400 text-sm py-3">
              Waiting for host to continue...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
