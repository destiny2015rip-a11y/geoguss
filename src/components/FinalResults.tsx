"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";
import { WIN_SCORE } from "@/lib/scoring";

interface FinalResultsProps {
  players: Player[];
  winnerId: string | null;
  isHost: boolean;
  roomId: string;
  playerId: string;
  onPlayAgain: () => void;
}

export default function FinalResults({
  players,
  winnerId,
  isHost,
  roomId,
  playerId,
  onPlayAgain,
}: FinalResultsProps) {
  const [loading, setLoading] = useState(false);

  const sorted = [...players]
    .filter((p) => p.isConnected)
    .sort((a, b) => b.totalScore - a.totalScore);

  const handlePlayAgain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/play-again`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (res.ok) {
        onPlayAgain();
      }
    } finally {
      setLoading(false);
    }
  };

  const podiumColors = ["text-gold", "text-silver", "text-bronze"];
  const podiumBg = [
    "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
    "from-gray-400/20 to-gray-500/5 border-gray-400/30",
    "from-orange-600/20 to-orange-700/5 border-orange-600/30",
  ];
  const podiumEmoji = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Victory Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-4xl font-black mb-2">
            <span className="text-gold">Game Over!</span>
          </h1>
          {sorted[0] && (
            <p className="text-xl text-gray-300">
              <span className="font-bold text-white">{sorted[0].name}</span> wins with{" "}
              <span className="text-accent font-bold">{sorted[0].totalScore.toLocaleString()}</span> points!
            </p>
          )}
        </div>

        {/* Podium - Top 3 */}
        <div className="grid grid-cols-3 gap-2 mb-6 items-end">
          {/* 2nd place */}
          {sorted[1] ? (
            <div className={`bg-gradient-to-b ${podiumBg[1]} border rounded-2xl p-4 text-center h-36 flex flex-col justify-end`}>
              <div className="text-3xl mb-1">{podiumEmoji[1]}</div>
              <p className="font-bold text-sm truncate">{sorted[1].name}</p>
              <p className={`text-lg font-black ${podiumColors[1]}`}>
                {sorted[1].totalScore.toLocaleString()}
              </p>
            </div>
          ) : (
            <div />
          )}

          {/* 1st place */}
          {sorted[0] ? (
            <div
              className={`bg-gradient-to-b ${podiumBg[0]} border rounded-2xl p-4 text-center h-44 flex flex-col justify-end animate-[pulse-glow_2s_ease-in-out_infinite]`}
            >
              <div className="text-5xl mb-2">{podiumEmoji[0]}</div>
              <p className="font-bold truncate">{sorted[0].name}</p>
              <p className={`text-2xl font-black ${podiumColors[0]}`}>
                {sorted[0].totalScore.toLocaleString()}
              </p>
            </div>
          ) : (
            <div />
          )}

          {/* 3rd place */}
          {sorted[2] ? (
            <div className={`bg-gradient-to-b ${podiumBg[2]} border rounded-2xl p-4 text-center h-28 flex flex-col justify-end`}>
              <div className="text-2xl mb-1">{podiumEmoji[2]}</div>
              <p className="font-bold text-sm truncate">{sorted[2].name}</p>
              <p className={`text-lg font-black ${podiumColors[2]}`}>
                {sorted[2].totalScore.toLocaleString()}
              </p>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Full leaderboard */}
        {sorted.length > 3 && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6">
            <h3 className="text-sm text-gray-400 mb-3 font-medium">Full Rankings</h3>
            <div className="space-y-2">
              {sorted.slice(3).map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    p.id === playerId ? "bg-primary/10" : "bg-dark-lighter"
                  }`}
                >
                  <span className="text-sm text-gray-500 w-5">{idx + 4}</span>
                  <span className="flex-1 font-medium text-sm truncate">{p.name}</span>
                  <span className="text-sm font-bold text-gray-300">
                    {p.totalScore.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score breakdown */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-3 font-medium">Final Scores</h3>
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs w-6 text-center">
                  {i < 3 ? podiumEmoji[i] : `${i + 1}`}
                </span>
                <span className="text-sm flex-1 truncate">{p.name}</span>
                <div className="flex-1 h-2 bg-dark-lighter rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, (p.totalScore / Math.max(sorted[0]?.totalScore || WIN_SCORE, WIN_SCORE)) * 100)}%`,
                      background:
                        i === 0
                          ? "linear-gradient(90deg, #ffd700, #ffaa00)"
                          : i === 1
                          ? "linear-gradient(90deg, #c0c0c0, #888)"
                          : i === 2
                          ? "linear-gradient(90deg, #cd7f32, #a0522d)"
                          : "linear-gradient(90deg, #6c5ce7, #a29bfe)",
                    }}
                  />
                </div>
                <span className="text-sm font-bold w-16 text-right">
                  {p.totalScore.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <button
              onClick={handlePlayAgain}
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white text-lg font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
            >
              {loading ? "Restarting..." : "🔄 Play Again"}
            </button>
          ) : (
            <div className="text-center py-3 text-gray-400">
              Waiting for host to restart...
            </div>
          )}

          <a
            href="/"
            className="block w-full py-2 text-center text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
