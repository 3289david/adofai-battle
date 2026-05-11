import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const db = getDb();

    const notifications = db
      .prepare(
        `SELECT * FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .all(user.id);

    return NextResponse.json({ notifications });
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
    const body = await req.json();

    if (body.all === true) {
      db.prepare(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0"
      ).run(user.id);

      return NextResponse.json({ marked: "all" });
    }

    const ids = body.ids as string[] | undefined;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Provide ids array or { all: true }" },
        { status: 400 }
      );
    }

    const placeholders = ids.map(() => "?").join(", ");
    db.prepare(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`
    ).run(user.id, ...ids);

    return NextResponse.json({ marked: ids.length });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
