"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDate,
  getOrderStatusLabel,
} from "@/lib/utils";
import { Check, X } from "lucide-react";
import { VALID_TRANSITIONS } from "@/types";

interface OrderItem {
  id: string;
  menuItemName: string;
  unitPrice: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  deliveryAddress: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  restaurant?: { name: string };
}

interface OrderQueueProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  isLoading?: boolean;
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
}) {
  const allowedNext = VALID_TRANSITIONS[order.status] ?? [];
  const canAccept = order.status === "PENDING" && allowedNext.includes("CONFIRMED");
  const canReject = order.status === "PENDING" && allowedNext.includes("CANCELLED");
  const canPreparing = order.status === "CONFIRMED" && allowedNext.includes("PREPARING");
  const canReady = order.status === "PREPARING" && allowedNext.includes("READY");

  const handleAction = async (newStatus: string) => {
    await onStatusChange(order.id, newStatus);
  };

  return (
    <Card size="sm" className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
          <p className="font-medium">{order.deliveryAddress}</p>
        </div>
        <Badge variant="secondary">{getOrderStatusLabel(order.status)}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="text-sm text-muted-foreground space-y-1">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.quantity}× {item.menuItemName}
            </li>
          ))}
        </ul>
        {order.notes && (
          <p className="text-xs text-muted-foreground italic">
            Note: {order.notes}
          </p>
        )}
        <p className="font-semibold">{formatCurrency(order.total)}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {canAccept && (
            <Button
              size="sm"
              className="gap-1"
              onClick={() => handleAction("CONFIRMED")}
            >
              <Check className="size-3.5" />
              Accept
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              variant="destructive"
              className="gap-1"
              onClick={() => handleAction("CANCELLED")}
            >
              <X className="size-3.5" />
              Reject
            </Button>
          )}
          {canPreparing && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction("PREPARING")}
            >
              Start Preparing
            </Button>
          )}
          {canReady && (
            <Button
              size="sm"
              className="gap-1"
              onClick={() => handleAction("READY")}
            >
              <Check className="size-3.5" />
              Ready for Pickup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderQueue({
  orders,
  onStatusChange,
  isLoading,
}: OrderQueueProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} size="sm" className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-5 w-32 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No orders in this queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
