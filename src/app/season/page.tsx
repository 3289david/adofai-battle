"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Loader2,
  Lock,
  Star,
  Trophy,
  Zap,
  Shield,
  Gem,
  Award,
  Flame,
  Target,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface SeasonData {
  id: number;
  name: string;
  subtitle: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  current_level: number;
  current_xp: number;
  xp_to_next: number;
  division: string | null;
  placement_matches_played: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  division: string;
  xp: number;
  wins: number;
  losses: number;
}

const DIVISIONS = [
  { id: "iron", name: "Iron", color: "#6b7280", icon: Shield, description: "Starting division for new players" },
  { id: "bronze", name: "Bronze", color: "#cd7f32", icon: Shield, description: "Learning the fundamentals" },
  { id: "silver", name: "Silver", color: "#c0c0c0", icon: Shield, description: "Developing consistency" },
  { id: "gold", name: "Gold", color: "#ffd700", icon: Star, description: "Solid competitive player" },
  { id: "platinum", name: "Platinum", color: "#4dd0e1", icon: Gem, description: "Advanced rhythm mastery" },
  { id: "diamond", name: "Diamond", color: "#b388ff", icon: Gem, description: "Elite tier performance" },
  { id: "master", name: "Master", color: "#ff4081", icon: Crown, description: "Top-tier competitive player" },
  { id: "champion", name: "Champion", color: "#ff6d00", icon: Crown, description: "The absolute best of the best" },
];

const SEASON_PASS_REWARDS = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  if (level % 10 === 0) return { level, name: "Legendary Frame", icon: Crown, rarity: "legendary" };
  if (level % 5 === 0) return { level, name: "Epic Badge", icon: Award, rarity: "epic" };
  if (level % 3 === 0) return { level, name: "XP Boost", icon: Zap, rarity: "rare" };
  return { level, name: "Season Points", icon: Star, rarity: "common" };
});

const RARITY_STYLES: Record<string, string> = {
  common: "border-zinc-600 bg-zinc-800/50",
  rare: "border-blue-500/40 bg-blue-900/20",
  epic: "border-violet-500/40 bg-violet-900/20",
  legendary: "border-amber-500/40 bg-amber-900/20",
};

export default function SeasonPage() {
  const { user } = useAuth();
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [seasonRes, lbRes] = await Promise.all([
          fetch("/api/seasons"),
          fetch("/api/seasons/leaderboard"),
        ]);
        if (seasonRes.ok) setSeason(await seasonRes.json());
        if (lbRes.ok) {
          const data = await lbRes.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const daysRemaining = useMemo(() => {
    if (!season) return 0;
    const end = new Date(season.end_date);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, [season]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    );
  }

  const currentLevel = season?.current_level ?? 1;
  const currentXp = season?.current_xp ?? 0;
  const xpToNext = season?.xp_to_next ?? 100;
  const userDivision = season?.division;
  const placementPlayed = season?.placement_matches_played ?? 0;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-fire/[0.03] blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black mb-1">
                Season 1: <span className="fire-text">Spring Fire</span>
              </h1>
              <p className="text-muted text-sm">Jan 2026 — Jun 2026</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
                <Flame className="w-4 h-4 text-fire" />
                <span className="text-sm font-bold">{daysRemaining}</span>
                <span className="text-xs text-muted">days left</span>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>
        </motion.div>

        {/* Season Pass */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Season Pass
          </h2>
          <div className="rounded-2xl border border-border bg-surface-light p-5">
            {/* XP Progress */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl fire-gradient flex items-center justify-center text-white font-black text-sm">
                  {currentLevel}
                </div>
                <div>
                  <p className="text-xs text-muted">Current Level</p>
                  <p className="text-sm font-bold">{currentXp} / {xpToNext} XP</p>
                </div>
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full fire-gradient transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentXp / xpToNext) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Reward Track */}
            <div className="overflow-x-auto pb-2 -mx-5 px-5">
              <div className="flex gap-2 min-w-max">
                {SEASON_PASS_REWARDS.map((reward) => {
                  const isUnlocked = reward.level <= currentLevel;
                  const isCurrent = reward.level === currentLevel;
                  return (
                    <div
                      key={reward.level}
                      className={cn(
                        "relative flex flex-col items-center w-16 p-2 rounded-xl border transition-all",
                        isCurrent && "ring-2 ring-fire shadow-[0_0_20px_rgba(255,100,0,0.2)]",
                        isUnlocked ? RARITY_STYLES[reward.rarity] : "border-border bg-surface opacity-50"
                      )}
                    >
                      <span className="text-[10px] font-bold text-muted mb-1">{reward.level}</span>
                      {isUnlocked ? (
                        <reward.icon className={cn(
                          "w-5 h-5",
                          reward.rarity === "legendary" ? "text-amber-400" :
                          reward.rarity === "epic" ? "text-violet-400" :
                          reward.rarity === "rare" ? "text-blue-400" : "text-zinc-400"
                        )} />
                      ) : (
                        <Lock className="w-4 h-4 text-zinc-600" />
                      )}
                      <span className="text-[9px] text-muted mt-1 text-center leading-tight">{reward.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Division Ladder */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-fire" />
            Division Ladder
          </h2>

          {!userDivision && placementPlayed < 5 && (
            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3">
              <Target className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Play {5 - placementPlayed} more placement matches to get placed</p>
                <p className="text-xs text-muted">{placementPlayed}/5 matches completed</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DIVISIONS.map((div) => {
              const isUserDiv = userDivision === div.id;
              const DivIcon = div.icon;
              return (
                <div
                  key={div.id}
                  className={cn(
                    "rounded-xl border p-4 transition-all",
                    isUserDiv
                      ? "border-fire/40 bg-fire/5 ring-1 ring-fire/20"
                      : "border-border bg-surface-light hover:border-border-light"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${div.color}22`, border: `1px solid ${div.color}44` }}
                    >
                      <DivIcon className="w-4.5 h-4.5" style={{ color: div.color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: div.color }}>{div.name}</p>
                      {isUserDiv && (
                        <span className="text-[10px] font-bold text-fire">YOUR RANK</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted">{div.description}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Season Rules */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Season Rules
          </h2>
          <div className="rounded-2xl border border-border bg-surface-light p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold mb-3">Promotion &amp; Demotion</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-fire flex-shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Placement:</strong> Play 5 matches to get placed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Promotion:</strong> Win 3 in a row at your division cap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-foreground">Demotion:</strong> Lose 3 in a row at your division floor</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-3">XP Earnings</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Tournament Win: <strong className="text-foreground">+50 XP</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>Tournament Participation: <strong className="text-foreground">+20 XP</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Daily Challenge: <strong className="text-foreground">+10 XP</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-violet-400" />
                    <span>Challenge Completion: <strong className="text-foreground">+15 XP</strong></span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted">
                Season rewards are claimed at the end of the season based on your highest achieved division.
                Higher divisions unlock exclusive frames, badges, and titles.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Season Leaderboard */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            Season Leaderboard
          </h2>
          <div className="rounded-2xl border border-border bg-surface-light overflow-hidden">
            <div className="hidden sm:grid grid-cols-[3rem_1fr_6rem_5rem_5rem] gap-2 px-5 py-3 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Division</span>
              <span className="text-right">XP</span>
              <span className="text-right">W/L</span>
            </div>
            {leaderboard.length > 0 ? (
              <div className="divide-y divide-border">
                {leaderboard.map((entry) => {
                  const div = DIVISIONS.find((d) => d.id === entry.division);
                  const isUser = user?.username === entry.username;
                  return (
                    <div
                      key={entry.rank}
                      className={cn(
                        "grid grid-cols-1 sm:grid-cols-[3rem_1fr_6rem_5rem_5rem] gap-2 px-5 py-3.5 items-center",
                        isUser && "bg-fire/5"
                      )}
                    >
                      <span className="font-mono font-bold text-sm flex items-center gap-1">
                        {entry.rank === 1 && <Crown className="w-3.5 h-3.5 text-gold" />}
                        {entry.rank}
                      </span>
                      <span className={cn("font-semibold text-sm", isUser && "text-fire")}>{entry.username}</span>
                      <span className="text-right text-xs font-semibold" style={{ color: div?.color }}>
                        {div?.name ?? entry.division}
                      </span>
                      <span className="text-right font-mono text-sm">{entry.xp}</span>
                      <span className="text-right font-mono text-sm text-muted">
                        {entry.wins}/{entry.losses}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted">No leaderboard data yet. Play matches to climb!</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
