import Link from "next/link";
import Image from "next/image";
import { Star, Clock, Truck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    cuisine: string;
    imageUrl: string | null;
    rating: number;
    deliveryTimeMin: number;
    deliveryFee: number;
    minimumOrder: number;
    isOpen: boolean;
  };
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <MapPin className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900">
                Closed
              </span>
            </div>
          )}
          <Badge className="absolute left-3 top-3 bg-white/90 text-foreground hover:bg-white/90">
            {restaurant.cuisine}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {restaurant.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {restaurant.deliveryTimeMin} min
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              {formatCurrency(restaurant.deliveryFee)}
            </span>
            <span>Min. {formatCurrency(restaurant.minimumOrder)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
