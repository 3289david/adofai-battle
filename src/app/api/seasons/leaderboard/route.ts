import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DIVISION_ORDER: Record<string, number> = {
  Champion: 0,
  Master: 1,
  Diamond: 2,
  Platinum: 3,
  Gold: 4,
  Silver: 5,
  Bronze: 6,
  Iron: 7,
  unranked: 8,
};

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const seasonId = req.nextUrl.searchParams.get("season_id");

    let season: Record<string, unknown> | undefined;

    if (seasonId) {
      season = db.prepare("SELECT * FROM seasons WHERE id = ?").get(seasonId) as
        | Record<string, unknown>
        | undefined;
    } else {
      season = db
        .prepare("SELECT * FROM seasons WHERE status = 'active' LIMIT 1")
        .get() as Record<string, unknown> | undefined;
    }

    if (!season) {
      return NextResponse.json({ leaderboard: [], season: null });
    }

    const rows = db
      .prepare(
        `SELECT usp.*, u.username, u.avatar_url, u.rank
         FROM user_season_progress usp
         JOIN users u ON usp.user_id = u.id
         WHERE usp.season_id = ?
         ORDER BY usp.total_xp DESC
         LIMIT 100`
      )
      .all(season.id) as Record<string, unknown>[];

    const leaderboard = rows.sort((a, b) => {
      const divA = DIVISION_ORDER[a.division as string] ?? 8;
      const divB = DIVISION_ORDER[b.division as string] ?? 8;
      if (divA !== divB) return divA - divB;
      return (b.total_xp as number) - (a.total_xp as number);
    });

    return NextResponse.json({ leaderboard, season });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
