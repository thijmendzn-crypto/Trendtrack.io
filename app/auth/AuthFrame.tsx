"use client";

import { ClerkLoaded, ClerkLoading, SignIn, SignUp } from "@clerk/nextjs";

type AuthFrameProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthFrame({ mode }: AuthFrameProps) {
  return (
    <section className="auth-frame">
      <div className="auth-intro">
        <span className="modal-kicker">SignalPilot account</span>
        <h1>{mode === "sign-in" ? "Log in op je dashboard" : "Maak je account aan"}</h1>
        <p>Gebruik Google/Gmail of email om je eigen workspace, watchlist en billing te beheren.</p>
      </div>

      <div className="clerk-shell">
        <ClerkLoading>
          <div className="auth-loading">
            <strong>Login laden...</strong>
            <span>Clerk wordt verbonden. Dit kan lokaal een paar seconden duren.</span>
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          {mode === "sign-in" ? (
            <SignIn fallbackRedirectUrl="/" forceRedirectUrl="/" path="/sign-in" routing="path" signUpUrl="/sign-up" />
          ) : (
            <SignUp fallbackRedirectUrl="/" forceRedirectUrl="/" path="/sign-up" routing="path" signInUrl="/sign-in" />
          )}
        </ClerkLoaded>
      </div>
    </section>
  );
}
