import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();
    const clans = db
      .prepare(
        `SELECT c.*, u.username as owner_name
         FROM clans c
         JOIN users u ON c.owner_id = u.id
         ORDER BY c.mmr DESC
         LIMIT 50`
      )
      .all();

    return NextResponse.json({ clans });
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
    const body = await req.json();
    const { name, tag, description = "" } = body;

    if (!name || !tag) {
      return NextResponse.json(
        { error: "Name and tag are required" },
        { status: 400 }
      );
    }

    if (tag.length < 2 || tag.length > 5) {
      return NextResponse.json(
        { error: "Tag must be 2-5 characters" },
        { status: 400 }
      );
    }

    if (user.clan_id) {
      return NextResponse.json(
        { error: "You are already in a clan" },
        { status: 400 }
      );
    }

    const db = getDb();

    const existing = db
      .prepare("SELECT id FROM clans WHERE name = ? OR tag = ?")
      .get(name, tag);
    if (existing) {
      return NextResponse.json(
        { error: "Clan name or tag already taken" },
        { status: 409 }
      );
    }

    const clanId = uuid();

    db.prepare(
      `INSERT INTO clans (id, name, tag, description, owner_id)
       VALUES (?, ?, ?, ?, ?)`
    ).run(clanId, name, tag, description, user.id);

    db.prepare(
      `INSERT INTO clan_members (clan_id, user_id, role) VALUES (?, ?, 'owner')`
    ).run(clanId, user.id);

    db.prepare("UPDATE users SET clan_id = ? WHERE id = ?").run(
      clanId,
      user.id
    );

    return NextResponse.json({ clan: { id: clanId, name, tag } });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
