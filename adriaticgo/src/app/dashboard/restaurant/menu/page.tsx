"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { MenuEditor } from "@/components/restaurant/MenuEditor";

export default function RestaurantMenuPage() {
  const { data: restaurants = [], mutate, isLoading } = useSWR<any[]>(
    "/api/restaurants/me",
    fetcher
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Menu Management</h1>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : (
        <MenuEditor restaurants={restaurants} onRefresh={() => mutate()} />
      )}
    </div>
  );
}
