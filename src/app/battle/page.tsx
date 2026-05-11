"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Search,
  Loader2,
  Swords,
  Crown,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tournament {
  id: string;
  name: string;
  description: string;
  tournament_type: string;
  difficulty_tier: string;
  mode: string;
  format: string;
  status: string;
  max_players: number;
  player_count: number;
  maps: string;
  swiss_rounds: number;
  bracket_type: string;
  submission_deadline_hours: number;
  created_by_name: string;
  starts_at: string | null;
  created_at: string;
  featured: number;
}

const TIER_INFO: Record<string, { name: string; icon: string; color: string; bg: string; border: string }> = {
  beginner:     { name: "Beginner",     icon: "🌱", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  intermediate: { name: "Intermediate", icon: "⚡", color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  advanced:     { name: "Advanced",     icon: "🔥", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  expert:       { name: "Expert",       icon: "💎", color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  master:       { name: "Master",       icon: "👑", color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
};

const MODE_INFO: Record<string, { name: string; icon: string }> = {
  accuracy: { name: "Accuracy", icon: "🎯" },
  survival: { name: "Survival", icon: "💀" },
  speed:    { name: "Speed",    icon: "⚡" },
  hidden:   { name: "Hidden",   icon: "🔮" },
  draft:    { name: "Draft",    icon: "♟️" },
};

const TYPE_INFO: Record<string, { name: string; icon: string; accent: string }> = {
  daily:   { name: "Daily",   icon: "📅", accent: "text-emerald-400" },
  weekly:  { name: "Weekly",  icon: "📆", accent: "text-blue-400" },
  monthly: { name: "Monthly", icon: "🗓️", accent: "text-amber-400" },
  season:  { name: "Season",  icon: "🏅", accent: "text-violet-400" },
  annual:  { name: "Annual",  icon: "🏆", accent: "text-rose-400" },
};

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  registration: { label: "Open",     color: "text-emerald-400", dot: "bg-emerald-400" },
  swiss:        { label: "Swiss",    color: "text-amber-400",   dot: "bg-amber-400" },
  playoffs:     { label: "Playoffs", color: "text-rose-400",    dot: "bg-rose-400" },
  completed:    { label: "Done",     color: "text-zinc-500",    dot: "bg-zinc-500" },
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterTier !== "all") params.set("tier", filterTier);
      if (filterMode !== "all") params.set("mode", filterMode);
      if (filterType !== "all") params.set("type", filterType);
      if (filterStatus !== "all") params.set("status", filterStatus);
      const qs = params.toString();
      const res = await fetch(`/api/tournaments${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [filterTier, filterMode, filterType, filterStatus]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const filtered = search
    ? tournaments.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : tournaments;

  // Group by tier for display
  const grouped = new Map<string, Tournament[]>();
  for (const t of filtered) {
    const key = t.difficulty_tier || "beginner";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }

  const tierOrder = ["beginner", "intermediate", "advanced", "expert", "master"];
  const sortedGroups = tierOrder.filter((k) => grouped.has(k)).map((k) => [k, grouped.get(k)!] as const);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-fire/[0.02] blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black">
              Tournaments <span className="fire-text">Arena</span>
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-emerald-400">Auto-Generated</span>
            </div>
          </div>
          <p className="text-muted text-sm max-w-2xl">
            Tournaments are automatically created with maps from ADOFAI.NET. Organized by difficulty tier and game mode.
            New tournaments appear every day, week, and month.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 rounded-2xl border border-fire/20 bg-gradient-to-r from-fire-glow to-surface-light p-6 overflow-hidden relative noise-overlay">
          <div className="absolute inset-0 bg-grid-fire opacity-20" />
          <div className="relative">
            <h3 className="font-bold text-lg mb-3">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center text-white text-xs font-black flex-shrink-0">1</div>
                <div><span className="font-semibold">Pick Your Level</span><p className="text-xs text-muted mt-0.5">Choose a tier matching your skill</p></div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center text-white text-xs font-black flex-shrink-0">2</div>
                <div><span className="font-semibold">Register</span><p className="text-xs text-muted mt-0.5">Join before registration closes</p></div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center text-white text-xs font-black flex-shrink-0">3</div>
                <div><span className="font-semibold">Play &amp; Upload</span><p className="text-xs text-muted mt-0.5">Play the maps, upload video proof</p></div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg fire-gradient flex items-center justify-center text-white text-xs font-black flex-shrink-0">4</div>
                <div><span className="font-semibold">Win</span><p className="text-xs text-muted mt-0.5">Climb ranks, earn badges &amp; MMR</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          {/* Search + Refresh */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-light border border-border text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-fire/50 transition-colors"
              />
            </div>
            <button
              onClick={() => fetchTournaments()}
              className="p-2.5 rounded-lg bg-surface-light border border-border hover:border-fire/30 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-muted" />
            </button>
          </div>

          {/* Filter rows */}
          <div className="flex flex-wrap gap-4">
            {/* Difficulty Tier */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Tier</span>
              <div className="flex items-center gap-1">
                <FilterPill active={filterTier === "all"} onClick={() => setFilterTier("all")}>All</FilterPill>
                {tierOrder.map((t) => {
                  const info = TIER_INFO[t];
                  return (
                    <FilterPill key={t} active={filterTier === t} onClick={() => setFilterTier(t)}>
                      <span>{info.icon}</span> {info.name}
                    </FilterPill>
                  );
                })}
              </div>
            </div>

            {/* Mode */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Mode</span>
              <div className="flex items-center gap-1">
                <FilterPill active={filterMode === "all"} onClick={() => setFilterMode("all")}>All</FilterPill>
                {Object.entries(MODE_INFO).map(([id, info]) => (
                  <FilterPill key={id} active={filterMode === id} onClick={() => setFilterMode(id)}>
                    <span>{info.icon}</span> {info.name}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Type</span>
              <div className="flex items-center gap-1">
                <FilterPill active={filterType === "all"} onClick={() => setFilterType("all")}>All</FilterPill>
                {Object.entries(TYPE_INFO).map(([id, info]) => (
                  <FilterPill key={id} active={filterType === id} onClick={() => setFilterType(id)}>
                    <span>{info.icon}</span> {info.name}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Status</span>
              <div className="flex items-center gap-1">
                <FilterPill active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>All</FilterPill>
                {Object.entries(STATUS_LABELS).map(([id, info]) => (
                  <FilterPill key={id} active={filterStatus === id} onClick={() => setFilterStatus(id)}>
                    <span className={cn("inline-block w-1.5 h-1.5 rounded-full", info.dot)} /> {info.label}
                  </FilterPill>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-fire mx-auto mb-4" />
            <p className="text-muted text-sm">Loading tournaments...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-10">
            {sortedGroups.map(([tierId, tierTournaments]) => {
              const tier = TIER_INFO[tierId] || TIER_INFO.beginner;
              return (
                <section key={tierId}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{tier.icon}</span>
                    <h2 className={cn("text-xl font-black", tier.color)}>{tier.name} Tier</h2>
                    <span className="text-xs text-muted font-medium">{tierTournaments.length} tournaments</span>
                    <div className={cn("flex-1 h-px", tier.bg)} />
                  </div>

                  <div className="grid gap-3">
                    {tierTournaments.map((t) => (
                      <TournamentCard key={t.id} tournament={t} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-light border border-border mb-6">
              <Trophy className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tournaments found</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Tournaments are auto-generated. Try adjusting your filters or check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
        active
          ? "fire-gradient text-white shadow-sm"
          : "bg-surface-light text-muted hover:text-foreground border border-border"
      )}
    >
      {children}
    </button>
  );
}

function TournamentCard({ tournament: t }: { tournament: Tournament }) {
  const tier = TIER_INFO[t.difficulty_tier] || TIER_INFO.beginner;
  const mode = MODE_INFO[t.mode] || MODE_INFO.accuracy;
  const type = TYPE_INFO[t.tournament_type] || TYPE_INFO.daily;
  const status = STATUS_LABELS[t.status] || STATUS_LABELS.registration;
  const maps: string[] = JSON.parse(t.maps || "[]");

  return (
    <Link href={`/tournaments/${t.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-xl border bg-surface/80 backdrop-blur-sm p-5 hover:border-fire/30 transition-all group",
          t.featured ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-border"
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-base">{type.icon}</span>
              <h3 className="font-bold text-base truncate">{t.name}</h3>
              {t.featured === 1 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  FEATURED
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", tier.bg, tier.color, tier.border, "border")}>
                {tier.icon} {tier.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-light border border-border text-foreground">
                {mode.icon} {mode.name}
              </span>
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", type.accent)}>
                {type.name}
              </span>
              <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", status.color)}>
                <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {t.player_count}{t.max_players < 999 ? `/${t.max_players}` : ""} players
              </span>
              {t.format !== "free_for_all" && (
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  Swiss ({t.swiss_rounds}R) → {t.bracket_type.replace("_", " ")}
                </span>
              )}
              {t.format === "free_for_all" && (
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  Free for All
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t.submission_deadline_hours}h deadline
              </span>
              {maps.length > 0 && (
                <span className="flex items-center gap-1">
                  🎵 {maps.length} {maps.length === 1 ? "map" : "maps"}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 text-xs flex-shrink-0">
            <span className="flex items-center gap-1 text-muted">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              {t.created_by_name}
            </span>
            {t.status === "registration" && (
              <span className="px-3 py-1.5 rounded-lg bg-fire/10 text-fire font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Register →
              </span>
            )}
            {(t.status === "swiss" || t.status === "playoffs") && (
              <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View →
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
