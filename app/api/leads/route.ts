import { NextRequest, NextResponse } from "next/server";
import { updateStore } from "@/app/lib/file-store";
import type { Lead } from "@/app/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<Lead>;
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const plan = String(body.plan || "Growth").trim();

  if (!name || !email) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const lead: Lead = {
    id: crypto.randomUUID(),
    name,
    email,
    plan,
    createdAt: new Date().toISOString(),
  };

  const store = await updateStore((current) => ({
    ...current,
    leads: [...current.leads, lead],
  }));

  return NextResponse.json({ lead, leads: store.leads }, { status: 201 });
}
