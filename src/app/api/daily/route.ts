import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();
    const today = getTodayDate();

    let dailyMap = db
      .prepare("SELECT * FROM daily_maps WHERE map_date = ?")
      .get(today) as Record<string, unknown> | undefined;

    if (!dailyMap) {
      const res = await fetch(
        "https://adofai.net/api/maps?sort=random&limit=1"
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: "Failed to fetch map from ADOFAI.NET" },
          { status: 502 }
        );
      }

      const data = await res.json();
      const map = Array.isArray(data) ? data[0] : data?.results?.[0];

      if (!map) {
        return NextResponse.json(
          { error: "No map available" },
          { status: 404 }
        );
      }

      const mapId = uuid();
      db.prepare(
        `INSERT INTO daily_maps (id, map_date, map_id, map_title, map_artist, map_difficulty, map_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        mapId,
        today,
        String(map.id ?? ""),
        map.title ?? map.song ?? "Unknown",
        map.artist ?? map.creator ?? "",
        map.difficulty ?? 0,
        map.download_url ?? map.url ?? ""
      );

      dailyMap = db
        .prepare("SELECT * FROM daily_maps WHERE id = ?")
        .get(mapId) as Record<string, unknown>;
    }

    const leaderboard = db
      .prepare(
        `SELECT dms.*, u.username, u.avatar_url, u.rank
         FROM daily_map_scores dms
         JOIN users u ON dms.user_id = u.id
         WHERE dms.daily_map_id = ?
         ORDER BY dms.accuracy DESC, dms.score DESC
         LIMIT 100`
      )
      .all(dailyMap.id);

    return NextResponse.json({ dailyMap, leaderboard });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = getDb();
    const today = getTodayDate();

    const dailyMap = db
      .prepare("SELECT * FROM daily_maps WHERE map_date = ?")
      .get(today) as Record<string, unknown> | undefined;

    if (!dailyMap) {
      return NextResponse.json(
        { error: "No daily map for today. Try GET first." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { accuracy, max_combo, score, video_url } = body;

    if (accuracy == null || score == null) {
      return NextResponse.json(
        { error: "accuracy and score are required" },
        { status: 400 }
      );
    }

    const scoreId = uuid();
    db.prepare(
      `INSERT OR REPLACE INTO daily_map_scores (id, daily_map_id, user_id, accuracy, max_combo, score, video_url, submitted_at)
       VALUES (
         COALESCE((SELECT id FROM daily_map_scores WHERE daily_map_id = ? AND user_id = ?), ?),
         ?, ?, ?, ?, ?, ?, datetime('now')
       )`
    ).run(
      dailyMap.id,
      user.id,
      scoreId,
      dailyMap.id,
      user.id,
      accuracy,
      max_combo ?? 0,
      score,
      video_url ?? ""
    );

    return NextResponse.json({ submitted: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
