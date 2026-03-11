"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export function CartSummaryBar() {
  const { items, totalItems, subtotal } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {totalItems} {totalItems === 1 ? "item" : "items"} in cart
            </p>
            <p className="text-sm text-muted-foreground">
              Subtotal: {formatCurrency(subtotal)}
            </p>
          </div>
        </div>
        <Link href="/cart">
          <Button>View Cart</Button>
        </Link>
      </div>
    </div>
  );
}
