"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Swords,
  Crown,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Play,
  Shield,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { RANKS } from "@/lib/mock-data";

interface TournamentDetail {
  id: string;
  name: string;
  description: string;
  format: string;
  status: string;
  max_players: number;
  player_count: number;
  maps: string;
  swiss_rounds: number;
  bracket_type: string;
  submission_deadline_hours: number;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

interface TournamentPlayer {
  user_id: string;
  username: string;
  mmr: number;
  rank: string;
  seed: number | null;
  swiss_wins: number;
  swiss_losses: number;
  eliminated: number;
  placement: number | null;
}

interface TournamentRound {
  id: string;
  round_number: number;
  round_type: string;
  status: string;
}

interface TournamentMatch {
  id: string;
  round_id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  player1_mmr: number;
  player2_mmr: number;
  player1_rank: string;
  player2_rank: string;
  map_name: string;
  best_of: number;
  status: string;
  winner_id: string | null;
  winner_name: string | null;
  bracket_position: string | null;
  submission_deadline: string | null;
}

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [rounds, setRounds] = useState<TournamentRound[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bracket" | "players">("overview");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setTournament(data.tournament);
      setPlayers(data.players || []);
      setRounds(data.rounds || []);
      setMatches(data.matches || []);
    } catch { /* noop */ }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isRegistered = players.some((p) => p.user_id === user?.id);
  const isOrganizer = user?.id === tournament?.created_by;
  const maps: string[] = tournament ? JSON.parse(tournament.maps || "[]") : [];

  async function handleRegister() {
    if (!user) { router.push("/login"); return; }
    setRegistering(true);
    await fetch(`/api/tournaments/${id}/register`, { method: "POST" });
    setRegistering(false);
    fetchData();
  }

  async function handleUnregister() {
    await fetch(`/api/tournaments/${id}/register`, { method: "DELETE" });
    fetchData();
  }

  async function handleBracketAction(action: string) {
    await fetch(`/api/tournaments/${id}/brackets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchData();
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

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Tournament Not Found</h2>
          <Link href="/battle" className="text-fire hover:underline text-sm">Back to Tournaments</Link>
        </div>
      </div>
    );
  }

  const myMatches = matches.filter(
    (m) => m.player1_id === user?.id || m.player2_id === user?.id
  );

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/battle" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          All Tournaments
        </Link>

        {/* Header */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-2xl fire-gradient flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black truncate">{tournament.name}</h1>
                <span className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-lg",
                  tournament.status === "registration" ? "bg-success/10 text-success" :
                  tournament.status === "completed" ? "bg-muted/10 text-muted" :
                  "bg-fire/10 text-fire"
                )}>
                  {tournament.status === "swiss" ? "Swiss Stage" : tournament.status}
                </span>
              </div>
              {tournament.description && (
                <p className="text-sm text-muted mb-3">{tournament.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tournament.player_count}/{tournament.max_players}</span>
                <span className="flex items-center gap-1"><Swords className="w-3.5 h-3.5" /> Swiss {tournament.swiss_rounds}R → {tournament.bracket_type.replace("_", " ")}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tournament.submission_deadline_hours}h per round</span>
                <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-gold" /> {tournament.created_by_name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {tournament.status === "registration" && !isRegistered && !isOrganizer && (
                <button
                  onClick={handleRegister}
                  disabled={registering || tournament.player_count >= tournament.max_players}
                  className="px-6 py-3 rounded-xl fire-gradient text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 glow-fire"
                >
                  {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                  Register
                </button>
              )}
              {tournament.status === "registration" && isRegistered && !isOrganizer && (
                <button
                  onClick={handleUnregister}
                  className="px-6 py-3 rounded-xl border border-border bg-surface-light text-foreground font-semibold text-sm hover:bg-surface-lighter transition-colors"
                >
                  Unregister
                </button>
              )}
              {isOrganizer && tournament.status === "registration" && (
                <button
                  onClick={() => handleBracketAction("start")}
                  disabled={tournament.player_count < 2}
                  className="px-6 py-3 rounded-xl fire-gradient text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Tournament
                </button>
              )}
              {isOrganizer && tournament.status === "swiss" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleBracketAction("next_swiss_round")}
                    className="px-6 py-2.5 rounded-xl bg-ice/10 text-ice font-semibold text-xs hover:bg-ice/20 transition-colors"
                  >
                    Next Swiss Round
                  </button>
                  <button
                    onClick={() => handleBracketAction("start_playoffs")}
                    className="px-6 py-2.5 rounded-xl fire-gradient text-white font-semibold text-xs hover:opacity-90"
                  >
                    Start Playoffs
                  </button>
                </div>
              )}
              {isOrganizer && tournament.status === "playoffs" && (
                <button
                  onClick={() => handleBracketAction("finish")}
                  className="px-6 py-3 rounded-xl fire-gradient text-white font-bold text-sm"
                >
                  Finish Tournament
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {(["overview", "bracket", "players"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === tab
                  ? "fire-gradient text-white"
                  : "bg-surface-light text-muted hover:text-foreground border border-border"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* My Matches */}
              {user && myMatches.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Swords className="w-5 h-5 text-fire" />
                    Your Matches
                  </h2>
                  <div className="space-y-3">
                    {myMatches.map((m) => (
                      <MatchCard key={m.id} match={m} tournamentId={id} userId={user.id} getRankColor={getRankColor} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Matches */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4">All Matches</h2>
                {matches.length > 0 ? (
                  <div className="space-y-3">
                    {matches.map((m) => (
                      <MatchCard key={m.id} match={m} tournamentId={id} userId={user?.id} getRankColor={getRankColor} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted text-center py-8">
                    {tournament.status === "registration" ? "Matches will appear after the tournament starts." : "No matches yet."}
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {maps.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-bold mb-3 text-muted uppercase tracking-wider">Map Pool</h3>
                  <div className="space-y-2">
                    {maps.map((map, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-light border border-border text-sm">
                        <Calendar className="w-3.5 h-3.5 text-fire flex-shrink-0" />
                        <span className="truncate">{map}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-3 text-muted uppercase tracking-wider">Rules</h3>
                <div className="space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-success" /> Video proof required for all submissions</div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {tournament.submission_deadline_hours}h deadline per match</div>
                  <div className="flex items-center gap-2"><Swords className="w-3.5 h-3.5" /> Higher accuracy wins each game</div>
                  <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5 text-gold" /> MMR adjusted after each match</div>
                </div>
              </div>

              {rounds.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-bold mb-3 text-muted uppercase tracking-wider">Rounds</h3>
                  <div className="space-y-2">
                    {rounds.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-light border border-border text-xs">
                        <span className="font-semibold">Round {r.round_number} ({r.round_type})</span>
                        <span className={cn(
                          "font-semibold",
                          r.status === "active" ? "text-fire" : "text-muted"
                        )}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bracket View */}
        {activeTab === "bracket" && (
          <div className="space-y-6">
            {rounds.map((round) => {
              const roundMatches = matches.filter((m) => m.round_id === round.id);
              return (
                <div key={round.id} className="glass rounded-2xl p-6">
                  <h2 className="font-bold text-lg mb-4">
                    Round {round.round_number} — <span className="capitalize">{round.round_type}</span>
                    <span className={cn("ml-2 text-xs font-semibold", round.status === "active" ? "text-fire" : "text-muted")}>
                      {round.status}
                    </span>
                  </h2>
                  {roundMatches.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roundMatches.map((m) => (
                        <BracketMatchCard key={m.id} match={m} tournamentId={id} getRankColor={getRankColor} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No matches in this round.</p>
                  )}
                </div>
              );
            })}
            {rounds.length === 0 && (
              <div className="text-center py-16">
                <Swords className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">Brackets will appear when the tournament starts.</p>
              </div>
            )}
          </div>
        )}

        {/* Players */}
        {activeTab === "players" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[3rem_1fr_5rem_5rem_5rem_5rem] gap-2 px-5 py-3 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">MMR</span>
              <span className="text-right">W</span>
              <span className="text-right">L</span>
              <span className="text-right">Status</span>
            </div>
            {players.length > 0 ? (
              <div className="divide-y divide-border">
                {players.map((p, i) => (
                  <div key={p.user_id} className="grid grid-cols-1 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_5rem] gap-2 px-5 py-3.5 items-center">
                    <span className="font-mono font-bold text-sm">{p.seed || i + 1}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                        style={{ background: getRankColor(p.rank) }}
                      >
                        {p.rank[0]}
                      </div>
                      <span className="font-semibold text-sm truncate">{p.username}</span>
                      {p.placement === 1 && <Crown className="w-3.5 h-3.5 text-gold" />}
                    </div>
                    <span className="text-right font-mono text-sm">{p.mmr}</span>
                    <span className="text-right font-mono text-sm text-success">{p.swiss_wins}</span>
                    <span className="text-right font-mono text-sm text-red-400">{p.swiss_losses}</span>
                    <span className="text-right">
                      {p.eliminated ? (
                        <span className="text-xs text-red-400 font-semibold">OUT</span>
                      ) : p.placement ? (
                        <span className="text-xs text-gold font-semibold">#{p.placement}</span>
                      ) : (
                        <span className="text-xs text-success font-semibold">IN</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted">No players registered yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match: m, tournamentId, userId, getRankColor }: {
  match: TournamentMatch; tournamentId: string; userId?: string; getRankColor: (r: string) => string;
}) {
  const isParticipant = m.player1_id === userId || m.player2_id === userId;
  const deadlinePassed = m.submission_deadline ? new Date(m.submission_deadline) < new Date() : false;

  return (
    <Link href={`/tournaments/${tournamentId}/match/${m.id}`}>
      <div className={cn(
        "rounded-xl border p-4 transition-all hover:border-fire/30 group cursor-pointer",
        isParticipant ? "border-fire/20 bg-fire/[0.02]" : "border-border bg-surface-light"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black text-white" style={{ background: getRankColor(m.player1_rank) }}>
                {m.player1_rank?.[0]}
              </div>
              <span className={cn("font-semibold text-sm", m.winner_id === m.player1_id && "text-fire")}>{m.player1_name}</span>
            </div>
            <span className="text-xs text-muted font-bold">vs</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black text-white" style={{ background: getRankColor(m.player2_rank) }}>
                {m.player2_rank?.[0]}
              </div>
              <span className={cn("font-semibold text-sm", m.winner_id === m.player2_id && "text-fire")}>{m.player2_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted">{m.map_name}</span>
            {m.status === "completed" ? (
              <span className="flex items-center gap-1 text-success font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {m.winner_name} wins
              </span>
            ) : (
              <span className={cn("font-semibold", deadlinePassed ? "text-red-400" : "text-fire")}>
                {deadlinePassed ? "Overdue" : "Active"}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function BracketMatchCard({ match: m, tournamentId, getRankColor }: {
  match: TournamentMatch; tournamentId: string; getRankColor: (r: string) => string;
}) {
  return (
    <Link href={`/tournaments/${tournamentId}/match/${m.id}`}>
      <div className="rounded-xl border border-border bg-surface-light p-4 hover:border-fire/30 transition-all">
        {m.bracket_position && (
          <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2">{m.bracket_position}</div>
        )}
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg",
            m.winner_id === m.player1_id ? "bg-fire/10" : "bg-surface"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-black text-white" style={{ background: getRankColor(m.player1_rank) }}>
                {m.player1_rank?.[0]}
              </div>
              <span className="font-semibold text-sm">{m.player1_name}</span>
            </div>
            {m.winner_id === m.player1_id && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
          </div>
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg",
            m.winner_id === m.player2_id ? "bg-fire/10" : "bg-surface"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-black text-white" style={{ background: getRankColor(m.player2_rank) }}>
                {m.player2_rank?.[0]}
              </div>
              <span className="font-semibold text-sm">{m.player2_name}</span>
            </div>
            {m.winner_id === m.player2_id && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted text-center">
          {m.map_name} &middot; Bo{m.best_of} &middot; {m.status}
        </div>
      </div>
    </Link>
  );
}
