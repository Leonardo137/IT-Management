"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isAvailable: boolean;
  };
  restaurantId: string;
  restaurantName: string;
}

export function MenuItemCard({
  item,
  restaurantId,
  restaurantName,
}: MenuItemCardProps) {
  const {
    addItem,
    restaurantId: cartRestaurantId,
    restaurantName: cartRestaurantName,
    items,
  } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.menuItemId === item.id);
  const quantityInCart = cartItem?.quantity || 0;

  function handleAdd() {
    const isDifferentRestaurant =
      cartRestaurantId && cartRestaurantId !== restaurantId;

    if (isDifferentRestaurant) {
      const confirmed = window.confirm(
        `Your cart contains items from ${cartRestaurantName}. Adding this item will clear your current cart. Continue?`
      );
      if (!confirmed) return;
    }

    const newItem: CartItem = {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId,
      restaurantName,
    };

    addItem(newItem);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  if (!item.isAvailable) {
    return (
      <Card className="opacity-60">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{item.name}</h4>
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            </div>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
            <p className="mt-2 font-semibold text-primary">
              {formatCurrency(item.price)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1 pr-4">
          <h4 className="font-medium">{item.name}</h4>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          <p className="mt-2 font-semibold text-primary">
            {formatCurrency(item.price)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quantityInCart > 0 && (
            <span className="text-sm font-medium text-primary">
              {quantityInCart} in cart
            </span>
          )}
          <Button
            size="sm"
            onClick={handleAdd}
            className={justAdded ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Plus className="mr-1 h-4 w-4" />
            {justAdded ? "Added!" : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
