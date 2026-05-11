import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id: targetId } = await params;

    if (targetId === user.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    const db = getDb();

    const targetUser = db
      .prepare("SELECT id, username FROM users WHERE id = ?")
      .get(targetId) as { id: string; username: string } | undefined;

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFollow = db
      .prepare(
        "SELECT follower_id FROM follows WHERE follower_id = ? AND following_id = ?"
      )
      .get(user.id, targetId);

    if (existingFollow) {
      db.prepare(
        "DELETE FROM follows WHERE follower_id = ? AND following_id = ?"
      ).run(user.id, targetId);

      db.prepare(
        "UPDATE users SET following_count = MAX(0, following_count - 1) WHERE id = ?"
      ).run(user.id);
      db.prepare(
        "UPDATE users SET follower_count = MAX(0, follower_count - 1) WHERE id = ?"
      ).run(targetId);

      return NextResponse.json({ following: false });
    }

    db.prepare(
      "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)"
    ).run(user.id, targetId);

    db.prepare(
      "UPDATE users SET following_count = following_count + 1 WHERE id = ?"
    ).run(user.id);
    db.prepare(
      "UPDATE users SET follower_count = follower_count + 1 WHERE id = ?"
    ).run(targetId);

    const notifId = uuid();
    db.prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, link)
       VALUES (?, ?, 'follow', ?, ?, ?)`
    ).run(
      notifId,
      targetId,
      "New Follower",
      `${user.username} started following you`,
      `/players/${user.id}`
    );

    return NextResponse.json({ following: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
