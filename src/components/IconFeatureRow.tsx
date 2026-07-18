import {
  TruckIcon,
  ShieldCheckIcon,
  BoxIcon,
  GlobeIcon,
  StarIcon,
  HeartIcon,
  TagIcon,
  SparkleIcon,
} from "@/components/icons";
import { FeatureItemRow } from "@/lib/feature-items-data";

export const FEATURE_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  truck: TruckIcon,
  shield: ShieldCheckIcon,
  box: BoxIcon,
  globe: GlobeIcon,
  star: StarIcon,
  heart: HeartIcon,
  tag: TagIcon,
  sparkle: SparkleIcon,
};

export function IconFeatureRow({ items }: { items: FeatureItemRow[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
      <div
        className="grid min-h-[4.05rem] rounded-md bg-paper-raised px-1.5 py-2 shadow-sm"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ id, icon, label, sub }) => {
          const Icon = FEATURE_ICONS[icon] ?? TruckIcon;
          return (
            <div key={id} className="flex flex-col items-center gap-1 px-1 text-center">
              <Icon className="h-4 w-4 text-accent" />
              <p className="text-[10px] font-semibold leading-tight text-ink">{label}</p>
              {sub && <p className="text-[9px] leading-tight text-ink-muted">{sub}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
