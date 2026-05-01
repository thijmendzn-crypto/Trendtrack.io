import { headers } from "next/headers";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export async function getActorId(): Promise<string> {
  const headersList = await headers();
  const visitorId = headersList.get("x-visitor-id");
  if (visitorId && visitorId.length > 8) return visitorId;
  return "demo-user";
}
