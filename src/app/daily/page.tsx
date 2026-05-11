"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Loader2,
  Music,
  Trophy,
  Crown,
  Upload,
  Target,
  Zap,
  Star,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface DailyMap {
  id: string;
  title: string;
  artist: string;
  difficulty: number;
  bpm: number;
}

interface DailyLeaderboardEntry {
  rank: number;
  username: string;
  accuracy: number;
  combo: number;
  score: number;
  is_user?: boolean;
}

interface DailyData {
  map: DailyMap;
  leaderboard: DailyLeaderboardEntry[];
  user_submitted: boolean;
}

export default function DailyPage() {
  const { user } = useAuth();
  const [daily, setDaily] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accuracy, setAccuracy] = useState("");
  const [combo, setCombo] = useState("");
  const [score, setScore] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/daily");
        if (res.ok) setDaily(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accuracy: parseFloat(accuracy),
          combo: parseInt(combo),
          score: parseInt(score),
          video_url: videoUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Failed to submit");
      } else {
        setSubmitSuccess(true);
        const refreshed = await fetch("/api/daily");
        if (refreshed.ok) setDaily(await refreshed.json());
      }
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    );
  }

  const map = daily?.map;
  const leaderboard = daily?.leaderboard || [];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-fire/[0.03] blur-[100px]" />
        <div className="absolute bottom-20 right-1/3 w-[400px] h-[400px] rounded-full bg-amber-500/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-6 h-6 text-fire" />
            <h1 className="text-3xl sm:text-4xl font-black">
              Daily <span className="fire-text">Challenge</span>
            </h1>
          </div>
          <p className="text-muted text-sm">A new map every day. Compete for the top spot and earn XP.</p>
        </motion.div>

        {/* Today's Map */}
        {map ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl border border-fire/20 bg-gradient-to-r from-fire-glow to-surface-light p-6 relative overflow-hidden noise-overlay"
          >
            <div className="absolute inset-0 bg-grid-fire opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-fire" />
                <span className="text-xs font-bold uppercase tracking-widest text-fire">Today&apos;s Map</span>
              </div>
              <h2 className="text-2xl font-black mb-2">{map.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  {map.artist}
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-red-400" />
                  Difficulty: {map.difficulty}
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-400" />
                  {map.bpm} BPM
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mb-8 rounded-2xl border border-border bg-surface-light p-8 text-center">
            <Music className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No daily challenge available today. Check back later!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
          {/* Submit Score */}
          {user && map && !daily?.user_submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-surface-light p-5"
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-fire" />
                Submit Your Score
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">Accuracy (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-fire/50"
                    placeholder="99.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">Max Combo</label>
                  <input
                    type="number"
                    min="0"
                    value={combo}
                    onChange={(e) => setCombo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-fire/50"
                    placeholder="1234"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">Score</label>
                  <input
                    type="number"
                    min="0"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-fire/50"
                    placeholder="950000"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted mb-1 block">Video URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-fire/50"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
                {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                {submitSuccess && <p className="text-xs text-emerald-400">Score submitted successfully!</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg fire-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {submitting ? "Submitting..." : "Submit Score"}
                </button>
              </form>
            </motion.div>
          )}

          {user && daily?.user_submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-sm mb-1">Score Submitted!</h3>
              <p className="text-xs text-muted">Check the leaderboard to see your position.</p>
            </motion.div>
          )}

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-surface-light p-5 flex flex-col items-center justify-center text-center"
            >
              <Upload className="w-8 h-8 text-muted mb-3" />
              <h3 className="font-bold text-sm mb-1">Sign in to Submit</h3>
              <p className="text-xs text-muted">Log in to submit your score and compete on the leaderboard.</p>
            </motion.div>
          )}

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-gold" />
              Today&apos;s Leaderboard
            </h3>
            <div className="rounded-2xl border border-border bg-surface-light overflow-hidden">
              <div className="hidden sm:grid grid-cols-[2.5rem_1fr_5rem_4rem_5rem] gap-2 px-4 py-2.5 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted">
                <span>#</span>
                <span>Player</span>
                <span className="text-right">Accuracy</span>
                <span className="text-right">Combo</span>
                <span className="text-right">Score</span>
              </div>
              {leaderboard.length > 0 ? (
                <div className="divide-y divide-border">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={cn(
                        "grid grid-cols-1 sm:grid-cols-[2.5rem_1fr_5rem_4rem_5rem] gap-2 px-4 py-3 items-center",
                        entry.is_user && "bg-fire/5"
                      )}
                    >
                      <span className="font-mono font-bold text-sm flex items-center gap-1">
                        {entry.rank === 1 && <Crown className="w-3.5 h-3.5 text-gold" />}
                        {entry.rank}
                      </span>
                      <span className={cn("font-semibold text-sm", entry.is_user && "text-fire")}>{entry.username}</span>
                      <span className="text-right font-mono text-sm">{entry.accuracy.toFixed(1)}%</span>
                      <span className="text-right font-mono text-sm text-muted">{entry.combo}</span>
                      <span className="text-right font-mono text-sm">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-8 h-8 text-muted mx-auto mb-3" />
                  <p className="text-xs text-muted">No submissions yet. Be the first!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
