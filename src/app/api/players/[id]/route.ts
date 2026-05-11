import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const user = db
    .prepare(
      `SELECT id, username, mmr, rank, peak_rank, total_matches, wins, best_accuracy, best_combo, created_at
       FROM users WHERE id = ?`
    )
    .get(id) as Record<string, unknown> | undefined;

  if (!user) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const recentMatches = db
    .prepare(
      `SELECT mr.placement, mr.accuracy, mr.max_combo, mr.mmr_change, mr.is_verified,
              m.map_name, m.mode, m.player_count, m.finished_at
       FROM match_results mr
       JOIN matches m ON mr.match_id = m.id
       WHERE mr.user_id = ?
       ORDER BY m.finished_at DESC
       LIMIT 20`
    )
    .all(id);

  const stats = db
    .prepare(
      `SELECT
        ROUND(AVG(mr.accuracy), 2) as avg_accuracy,
        MAX(mr.accuracy) as best_accuracy,
        MAX(mr.max_combo) as best_combo,
        COUNT(CASE WHEN mr.placement = 1 THEN 1 END) as first_places,
        SUM(mr.mmr_change) as total_mmr_change
       FROM match_results mr
       WHERE mr.user_id = ?`
    )
    .get(id) as Record<string, unknown>;

  return NextResponse.json({ user, recentMatches, stats });
}
