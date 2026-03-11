"use client";

import Link from "next/link";
import useSWR from "swr";
import { ClipboardList, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  fetcher,
} from "@/lib/utils";

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "DELIVERED":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "PENDING":
      return "outline";
    default:
      return "secondary";
  }
}

interface OrderItem {
  id: string;
  quantity: number;
  menuItemName: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  restaurant?: { name: string };
  items?: OrderItem[];
}

export default function OrdersPage() {
  const {
    data: orders,
    error,
    isLoading,
  } = useSWR<Order[]>("/api/orders", fetcher, {
    refreshInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-destructive">
          Failed to load orders. Please try again.
        </p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">No orders yet</h1>
        <p className="mb-6 text-muted-foreground">
          Your order history will appear here
        </p>
        <Link href="/">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold">
                        {order.restaurant?.name}
                      </h3>
                      <Badge variant={getStatusVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {order.items
                        ?.map(
                          (i: OrderItem) =>
                            `${i.quantity}x ${i.menuItemName}`
                        )
                        .join(", ")}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
