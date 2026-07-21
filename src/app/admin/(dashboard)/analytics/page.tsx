import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/admin-analytics-data";
import { formatPrice } from "@/lib/format";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { CategoryPerformanceList } from "@/components/admin/CategoryPerformanceList";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper-raised p-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const summary = await getAnalyticsSummary();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold text-ink">Analytics</h1>
        <Link href="/admin/stock" className="text-sm text-accent hover:underline">
          Stock &amp; sales →
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-2.5">
        <StatCard label="Total revenue" value={formatPrice(summary.totalRevenueCents)} />
        <StatCard label="Total orders" value={summary.totalOrders.toString()} />
        <StatCard label="Avg. order value" value={formatPrice(summary.avgOrderValueCents)} />
        <StatCard
          label="Repeat customer rate"
          value={
            summary.totalCustomers > 0
              ? `${summary.repeatRatePercent}%`
              : "—"
          }
        />
      </section>
      {summary.totalCustomers > 0 && (
        <p className="-mt-4 text-xs text-ink-muted">
          {summary.repeatCustomers} of {summary.totalCustomers} customers have ordered more than
          once.
        </p>
      )}

      <RevenueChart data={summary.dailyRevenue} />
      <CategoryPerformanceList categories={summary.categoryPerformance} />
    </div>
  );
}
