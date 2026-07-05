"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_EVENTS } from "@/lib/socket-events";
import { MapPin, Globe, Play, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { socket } = useSocket();
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = () => {
    if (!nickname) return alert("Please enter a nickname");
    setLoading(true);
    socket.emit(SOCKET_EVENTS.ROOM_CREATE, { nickname });
  };

  const handleJoinRoom = () => {
    if (!nickname || !roomCode) return alert("Please enter nickname and room code");
    setLoading(true);
    socket.emit(SOCKET_EVENTS.ROOM_JOIN, { code: roomCode.toUpperCase(), nickname });
  };

  socket?.on(SOCKET_EVENTS.ROOM_CREATED, ({ code }) => {
    router.push(`/room/${code}?nickname=${nickname}`);
  });

  socket?.on(SOCKET_EVENTS.ROOM_PLAYER_JOINED, () => {
    if (roomCode) {
      router.push(`/room/${roomCode.toUpperCase()}?nickname=${nickname}`);
    }
  });

  socket?.on(SOCKET_EVENTS.ERROR, (msg) => {
    alert(msg);
    setLoading(false);
  });

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0)_0%,rgba(2,6,23,1)_100%)]"></div>
        <div className="opacity-20">
          <Globe className="absolute -bottom-24 -left-24 h-96 w-96 text-blue-500 blur-sm" />
          <MapPin className="absolute -top-12 -right-12 h-64 w-64 text-emerald-500 blur-sm" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Geo<span className="text-blue-500">Arena</span>
          </h1>
          <p className="mt-2 text-slate-400">Multiplayer Location Guessing Game</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
            >
              <Play className="h-5 w-5" />
              Create Room
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-4 flex-shrink text-xs font-medium uppercase text-slate-500">Or join</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="flex-grow rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Room Code"
              />
              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
              >
                <Users className="h-5 w-5" />
                Join
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
