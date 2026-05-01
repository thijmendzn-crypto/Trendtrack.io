import { NextResponse } from "next/server";
import { updateStore } from "@/app/lib/file-store";

export const dynamic = "force-dynamic";

export async function POST() {
  const store = await updateStore((current) => ({ ...current, storeConnected: true }));
  return NextResponse.json({ storeConnected: store.storeConnected });
}
