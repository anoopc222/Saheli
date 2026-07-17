import { loginAction } from "@/lib/admin-actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">
        Admin login
      </h1>
      <p className="mb-6 text-sm text-ink-muted">
        Saheli Sarees management
      </p>
      <form action={loginAction} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          className="rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm outline-none focus:border-accent"
        />
        {error && (
          <p className="text-sm text-accent">Incorrect password.</p>
        )}
        <button
          type="submit"
          className="rounded-full bg-ink px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
