import { TruckIcon, ShieldCheckIcon, BoxIcon, GlobeIcon } from "@/components/icons";

const FEATURES = [
  { icon: TruckIcon, label: "Free Shipping", sub: "above ₹1,999" },
  { icon: ShieldCheckIcon, label: "Secure Payments", sub: "100% safe" },
  { icon: BoxIcon, label: "Premium Packaging", sub: "for every order" },
  { icon: GlobeIcon, label: "Worldwide Shipping", sub: "" },
];

export function IconFeatureRow() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pt-4">
      <div className="grid min-h-[6.75rem] grid-cols-4 rounded-[1.125rem] bg-paper-raised px-2 py-4 shadow-sm">
        {FEATURES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 px-1 text-center">
            <Icon className="h-6 w-6 text-accent" />
            <p className="text-xs font-semibold leading-tight text-ink">{label}</p>
            {sub && <p className="text-[11px] leading-tight text-ink-muted">{sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
