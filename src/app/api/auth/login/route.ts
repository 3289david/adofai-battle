import { NextResponse } from "next/server";

/** Password login deprecated — OAuth only (auth.adofai.net). */
export async function POST() {
  return NextResponse.json(
    { error: "Use OAuth: click Sign In to continue via auth.adofai.net." },
    { status: 410 }
  );
}
