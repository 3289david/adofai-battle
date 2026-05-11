import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".mp4";
    const allowed = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
    if (!allowed.includes(ext.toLowerCase())) {
      return NextResponse.json({ error: `Invalid file type. Allowed: ${allowed.join(", ")}` }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const filename = `${uuid()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, filename });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
