"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PLAYER_COLORS } from "./MapView";
import type { Player, Room, RoundData, Guess } from "@/lib/types";
import { WIN_SCORE } from "@/lib/scoring";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface GameScreenProps {
  room: Room;
  players: Player[];
  currentRound: RoundData | null;
  hasGuessed: boolean;
  guesses: Guess[];
  roomId: string;
  playerId: string;
  onGuessSubmitted: () => void;
}

export default function GameScreen({
  room,
  players,
  currentRound,
  hasGuessed,
  guesses,
  roomId,
  playerId,
  onGuessSubmitted,
}: GameScreenProps) {
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  // Timer
  useEffect(() => {
    if (!room.timeLimit || !currentRound || hasGuessed) {
      setTimeLeft(null);
      return;
    }

    const startTime = new Date(currentRound.startedAt).getTime();
    const endTime = startTime + room.timeLimit * 1000;

    const update = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasGuessed) {
        // Auto submit random guess when time runs out
        handleSubmit(true);
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.timeLimit, currentRound, hasGuessed]);

  const handleSubmit = async (autoSubmit = false) => {
    if (hasGuessed || submitting) return;

    const guessLat = selectedPoint?.lat ?? (autoSubmit ? Math.random() * 180 - 90 : null);
    const guessLng = selectedPoint?.lng ?? (autoSubmit ? Math.random() * 360 - 180 : null);

    if (guessLat === null || guessLng === null) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          lat: guessLat,
          lng: guessLng,
        }),
      });

      if (res.ok) {
        onGuessSubmitted();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!hasGuessed) {
      setSelectedPoint({ lat, lng });
    }
  };

  const connectedPlayers = players.filter((p) => p.isConnected);
  const guessedCount = guesses.filter((g) => g.submitted || g.score !== undefined).length;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-dark-card border-b border-dark-border px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">
            <span className="text-primary">Geo</span>
            <span className="text-accent">Arena</span>
          </h1>
          <span className="text-sm text-gray-400 bg-dark-lighter px-3 py-1 rounded-full">
            Round {room.currentRound}
          </span>
        </div>

        {/* Timer */}
        {timeLeft !== null && (
          <div
            className={`text-lg font-mono font-bold px-4 py-1 rounded-full ${
              timeLeft <= 10
                ? "bg-danger/20 text-danger animate-pulse"
                : "bg-dark-lighter text-white"
            }`}
          >
            ⏱ {timeLeft}s
          </div>
        )}

        <div className="text-sm text-gray-400">
          {guessedCount}/{connectedPlayers.length} answered
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Location Clue Area */}
        <div className="md:w-1/2 h-1/2 md:h-full relative bg-dark-lighter flex items-center justify-center border-b md:border-b-0 md:border-r border-dark-border">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold mb-2 text-primary-light">Where is this place?</h2>
            <p className="text-gray-400 text-lg mb-4">
              Study the clues and mark your guess on the map →
            </p>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 inline-block">
              <p className="text-sm text-gray-500 mb-1">Hint for Round {room.currentRound}</p>
              <p className="text-lg text-warning font-medium">
                🔍 Explore the map and make your best guess!
              </p>
            </div>

            {hasGuessed && (
              <div className="mt-6 bg-success/10 border border-success/30 rounded-xl p-4">
                <p className="text-success font-bold text-lg">✅ Answer Submitted!</p>
                <p className="text-gray-400 text-sm mt-1">
                  Waiting for other players... ({guessedCount}/{connectedPlayers.length})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="md:w-1/2 h-1/2 md:h-full relative">
          <MapView
            onClick={handleMapClick}
            selectedPoint={selectedPoint}
            interactive={!hasGuessed}
          />

          {/* Submit button overlay */}
          {!hasGuessed && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <button
                onClick={() => handleSubmit(false)}
                disabled={!selectedPoint || submitting}
                className={`w-full py-3 font-bold rounded-xl text-lg transition-all duration-200 shadow-lg ${
                  selectedPoint
                    ? "bg-primary hover:bg-primary-dark text-white hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : selectedPoint
                  ? "📍 Confirm Guess"
                  : "Click on the map to guess"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom scoreboard */}
      <div className="bg-dark-card border-t border-dark-border px-4 py-2 shrink-0">
        <div className="flex gap-3 overflow-x-auto">
          {connectedPlayers
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shrink-0 ${
                  p.id === playerId ? "bg-primary/15 border border-primary/30" : "bg-dark-lighter"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
                />
                <span className="text-sm font-medium truncate max-w-[80px]">{p.name}</span>
                <span className="text-xs text-primary-light font-bold">{p.totalScore}</span>
                {/* Progress bar */}
                <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (p.totalScore / WIN_SCORE) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
