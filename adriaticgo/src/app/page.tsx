import { UtensilsCrossed, MapPin, Clock, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-16 text-center">
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

      {/* Features */}
      <section className="mb-16 grid gap-8 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold">Local Restaurants</h3>
          <p className="text-sm text-muted-foreground">
            5 restaurants in Koper, from Mediterranean to Asian fusion
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold">Fast Delivery</h3>
          <p className="text-sm text-muted-foreground">
            Track your order in real-time from kitchen to doorstep
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold">Quality Food</h3>
          <p className="text-sm text-muted-foreground">
            Curated selection of top-rated coastal cuisine
          </p>
        </div>
      </section>

      {/* Placeholder for restaurant grid */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Restaurants near you</h2>
        <p className="text-muted-foreground">
         Sign in with a
          demo account to explore the full experience.
        </p>
      </section>
    </div>
  );
}
