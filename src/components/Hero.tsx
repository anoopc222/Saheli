export function Hero() {
  return (
    <section className="mx-auto max-w-[480px] px-4 pb-6 pt-8 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
        Handloom &amp; silk, made with care
      </p>
      <h1 className="mt-3 font-heading text-4xl font-semibold leading-[1.1] text-ink">
        Sarees for
        <br />
        every story
      </h1>
      <p className="mx-auto mt-4 max-w-[300px] text-sm leading-relaxed text-ink-muted">
        Cotton, silk, linen and georgette — curated for everyday wear and
        special occasions alike.
      </p>
      <a
        href="#shop"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        Shop the collection
      </a>
    </section>
  );
}
