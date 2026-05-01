import Link from "next/link";
import { AuthFrame } from "@/app/auth/AuthFrame";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="auth-page">
        <section className="auth-fallback">
          <span className="modal-kicker">Auth setup</span>
          <h1>Clerk keys nodig om accounts te maken</h1>
          <p>
            Vul `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` en `CLERK_SECRET_KEY` in `.env.local` in. Zet daarna Google aan in
            Clerk Dashboard onder social connections.
          </p>
          <Link className="primary-button" href="/">
            Terug naar demo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <AuthFrame mode="sign-up" />
    </main>
  );
}
