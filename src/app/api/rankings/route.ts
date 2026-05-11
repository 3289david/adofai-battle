import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const sortBy = req.nextUrl.searchParams.get("sort") || "mmr";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50"), 100);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  const sortColumns: Record<string, string> = {
    mmr: "u.mmr DESC",
    accuracy: "u.best_accuracy DESC",
    wins: "u.wins DESC",
    matches: "u.total_matches DESC",
  };

  const orderBy = sortColumns[sortBy] || "u.mmr DESC";

  const rankings = db
    .prepare(
      `SELECT u.id, u.username, u.mmr, u.rank, u.peak_rank, u.total_matches, u.wins,
              u.best_accuracy, u.best_combo,
              CASE WHEN u.total_matches > 0 THEN ROUND(CAST(u.wins AS REAL) / u.total_matches * 100, 1) ELSE 0 END as win_rate
       FROM users u
       WHERE u.total_matches > 0
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`
    )
    .all(limit, offset);

  const totalPlayers = db
    .prepare("SELECT COUNT(*) as c FROM users WHERE total_matches > 0")
    .get() as { c: number };

  return NextResponse.json({
    rankings,
    total: totalPlayers.c,
    limit,
    offset,
  });
}
