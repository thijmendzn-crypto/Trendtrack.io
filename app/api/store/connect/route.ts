import { NextResponse } from "next/server";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { updateWorkspace } from "@/app/lib/file-store";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const actorId = await getActorId();
    const store = await updateWorkspace(actorId, (current) => ({ ...current, storeConnected: true }));
    return NextResponse.json({ storeConnected: store.storeConnected });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
