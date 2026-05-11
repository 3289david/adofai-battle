"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Loader2,
  Target,
  CheckCircle2,
  Trophy,
  Star,
  X,
  Upload,
  Zap,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface Challenge {
  id: string;
  name: string;
  description: string;
  target: string;
  map: string;
  difficulty: number;
  reward_xp: number;
  reward_name: string;
  completed: boolean;
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/challenges");
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.challenges || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error || "Failed to submit");
      } else {
        setChallenges((prev) =>
          prev.map((c) => c.id === selectedChallenge.id ? { ...c, completed: true } : c)
        );
        setSelectedChallenge(null);
        setVideoUrl("");
      }
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const activeChallenges = challenges.filter((c) => !c.completed);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-fire/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black">
              <span className="fire-text">Challenges</span>
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fire/10 border border-fire/20">
              <Flame className="w-3.5 h-3.5 text-fire" />
              <span className="text-[11px] font-semibold text-fire">{activeChallenges.length} Active</span>
            </div>
          </div>
          <p className="text-muted text-sm">Complete challenges to earn XP and exclusive rewards.</p>
        </motion.div>

        {/* Challenge Cards */}
        {challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-2xl border p-5 transition-all",
                  challenge.completed
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-border bg-surface-light hover:border-fire/20"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      challenge.completed
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-fire/10 border border-fire/20"
                    )}>
                      {challenge.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Target className="w-5 h-5 text-fire" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bold text-sm",
                        challenge.completed && "line-through text-muted"
                      )}>{challenge.name}</h3>
                      <p className="text-xs text-muted">{challenge.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {challenge.target}
                  </span>
                  <span className="flex items-center gap-1">
                    🎵 {challenge.map}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Difficulty: {challenge.difficulty}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold">
                      +{challenge.reward_xp} XP · {challenge.reward_name}
                    </span>
                  </div>
                  {!challenge.completed && user && (
                    <button
                      onClick={() => setSelectedChallenge(challenge)}
                      className="px-3 py-1.5 rounded-lg fire-gradient text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Complete
                    </button>
                  )}
                  {challenge.completed && (
                    <span className="text-xs font-semibold text-emerald-400">Completed ✓</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-light border border-border mb-6">
              <Trophy className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No challenges available</h3>
            <p className="text-sm text-muted">Check back later for new challenges.</p>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedChallenge(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Complete Challenge</h2>
              <button onClick={() => setSelectedChallenge(null)} className="p-2 rounded-lg hover:bg-surface-light transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-4 p-3 rounded-lg bg-surface-light border border-border">
              <p className="font-semibold text-sm">{selectedChallenge.name}</p>
              <p className="text-xs text-muted mt-1">{selectedChallenge.target}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">Video Proof URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-light border border-border text-sm focus:outline-none focus:border-fire/50"
                    placeholder="https://youtube.com/..."
                    required
                  />
                </div>
              </div>
              {submitError && <p className="text-xs text-red-400">{submitError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg fire-gradient text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Proof"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
