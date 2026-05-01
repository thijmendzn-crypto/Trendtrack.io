import { NextRequest, NextResponse } from "next/server";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { updateWorkspace } from "@/app/lib/file-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const actorId = await getActorId();
    const body = (await request.json()) as { signalId?: number };
    const signalId = Number(body.signalId);

    if (!Number.isInteger(signalId)) {
      return NextResponse.json({ error: "signalId is required" }, { status: 400 });
    }

    const store = await updateWorkspace(actorId, (current) => {
      const saved = current.saved.includes(signalId)
        ? current.saved.filter((id) => id !== signalId)
        : [...current.saved, signalId];

      return { ...current, saved };
    });

    return NextResponse.json({ saved: store.saved });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
