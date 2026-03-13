import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DeliveryNav } from "./DeliveryNav";

export default async function DeliveryDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "DELIVERY_PERSON") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DeliveryNav />
        {children}
      </div>
    </div>
  );
}
