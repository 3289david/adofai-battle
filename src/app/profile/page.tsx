"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  LogIn,
  Trophy,
  Swords,
  ShieldCheck,
  Target,
  BarChart3,
  Award,
  Loader2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Crown,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { RANKS } from "@/lib/mock-data";

interface PlayerProfile {
  id: string;
  username: string;
  mmr: number;
  rank: string;
  peak_rank: string;
  total_matches: number;
  wins: number;
  best_accuracy: number;
  best_combo: number;
  created_at: string;
}

interface MatchResult {
  placement: number;
  accuracy: number;
  max_combo: number;
  mmr_change: number;
  is_verified: number;
  map_name: string;
  mode: string;
  player_count: number;
  finished_at: string;
}

interface Stats {
  avg_accuracy: number | null;
  best_accuracy: number | null;
  best_combo: number | null;
  first_places: number;
  total_mmr_change: number | null;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const playerId = searchParams.get("id");

  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const targetId = playerId || user?.id;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/players/${targetId}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setProfile(data.user);
        setMatches(data.recentMatches || []);
        setStats(data.stats);
      } catch { /* noop */ }
      setLoading(false);
    })();
  }, [targetId]);

  function getRankColor(rank: string): string {
    return RANKS.find((r) => r.name === rank)?.color || "#888";
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    );
  }

  if (!targetId || !profile) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-fire/[0.03] blur-[150px]" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-surface-light border border-border mb-6">
              <User className="w-12 h-12 text-muted" />
            </div>
            <h1 className="text-3xl font-black mb-3">Your Profile</h1>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Sign in to view your profile, track your stats, earn badges, and climb the ranks.
            </p>
            <Link
              href="/login"
              className="inline-flex px-8 py-4 rounded-xl fire-gradient text-white font-bold text-lg hover:opacity-90 transition-opacity items-center gap-3 glow-fire"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Continue
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-black text-center mb-8">
              What you&apos;ll see on your <span className="fire-text">profile</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Trophy, title: "Rank & MMR", desc: "Your competitive tier and matchmaking rating" },
                { icon: Target, title: "Best Accuracy", desc: "Your peak accuracy across all maps" },
                { icon: Swords, title: "Match History", desc: "Every battle, result, and MMR change" },
                { icon: BarChart3, title: "Accuracy Trend", desc: "Your performance graph over time" },
                { icon: ShieldCheck, title: "Verified Clears", desc: "Server-validated, anti-cheat certified clears" },
                { icon: Award, title: "Badges", desc: "Achievements earned through competition" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-surface-light p-5 text-center">
                  <item.icon className="w-6 h-6 text-fire mx-auto mb-3" />
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-[10px] text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const winRate = profile.total_matches > 0 ? ((profile.wins / profile.total_matches) * 100).toFixed(1) : "0";

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-fire/[0.03] blur-[150px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg"
              style={{ background: getRankColor(profile.rank), boxShadow: `0 0 30px ${getRankColor(profile.rank)}44` }}
            >
              {profile.rank === "Rhythm God" ? "★" : profile.rank[0]}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-black mb-1">{profile.username}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted">
                <span style={{ color: getRankColor(profile.rank) }} className="font-bold">{profile.rank}</span>
                <span className="font-mono">{profile.mmr} MMR</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {user?.id === profile.id && (
              <div className="px-3 py-1.5 rounded-lg bg-fire/10 border border-fire/20 text-fire text-xs font-semibold">
                Your Profile
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "MMR", value: profile.mmr.toString(), sub: `Peak: ${profile.peak_rank}` },
            { label: "Best Accuracy", value: `${profile.best_accuracy.toFixed(1)}%`, sub: `Avg: ${stats?.avg_accuracy?.toFixed(1) ?? "—"}%` },
            { label: "Win Rate", value: `${winRate}%`, sub: `${profile.wins}W / ${profile.total_matches - profile.wins}L` },
            { label: "Best Combo", value: profile.best_combo.toString(), sub: `${profile.total_matches} matches` },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-5 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">{stat.label}</div>
              <div className="text-2xl font-black font-mono">{stat.value}</div>
              <div className="text-[10px] text-muted mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Match History */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Swords className="w-5 h-5 text-fire" />
            <h2 className="font-bold">Recent Matches</h2>
            <span className="text-xs text-muted">({matches.length})</span>
          </div>

          {matches.length > 0 ? (
            <div className="divide-y divide-border">
              {matches.map((m, i) => (
                <div key={i} className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      m.placement === 1 ? "fire-gradient text-white" : "bg-surface-light border border-border text-muted"
                    }`}>
                      {m.placement === 1 ? <Crown className="w-4 h-4" /> : `#${m.placement}`}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{m.map_name}</div>
                      <div className="text-[10px] text-muted">{m.mode} &middot; {m.player_count} players &middot; {new Date(m.finished_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">{m.accuracy.toFixed(2)}%</div>
                      <div className="text-[10px] text-muted">{m.max_combo}x combo</div>
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-mono font-bold ${
                      m.mmr_change >= 0 ? "text-success" : "text-red-400"
                    }`}>
                      {m.mmr_change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(m.mmr_change)}
                    </div>
                    {m.is_verified === 1 && (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Swords className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">No matches played yet.</p>
              <Link href="/battle" className="text-fire text-sm hover:underline mt-2 inline-block">
                Play your first battle
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
