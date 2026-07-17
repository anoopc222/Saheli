const ITEMS = [
  "Free shipping over ₹1,999",
  "Cash on delivery available",
  "7-day easy returns",
];

export function PromoStrip() {
  return (
    <div className="mx-auto flex max-w-[480px] items-center gap-2 overflow-x-auto px-4 pb-5 text-xs font-medium text-ink-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ITEMS.map((item) => (
        <span
          key={item}
          className="shrink-0 whitespace-nowrap rounded-full border border-line bg-paper-raised px-3.5 py-1.5"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
