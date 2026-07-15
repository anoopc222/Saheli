export function Hero() {
  return (
    <section className="border-b border-brand-line bg-gradient-to-b from-brand-terracotta/15 to-transparent">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta">
          Handpicked weaves, made to drape
        </p>
        <h1 className="font-serif text-4xl font-semibold text-brand-maroon sm:text-5xl">
          Sarees for every story
        </h1>
        <p className="max-w-xl text-brand-maroon-dark/70">
          Cotton, silk, linen and georgette weaves sourced from handloom
          clusters across India — curated for everyday wear and special
          occasions alike.
        </p>
        <a
          href="#shop"
          className="mt-2 rounded-full bg-brand-maroon px-6 py-3 text-sm font-medium text-brand-cream hover:bg-brand-maroon-dark"
        >
          Shop the collection
        </a>
      </div>
    </section>
  );
}
