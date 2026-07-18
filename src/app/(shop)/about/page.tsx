export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-6">
      <h1 className="mb-1 font-heading text-2xl font-semibold text-ink">About Us</h1>
      <p className="mb-5 text-xs text-ink-muted">A dream shared by two friends</p>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink">
        <p>
          Saheli began as a small, shared dream between two friends who wanted to bring
          handpicked sarees and ethnic wear to homes everywhere, without losing the warmth
          of a neighbourhood store.
        </p>
        <p>
          Every piece in our collection is chosen with care — for its fabric, its craft, and
          the story it carries. We work directly with weavers and artisans so that what
          reaches you feels as personal as a gift from a friend.
        </p>
        <p>
          Thank you for being part of our journey. We&apos;re just getting started, and we&apos;re
          so glad you&apos;re here.
        </p>
      </div>
    </div>
  );
}
