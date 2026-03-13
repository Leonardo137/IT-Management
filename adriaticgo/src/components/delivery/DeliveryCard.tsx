"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Store, Truck } from "lucide-react";

interface OrderItem {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
}

interface AvailableOrder {
  id: string;
  total: number;
  deliveryAddress: string;
  notes?: string | null;
  restaurant?: {
    name: string;
    address: string;
  };
  items?: OrderItem[];
}

interface DeliveryCardProps {
  order: AvailableOrder;
  onAccept: () => void;
}

export function DeliveryCard({ order, onAccept }: DeliveryCardProps) {
  const estimatedEarnings = order.restaurant
    ? Math.round(order.total * 0.15 + 2)
    : 2; // Simple estimate: ~15% of order + base fee

  return (
    <Card size="sm" className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{order.restaurant?.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Store className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{order.restaurant?.address}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="font-medium">Delivery to</p>
            <p className="text-muted-foreground">{order.deliveryAddress}</p>
          </div>
        </div>
        {order.items && order.items.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {order.items.slice(0, 3).map((item) => (
              <li key={item.id}>
                {item.quantity}× {item.menuItemName}
              </li>
            ))}
            {order.items.length > 3 && (
              <li>+{order.items.length - 3} more</li>
            )}
          </ul>
        )}
        {order.notes && (
          <p className="text-xs text-muted-foreground italic">
            Note: {order.notes}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold">{formatCurrency(order.total)}</span>
          <span className="text-xs text-muted-foreground">
            ~€{estimatedEarnings} earnings
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          className="w-full gap-2"
          onClick={onAccept}
        >
          <Truck className="h-4 w-4" />
          Accept Delivery
        </Button>
      </CardFooter>
    </Card>
  );
}
