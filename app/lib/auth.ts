import { auth } from "@clerk/nextjs/server";
import { hasRealClerkKeys } from "./env";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export function isClerkConfigured() {
  return hasRealClerkKeys();
}

export async function getActorId() {
  if (!isClerkConfigured()) {
    return "demo-user";
  }

  const { userId } = await auth();

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
