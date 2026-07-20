"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-accent";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/account");
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-10">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">Log in</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Optional — you don&apos;t need an account to shop or check out.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
        {error && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 w-full rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-40"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <Link href="/account/forgot-password" className="text-accent hover:underline">
          Forgot password?
        </Link>
        <p className="text-ink-muted">
          New here?{" "}
          <Link href="/account/signup" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
