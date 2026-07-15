export function RatingStars({
  rating,
  count,
}: {
  rating: number | null;
  count: number;
}) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-brand-maroon-dark/70">
      <span aria-hidden className="text-brand-gold">
        {"★".repeat(Math.round(rating))}
        {"☆".repeat(5 - Math.round(rating))}
      </span>
      <span>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}
