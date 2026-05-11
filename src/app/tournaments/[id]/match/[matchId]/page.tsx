"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  Trophy,
  Swords,
  Film,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { RANKS } from "@/lib/mock-data";

interface MatchDetail {
  id: string;
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  map_name: string;
  best_of: number;
  status: string;
  winner_id: string | null;
  winner_name: string | null;
  submission_deadline: string | null;
}

interface Game {
  id: string;
  game_number: number;
  map_name: string;
  status: string;
  winner_id: string | null;
}

interface Submission {
  id: string;
  game_id: string;
  user_id: string;
  username: string;
  video_url: string;
  accuracy: number;
  max_combo: number;
  perfect_count: number;
  great_count: number;
  miss_count: number;
  score: number;
  is_verified: number;
  submitted_at: string;
}

export default function MatchPage({ params }: { params: Promise<{ id: string; matchId: string }> }) {
  const { id: tournamentId, matchId } = use(params);
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [accuracy, setAccuracy] = useState("");
  const [maxCombo, setMaxCombo] = useState("");
  const [perfectCount, setPerfectCount] = useState("");
  const [greatCount, setGreatCount] = useState("");
  const [missCount, setMissCount] = useState("");
  const [score, setScore] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/submit`);
      if (!res.ok) return;
      const data = await res.json();
      setMatch(data.match);
      setGames(data.games || []);
      setSubmissions(data.submissions || []);
      if (data.games?.length > 0 && !selectedGame) {
        setSelectedGame(data.games[0].id);
      }
    } catch { /* noop */ }
    setLoading(false);
  }, [tournamentId, matchId, selectedGame]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isParticipant = match && user && (match.player1_id === user.id || match.player2_id === user.id);
  const deadlinePassed = match?.submission_deadline ? new Date(match.submission_deadline) < new Date() : false;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setVideoUrl(data.url);
    } catch { /* noop */ }
    setUploading(false);
  }

  async function handleSubmit() {
    if (!selectedGame || !videoUrl) return;
    setSubmitting(true);
    try {
      await fetch(`/api/tournaments/${tournamentId}/matches/${matchId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame,
          videoUrl,
          accuracy: parseFloat(accuracy) || 0,
          maxCombo: parseInt(maxCombo) || 0,
          perfectCount: parseInt(perfectCount) || 0,
          greatCount: parseInt(greatCount) || 0,
          missCount: parseInt(missCount) || 0,
          score: parseInt(score) || 0,
        }),
      });
      setVideoUrl("");
      setAccuracy("");
      setMaxCombo("");
      setPerfectCount("");
      setGreatCount("");
      setMissCount("");
      setScore("");
      fetchData();
    } finally {
      setSubmitting(false);
    }
  }

  function getRankColor(rank: string): string {
    return RANKS.find((r) => r.name === rank)?.color || "#888";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fire" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold">Match Not Found</h2>
        </div>
      </div>
    );
  }

  const hasSubmittedForGame = (gameId: string) =>
    submissions.some((s) => s.game_id === gameId && s.user_id === user?.id);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournament
        </Link>

        {/* Match Header */}
        <div className="glass rounded-2xl p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-2xl font-black">{match.player1_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xl font-black text-muted">vs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black">{match.player2_name}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-muted">
            <span>{match.map_name}</span>
            <span>&middot;</span>
            <span>Best of {match.best_of}</span>
            <span>&middot;</span>
            <span className={cn(match.status === "completed" ? "text-success" : "text-fire")} >
              {match.status === "completed" ? `${match.winner_name} wins` : "Active"}
            </span>
          </div>
          {match.submission_deadline && match.status === "active" && (
            <div className={cn("mt-3 flex items-center justify-center gap-1.5 text-xs", deadlinePassed ? "text-red-400" : "text-muted")}>
              <Clock className="w-3.5 h-3.5" />
              Deadline: {new Date(match.submission_deadline).toLocaleString()}
              {deadlinePassed && " (EXPIRED)"}
            </div>
          )}
        </div>

        {/* Games */}
        <div className="space-y-6 mb-8">
          {games.map((game) => {
            const gameSubs = submissions.filter((s) => s.game_id === game.id);
            const p1Sub = gameSubs.find((s) => s.user_id === match.player1_id);
            const p2Sub = gameSubs.find((s) => s.user_id === match.player2_id);

            return (
              <div key={game.id} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">
                    Game {game.game_number} — <span className="text-muted">{game.map_name}</span>
                  </h3>
                  {game.winner_id ? (
                    <span className="text-xs text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {game.winner_id === match.player1_id ? match.player1_name : match.player2_name} wins
                    </span>
                  ) : (
                    <span className="text-xs text-fire font-semibold">Awaiting submissions</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SubmissionCard
                    playerName={match.player1_name}
                    submission={p1Sub}
                    isWinner={game.winner_id === match.player1_id}
                  />
                  <SubmissionCard
                    playerName={match.player2_name}
                    submission={p2Sub}
                    isWinner={game.winner_id === match.player2_id}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Form */}
        {isParticipant && match.status === "active" && !deadlinePassed && (
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-fire" />
              Submit Your Play
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Game</label>
                <div className="flex gap-2">
                  {games.map((g) => {
                    const submitted = hasSubmittedForGame(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGame(g.id)}
                        disabled={submitted}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                          selectedGame === g.id ? "border-fire bg-fire/10 text-fire" :
                          submitted ? "border-border bg-surface-light text-muted opacity-50 cursor-not-allowed" :
                          "border-border bg-surface-light text-muted hover:text-foreground"
                        )}
                      >
                        Game {g.game_number} {submitted && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Video</label>
                <div className="flex gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-light border border-border border-dashed text-sm text-muted hover:text-foreground hover:border-fire/50 transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                    {uploading ? "Uploading..." : videoUrl ? "Video uploaded ✓" : "Upload video file"}
                  </button>
                  <span className="text-[10px] text-muted self-center">or</span>
                  <input
                    type="text"
                    placeholder="Paste video URL..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-light border border-border text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-fire/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Accuracy (%)</label>
                  <input type="number" step="0.01" value={accuracy} onChange={(e) => setAccuracy(e.target.value)} placeholder="99.21" className="w-full px-3 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Max Combo</label>
                  <input type="number" value={maxCombo} onChange={(e) => setMaxCombo(e.target.value)} placeholder="1234" className="w-full px-3 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Score</label>
                  <input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="985000" className="w-full px-3 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Perfect</label>
                  <input type="number" value={perfectCount} onChange={(e) => setPerfectCount(e.target.value)} placeholder="500" className="w-full px-3 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Great</label>
                  <input type="number" value={greatCount} onChange={(e) => setGreatCount(e.target.value)} placeholder="12" className="w-full px-3 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Miss</label>
                  <input type="number" value={missCount} onChange={(e) => setMissCount(e.target.value)} placeholder="3" className="w-full px-3 py-2.5 rounded-lg bg-surface-light border border-border text-sm font-mono focus:outline-none focus:border-fire/50" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-light border border-border">
                <Shield className="w-5 h-5 text-success flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs font-semibold">Video Verification Required</span>
                  <p className="text-[10px] text-muted">Organizers may review your video to verify results</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedGame || !videoUrl || hasSubmittedForGame(selectedGame)}
                className="w-full py-3.5 rounded-xl fire-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 glow-fire disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit Play
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionCard({ playerName, submission, isWinner }: {
  playerName: string;
  submission?: Submission;
  isWinner: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      isWinner ? "border-success/30 bg-success/[0.03]" : "border-border bg-surface-light"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm">{playerName}</span>
        {isWinner && <Trophy className="w-4 h-4 text-gold" />}
      </div>
      {submission ? (
        <div className="space-y-2">
          <div className="text-2xl font-black font-mono fire-text">{submission.accuracy.toFixed(2)}%</div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div><div className="font-bold text-success">{submission.perfect_count}</div><div className="text-muted">Perfect</div></div>
            <div><div className="font-bold text-ice">{submission.great_count}</div><div className="text-muted">Great</div></div>
            <div><div className="font-bold text-red-400">{submission.miss_count}</div><div className="text-muted">Miss</div></div>
          </div>
          <div className="flex justify-between text-xs text-muted pt-1">
            <span>Combo: {submission.max_combo}x</span>
            <span>Score: {submission.score.toLocaleString()}</span>
          </div>
          {submission.video_url && (
            <a
              href={submission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-fire hover:underline mt-1"
            >
              <Film className="w-3 h-3" />
              Watch Video
            </a>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <Clock className="w-6 h-6 text-muted mx-auto mb-2" />
          <p className="text-xs text-muted">Awaiting submission</p>
        </div>
      )}
    </div>
  );
}
