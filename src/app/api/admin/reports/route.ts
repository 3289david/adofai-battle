import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = getDb();
  const status = req.nextUrl.searchParams.get("status") || "pending";

  const reports = db.prepare(
    `SELECT r.*, s.video_url, s.accuracy, s.user_id as submitter_id,
      reporter.username as reporter_name,
      submitter.username as submitter_name,
      reviewer.username as reviewer_name
     FROM anticheat_reports r
     JOIN submissions s ON r.submission_id = s.id
     LEFT JOIN users reporter ON r.reporter_id = reporter.id
     JOIN users submitter ON s.user_id = submitter.id
     LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
     WHERE r.status = ?
     ORDER BY r.created_at DESC
     LIMIT 50`
  ).all(status);

  return NextResponse.json({ reports });
}
