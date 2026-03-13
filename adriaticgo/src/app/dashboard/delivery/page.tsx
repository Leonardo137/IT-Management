"use client";

import Link from "next/link";
import useSWR from "swr";
import { Loader2, Truck } from "lucide-react";
import { DeliveryCard } from "@/components/delivery/DeliveryCard";
import { fetcher } from "@/lib/utils";

interface AvailableOrder {
  id: string;
  status: string;
  total: number;
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  notes?: string | null;
  createdAt: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  items?: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface DeliveriesResponse {
  available: AvailableOrder[];
  active: { id: string } | null;
}

export default function DeliveriesPage() {
  const { data, error, isLoading, mutate } = useSWR<DeliveriesResponse>(
    "/api/deliveries",
    fetcher,
    { refreshInterval: 5000 }
  );

  const handleAccept = async (orderId: string) => {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      mutate();
      window.location.href = "/dashboard/delivery/active";
    } else {
      const err = await res.json();
      alert(err.error ?? "Failed to accept delivery");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive">Failed to load deliveries.</p>
      </div>
    );
  }

  const available = data?.available ?? [];
  const active = data?.active;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Deliveries</h1>
        <p className="text-muted-foreground">
          Accept a delivery to start earning
        </p>
      </div>

      {active && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm font-medium">
            You have an active delivery.{" "}
            <Link
              href="/dashboard/delivery/active"
              className="underline hover:no-underline"
            >
              Go to Active Delivery
            </Link>
          </p>
        </div>
      )}

      {available.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Truck className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">
            No deliveries available right now
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            New orders will appear here when restaurants mark them ready for
            pickup
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onAccept={() => handleAccept(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
