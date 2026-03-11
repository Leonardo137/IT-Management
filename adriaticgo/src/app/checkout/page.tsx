"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Loader2, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatCurrency, fetcher } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurantId, restaurantName, subtotal, clearCart } =
    useCart();
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Pristaniška ulica 12, 6000 Koper"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: restaurant } = useSWR(
    restaurantId ? `/api/restaurants/${restaurantId}` : null,
    fetcher
  );

  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const minimumOrder = restaurant?.minimumOrder ?? 0;
  const total = subtotal + deliveryFee;
  const belowMinimum = minimumOrder > 0 && subtotal < minimumOrder;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="mb-2 text-2xl font-bold">Nothing to checkout</h1>
        <p className="mb-6 text-muted-foreground">Your cart is empty</p>
        <Link href="/">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!deliveryAddress.trim()) {
      setError("Please enter a delivery address");
      return;
    }
    if (belowMinimum) {
      setError(
        `Minimum order is ${formatCurrency(minimumOrder)}. Please add more items.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          deliveryAddress,
          deliveryLat: 45.5469,
          deliveryLng: 13.7294,
          notes: notes || undefined,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to place order");
        setLoading(false);
        return;
      }

      const order = await res.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link href="/cart">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Button>
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold">Checkout</h1>
      <p className="mb-8 text-muted-foreground">
        Ordering from <strong>{restaurantName}</strong>
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Ring doorbell, extra napkins..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            {belowMinimum && (
              <p className="text-sm text-destructive">
                Minimum order is {formatCurrency(minimumOrder)}. Add{" "}
                {formatCurrency(minimumOrder - subtotal)} more.
              </p>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={loading || belowMinimum}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Place Order &mdash; {formatCurrency(total)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
