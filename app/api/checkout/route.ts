import { NextRequest, NextResponse } from "next/server";
import { updateStore } from "@/app/lib/file-store";
import type { CheckoutSession } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { plan?: string };
  const plan = String(body.plan || "Growth");

  const session: CheckoutSession = {
    id: crypto.randomUUID(),
    plan,
    status: "demo_created",
    createdAt: new Date().toISOString(),
  };

  const store = await updateStore((current) => ({
    ...current,
    checkoutSessions: [...current.checkoutSessions, session],
  }));

  return NextResponse.json({
    checkoutUrl: "/#billing",
    mode: "demo",
    session,
    sessions: store.checkoutSessions,
  });
}
