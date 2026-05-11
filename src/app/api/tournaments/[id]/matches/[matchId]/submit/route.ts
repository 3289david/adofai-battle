import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { resolveMatch } from "@/lib/tournament";
import { analyzeSubmission, createReport } from "@/lib/anticheat";
import { v4 as uuid } from "uuid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { matchId } = await params;
  const db = getDb();

  const match = db.prepare(
    `SELECT m.*,
      u1.username as player1_name, u2.username as player2_name,
      w.username as winner_name
     FROM matches m
     LEFT JOIN users u1 ON m.player1_id = u1.id
     LEFT JOIN users u2 ON m.player2_id = u2.id
     LEFT JOIN users w ON m.winner_id = w.id
     WHERE m.id = ?`
  ).get(matchId) as Record<string, unknown> | undefined;

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const games = db.prepare(
    "SELECT * FROM match_games WHERE match_id = ? ORDER BY game_number"
  ).all(matchId);

  const submissions = db.prepare(
    `SELECT s.*, u.username
     FROM submissions s JOIN users u ON s.user_id = u.id
     WHERE s.match_id = ?
     ORDER BY s.game_id, s.accuracy DESC`
  ).all(matchId);

  const vetoes = db.prepare(
    `SELECT v.*, u.username
     FROM match_map_veto v JOIN users u ON v.user_id = u.id
     WHERE v.match_id = ?
     ORDER BY v.pick_order`
  ).all(matchId);

  return NextResponse.json({ match, games, submissions, vetoes });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { matchId } = await params;
  const db = getDb();

  const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId) as {
    id: string; player1_id: string; player2_id: string; status: string; submission_deadline: string;
  } | undefined;

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "active") {
    return NextResponse.json({ error: "Match is not active" }, { status: 400 });
  }

  if (user.id !== match.player1_id && user.id !== match.player2_id) {
    return NextResponse.json({ error: "You are not a participant in this match" }, { status: 403 });
  }

  if (match.submission_deadline && new Date(match.submission_deadline) < new Date()) {
    return NextResponse.json({ error: "Submission deadline has passed" }, { status: 400 });
  }

  const body = await req.json();
  const { gameId, videoUrl, accuracy, maxCombo, perfectCount, greatCount, missCount, score } = body;

  if (!gameId || !videoUrl) {
    return NextResponse.json({ error: "Game ID and video URL required" }, { status: 400 });
  }

  const game = db.prepare("SELECT * FROM match_games WHERE id = ? AND match_id = ?").get(gameId, matchId) as {
    id: string; status: string;
  } | undefined;

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const existingSub = db.prepare(
    "SELECT id FROM submissions WHERE game_id = ? AND user_id = ?"
  ).get(gameId, user.id);

  if (existingSub) {
    return NextResponse.json({ error: "You already submitted for this game" }, { status: 409 });
  }

  // Anti-cheat analysis
  const acResult = analyzeSubmission({
    accuracy: accuracy || 0,
    maxCombo: maxCombo || 0,
    perfectCount: perfectCount || 0,
    greatCount: greatCount || 0,
    missCount: missCount || 0,
    score: score || 0,
    userId: user.id,
  });

  const subId = uuid();
  db.prepare(
    `INSERT INTO submissions (id, game_id, match_id, user_id, video_url, accuracy, max_combo, perfect_count, great_count, miss_count, score, anticheat_status, anticheat_flags, anticheat_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    subId, gameId, matchId, user.id, videoUrl,
    accuracy || 0, maxCombo || 0, perfectCount || 0, greatCount || 0, missCount || 0, score || 0,
    acResult.status, JSON.stringify(acResult.flags), acResult.score
  );

  // Auto-create report if flagged
  if (acResult.status === "flagged" || acResult.status === "suspicious") {
    createReport(subId, null, "auto", `Auto-flagged: ${acResult.flags.join(", ")}`, acResult.flags);
  }

  if (acResult.status === "rejected") {
    createReport(subId, null, "auto", `Auto-rejected: ${acResult.flags.join(", ")}`, acResult.flags);
    return NextResponse.json({
      ok: false,
      submissionId: subId,
      anticheat: { status: acResult.status, flags: acResult.flags },
      error: "Submission auto-rejected by anti-cheat. A moderator will review.",
    }, { status: 403 });
  }

  // Check if both players have submitted for all games — auto-resolve
  const allGames = db.prepare("SELECT id FROM match_games WHERE match_id = ?").all(matchId) as { id: string }[];
  const allSubmitted = allGames.every(g => {
    const c = (db.prepare("SELECT COUNT(*) as c FROM submissions WHERE game_id = ?").get(g.id) as { c: number }).c;
    return c >= 2;
  });

  if (allSubmitted) {
    resolveMatch(matchId);
  }

  return NextResponse.json({
    ok: true,
    submissionId: subId,
    anticheat: { status: acResult.status, flags: acResult.flags },
  });
}
