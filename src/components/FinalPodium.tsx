"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Home } from "lucide-react";
import Link from "next/link";

interface Player {
  id: string;
  nickname: string;
  score: number;
}

interface FinalPodiumProps {
  ranking: Player[];
}

export default function FinalPodium({ ranking }: FinalPodiumProps) {
  const top3 = ranking.slice(0, 3);
  const others = ranking.slice(3);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-block rounded-full bg-yellow-500/20 p-4"
          >
            <Trophy className="h-12 w-12 text-yellow-500" />
          </motion.div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white">GAME OVER</h1>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row items-end justify-center gap-4 px-4"
        >
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div variants={item} className="w-full md:w-1/3 order-2 md:order-1">
              <div className="flex flex-col items-center">
                <span className="mb-2 font-bold text-slate-300">{top3[1].nickname}</span>
                <div className="h-32 w-full rounded-t-xl bg-slate-400/20 border-x border-t border-slate-400/30 flex flex-col items-center justify-center">
                  <Medal className="h-10 w-10 text-slate-400 mb-1" />
                  <span className="text-2xl font-black text-slate-400">2ND</span>
                  <span className="text-sm font-medium text-slate-500">{top3[1].score} pts</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div variants={item} className="w-full md:w-1/3 order-1 md:order-2">
              <div className="flex flex-col items-center">
                <span className="mb-2 font-black text-yellow-500 text-xl">{top3[0].nickname}</span>
                <div className="h-48 w-full rounded-t-xl bg-yellow-500/20 border-x border-t border-yellow-500/30 flex flex-col items-center justify-center shadow-[0_-20px_50px_-12px_rgba(234,179,8,0.3)]">
                  <Trophy className="h-16 w-16 text-yellow-500 mb-2 animate-bounce" />
                  <span className="text-4xl font-black text-yellow-500">1ST</span>
                  <span className="text-lg font-bold text-yellow-600">{top3[0].score} pts</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div variants={item} className="w-full md:w-1/3 order-3">
              <div className="flex flex-col items-center">
                <span className="mb-2 font-bold text-amber-700">{top3[2].nickname}</span>
                <div className="h-24 w-full rounded-t-xl bg-amber-700/20 border-x border-t border-amber-700/30 flex flex-col items-center justify-center">
                  <Medal className="h-8 w-8 text-amber-700 mb-1" />
                  <span className="text-xl font-black text-amber-700">3RD</span>
                  <span className="text-sm font-medium text-amber-800">{top3[2].score} pts</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {others.length > 0 && (
          <div className="max-w-lg mx-auto bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5">
            {others.map((p, idx) => (
              <div key={p.id} className="flex justify-between p-3 px-6 items-center">
                <span className="text-slate-400 font-medium">{idx + 4}. {p.nickname}</span>
                <span className="text-slate-500 font-bold">{p.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white text-slate-950 px-8 py-3 font-bold transition-transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            BACK TO LOBBY
          </Link>
        </div>
      </div>
    </div>
  );
}
