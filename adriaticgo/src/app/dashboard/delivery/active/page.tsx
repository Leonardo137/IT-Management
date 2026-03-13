"use client";

import { useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import useSWR from "swr";
import {
  Loader2,
  ArrowLeft,
  Store,
  MapPin,
  Package,
  LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryMap } from "@/components/delivery/DeliveryMap";
import { StatusUpdater } from "@/components/delivery/StatusUpdater";
import { formatCurrency, fetcher } from "@/lib/utils";

// Dynamic import to avoid SSR issues with Leaflet
const LazyDeliveryMap = dynamic(
  () =>
    import("@/components/delivery/DeliveryMap").then((mod) => ({
      default: mod.DeliveryMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface ActiveDelivery {
  id: string;
  status: string;
  currentLat?: number | null;
  currentLng?: number | null;
  order: {
    deliveryAddress: string;
    deliveryLat?: number | null;
    deliveryLng?: number | null;
    restaurant: {
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    total?: number;
    items?: Array<{ menuItemName: string; quantity: number; unitPrice: number }>;
  };
}

interface DeliveriesResponse {
  available: unknown[];
  active: ActiveDelivery | null;
}

const KOPER_CENTER = { lat: 45.5469, lng: 13.7294 };

export default function ActiveDeliveryPage() {
  const { data, error, isLoading, mutate } = useSWR<DeliveriesResponse>(
    "/api/deliveries",
    fetcher,
    { refreshInterval: 3000 }
  );
  const activeDelivery = data?.active ?? null;
  const locationWatchRef = useRef<number | null>(null);
  const deliveryIdRef = useRef<string | null>(null);
  deliveryIdRef.current = activeDelivery?.id ?? null;

  const updateLocation = useCallback(
    async (lat: number, lng: number) => {
      const id = deliveryIdRef.current;
      if (!id) return;
      await fetch(`/api/deliveries/${id}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentLat: lat, currentLng: lng }),
      });
      mutate();
    },
    [mutate]
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation || !deliveryIdRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        updateLocation(pos.coords.latitude, pos.coords.longitude),
      () => alert("Could not get location. Check site permissions in your browser."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [updateLocation]);

  // Request location immediately on mount, then watch for updates
  useEffect(() => {
    if (!activeDelivery?.id || activeDelivery.status === "DELIVERED") return;
    if (!navigator.geolocation) return;

    requestLocation();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => updateLocation(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    locationWatchRef.current = watchId;

    return () => {
      if (locationWatchRef.current != null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
    };
  }, [activeDelivery?.id, activeDelivery?.status, updateLocation, requestLocation]);

  const handleStatusChange = async (newStatus: string) => {
    if (!activeDelivery?.id) return;
    const res = await fetch(`/api/deliveries/${activeDelivery.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) mutate();
    else {
      const err = await res.json();
      alert(err.error ?? "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !activeDelivery) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/delivery">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to deliveries
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium">No active delivery</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Accept a delivery from the available list to get started
            </p>
            <Link href="/dashboard/delivery">
              <Button className="mt-4">View Available Deliveries</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const order = activeDelivery.order;
  const restaurant = order.restaurant;
  const restaurantLat = restaurant.latitude;
  const restaurantLng = restaurant.longitude;
  const deliveryLat = order.deliveryLat ?? KOPER_CENTER.lat;
  const deliveryLng = order.deliveryLng ?? KOPER_CENTER.lng;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/delivery">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Active Delivery</h1>

        <div className="space-y-2">
          <LazyDeliveryMap
            restaurantLat={restaurantLat}
            restaurantLng={restaurantLng}
            deliveryLat={deliveryLat}
            deliveryLng={deliveryLng}
            driverLat={activeDelivery.currentLat}
            driverLng={activeDelivery.currentLng}
            restaurantName={restaurant.name}
            deliveryAddress={order.deliveryAddress}
            className="h-[300px] w-full rounded-xl sm:h-[350px]"
          />
          {activeDelivery.status !== "DELIVERED" && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={requestLocation}
            >
              <LocateFixed className="h-4 w-4" />
              {activeDelivery.currentLat != null
                ? "Update my location"
                : "Share my location"}
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="h-5 w-5" />
                Pickup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{restaurant.name}</p>
              <p className="text-sm text-muted-foreground">{restaurant.address}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" />
                Deliver to
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.deliveryAddress}</p>
            </CardContent>
          </Card>
        </div>

        {order.items && order.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5" />
                Order items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity}× {item.menuItemName}
                  </li>
                ))}
              </ul>
              {order.total != null && (
                <p className="mt-2 font-semibold">
                  Total: {formatCurrency(order.total)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Update status</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tap to advance through each step of the delivery
            </p>
          </CardHeader>
          <CardContent>
            <StatusUpdater
              currentStatus={activeDelivery.status}
              onStatusChange={handleStatusChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
