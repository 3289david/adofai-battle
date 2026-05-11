import { getDb } from "./db";
import { v4 as uuid } from "uuid";

/**
 * Fully automated tournament system.
 *
 * Tournaments are auto-created by:
 *   - Schedule: Daily, Weekly, Monthly, Season, Annual
 *   - Difficulty tier: Beginner, Intermediate, Advanced, Expert, Master
 *   - Mode: Accuracy, Survival, Speed, Hidden, Draft
 *
 * Maps are fetched from ADOFAI.NET API (`/api/maps?sort=random`)
 * filtered by difficulty range for the tier.
 */

export const DIFFICULTY_TIERS = [
  { id: "beginner", name: "Beginner", icon: "🌱", minDiff: 1, maxDiff: 5, color: "#4ade80" },
  { id: "intermediate", name: "Intermediate", icon: "⚡", minDiff: 5, maxDiff: 10, color: "#60a5fa" },
  { id: "advanced", name: "Advanced", icon: "🔥", minDiff: 10, maxDiff: 15, color: "#f59e0b" },
  { id: "expert", name: "Expert", icon: "💎", minDiff: 15, maxDiff: 18, color: "#a78bfa" },
  { id: "master", name: "Master", icon: "👑", minDiff: 18, maxDiff: 21, color: "#f43f5e" },
] as const;

export const TOURNAMENT_MODES = [
  { id: "accuracy", name: "Accuracy", icon: "🎯", description: "Highest accuracy wins" },
  { id: "survival", name: "Survival", icon: "💀", description: "Miss = elimination" },
  { id: "speed", name: "Speed", icon: "⚡", description: "Played at 1.5x speed" },
  { id: "hidden", name: "Hidden", icon: "🔮", description: "No visual cues" },
  { id: "draft", name: "Draft", icon: "♟️", description: "Players pick maps" },
] as const;

const SCHEDULE_CONFIG = {
  daily: {
    maxPlayers: 999,
    swissRounds: 1,
    bestOfSwiss: 1,
    bestOfPlayoffs: 1,
    submissionDeadlineHours: 24,
    format: "free_for_all",
    bracketType: "none",
    mapsNeeded: 1,
    xpReward: 10,
    mmrBonus: 0,
    description: "Play one map, submit your best score. Resets daily.",
  },
  weekly: {
    maxPlayers: 64,
    swissRounds: 3,
    bestOfSwiss: 1,
    bestOfPlayoffs: 3,
    submissionDeadlineHours: 48,
    format: "swiss_bracket",
    bracketType: "single_elimination",
    mapsNeeded: 5,
    xpReward: 30,
    mmrBonus: 25,
    description: "Swiss stage into single-elimination playoffs. 5 maps.",
  },
  monthly: {
    maxPlayers: 128,
    swissRounds: 5,
    bestOfSwiss: 1,
    bestOfPlayoffs: 3,
    submissionDeadlineHours: 72,
    format: "swiss_bracket",
    bracketType: "single_elimination",
    mapsNeeded: 7,
    xpReward: 75,
    mmrBonus: 50,
    description: "Major monthly championship. 7 maps, Bo3 playoffs.",
  },
  season: {
    maxPlayers: 256,
    swissRounds: 6,
    bestOfSwiss: 3,
    bestOfPlayoffs: 5,
    submissionDeadlineHours: 72,
    format: "swiss_bracket",
    bracketType: "double_elimination",
    mapsNeeded: 12,
    xpReward: 200,
    mmrBonus: 150,
    description: "The ultimate competition. 6-round Swiss, double-elimination Bo5 playoffs. Progressive difficulty — maps get harder each round. Placement matches count toward division ranking. Promotion/demotion rules apply.",
  },
  annual: {
    maxPlayers: 32,
    swissRounds: 4,
    bestOfSwiss: 3,
    bestOfPlayoffs: 5,
    submissionDeadlineHours: 96,
    format: "swiss_bracket",
    bracketType: "double_elimination",
    mapsNeeded: 15,
    xpReward: 500,
    mmrBonus: 300,
    description: "The Grand Championship. Invite-only for top-ranked players. Bo5 throughout. 15 maps across all difficulties.",
  },
} as const;

/**
 * Season Tournament Complex Rules
 *
 * PLACEMENT SYSTEM:
 *   - Players must complete 5 placement matches before receiving a division
 *   - Initial division based on placement W/L ratio and accuracy
 *   - 5-0: Diamond+   4-1: Platinum   3-2: Gold   2-3: Silver   1-4: Bronze   0-5: Iron
 *
 * DIVISION SYSTEM (8 divisions):
 *   Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Champion
 *
 * PROMOTION RULES:
 *   - Win 3 consecutive matches at your division's MMR ceiling to promote
 *   - Promotion series: must win 2/3 of promotion matches
 *   - Division skip possible if MMR far exceeds next division threshold
 *
 * DEMOTION RULES:
 *   - Lose 3 consecutive matches at your division's MMR floor to trigger demotion warning
 *   - Demotion protection: first demotion warning is forgiven (shield)
 *   - After shield used, losing at floor = instant demotion
 *
 * PROGRESSIVE DIFFICULTY:
 *   - Season tournament maps increase in difficulty each Swiss round
 *   - Round 1-2: tier min difficulty
 *   - Round 3-4: tier mid difficulty
 *   - Round 5-6: tier max difficulty
 *   - Playoffs: hardest maps from the tier
 *
 * SCORING MULTIPLIERS:
 *   - Accuracy weight: 60%
 *   - Combo weight: 20%
 *   - Miss penalty: -5% per miss
 *   - Speed bonus: +10% if played at 1.5x speed (Speed mode)
 *   - No-miss bonus: +15% if zero misses
 *   - Full-combo bonus: +25% if full combo achieved
 *
 * XP & REWARDS:
 *   - Win: +50 XP, Loss: +20 XP (participation)
 *   - Daily challenge: +10 XP
 *   - Challenge completion: +15 XP
 *   - Season pass levels unlock cosmetic rewards every 5 levels
 *   - End-of-season rewards based on final division
 */
export const SEASON_RULES = {
  placementMatches: 5,
  promotionWinsNeeded: 3,
  demotionLossesNeeded: 3,
  promotionSeriesWins: 2,
  promotionSeriesGames: 3,
  demotionShield: true,
  scoringWeights: {
    accuracy: 0.6,
    combo: 0.2,
    missPenalty: 0.05,
    speedBonus: 0.1,
    noMissBonus: 0.15,
    fullComboBonus: 0.25,
  },
  xpRewards: {
    win: 50,
    loss: 20,
    dailyChallenge: 10,
    challengeCompletion: 15,
    tournamentWin: 100,
  },
  divisions: [
    { id: "iron",     name: "Iron",     icon: "🪨", color: "#71717a", mmrMin: 0,    mmrMax: 799 },
    { id: "bronze",   name: "Bronze",   icon: "🥉", color: "#cd7f32", mmrMin: 800,  mmrMax: 1199 },
    { id: "silver",   name: "Silver",   icon: "🥈", color: "#c0c0c0", mmrMin: 1200, mmrMax: 1599 },
    { id: "gold",     name: "Gold",     icon: "🥇", color: "#ffd700", mmrMin: 1600, mmrMax: 1999 },
    { id: "platinum", name: "Platinum", icon: "💠", color: "#4dd0e1", mmrMin: 2000, mmrMax: 2499 },
    { id: "diamond",  name: "Diamond",  icon: "💎", color: "#b388ff", mmrMin: 2500, mmrMax: 2999 },
    { id: "master",   name: "Master",   icon: "🔮", color: "#ff4081", mmrMin: 3000, mmrMax: 3999 },
    { id: "champion", name: "Champion", icon: "👑", color: "#ffd700", mmrMin: 4000, mmrMax: 99999 },
  ],
} as const;

type ScheduleType = keyof typeof SCHEDULE_CONFIG;
type TierId = (typeof DIFFICULTY_TIERS)[number]["id"];
type ModeId = (typeof TOURNAMENT_MODES)[number]["id"];

/**
 * Fetch random maps from ADOFAI.NET API by difficulty range.
 */
export async function fetchMapsFromAdofaiNet(
  diffMin: number,
  diffMax: number,
  count: number
): Promise<{ title: string; artist: string; difficulty: number }[]> {
  try {
    const res = await fetch(
      `https://adofai.net/api/maps?sort=random&diffMin=${diffMin}&diffMax=${diffMax}&limit=${count}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const maps = data.maps || [];
    return maps.map((m: Record<string, unknown>) => ({
      title: m.title as string,
      artist: m.artist as string,
      difficulty: m.difficulty as number,
    }));
  } catch {
    return [];
  }
}

/**
 * Create a single auto-tournament for a specific schedule/tier/mode combo.
 */
export async function createAutoTournament(
  scheduleType: ScheduleType,
  tierId: TierId,
  modeId: ModeId,
  systemUserId: string
): Promise<string | null> {
  const db = getDb();
  const config = SCHEDULE_CONFIG[scheduleType];
  const tier = DIFFICULTY_TIERS.find((t) => t.id === tierId)!;
  const mode = TOURNAMENT_MODES.find((m) => m.id === modeId)!;

  // Check if there's already an active tournament of this type/tier/mode
  const existing = db.prepare(
    `SELECT id FROM tournaments
     WHERE tournament_type = ? AND difficulty_tier = ? AND mode = ?
     AND status IN ('registration', 'swiss', 'playoffs')`
  ).get(scheduleType, tierId, modeId);

  if (existing) return null;

  // Fetch maps from ADOFAI.NET
  const maps = await fetchMapsFromAdofaiNet(tier.minDiff, tier.maxDiff, config.mapsNeeded);
  if (maps.length === 0) return null;

  const mapNames = maps.map((m) => `${m.title} by ${m.artist}`);

  const now = new Date();
  let name: string;

  switch (scheduleType) {
    case "daily":
      name = `Daily ${mode.name} — ${tier.name} — ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      break;
    case "weekly": {
      const weekNum = getISOWeekNumber(now);
      name = `Weekly ${mode.name} Cup — ${tier.name} — W${weekNum}`;
      break;
    }
    case "monthly":
      name = `Monthly ${mode.name} Championship — ${tier.name} — ${now.toLocaleDateString("en-US", { month: "long" })}`;
      break;
    case "season":
      name = `Season ${mode.name} Finals — ${tier.name}`;
      break;
    case "annual":
      name = `${now.getFullYear()} ${mode.name} Grand Championship — ${tier.name}`;
      break;
  }

  const description = `${tier.icon} ${tier.name} tier (Lv.${tier.minDiff}-${tier.maxDiff}) • ${mode.icon} ${mode.name} mode — ${mode.description}. Maps auto-selected from ADOFAI.NET.`;

  const id = uuid();
  db.prepare(
    `INSERT INTO tournaments (id, name, description, tournament_type, difficulty_tier, mode, format,
      max_players, maps, swiss_rounds, bracket_type, best_of_swiss, best_of_playoffs,
      submission_deadline_hours, created_by, starts_at, auto_start, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 1, ?, 'registration')`
  ).run(
    id, name, description, scheduleType, tierId, modeId, config.format,
    config.maxPlayers, JSON.stringify(mapNames), config.swissRounds,
    config.bracketType, config.bestOfSwiss, config.bestOfPlayoffs,
    config.submissionDeadlineHours, systemUserId,
    scheduleType !== "daily" ? 1 : 0
  );

  return id;
}

/**
 * Auto-run: creates all missing daily tournaments.
 * Called on server startup / cron.
 */
export async function autoRunDailyTournaments(systemUserId: string): Promise<string[]> {
  const created: string[] = [];
  for (const tier of DIFFICULTY_TIERS) {
    for (const mode of TOURNAMENT_MODES) {
      const id = await createAutoTournament("daily", tier.id, mode.id, systemUserId);
      if (id) created.push(id);
    }
  }
  return created;
}

/**
 * Auto-run: creates all missing weekly tournaments.
 */
export async function autoRunWeeklyTournaments(systemUserId: string): Promise<string[]> {
  const created: string[] = [];
  for (const tier of DIFFICULTY_TIERS) {
    for (const mode of TOURNAMENT_MODES) {
      const id = await createAutoTournament("weekly", tier.id, mode.id, systemUserId);
      if (id) created.push(id);
    }
  }
  return created;
}

/**
 * Auto-run: creates all missing monthly tournaments.
 */
export async function autoRunMonthlyTournaments(systemUserId: string): Promise<string[]> {
  const created: string[] = [];
  for (const tier of DIFFICULTY_TIERS) {
    for (const mode of TOURNAMENT_MODES) {
      const id = await createAutoTournament("monthly", tier.id, mode.id, systemUserId);
      if (id) created.push(id);
    }
  }
  return created;
}

/**
 * Ensure a system user exists for auto-created tournaments.
 */
export function ensureSystemUser(): string {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE username = 'SYSTEM'").get() as { id: string } | undefined;
  if (existing) return existing.id;

  const id = uuid();
  db.prepare(
    "INSERT INTO users (id, username, role) VALUES (?, 'SYSTEM', 'admin')"
  ).run(id);
  return id;
}

/**
 * Run all auto-tournament generation. Call on server init.
 */
export async function autoRunAllTournaments(): Promise<{ daily: string[]; weekly: string[]; monthly: string[] }> {
  const systemUserId = ensureSystemUser();
  const [daily, weekly, monthly] = await Promise.all([
    autoRunDailyTournaments(systemUserId),
    autoRunWeeklyTournaments(systemUserId),
    autoRunMonthlyTournaments(systemUserId),
  ]);
  return { daily, weekly, monthly };
}

function getISOWeekNumber(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
