const ITEMS = [
  "Free shipping over ₹1,999",
  "Cash on delivery available",
  "7-day easy returns",
];

export function PromoStrip() {
  return (
    <div className="border-b border-brand-line bg-brand-maroon">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 py-2 text-xs font-medium tracking-wide text-brand-cream/90">
        {ITEMS.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
