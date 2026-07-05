import { Users } from "lucide-react";

interface Player {
  id: string;
  nickname: string;
  score: number;
  isReady: boolean;
}

interface ScoreBoardProps {
  players: Player[];
  currentRound: number;
  targetPoints: number;
}

export default function ScoreBoard({ players, currentRound, targetPoints }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex h-full w-full flex-col p-4 bg-slate-900 border-l border-white/10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Players
        </h2>
        <span className="text-sm font-medium text-slate-400">Round {currentRound}</span>
      </div>

      <div className="flex-grow space-y-3 overflow-y-auto">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${player.isReady ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
              <span className="font-medium truncate max-w-[120px]">{player.nickname}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-blue-400">{player.score}</span>
              <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (player.score / targetPoints) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-center text-slate-500 font-medium">
          Goal: <span className="text-slate-300">{targetPoints} points</span>
        </p>
      </div>
    </div>
  );
}
