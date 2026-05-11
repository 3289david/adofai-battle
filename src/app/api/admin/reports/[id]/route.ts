import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { reviewReport } from "@/lib/anticheat";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id: reportId } = await params;
  const { action, note } = await req.json();

  if (!["approve", "reject", "ban_player"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  reviewReport(reportId, user.id, action, note || "");

  return NextResponse.json({ ok: true });
}
