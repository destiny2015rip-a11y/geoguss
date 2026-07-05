"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_EVENTS } from "@/lib/socket-events";
import PanoramaViewer from "@/components/PanoramaViewer";
import GuessMap from "@/components/GuessMap";
import ScoreBoard from "@/components/ScoreBoard";
import RoundResults from "@/components/RoundResults";
import FinalPodium from "@/components/FinalPodium";
import { Settings, Play, CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { socket, connected } = useSocket();
  const nickname = searchParams.get("nickname");

  const [players, setPlayers] = useState<any[]>([]);
  const [status, setStatus] = useState<"lobby" | "playing" | "round_end" | "finished">("lobby");
  const [currentRound, setCurrentRound] = useState(0);
  const [roundData, setRoundData] = useState<any>(null);
  const [roundResults, setRoundResults] = useState<any>(null);
  const [matchRanking, setMatchRanking] = useState<any>(null);
  const [settings, setSettings] = useState({ timer: 60, targetPoints: 10000, allowMove: true });
  const [hasGuessed, setHasGuessed] = useState(false);

  const isHost = players.find((p) => p.id === socket?.id)?.id === players[0]?.id; // Simplified host check

  useEffect(() => {
    if (!connected || !socket) return;

    if (!nickname) {
      router.push("/");
      return;
    }

    socket.emit(SOCKET_EVENTS.ROOM_JOIN, { code: roomId, nickname });

    socket.on(SOCKET_EVENTS.ROOM_PLAYER_JOINED, (allPlayers) => {
      setPlayers(allPlayers);
    });

    socket.on(SOCKET_EVENTS.ROOM_SETTINGS, (newSettings) => {
      setSettings(newSettings);
    });

    socket.on(SOCKET_EVENTS.GAME_ROUND_START, (data) => {
      setRoundData(data);
      setCurrentRound(data.roundNumber);
      setStatus("playing");
      setHasGuessed(false);
      setRoundResults(null);
    });

    socket.on(SOCKET_EVENTS.GAME_ROUND_END, (data) => {
      setRoundResults(data);
      setStatus("round_end");
    });

    socket.on(SOCKET_EVENTS.GAME_MATCH_END, (data) => {
      setMatchRanking(data.ranking);
      setStatus("finished");
    });

    socket.on(SOCKET_EVENTS.ERROR, (msg) => {
      alert(msg);
      router.push("/");
    });

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_PLAYER_JOINED);
      socket.off(SOCKET_EVENTS.ROOM_SETTINGS);
      socket.off(SOCKET_EVENTS.GAME_ROUND_START);
      socket.off(SOCKET_EVENTS.GAME_ROUND_END);
      socket.off(SOCKET_EVENTS.GAME_MATCH_END);
      socket.off(SOCKET_EVENTS.ERROR);
    };
  }, [connected, socket, roomId, nickname, router]);

  const handleStartGame = () => {
    socket?.emit(SOCKET_EVENTS.ROOM_START);
  };

  const handleReady = (ready: boolean) => {
    socket?.emit(SOCKET_EVENTS.ROOM_READY, { ready });
  };

  const handleGuess = (lat: number, lng: number) => {
    setHasGuessed(true);
    socket?.emit(SOCKET_EVENTS.GAME_SUBMIT_GUESS, { lat, lng });
  };

  const handleNextRound = () => {
    socket?.emit(SOCKET_EVENTS.ROOM_START); // Host triggers next round the same way
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  };

  if (!connected) return <div className="flex h-screen items-center justify-center">Connecting...</div>;

  if (status === "lobby") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-4xl grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Room: <span className="text-blue-500 font-mono">{roomId}</span>
                <button onClick={copyLink} className="p-2 hover:bg-white/5 rounded-lg"><Copy className="h-4 w-4" /></button>
              </h1>
              <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm font-bold">LOBBY</span>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Game Settings</span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Points Goal</label>
                  <p className="text-2xl font-bold">{settings.targetPoints}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Round Timer</label>
                  <p className="text-2xl font-bold">{settings.timer}s</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Movement</label>
                  <p className="text-2xl font-bold">{settings.allowMove ? "Allowed" : "Static"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  className="flex-grow flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-500"
                >
                  <Play className="h-5 w-5" /> START MATCH
                </button>
              ) : (
                <div className="flex-grow text-center p-4 bg-white/5 rounded-xl border border-white/10 text-slate-400 italic">
                  Waiting for host to start...
                </div>
              )}
              <button 
                onClick={() => handleReady(true)}
                className="px-8 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500"
              >
                READY
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <div className="bg-white/5 rounded-2xl border border-white/10 h-[500px] flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className="font-bold">Players</span>
                  <span className="text-slate-500 text-sm">{players.length} joined</span>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                      <span className="font-medium">{p.nickname} {p.id === socket?.id && "(You)"}</span>
                      {p.isReady && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950 overflow-hidden">
      <div className="flex-grow relative">
        {roundData && (
          <PanoramaViewer 
            lat={roundData.lat} 
            lng={roundData.lng} 
            allowMove={settings.allowMove} 
          />
        )}
        
        {hasGuessed && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <div className="text-center">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold">Waiting for others...</h2>
              <p className="text-slate-400">Your guess is locked in.</p>
            </div>
          </div>
        )}
      </div>

      <div className="h-1/3 min-h-[300px] flex border-t border-white/10">
        <div className="w-1/3 max-w-sm">
          <ScoreBoard 
            players={players} 
            currentRound={currentRound} 
            targetPoints={settings.targetPoints} 
          />
        </div>
        <div className="flex-grow bg-slate-900">
          <GuessMap onGuess={handleGuess} disabled={hasGuessed} />
        </div>
      </div>

      <AnimatePresence>
        {status === "round_end" && roundResults && (
          <RoundResults 
            results={roundResults.results} 
            realLocation={roundResults.realLocation}
            isHost={isHost}
            onNextRound={handleNextRound}
          />
        )}
      </AnimatePresence>

      {status === "finished" && matchRanking && (
        <FinalPodium ranking={matchRanking} />
      )}
    </div>
  );
}
