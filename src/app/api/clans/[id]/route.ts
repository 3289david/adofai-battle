import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const clan = db
      .prepare(
        `SELECT c.*, u.username as owner_name
         FROM clans c
         JOIN users u ON c.owner_id = u.id
         WHERE c.id = ?`
      )
      .get(id) as Record<string, unknown> | undefined;

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    const members = db
      .prepare(
        `SELECT cm.role, cm.joined_at, u.id as user_id, u.username, u.mmr, u.rank, u.avatar_url
         FROM clan_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.clan_id = ?
         ORDER BY
           CASE cm.role WHEN 'owner' THEN 0 WHEN 'officer' THEN 1 ELSE 2 END,
           u.mmr DESC`
      )
      .all(id);

    return NextResponse.json({ clan, members });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
