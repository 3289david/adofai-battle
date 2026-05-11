import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateSwissRound, generatePlayoffBracket } from "@/lib/tournament";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: tournamentId } = await params;
  const db = getDb();

  const tournament = db.prepare("SELECT * FROM tournaments WHERE id = ?").get(tournamentId) as {
    id: string; created_by: string; status: string; swiss_rounds: number;
  } | undefined;

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.created_by !== user.id) {
    return NextResponse.json({ error: "Only the organizer can manage brackets" }, { status: 403 });
  }

  const { action } = await req.json();

  if (action === "start") {
    if (tournament.status !== "registration") {
      return NextResponse.json({ error: "Tournament already started" }, { status: 400 });
    }

    const playerCount = db.prepare(
      "SELECT COUNT(*) as c FROM tournament_players WHERE tournament_id = ?"
    ).get(tournamentId) as { c: number };

    if (playerCount.c < 2) {
      return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 });
    }

    db.prepare("UPDATE tournaments SET status = 'swiss' WHERE id = ?").run(tournamentId);
    const roundId = generateSwissRound(tournamentId, 1);

    return NextResponse.json({ action: "swiss_started", roundId });
  }

  if (action === "next_swiss_round") {
    const currentRounds = db.prepare(
      "SELECT COUNT(*) as c FROM tournament_rounds WHERE tournament_id = ? AND round_type = 'swiss'"
    ).get(tournamentId) as { c: number };

    if (currentRounds.c >= tournament.swiss_rounds) {
      return NextResponse.json({ error: "All Swiss rounds completed. Start playoffs instead." }, { status: 400 });
    }

    const activeMatches = db.prepare(
      `SELECT COUNT(*) as c FROM matches m
       JOIN tournament_rounds r ON m.round_id = r.id
       WHERE m.tournament_id = ? AND r.round_type = 'swiss' AND m.status = 'active'`
    ).get(tournamentId) as { c: number };

    if (activeMatches.c > 0) {
      return NextResponse.json({ error: "Current round has unresolved matches" }, { status: 400 });
    }

    const roundId = generateSwissRound(tournamentId, currentRounds.c + 1);
    return NextResponse.json({ action: "swiss_round_created", roundId, roundNumber: currentRounds.c + 1 });
  }

  if (action === "start_playoffs") {
    db.prepare("UPDATE tournaments SET status = 'playoffs' WHERE id = ?").run(tournamentId);
    const roundId = generatePlayoffBracket(tournamentId);
    return NextResponse.json({ action: "playoffs_started", roundId });
  }

  if (action === "finish") {
    const remainingPlayers = db.prepare(
      `SELECT tp.user_id, tp.swiss_wins, u.username
       FROM tournament_players tp JOIN users u ON tp.user_id = u.id
       WHERE tp.tournament_id = ? AND tp.eliminated = 0
       ORDER BY tp.swiss_wins DESC, u.mmr DESC`
    ).all(tournamentId) as { user_id: string; swiss_wins: number; username: string }[];

    remainingPlayers.forEach((p, i) => {
      db.prepare("UPDATE tournament_players SET placement = ? WHERE tournament_id = ? AND user_id = ?")
        .run(i + 1, tournamentId, p.user_id);
    });

    db.prepare("UPDATE tournaments SET status = 'completed', ends_at = datetime('now') WHERE id = ?")
      .run(tournamentId);

    return NextResponse.json({ action: "tournament_completed", placements: remainingPlayers });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
