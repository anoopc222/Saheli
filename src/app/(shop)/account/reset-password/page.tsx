"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const inputClasses =
  "w-full rounded-xl border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none focus:border-accent";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The reset-link redirect carries a recovery token in the URL that
  // supabase-js parses on load, establishing a temporary session — wait
  // for that (or an explicit PASSWORD_RECOVERY event) before showing the form.
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/account"), 1500);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-[420px] px-4 py-10 text-center">
        <h1 className="font-heading text-2xl font-semibold text-ink">Password updated</h1>
        <p className="mt-3 text-sm text-ink-muted">Taking you to your account...</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-[420px] px-4 py-10 text-center">
        <p className="text-sm text-ink-muted">
          This link is invalid or has expired. Request a new one from the login page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-ink">Set a new password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {submitting ? "Saving..." : "Save new password"}
        </button>
      </form>
    </div>
  );
}
