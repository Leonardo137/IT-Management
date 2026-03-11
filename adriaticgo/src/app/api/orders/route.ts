import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { orderSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const where: Record<string, string> = {};

    if (role === "CUSTOMER") {
      where.customerId = session.user.id;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: {
          select: { id: true, name: true, imageUrl: true },
        },
        items: true,
        delivery: true,
      },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can place orders" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      restaurantId,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      notes,
      items,
    } = parsed.data;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });
    const miMap = new Map(menuItems.map((mi) => [mi.id, mi]));

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const mi = miMap.get(item.menuItemId);
      if (!mi) throw new Error(`Menu item not found: ${item.menuItemId}`);
      subtotal += mi.price * item.quantity;
      return {
        menuItemId: mi.id,
        menuItemName: mi.name,
        unitPrice: mi.price,
        quantity: item.quantity,
      };
    });

    const total = subtotal + restaurant.deliveryFee;

    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        restaurantId,
        status: "PENDING",
        subtotal,
        deliveryFee: restaurant.deliveryFee,
        total,
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        notes,
        items: { create: orderItems },
      },
      include: {
        items: true,
        restaurant: { select: { name: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
