import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const hasClerkKeys = Boolean(process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const protectedMiddleware = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: "/sign-in",
    });
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  return protectedMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
