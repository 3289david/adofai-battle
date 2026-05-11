import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = getDb();
  const logs = db.prepare(
    `SELECT ml.*, m.username as moderator_name, t.username as target_name
     FROM moderation_log ml
     JOIN users m ON ml.moderator_id = m.id
     LEFT JOIN users t ON ml.target_user_id = t.id
     ORDER BY ml.created_at DESC
     LIMIT 100`
  ).all();

  return NextResponse.json({ logs });
}
