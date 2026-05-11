import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const userId = req.nextUrl.searchParams.get("user_id");

    if (userId) {
      const activities = db
        .prepare(
          `SELECT af.*, u.username, u.avatar_url
           FROM activity_feed af
           JOIN users u ON af.user_id = u.id
           WHERE af.user_id = ?
           ORDER BY af.created_at DESC
           LIMIT 50`
        )
        .all(userId);

      return NextResponse.json({ activities });
    }

    const user = await getSession();

    if (!user) {
      const activities = db
        .prepare(
          `SELECT af.*, u.username, u.avatar_url
           FROM activity_feed af
           JOIN users u ON af.user_id = u.id
           ORDER BY af.created_at DESC
           LIMIT 50`
        )
        .all();

      return NextResponse.json({ activities });
    }

    const activities = db
      .prepare(
        `SELECT af.*, u.username, u.avatar_url
         FROM activity_feed af
         JOIN users u ON af.user_id = u.id
         WHERE af.user_id = ?
            OR af.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
         ORDER BY af.created_at DESC
         LIMIT 50`
      )
      .all(user.id, user.id);

    return NextResponse.json({ activities });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
