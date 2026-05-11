"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  Calendar,
  Target,
  Zap,
  TrendingUp,
  Loader2,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RANKS } from "@/lib/mock-data";

const RANKING_TABS = [
  { id: "mmr", label: "MMR", icon: TrendingUp },
  { id: "accuracy", label: "Accuracy", icon: Target },
  { id: "wins", label: "Most Wins", icon: Trophy },
  { id: "matches", label: "Most Matches", icon: Zap },
];

interface RankedPlayer {
  id: string;
  username: string;
  mmr: number;
  rank: string;
  peak_rank: string;
  total_matches: number;
  wins: number;
  best_accuracy: number;
  best_combo: number;
  win_rate: number;
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState("mmr");
  const [searchQuery, setSearchQuery] = useState("");
  const [rankings, setRankings] = useState<RankedPlayer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rankings?sort=${activeTab}&limit=50`);
      const data = await res.json();
      setRankings(data.rankings || []);
      setTotal(data.total || 0);
    } catch {
      setRankings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const filtered = searchQuery
    ? rankings.filter((p) => p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : rankings;

  function getRankColor(rank: string): string {
    const r = RANKS.find((r) => r.name === rank);
    return r?.color || "#888";
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-gold/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">
              Global <span className="fire-text">Rankings</span>
            </h1>
            <p className="text-muted">
              Compete for the top. {total > 0 ? `${total} ranked players.` : "Every beat matters."}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-fire">
            <Calendar className="w-4 h-4 text-fire" />
            <span className="text-sm font-semibold">Season 1</span>
            <span className="text-xs text-muted">2026 Spring</span>
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-semibold">ACTIVE</span>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-border bg-surface-light p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Rank Tiers</h3>
          <div className="flex flex-wrap gap-3">
            {RANKS.map((rank) => (
              <div key={rank.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border hover:border-border-light transition-all group">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform"
                  style={{
                    background: rank.color,
                    color: rank.name === "Silver" || rank.name === "Gold" ? "#111" : "#fff",
                    boxShadow: `0 0 10px ${rank.color}22`,
                  }}
                >
                  {rank.name === "Rhythm God" ? "★" : rank.name[0]}
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: rank.color }}>{rank.name}</div>
                  <div className="text-[10px] text-muted">{rank.minMMR}+ MMR</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {RANKING_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "fire-gradient text-white"
                  : "bg-surface-light text-muted hover:text-foreground border border-border"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-light border border-border text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-fire/50 transition-colors"
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface-light overflow-hidden">
          <div className="hidden sm:grid grid-cols-[3rem_1fr_6rem_6rem_5rem_5rem] gap-2 px-5 py-3 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">MMR</span>
            <span className="text-right">Accuracy</span>
            <span className="text-right">W/L</span>
            <span className="text-right">Win%</span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-fire mx-auto mb-4" />
              <p className="text-sm text-muted">Loading rankings...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map((player, i) => (
                <Link
                  key={player.id}
                  href={`/profile?id=${player.id}`}
                  className="grid grid-cols-1 sm:grid-cols-[3rem_1fr_6rem_6rem_5rem_5rem] gap-2 px-5 py-3.5 hover:bg-surface/50 transition-colors items-center"
                >
                  <span className="font-mono font-bold text-sm flex items-center gap-1">
                    {i === 0 && <Crown className="w-3.5 h-3.5 text-gold" />}
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: getRankColor(player.rank), color: "#fff" }}
                    >
                      {player.rank === "Rhythm God" ? "★" : player.rank[0]}
                    </div>
                    <span className="font-semibold text-sm truncate">{player.username}</span>
                    <span className="text-[10px] text-muted hidden sm:inline">{player.rank}</span>
                  </div>
                  <span className="text-right font-mono text-sm font-bold">{player.mmr}</span>
                  <span className="text-right font-mono text-sm">{player.best_accuracy.toFixed(1)}%</span>
                  <span className="text-right font-mono text-sm text-muted">
                    {player.wins}/{player.total_matches - player.wins}
                  </span>
                  <span className="text-right font-mono text-sm">{player.win_rate}%</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No rankings yet</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                Rankings populate as players compete in battles. Be the first to claim the top spot.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
