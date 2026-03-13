import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod/v4";

const acceptDeliverySchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role as string;
    if (role !== "DELIVERY_PERSON") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Available: orders READY without a Delivery record
    const availableOrders = await prisma.order.findMany({
      where: {
        status: "READY",
        delivery: null,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Active: driver's current delivery (not DELIVERED)
    const activeDelivery = await prisma.delivery.findFirst({
      where: {
        driverId: session.user.id,
        status: { not: "DELIVERED" },
      },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
            items: true,
          },
        },
      },
    });

    return NextResponse.json({
      available: availableOrders,
      active: activeDelivery,
    });
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
    const role = session.user.role as string;
    if (role !== "DELIVERY_PERSON") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = acceptDeliverySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    // Ensure order exists, is READY, and has no delivery
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { delivery: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "READY") {
      return NextResponse.json(
        { error: "Order is not ready for pickup" },
        { status: 400 }
      );
    }
    if (order.delivery) {
      return NextResponse.json(
        { error: "Order already assigned to a driver" },
        { status: 400 }
      );
    }

    // Driver cannot have another active delivery
    const existingActive = await prisma.delivery.findFirst({
      where: {
        driverId: session.user.id,
        status: { not: "DELIVERED" },
      },
    });
    if (existingActive) {
      return NextResponse.json(
        { error: "You already have an active delivery" },
        { status: 400 }
      );
    }

    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        driverId: session.user.id,
        status: "ASSIGNED",
      },
      include: {
        order: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                address: true,
                latitude: true,
                longitude: true,
              },
            },
            items: true,
          },
        },
      },
    });

    return NextResponse.json(delivery);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
