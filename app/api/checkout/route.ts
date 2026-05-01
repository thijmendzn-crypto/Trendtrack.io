import { NextRequest, NextResponse } from "next/server";
import { getActorId, UnauthorizedError } from "@/app/lib/auth";
import { updateWorkspace } from "@/app/lib/file-store";
import type { CheckoutSession } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const actorId = await getActorId();
    const body = (await request.json()) as { plan?: string };
    const plan = String(body.plan || "Growth");

    const session: CheckoutSession = {
      id: crypto.randomUUID(),
      plan,
      status: "demo_created",
      createdAt: new Date().toISOString(),
    };

    const store = await updateWorkspace(actorId, (current) => ({
      ...current,
      checkoutSessions: [...current.checkoutSessions, session],
    }));

    return NextResponse.json({
      checkoutUrl: "/#billing",
      mode: "demo",
      session,
      sessions: store.checkoutSessions,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    throw error;
  }
}
