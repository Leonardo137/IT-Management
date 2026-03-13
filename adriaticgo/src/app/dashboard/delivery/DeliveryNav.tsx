"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/delivery", label: "Available", icon: Truck },
  { href: "/dashboard/delivery/active", label: "Active Delivery", icon: ClipboardList },
];

export function DeliveryNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-2 border-b pb-4">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard/delivery"
            ? pathname === "/dashboard/delivery"
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
