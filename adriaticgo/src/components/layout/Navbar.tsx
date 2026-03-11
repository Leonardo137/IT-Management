"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  UtensilsCrossed,
  ShoppingCart,
  ClipboardList,
  Truck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  UserPlus,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavLinks(role?: string): NavLink[] {
  const common: NavLink[] = [
    {
      href: "/",
      label: "Restaurants",
      icon: <UtensilsCrossed className="h-4 w-4" />,
    },
  ];

  if (role === "CUSTOMER") {
    return [
      ...common,
      {
        href: "/cart",
        label: "Cart",
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        href: "/orders",
        label: "My Orders",
        icon: <ClipboardList className="h-4 w-4" />,
      },
    ];
  }

  if (role === "RESTAURANT_OWNER") {
    return [
      ...common,
      {
        href: "/dashboard/restaurant",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        href: "/dashboard/restaurant/menu",
        label: "Menu",
        icon: <ChefHat className="h-4 w-4" />,
      },
      {
        href: "/dashboard/restaurant/orders",
        label: "Orders",
        icon: <ClipboardList className="h-4 w-4" />,
      },
    ];
  }

  if (role === "DELIVERY_PERSON") {
    return [
      ...common,
      {
        href: "/dashboard/delivery",
        label: "Deliveries",
        icon: <Truck className="h-4 w-4" />,
      },
      {
        href: "/dashboard/delivery/active",
        label: "Active Delivery",
        icon: <ClipboardList className="h-4 w-4" />,
      },
    ];
  }

  return common;
}

function getRoleBadge(role: string): string {
  const labels: Record<string, string> = {
    CUSTOMER: "Customer",
    RESTAURANT_OWNER: "Restaurant Owner",
    DELIVERY_PERSON: "Delivery Person",
  };
  return labels[role] ?? role;
}

function CartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/90 px-1.5 text-[10px] font-bold text-primary-foreground">
      {totalItems}
    </span>
  );
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;
  const navLinks = getNavLinks(user?.role);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Adriatic<span className="text-primary">Go</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                {link.icon}
                {link.label}
                {link.href === "/cart" && <CartBadge />}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-2 md:flex">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent focus:outline-none" />
                }
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(user.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs font-medium text-primary">
                    {getRoleBadge(user.role ?? "")}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent md:hidden" />
            }
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    {link.icon}
                    {link.label}
                  </Button>
                </Link>
              ))}

              <div className="my-4 border-t" />

              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRoleBadge(user.role ?? "")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-start gap-3">
                      <UserPlus className="h-4 w-4" />
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
