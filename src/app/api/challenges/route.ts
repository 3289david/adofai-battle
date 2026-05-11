import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();

    const challenges = db
      .prepare(
        `SELECT * FROM challenges
         WHERE status = 'active'
           AND (expires_at IS NULL OR expires_at > datetime('now'))
         ORDER BY created_at DESC`
      )
      .all();

    return NextResponse.json({ challenges });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description = "",
      challenge_type = "accuracy",
      target_value,
      map_title,
      map_artist,
      difficulty,
      reward_mmr = 0,
      reward_badge,
      expires_at,
    } = body;

    if (!name || target_value == null) {
      return NextResponse.json(
        { error: "name and target_value are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = uuid();

    db.prepare(
      `INSERT INTO challenges (id, name, description, challenge_type, target_value, map_title, map_artist, difficulty, reward_mmr, reward_badge, expires_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      name,
      description,
      challenge_type,
      target_value,
      map_title ?? null,
      map_artist ?? null,
      difficulty ?? null,
      reward_mmr,
      reward_badge ?? null,
      expires_at ?? null,
      user.id
    );

    return NextResponse.json({ challenge: { id, name } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
