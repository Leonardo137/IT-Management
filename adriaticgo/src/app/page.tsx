import { UtensilsCrossed, MapPin, Clock, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RestaurantGrid } from "@/components/customer/RestaurantGrid";

export default async function HomePage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { rating: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      cuisine: true,
      address: true,
      imageUrl: true,
      rating: true,
      deliveryTimeMin: true,
      deliveryFee: true,
      minimumOrder: true,
      isOpen: true,
    },
  });

  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <UtensilsCrossed className="h-8 w-8" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Delicious food from{" "}
          <span className="text-primary">Koper&apos;s</span> best restaurants
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Order from Mediterranean kitchens, seafood spots, and more — delivered
          straight to your door on the Adriatic coast.
        </p>
      </section>

      <section className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h3 className="mb-1 font-semibold">Local Restaurants</h3>
          <p className="text-sm text-muted-foreground">
            {restaurants.length} restaurants in Koper
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="mb-1 font-semibold">Fast Delivery</h3>
          <p className="text-sm text-muted-foreground">
            Track your order in real-time
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Star className="h-5 w-5" />
          </div>
          <h3 className="mb-1 font-semibold">Quality Food</h3>
          <p className="text-sm text-muted-foreground">
            Curated coastal cuisine
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Restaurants near you</h2>
        <RestaurantGrid restaurants={restaurants} cuisines={cuisines} />
      </section>
    </div>
  );
}
