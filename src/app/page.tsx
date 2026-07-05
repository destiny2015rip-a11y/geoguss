"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [timeLimit, setTimeLimit] = useState(0);
  const [region, setRegion] = useState("world");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!playerName.trim()) {
      setError("Enter your name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName.trim(),
          isPrivate,
          maxPlayers,
          timeLimit: timeLimit || null,
          region,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerName", playerName.trim());
      router.push(`/room/${data.roomId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError("Enter your name");
      return;
    }
    if (!roomCode.trim()) {
      setError("Enter room code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode.trim().toUpperCase(),
          playerName: playerName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerName", playerName.trim());
      router.push(`/room/${data.roomId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black tracking-tight mb-2">
            <span className="text-primary">Geo</span>
            <span className="text-accent">Arena</span>
          </h1>
          <p className="text-gray-400 text-lg">Multiplayer Geo Guessing Game</p>
          <p className="text-gray-500 mt-1">Race to 10,000 points • Challenge your friends</p>
        </div>

        {mode === "home" && (
          <div className="space-y-4 animate-[slide-up_0.3s_ease-out]">
            <button
              onClick={() => setMode("create")}
              className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white text-lg font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
            >
              🎮 Create Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 px-6 bg-dark-card hover:bg-dark-lighter text-white text-lg font-bold rounded-2xl border border-dark-border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              🔗 Join Room
            </button>

            {/* How to play */}
            <div className="mt-8 bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3 text-primary-light">How to Play</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>🌍 You&apos;ll see a location on the map</p>
                <p>📍 Place your marker where you think it is</p>
                <p>⚡ Closer guess = more points</p>
                <p>🏆 First to 10,000 points wins!</p>
              </div>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 animate-[slide-up_0.3s_ease-out]">
            <h2 className="text-2xl font-bold text-center">Create Room</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="world">🌍 World</option>
                <option value="europe">🇪🇺 Europe</option>
                <option value="asia">🌏 Asia</option>
                <option value="americas">🌎 Americas</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Players</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} players
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Time Limit</label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value={0}>No limit</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPrivate ? "bg-primary" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isPrivate ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-400">Private Room</span>
            </div>

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>

            <button
              onClick={() => { setMode("home"); setError(""); }}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 animate-[slide-up_0.3s_ease-out]">
            <h2 className="text-2xl font-bold text-center">Join Room</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code..."
                maxLength={6}
                className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors tracking-widest text-center text-xl font-mono"
              />
            </div>

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>

            <button
              onClick={() => { setMode("home"); setError(""); }}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
