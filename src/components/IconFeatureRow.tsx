import { TruckIcon, ShieldCheckIcon, BoxIcon, GlobeIcon } from "@/components/icons";

const FEATURES = [
  { icon: TruckIcon, label: "Free Shipping", sub: "above ₹1,999" },
  { icon: ShieldCheckIcon, label: "Secure Payments", sub: "100% safe" },
  { icon: BoxIcon, label: "Premium Packaging", sub: "for every order" },
  { icon: GlobeIcon, label: "Worldwide Shipping", sub: "" },
];

export function IconFeatureRow() {
  return (
    <div className="mx-auto max-w-[480px] px-5 pb-5 pt-5">
      <div className="grid grid-cols-4 gap-2 rounded-2xl border border-line bg-paper-raised px-2 py-5 shadow-sm">
        {FEATURES.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-7 w-7 text-accent" />
            <p className="text-xs font-semibold leading-tight text-ink">{label}</p>
            {sub && <p className="text-[11px] leading-tight text-ink-muted">{sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
