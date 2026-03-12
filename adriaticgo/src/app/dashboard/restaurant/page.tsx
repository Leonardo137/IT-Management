"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { StatsCard } from "@/components/restaurant/StatsCard";
import { OrderQueue } from "@/components/restaurant/OrderQueue";
import { DollarSign, ClipboardList } from "lucide-react";

export default function RestaurantDashboardPage() {
  const { data: orders = [], mutate, isLoading } = useSWR<any[]>(
    "/api/orders",
    fetcher,
    { refreshInterval: 5000 }
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= todayStart && o.status !== "CANCELLED"
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter(
    (o) => o.status === "CONFIRMED" || o.status === "PREPARING"
  );
  const readyOrders = orders.filter((o) => o.status === "READY");

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to update");
    }
    mutate();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Today&apos;s Orders"
          value={todayOrders.length}
          description="Orders received today"
          icon={<ClipboardList />}
        />
        <StatsCard
          title="Today&apos;s Revenue"
          value={new Intl.NumberFormat("sl-SI", {
            style: "currency",
            currency: "EUR",
          }).format(todayRevenue)}
          description="Total revenue today"
          icon={<DollarSign />}
        />
        <StatsCard
          title="Pending"
          value={pendingOrders.length}
          description="Awaiting your response"
          icon={<ClipboardList />}
        />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Incoming Orders</h2>
        <OrderQueue
          orders={pendingOrders}
          onStatusChange={handleStatusChange}
          isLoading={isLoading}
        />
      </section>

      {(preparingOrders.length > 0 || readyOrders.length > 0) && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">In Progress</h2>
          <OrderQueue
            orders={[...preparingOrders, ...readyOrders]}
            onStatusChange={handleStatusChange}
          />
        </section>
      )}
    </div>
  );
}
