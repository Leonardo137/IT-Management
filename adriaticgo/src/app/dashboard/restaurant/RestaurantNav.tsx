"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/restaurant", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/restaurant/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/restaurant/menu", label: "Menu", icon: ChefHat },
];

export function RestaurantNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-2 border-b pb-4">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard/restaurant"
            ? pathname === "/dashboard/restaurant"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              "hover:bg-muted",
              isActive && "bg-background shadow-sm"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
