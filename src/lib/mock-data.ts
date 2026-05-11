export type Rank = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master" | "Rhythm God";

export interface Player {
  id: string;
  name: string;
  rank: Rank;
  mmr: number;
  accuracy: number;
  combo: number;
  progress: number;
  avatar: string;
  isReady: boolean;
  isAlive: boolean;
  missCount: number;
  perfectCount: number;
  greatCount: number;
  score: number;
}

export interface BattleRoom {
  id: string;
  name: string;
  map: string;
  mapDifficulty: number;
  mode: "Accuracy" | "Survival" | "Speed" | "Hidden" | "Draft";
  maxPlayers: number;
  currentPlayers: number;
  status: "waiting" | "ready" | "playing" | "finished";
  host: string;
  players: Player[];
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  accuracy: number;
  score: number;
  clears: number;
  winRate: number;
  peakRank: Rank;
  isVerified: boolean;
}

export interface Season {
  id: number;
  name: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MapInfo {
  name: string;
  difficulty: number;
  artist: string;
  bpm: number;
}

export const RANKS: { name: Rank; color: string; minMMR: number }[] = [
  { name: "Bronze", color: "#cd7f32", minMMR: 0 },
  { name: "Silver", color: "#c0c0c0", minMMR: 1000 },
  { name: "Gold", color: "#ffd700", minMMR: 2000 },
  { name: "Platinum", color: "#4dd0e1", minMMR: 3000 },
  { name: "Diamond", color: "#b388ff", minMMR: 4000 },
  { name: "Master", color: "#ff4081", minMMR: 5000 },
  { name: "Rhythm God", color: "#ffd700", minMMR: 6000 },
];

export function getRankColor(rank: Rank): string {
  return RANKS.find((r) => r.name === rank)?.color ?? "#888";
}

export const BATTLE_MODES = [
  {
    id: "accuracy",
    name: "Accuracy Battle",
    description: "Compete for the highest accuracy. Every input counts — precision is everything.",
    icon: "🎯",
    gradient: "from-fire to-fire-light",
    details: ["Pure accuracy competition", "Real-time accuracy tracking", "Perfect/Great/Miss breakdown", "Tie-breaker: lowest miss count"],
  },
  {
    id: "survival",
    name: "Survival",
    description: "Miss too many and you're out. Last player standing wins.",
    icon: "💀",
    gradient: "from-danger to-fire",
    details: ["3 misses = elimination", "Last one standing wins", "Increasing difficulty", "No second chances"],
  },
  {
    id: "speed",
    name: "Speed Battle",
    description: "Race at increased BPM. Maps play faster — can you keep up?",
    icon: "⚡",
    gradient: "from-warning to-fire-light",
    details: ["Maps play at 1.5x speed", "Accuracy still matters", "Speed multiplier bonus", "Fastest clear wins ties"],
  },
  {
    id: "hidden",
    name: "Hidden Mod",
    description: "Play blind. Map information is hidden — rely on your muscle memory.",
    icon: "🔮",
    gradient: "from-ice to-diamond",
    details: ["No visual cues", "Audio-only gameplay", "Memory-based scoring", "Bonus points for blind perfects"],
  },
  {
    id: "draft",
    name: "Draft Battle",
    description: "Players take turns picking maps. Strategy meets skill.",
    icon: "♟️",
    gradient: "from-master to-diamond",
    details: ["Alternating map picks", "Ban phase included", "Best of 5 rounds", "Strategic map selection"],
  },
];
