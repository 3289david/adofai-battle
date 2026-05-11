import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const tournament = db.prepare(
    `SELECT t.*, u.username as created_by_name,
      (SELECT COUNT(*) FROM tournament_players WHERE tournament_id = t.id) as player_count
     FROM tournaments t JOIN users u ON t.created_by = u.id
     WHERE t.id = ?`
  ).get(id) as Record<string, unknown> | undefined;

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const players = db.prepare(
    `SELECT tp.*, u.username, u.mmr, u.rank
     FROM tournament_players tp JOIN users u ON tp.user_id = u.id
     WHERE tp.tournament_id = ?
     ORDER BY tp.seed ASC NULLS LAST, u.mmr DESC`
  ).all(id);

  const rounds = db.prepare(
    `SELECT * FROM tournament_rounds WHERE tournament_id = ? ORDER BY round_number ASC`
  ).all(id);

  const matches = db.prepare(
    `SELECT m.*,
      u1.username as player1_name, u1.mmr as player1_mmr, u1.rank as player1_rank,
      u2.username as player2_name, u2.mmr as player2_mmr, u2.rank as player2_rank,
      w.username as winner_name
     FROM matches m
     LEFT JOIN users u1 ON m.player1_id = u1.id
     LEFT JOIN users u2 ON m.player2_id = u2.id
     LEFT JOIN users w ON m.winner_id = w.id
     WHERE m.tournament_id = ?
     ORDER BY m.created_at ASC`
  ).all(id);

  return NextResponse.json({ tournament, players, rounds, matches });
}
