"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RestaurantCard } from "./RestaurantCard";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  imageUrl: string | null;
  rating: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
  cuisines: string[];
}

export function RestaurantGrid({ restaurants, cuisines }: RestaurantGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      const matchesCuisine =
        !selectedCuisine || r.cuisine === selectedCuisine;
      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, search, selectedCuisine]);

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-10 text-base"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCuisine(null)}
          className={cn(
            "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            !selectedCuisine
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          )}
        >
          All
        </button>
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() =>
              setSelectedCuisine(
                selectedCuisine === cuisine ? null : cuisine
              )
            }
            className={cn(
              "inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCuisine === cuisine
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No restaurants found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
