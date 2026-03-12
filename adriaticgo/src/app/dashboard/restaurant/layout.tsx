import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RestaurantNav } from "./RestaurantNav";

export default async function RestaurantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "RESTAURANT_OWNER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RestaurantNav />
        {children}
      </div>
    </div>
  );
}
