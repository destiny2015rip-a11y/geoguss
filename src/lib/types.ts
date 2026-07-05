export interface Player {
  id: string;
  name: string;
  totalScore: number;
  isReady: boolean;
  isConnected: boolean;
}

export interface Room {
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

export interface Guess {
  playerId: string;
  lat?: number;
  lng?: number;
  distance?: number;
  score?: number;
  submitted?: boolean;
}

export interface RoundData {
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
