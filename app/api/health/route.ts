import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "signalpilot", timestamp: new Date().toISOString() });
}
