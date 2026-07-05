"use client";

import { useState } from "react";
import type { Player, Room } from "@/lib/types";

interface LobbyProps {
  room: Room;
  players: Player[];
  isHost: boolean;
  playerId: string;
  onRefresh: () => void;
}

export default function Lobby({ room, players, isHost, playerId, onRefresh }: LobbyProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const connectedPlayers = players.filter((p) => p.isConnected);

  const handleReady = async () => {
    const me = players.find((p) => p.id === playerId);
    await fetch(`/api/rooms/${room.id}/ready`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, isReady: !me?.isReady }),
    });
    onRefresh();
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Cannot start game");
      }
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regionLabel: Record<string, string> = {
    world: "🌍 World",
    europe: "🇪🇺 Europe",
    asia: "🌏 Asia",
    americas: "🌎 Americas",
  };

  const me = players.find((p) => p.id === playerId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black">
            <span className="text-primary">Geo</span>
            <span className="text-accent">Arena</span>
          </h1>
          <p className="text-gray-400 mt-1">Lobby</p>
        </div>

        {/* Room Code Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Room Code</p>
            <button
              onClick={copyCode}
              className="text-4xl font-mono font-bold tracking-[0.3em] text-primary hover:text-primary-light transition-colors cursor-pointer"
            >
              {room.code}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              {copied ? "✅ Copied!" : "Click to copy"}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
            <span>{regionLabel[room.region] || room.region}</span>
            <span>•</span>
            <span>{room.maxPlayers} max players</span>
            {room.timeLimit && (
              <>
                <span>•</span>
                <span>{room.timeLimit}s timer</span>
              </>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-4">
          <h3 className="text-sm text-gray-400 mb-3 font-medium">
            Players ({connectedPlayers.length}/{room.maxPlayers})
          </h3>
          <div className="space-y-2">
            {connectedPlayers.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  p.id === playerId
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-dark-lighter"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-sm font-bold">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{p.name}</span>
                  {p.id === room.hostId && (
                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                      Host
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    p.isReady
                      ? "bg-success/20 text-success"
                      : "bg-gray-600/20 text-gray-400"
                  }`}
                >
                  {p.isReady ? "Ready" : "Not Ready"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isHost && (
            <button
              onClick={handleReady}
              className={`w-full py-3 font-bold rounded-xl transition-all duration-200 ${
                me?.isReady
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-success hover:bg-accent-dark text-white"
              }`}
            >
              {me?.isReady ? "Cancel Ready" : "Ready Up"}
            </button>
          )}

          {isHost && (
            <button
              onClick={handleStart}
              disabled={loading || connectedPlayers.length < 2}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Starting..."
                : connectedPlayers.length < 2
                ? "Need 2+ Players"
                : "🚀 Start Game"}
            </button>
          )}

          <a
            href="/"
            className="block w-full py-2 text-center text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Leave Room
          </a>
        </div>
      </div>
    </div>
  );
}
