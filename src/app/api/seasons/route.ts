import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();

    const season = db
      .prepare("SELECT * FROM seasons WHERE status = 'active' LIMIT 1")
      .get() as Record<string, unknown> | undefined;

    if (!season) {
      return NextResponse.json({ season: null, progress: null, passLevels: [] });
    }

    const user = await getSession();
    let progress = null;

    if (user) {
      progress = db
        .prepare(
          "SELECT * FROM user_season_progress WHERE user_id = ? AND season_id = ?"
        )
        .get(user.id, season.id) as Record<string, unknown> | undefined ?? null;
    }

    const passLevels = db
      .prepare(
        "SELECT * FROM season_pass_levels WHERE season_id = ? ORDER BY level ASC"
      )
      .all(season.id);

    return NextResponse.json({ season, progress, passLevels });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
