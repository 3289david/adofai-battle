import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createReport } from "@/lib/anticheat";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: submissionId } = await params;
  const { reason } = await req.json();

  const reportId = createReport(
    submissionId,
    user.id,
    "player",
    reason || "Suspicious submission reported by player",
    ["PLAYER_REPORT"]
  );

  return NextResponse.json({ reportId });
}
