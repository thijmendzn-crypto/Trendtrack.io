import { NextRequest, NextResponse } from "next/server";
import { updateStore } from "@/app/lib/file-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { signalId?: number };
  const signalId = Number(body.signalId);

  if (!Number.isInteger(signalId)) {
    return NextResponse.json({ error: "signalId is required" }, { status: 400 });
  }

  const store = await updateStore((current) => {
    const saved = current.saved.includes(signalId)
      ? current.saved.filter((id) => id !== signalId)
      : [...current.saved, signalId];

    return { ...current, saved };
  });

  return NextResponse.json({ saved: store.saved });
}
