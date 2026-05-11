import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    const currentUser = db
      .prepare("SELECT clan_id FROM users WHERE id = ?")
      .get(user.id) as { clan_id: string | null } | undefined;

    if (currentUser?.clan_id) {
      return NextResponse.json(
        { error: "You are already in a clan" },
        { status: 400 }
      );
    }

    const clan = db.prepare("SELECT * FROM clans WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined;

    if (!clan) {
      return NextResponse.json({ error: "Clan not found" }, { status: 404 });
    }

    if (!(clan.recruiting as number)) {
      return NextResponse.json(
        { error: "This clan is not recruiting" },
        { status: 400 }
      );
    }

    if ((clan.member_count as number) >= (clan.max_members as number)) {
      return NextResponse.json({ error: "Clan is full" }, { status: 400 });
    }

    db.prepare(
      "INSERT INTO clan_members (clan_id, user_id, role) VALUES (?, ?, 'member')"
    ).run(id, user.id);

    db.prepare("UPDATE users SET clan_id = ? WHERE id = ?").run(id, user.id);

    db.prepare(
      "UPDATE clans SET member_count = member_count + 1 WHERE id = ?"
    ).run(id);

    return NextResponse.json({ joined: true, clan_id: id });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
