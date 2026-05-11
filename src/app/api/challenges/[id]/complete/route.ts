import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { v4 as uuid } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();

    const challenge = db
      .prepare(
        `SELECT * FROM challenges
         WHERE id = ? AND status = 'active'
           AND (expires_at IS NULL OR expires_at > datetime('now'))`
      )
      .get(id) as Record<string, unknown> | undefined;

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found or inactive" },
        { status: 404 }
      );
    }

    const alreadyCompleted = db
      .prepare(
        "SELECT id FROM challenge_completions WHERE challenge_id = ? AND user_id = ?"
      )
      .get(id, user.id);

    if (alreadyCompleted) {
      return NextResponse.json(
        { error: "You have already completed this challenge" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { achieved_value, video_url = "" } = body;

    if (achieved_value == null) {
      return NextResponse.json(
        { error: "achieved_value is required" },
        { status: 400 }
      );
    }

    const targetValue = challenge.target_value as number;
    if (
      challenge.challenge_type === "accuracy" &&
      achieved_value < targetValue
    ) {
      return NextResponse.json(
        {
          error: `Target not met. Required: ${targetValue}, achieved: ${achieved_value}`,
        },
        { status: 400 }
      );
    }

    const completionId = uuid();
    db.prepare(
      `INSERT INTO challenge_completions (id, challenge_id, user_id, achieved_value, video_url)
       VALUES (?, ?, ?, ?, ?)`
    ).run(completionId, id, user.id, achieved_value, video_url);

    const rewardMmr = challenge.reward_mmr as number;
    if (rewardMmr > 0) {
      db.prepare("UPDATE users SET mmr = mmr + ? WHERE id = ?").run(
        rewardMmr,
        user.id
      );
    }

    const activityId = uuid();
    db.prepare(
      `INSERT INTO activity_feed (id, user_id, activity_type, title, description, metadata)
       VALUES (?, ?, 'challenge_complete', ?, ?, ?)`
    ).run(
      activityId,
      user.id,
      `Completed challenge: ${challenge.name}`,
      `Achieved ${achieved_value} on "${challenge.name}"`,
      JSON.stringify({
        challenge_id: id,
        achieved_value,
        reward_mmr: rewardMmr,
      })
    );

    return NextResponse.json({
      completed: true,
      reward_mmr: rewardMmr,
      reward_badge: challenge.reward_badge,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
