import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Clock, Truck, MapPin, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MenuItemCard } from "@/components/customer/MenuItemCard";
import { CartSummaryBar } from "@/components/customer/CartSummaryBar";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!restaurant) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 sm:px-6 lg:px-8">
      <div className="py-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to restaurants
          </Button>
        </Link>
      </div>

      <div className="relative mb-6 aspect-[21/9] overflow-hidden rounded-2xl">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <MapPin className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-6 py-3 text-lg font-semibold">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {restaurant.description}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {restaurant.cuisine}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <strong className="text-foreground">
              {restaurant.rating.toFixed(1)}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {restaurant.deliveryTimeMin} min
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4" />
            {formatCurrency(restaurant.deliveryFee)} delivery
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {restaurant.address}
          </span>
        </div>
        {restaurant.openingHours && (
          <p className="mt-2 text-sm text-muted-foreground">
            Hours: {restaurant.openingHours}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Minimum order: {formatCurrency(restaurant.minimumOrder)}
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="space-y-10">
        {restaurant.categories.map((category) => (
          <section key={category.id}>
            <h2 className="mb-4 text-xl font-semibold">{category.name}</h2>
            <div className="grid gap-3">
              {category.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  restaurantId={restaurant.id}
                  restaurantName={restaurant.name}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <CartSummaryBar />
    </div>
  );
}
