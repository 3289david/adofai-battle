import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: tournamentId } = await params;
  const db = getDb();

  const tournament = db.prepare("SELECT * FROM tournaments WHERE id = ?").get(tournamentId) as {
    id: string; status: string; max_players: number;
  } | undefined;

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  if (tournament.status !== "registration") {
    return NextResponse.json({ error: "Registration is closed" }, { status: 400 });
  }

  const playerCount = db.prepare(
    "SELECT COUNT(*) as c FROM tournament_players WHERE tournament_id = ?"
  ).get(tournamentId) as { c: number };

  if (playerCount.c >= tournament.max_players) {
    return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
  }

  const existing = db.prepare(
    "SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?"
  ).get(tournamentId, user.id);

  if (existing) {
    return NextResponse.json({ error: "Already registered" }, { status: 409 });
  }

  db.prepare(
    "INSERT INTO tournament_players (tournament_id, user_id) VALUES (?, ?)"
  ).run(tournamentId, user.id);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: tournamentId } = await params;
  const db = getDb();

  const tournament = db.prepare("SELECT status FROM tournaments WHERE id = ?").get(tournamentId) as { status: string } | undefined;
  if (!tournament || tournament.status !== "registration") {
    return NextResponse.json({ error: "Cannot unregister after tournament starts" }, { status: 400 });
  }

  db.prepare("DELETE FROM tournament_players WHERE tournament_id = ? AND user_id = ?")
    .run(tournamentId, user.id);

  return NextResponse.json({ ok: true });
}
