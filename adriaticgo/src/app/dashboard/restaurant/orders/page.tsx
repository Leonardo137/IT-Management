"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { OrderQueue } from "@/components/restaurant/OrderQueue";

export default function RestaurantOrdersPage() {
  const { data: orders = [], mutate, isLoading } = useSWR<any[]>(
    "/api/orders",
    fetcher,
    { refreshInterval: 5000 }
  );

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");
  const postReadyOrders = orders.filter((o) =>
    ["PICKED_UP", "DELIVERING", "DELIVERED"].includes(o.status)
  );

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

  const columns = [
    {
      title: "New",
      orders: pendingOrders,
      description: "Accept or reject",
    },
    {
      title: "Confirmed",
      orders: confirmedOrders,
      description: "Start preparing",
    },
    {
      title: "Preparing",
      orders: preparingOrders,
      description: "Mark ready when done",
    },
    {
      title: "Ready for Pickup",
      orders: readyOrders,
      description: "Waiting for driver",
    },
    {
      title: "Out for Delivery",
      orders: postReadyOrders,
      description: "In transit",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Order Queue</h1>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <div>
                <h2 className="font-semibold">{col.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {col.description}
                </p>
              </div>
              <OrderQueue
                orders={col.orders}
                onStatusChange={handleStatusChange}
                isLoading={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
