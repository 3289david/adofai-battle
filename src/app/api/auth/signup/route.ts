import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Direct signup is not supported. Please use your ADOFAI.NET account to sign in.",
      redirectUrl: "https://adofai.net",
    },
    { status: 400 }
  );
}
