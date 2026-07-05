"use client";

import { useEffect, useState, useCallback, use } from "react";
import Lobby from "@/components/Lobby";
import GameScreen from "@/components/GameScreen";
import RoundResults from "@/components/RoundResults";
import FinalResults from "@/components/FinalResults";

interface Player {
  id: string;
  name: string;
  totalScore: number;
  isReady: boolean;
  isConnected: boolean;
}

interface Room {
  id: string;
  code: string;
  hostId: string;
  status: string;
  isPrivate: boolean;
  maxPlayers: number;
  timeLimit: number | null;
  region: string;
  currentRound: number;
  winnerId: string | null;
}

interface Guess {
  playerId: string;
  lat?: number;
  lng?: number;
  distance?: number;
  score?: number;
  submitted?: boolean;
}

interface RoundData {
  id: string;
  roundNumber: number;
  status: string;
  startedAt: string;
  targetLat?: number;
  targetLng?: number;
  locationName?: string;
  locationCountry?: string;
  locationHint?: string;
}

interface GameState {
  room: Room;
  players: Player[];
  currentRound: RoundData | null;
  guesses: Guess[];
  hasGuessed: boolean;
  allGuessed: boolean;
}

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [prevRound, setPrevRound] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem("playerId");
    if (id) setPlayerId(id);
  }, []);

  const fetchState = useCallback(async () => {
    if (!playerId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}?playerId=${playerId}`);
      if (!res.ok) {
        setError("Room not found or you were disconnected");
        return;
      }
      const data: GameState = await res.json();
      setGameState(data);

      // Show results when all guessed in active round
      if (data.allGuessed && data.currentRound?.status === "active") {
        setShowResults(true);
      }
      if (data.currentRound && data.currentRound.status === "completed") {
        setShowResults(true);
      }

      // Detect new round started
      if (data.room.currentRound > prevRound && prevRound > 0) {
        if (!data.allGuessed) {
          setShowResults(false);
        }
      }
      setPrevRound(data.room.currentRound);
    } catch {
      // Silently retry
    }
  }, [roomId, playerId, prevRound]);

  useEffect(() => {
    if (!playerId) return;
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, [fetchState, playerId]);

  // Handle leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerId && roomId) {
        navigator.sendBeacon(
          `/api/rooms/${roomId}/leave`,
          JSON.stringify({ playerId })
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [playerId, roomId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center max-w-md">
          <p className="text-danger text-xl mb-4">❌ {error}</p>
          <a href="/" className="text-primary hover:text-primary-light transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const isHost = playerId === gameState.room.hostId;

  // Finished state
  if (gameState.room.status === "finished") {
    return (
      <FinalResults
        players={gameState.players}
        winnerId={gameState.room.winnerId}
        isHost={isHost}
        roomId={roomId}
        playerId={playerId}
        onPlayAgain={() => {
          setShowResults(false);
          setPrevRound(0);
        }}
      />
    );
  }

  // Waiting / Lobby
  if (gameState.room.status === "waiting") {
    return (
      <Lobby
        room={gameState.room}
        players={gameState.players}
        isHost={isHost}
        playerId={playerId}
        onRefresh={fetchState}
      />
    );
  }

  // Playing - show results or game
  if (showResults && gameState.allGuessed && gameState.currentRound) {
    return (
      <RoundResults
        round={gameState.currentRound}
        guesses={gameState.guesses}
        players={gameState.players}
        isHost={isHost}
        roomId={roomId}
        playerId={playerId}
        onNextRound={() => {
          setShowResults(false);
          fetchState();
        }}
      />
    );
  }

  return (
    <GameScreen
      room={gameState.room}
      players={gameState.players}
      currentRound={gameState.currentRound}
      hasGuessed={gameState.hasGuessed}
      guesses={gameState.guesses}
      roomId={roomId}
      playerId={playerId}
      onGuessSubmitted={fetchState}
    />
  );
}
