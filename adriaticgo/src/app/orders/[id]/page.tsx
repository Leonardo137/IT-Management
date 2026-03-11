"use client";

import { use } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Clock,
  Store,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { OrderTracker } from "@/components/customer/OrderTracker";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
  fetcher,
} from "@/lib/utils";
import type { OrderStatus } from "@/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: order,
    error,
    isLoading,
  } = useSWR(`/api/orders/${id}`, fetcher, {
    refreshInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-destructive">Failed to load order details.</p>
        <Link href="/orders" className="mt-4 inline-block">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const isActive = !["DELIVERED", "CANCELLED"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-sm text-muted-foreground">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <Badge
          variant={
            order.status === "DELIVERED"
              ? "default"
              : order.status === "CANCELLED"
                ? "destructive"
                : "secondary"
          }
        >
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTracker currentStatus={order.status as OrderStatus} />
          {isActive && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Clock className="mr-1 inline h-4 w-4" />
              Updates automatically every few seconds
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">{order.restaurant?.name}</h3>
            {order.restaurant?.address && (
              <p className="text-sm text-muted-foreground">
                {order.restaurant.address}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items?.map(
            (item: {
              id: string;
              quantity: number;
              menuItemName: string;
              unitPrice: number;
            }) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.menuItemName}
                </span>
                <span className="font-medium">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
            )
          )}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Delivery Address</p>
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress}
              </p>
            </div>
          </div>
          {order.notes && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-muted-foreground">
                &#128221;
              </span>
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Placed at</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
