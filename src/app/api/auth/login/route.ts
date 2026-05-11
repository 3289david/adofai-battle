import { NextRequest, NextResponse } from "next/server";
import { loginWithAdofaiNet } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await loginWithAdofaiNet(email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
