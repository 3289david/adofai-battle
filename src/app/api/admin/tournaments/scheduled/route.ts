import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  autoRunAllTournaments,
  createAutoTournament,
  DIFFICULTY_TIERS,
  TOURNAMENT_MODES,
  ensureSystemUser,
} from "@/lib/scheduled-tournaments";

export async function GET() {
  const db = getDb();
  const tournaments = db.prepare(
    `SELECT t.*,
      (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = t.id) as player_count,
      u.username as created_by_name
    FROM tournaments t
    JOIN users u ON t.created_by = u.id
    WHERE t.status IN ('registration', 'swiss', 'playoffs')
    ORDER BY t.tournament_type, t.difficulty_tier, t.mode`
  ).all();
  return NextResponse.json({ tournaments });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "auto_run_all") {
    const result = await autoRunAllTournaments();
    return NextResponse.json({
      created: {
        daily: result.daily.length,
        weekly: result.weekly.length,
        monthly: result.monthly.length,
      },
    });
  }

  if (action === "create_single") {
    const { scheduleType, tier, mode } = body;
    if (!scheduleType || !tier || !mode) {
      return NextResponse.json({ error: "scheduleType, tier, mode required" }, { status: 400 });
    }

    const validTier = DIFFICULTY_TIERS.some((t) => t.id === tier);
    const validMode = TOURNAMENT_MODES.some((m) => m.id === mode);
    if (!validTier || !validMode) {
      return NextResponse.json({ error: "Invalid tier or mode" }, { status: 400 });
    }

    const systemUserId = ensureSystemUser();
    const id = await createAutoTournament(scheduleType, tier, mode, systemUserId);
    return NextResponse.json({ id });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
