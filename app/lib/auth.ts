export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export async function getActorId() {
  return "demo-user";
}
