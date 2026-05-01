import { auth } from "@clerk/nextjs/server";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export function isClerkConfigured() {
  return Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
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
