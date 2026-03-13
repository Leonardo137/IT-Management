"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export interface AvailableOrder {
  id: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  items: Array<{
    id: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface ActiveDelivery {
  id: string;
  orderId: string;
  driverId: string;
  status: string;
  currentLat?: number;
  currentLng?: number;
  pickedUpAt?: string;
  deliveredAt?: string;
  order: {
    id: string;
    status: string;
    deliveryAddress: string;
    deliveryLat?: number;
    deliveryLng?: number;
    restaurant: {
      id: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    items: Array<{
      menuItemName: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
}

export interface DeliveriesResponse {
  available: AvailableOrder[];
  active: ActiveDelivery | null;
}

export function useDeliveries() {
  const { data, error, isLoading, mutate } = useSWR<DeliveriesResponse>(
    "/api/deliveries",
    fetcher,
    { refreshInterval: 5000 }
  );
  return { data, error, isLoading, mutate };
}

export function useActiveDelivery(deliveryId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ActiveDelivery>(
    deliveryId ? `/api/deliveries/${deliveryId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );
  return { data, error, isLoading, mutate };
}
