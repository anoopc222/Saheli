export function RatingStars({
  rating,
  count,
}: {
  rating: number | null;
  count: number;
}) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-muted">
      <span aria-hidden className="text-accent">
        {"★".repeat(Math.round(rating))}
        {"☆".repeat(5 - Math.round(rating))}
      </span>
      <span>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}
